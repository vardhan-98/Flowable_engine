package com.prodapt.flowable.delegate.upgrade;

import java.time.ZonedDateTime;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;
import com.prodapt.flowable.service.scheduler.SchedulingService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("Schedule")
public class ScheduleDelegate implements JavaDelegate {

    @Autowired
    private SchedulingService schedulingService;

    @Autowired
    private WorkflowExecutionRepository workflowExecutionRepository;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();

        WorkflowExecution workflowExec = workflowExecutionRepository.findById(flowId)
            .orElseThrow(() -> new RuntimeException("Workflow execution not found: " + flowId));

        ZonedDateTime scheduledTime = workflowExec.getScheduledTime();
        String assignedDtac = workflowExec.getAssignedDtac();

        // Assign workflow to task (create new or append to existing)
        schedulingService.assignWorkflowToTask(scheduledTime, assignedDtac, workflowExec);

        // Set pre-upgrade time (3 days before scheduled time)
        ZonedDateTime preUpgradeTime = scheduledTime.minusDays(3);
        execution.setVariable("preUpgradeDateTime", preUpgradeTime.toInstant());

        workflowExecutionRepository.save(workflowExec);

        log.info("Workflow {} scheduled for device {} at {} by {}",
            flowId, deviceId, scheduledTime, assignedDtac);
    }
}
