package com.prodapt.flowable.delegate.upgrade;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.service.ElasticsearchService;
import com.prodapt.flowable.service.EmailService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("ReminderEmail")
public class ReminderEmailDelegate implements JavaDelegate {

    @Autowired
    private EmailService emailService;

    @Autowired
    private ElasticsearchService elasticsearchService;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String customerEmail = (String) execution.getVariable("customerEmail");

        // Handle scheduledUpgradeDateTime as it may be ZonedDateTime, Instant, or String
        Object scheduledObj = execution.getVariable("scheduledUpgradeDateTime");
        System.err.println(deviceId+" deviceID "+customerEmail+"  "+scheduledObj);
        String scheduledUpgradeDateTime;
        if (scheduledObj instanceof String) {
            scheduledUpgradeDateTime = (String) scheduledObj;
        } else if (scheduledObj instanceof java.time.ZonedDateTime) {
            scheduledUpgradeDateTime = ((java.time.ZonedDateTime) scheduledObj).toString();
        } else if (scheduledObj instanceof java.time.Instant) {
            scheduledUpgradeDateTime = ((java.time.Instant) scheduledObj).toString();
        } else {
            scheduledUpgradeDateTime = scheduledObj != null ? scheduledObj.toString() : null;
        }

        String flowId = execution.getProcessInstanceId();

        try {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "send-reminder-email", "STARTED",
                    "Starting reminder email sending - scheduled date: " + scheduledUpgradeDateTime + ", recipient: " + customerEmail);

            log.info("ReminderEmailDelegate executed for deviceId: {} and flowId: {}", deviceId, flowId);

            emailService.sendReminderEmail(customerEmail, deviceId, scheduledUpgradeDateTime, flowId, "msim@att.com");

            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "send-reminder-email", "SUCCESS",
                    "Reminder email sent successfully - scheduled date: " + scheduledUpgradeDateTime + ", sent to: " + customerEmail);

        } catch (Exception ex) {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "send-reminder-email", "FAILED",
                    "Reminder email sending failed - scheduled date: " + scheduledUpgradeDateTime + ", recipient: " + customerEmail + ", error: " + ex.getMessage());
            throw new RuntimeException("ReminderEmailDelegate failed", ex);
        }
    }
}
