package com.prodapt.flowable.delegate.upgrade;

import java.time.ZonedDateTime;
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

            // Get the scheduled time from execution variables (set by the controller)
            ZonedDateTime scheduledTime = (ZonedDateTime) execution.getVariable("scheduledUpgradeDateTime");

            if (scheduledTime != null) {
                String skill = "upgrade"; // Assuming skill is "upgrade" for device upgrades

                // Directly assign to the specified time slot without checking availability
                workflowExec.setScheduledTime(scheduledTime);
                schedulingService.assignWorkflowToEmployee(workflowExec, scheduledTime, skill);

                // Set execution variables for workflow timers
                execution.setVariable("scheduledUpgradeDateTime", scheduledTime);
                ZonedDateTime preUpgradeTime = scheduledTime.minusDays(7);
                execution.setVariable("preUpgradeDateTime", preUpgradeTime);

                workflowExecutionRepository.save(workflowExec);

                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "COMPLETED",
                        "Scheduled at: " + scheduledTime);
                log.info("Workflow {} scheduled at: {}", flowId, scheduledTime);
            } else {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "FAILED",
                        "No scheduled time provided in execution variables");
                throw new RuntimeException("No scheduled time available for scheduling");
            }
        } catch (Exception e) {
            log.error("Error in ScheduleDelegate: ", e);
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "FAILED",
                    e.getMessage());
            throw e;
        }
    }
}
