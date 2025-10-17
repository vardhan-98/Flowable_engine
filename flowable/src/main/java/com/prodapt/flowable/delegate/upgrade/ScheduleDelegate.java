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
import com.prodapt.flowable.service.scheduler.SchedulingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("Schedule")
@RequiredArgsConstructor
public class ScheduleDelegate implements JavaDelegate {

    @Autowired
    private final ElasticsearchService elasticsearchService;

    @Autowired
    private final SchedulingService schedulingService;

    @Autowired
    private final WorkflowExecutionRepository workflowExecutionRepository;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();

        elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "STARTED",
                "Schedule delegate executed");

        log.info("Schedule delegate executed for deviceId: {}", deviceId);

        try {
            WorkflowExecution workflowExec = workflowExecutionRepository.findById(flowId)
                    .orElseThrow(() -> new RuntimeException("Workflow execution not found: " + flowId));

            ZonedDateTime now = ZonedDateTime.now();
            ZonedDateTime start = now.plusDays(30);
            ZonedDateTime end = start.plusDays(60); // Search for 30 days to find available slots

            String skill = "upgrade"; // Assuming skill is "upgrade" for device upgrades

            List<ZonedDateTime> availableSlots = schedulingService.getAvailableSlots(start, end, skill);

            if (!availableSlots.isEmpty()) {
                ZonedDateTime firstSlot = availableSlots.get(0);
                workflowExec.setScheduledTime(firstSlot);
                schedulingService.assignWorkflowToEmployee(workflowExec, firstSlot, skill);

                workflowExecutionRepository.save(workflowExec);

                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "COMPLETED",
                        "Scheduled at: " + firstSlot);
                log.info("Workflow {} scheduled at: {}", flowId, firstSlot);
            } else {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "FAILED",
                        "No available slots in the next 60 days starting 30 days from now");
                throw new RuntimeException("No available slots for scheduling");
            }
        } catch (Exception e) {
            log.error("Error in ScheduleDelegate: ", e);
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "FAILED",
                    e.getMessage());
            throw e;
        }
    }
}
