package com.prodapt.flowable.delegate.upgrade;

import java.time.ZonedDateTime;
import java.util.List;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;
import com.prodapt.flowable.service.ElasticsearchService;
import com.prodapt.flowable.service.EmailService;
import com.prodapt.flowable.service.scheduler.SchedulingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("AutoSchedule")
@RequiredArgsConstructor
public class AutoScheduleDelegate implements JavaDelegate {

    @Autowired
    private final ElasticsearchService elasticsearchService;

    @Autowired
    private final EmailService emailService;

    @Autowired
    private final SchedulingService schedulingService;

    @Autowired
    private final WorkflowExecutionRepository workflowExecutionRepository;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();

        elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "autoschedule", "STARTED",
                "AutoSchedule delegate executed - finding first available slot 30 days from now");

        log.info("AutoSchedule delegate executed for deviceId: {}", deviceId);

        try {
            WorkflowExecution workflowExec = workflowExecutionRepository.findById(flowId)
                    .orElseThrow(() -> new RuntimeException("Workflow execution not found: " + flowId));

            ZonedDateTime now = ZonedDateTime.now();
            ZonedDateTime start = now.plusDays(30);
            ZonedDateTime end = start.plusDays(60); // Search for 60 days to find available slots

            String skill = "Upgrade"; // Match the skill case from employee data

            List<ZonedDateTime> availableSlots = schedulingService.getAvailableSlots(start, end, skill);

            if (!availableSlots.isEmpty()) {
                ZonedDateTime firstSlot = availableSlots.get(0);
                workflowExec.setScheduledTime(firstSlot);
                schedulingService.assignWorkflowToEmployee(workflowExec, firstSlot, skill);

                // Set execution variables for workflow timers
                execution.setVariable("scheduledUpgradeDateTime", firstSlot.toInstant());
                ZonedDateTime preUpgradeTime = firstSlot.minusDays(7);
                execution.setVariable("preUpgradeDateTime", preUpgradeTime.toInstant());

                workflowExecutionRepository.save(workflowExec);

                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "autoschedule", "COMPLETED",
                        "Auto-scheduled at: " + firstSlot);

                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "autoschedule", "INFO",
                        "Flow entering reschedule window until pre-upgrade time: " + preUpgradeTime);

                // Send upgrade email to customer
                emailService.sendUpgradeEmail(workflowExec.getLocalCustomerEmailContact(), deviceId, firstSlot.toString(), preUpgradeTime.toString(), flowId);

                log.info("Workflow {} auto-scheduled at: {}", flowId, firstSlot);
            } else {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "autoschedule", "FAILED",
                        "No available slots in the next 60 days starting 30 days from now");
                throw new RuntimeException("No available slots for auto-scheduling");
            }
        } catch (Exception e) {
            log.error("Error in AutoScheduleDelegate: ", e);
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "autoschedule", "FAILED",
                    e.getMessage());
            throw e;
        }
    }
}
