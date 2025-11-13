package com.prodapt.flowable.delegate.upgrade;

import java.time.ZonedDateTime;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.entity.Task;
import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.TaskRepository;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;
import com.prodapt.flowable.service.ElasticsearchService;
import com.prodapt.flowable.service.EmailService;
import com.prodapt.flowable.service.scheduler.SchedulingService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("ScheduleModifier")
public class ScheduleModifierDelegate implements JavaDelegate {

    @Autowired
    private ElasticsearchService elasticsearchService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SchedulingService schedulingService;

    @Autowired
    private WorkflowExecutionRepository workflowExecutionRepository;

    @Autowired
    private TaskRepository taskRepository;

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
                WorkflowExecution workflowExec = workflowExecutionRepository.findById(flowId)
                    .orElseThrow(() -> new RuntimeException("Workflow execution not found: " + flowId));

                // Check reschedule limit
                Integer currentCount = workflowExec.getReScheduleCount() != null ? workflowExec.getReScheduleCount() : 0;
                if (currentCount >= 3) {
                    elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "FAILED",
                            "Reschedule limit exceeded. Maximum 3 reschedules allowed.");
                    throw new RuntimeException("Reschedule limit exceeded. Maximum 3 reschedules allowed.");
                }

                // Unassign from existing task
                if (workflowExec.getTask() != null) {
                    Task existingTask = workflowExec.getTask();
                    existingTask.getWorkflows().remove(workflowExec);
                    existingTask.setWorkflowCount(existingTask.getWorkflowCount() - 1);
                    taskRepository.save(existingTask);
                    workflowExec.setTask(null);
                }

                // Update workflow with new schedule
                workflowExec.setScheduledTime(newScheduledTime);
                workflowExec.setReScheduleCount(currentCount + 1);

                // Set pre-upgrade time (3 days before)
                ZonedDateTime preUpgradeTime = newScheduledTime.minusDays(3);
                execution.setVariable("scheduledUpgradeDateTime", newScheduledTime.toInstant());
                execution.setVariable("preUpgradeDateTime", preUpgradeTime.toInstant());

                // Reassign to new task
                schedulingService.assignWorkflowToTask(newScheduledTime, workflowExec.getAssignedDtac(), workflowExec);

                workflowExecutionRepository.save(workflowExec);

                // Calculate remaining reschedules (max 3 allowed)
                Integer remainingReschedules = 3 - (currentCount + 1);

                // Send reschedule confirmation email
//                emailService.sendRescheduleEmail(workflowExec.getLocalCustomerEmailContact(), deviceId,
//                    newScheduledTime.toString(), remainingReschedules, flowId);

                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "COMPLETED",
                        "Schedule modified - new scheduled time: " + newScheduledTime + ", pre-upgrade time: " + preUpgradeTime);
                log.info("Workflow {} rescheduled to {} (reschedule #{})", flowId, newScheduledTime, currentCount + 1);
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
