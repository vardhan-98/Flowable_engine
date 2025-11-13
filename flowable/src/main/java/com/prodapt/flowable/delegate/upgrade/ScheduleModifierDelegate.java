package com.prodapt.flowable.delegate.upgrade;

import java.time.ZonedDateTime;
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
@Component("ScheduleModifier")
@RequiredArgsConstructor
public class ScheduleModifierDelegate implements JavaDelegate {

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

        elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "STARTED",
                "Modifying schedule configuration");

        log.info("Schedule modifier executed for deviceId: {}", deviceId);

        try {
            // Get the new scheduled time from the reschedule message
            ZonedDateTime newScheduledTime = (ZonedDateTime) execution.getVariable("newScheduledUpgradeDateTime");

            if (newScheduledTime != null) {
                // Update execution variables
                execution.setVariable("scheduledUpgradeDateTime", newScheduledTime.toInstant());
                ZonedDateTime preUpgradeTime = newScheduledTime.minusDays(7);
                execution.setVariable("preUpgradeDateTime", preUpgradeTime.toInstant());

                // Update the workflow execution record
                WorkflowExecution workflowExec = workflowExecutionRepository.findById(flowId)
                        .orElseThrow(() -> new RuntimeException("Workflow execution not found: " + flowId));

                // Update scheduled time
                workflowExec.setScheduledTime(newScheduledTime);

                // Increment reschedule count
                Integer currentCount = workflowExec.getReScheduleCount() != null ? workflowExec.getReScheduleCount() : 0;
                Integer newCount = currentCount + 1;
                workflowExec.setReScheduleCount(newCount);

                // Reassign using SchedulingService
                

                workflowExecutionRepository.save(workflowExec);

                // Calculate remaining reschedules (max 3 allowed)
                Integer remainingReschedules = 3 - newCount;

                // Send reschedule confirmation email
//                emailService.sendRescheduleEmail(workflowExec.getLocalCustomerEmailContact(), deviceId, newScheduledTime.toString(), remainingReschedules, flowId);

                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "COMPLETED",
                        "Schedule modified - new scheduled time: " + newScheduledTime + ", pre-upgrade time: " + preUpgradeTime);
                log.info("Workflow {} rescheduled to: {}", flowId, newScheduledTime);
            } else {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "FAILED",
                        "No new scheduled time provided in reschedule message");
                throw new RuntimeException("No new scheduled time available for reschedule");
            }
        } catch (Exception ex) {
            log.error("Error in ScheduleModifierDelegate: ", ex);
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "FAILED",
                    ex.getMessage());
            throw new RuntimeException("ScheduleModifierDelegate failed", ex);
        }
    }
}
