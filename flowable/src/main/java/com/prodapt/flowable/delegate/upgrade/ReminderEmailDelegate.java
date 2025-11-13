package com.prodapt.flowable.delegate.upgrade;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.service.EmailService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("ReminderEmail")
public class ReminderEmailDelegate implements JavaDelegate {

    @Autowired
    private EmailService emailService;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String customerEmail = (String) execution.getVariable("customerEmail");
        String scheduledUpgradeDateTime = (String) execution.getVariable("scheduledUpgradeDateTime");
        String flowId = execution.getProcessInstanceId();

        log.info("ReminderEmailDelegate executed for deviceId: {} and flowId: {}", deviceId, flowId);

        emailService.sendReminderEmail(customerEmail, deviceId, scheduledUpgradeDateTime, flowId, "msim@att.com");
    }
}
