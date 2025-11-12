package com.prodapt.flowable.delegate.upgrade;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("ReminderEmail")
public class ReminderEmailDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();

        // TODO: Implement reminder email functionality
        log.info("ReminderEmailDelegate executed for deviceId: {} and flowId: {}", deviceId, flowId);

        // Placeholder implementation - to be implemented later
    }
}
