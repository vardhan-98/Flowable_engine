package com.prodapt.flowable.delegate.upgrade;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.service.ElasticsearchService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("ScheduleModifier")
@RequiredArgsConstructor
public class ScheduleModifierDelegate implements JavaDelegate {

    @Autowired
    private final ElasticsearchService elasticsearchService;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();

        try {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "STARTED",
                    "Modifying schedule configuration");

            // TODO: Implement schedule modification logic
            // This could involve updating timers, rescheduling tasks, etc.

            log.info("Schedule modifier executed for deviceId: {}", deviceId);

            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "COMPLETED",
                    "Schedule modification completed");
        } catch (Exception ex) {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule-modifier", "FAILED",
                    "Schedule modification failed: " + ex.getMessage());
            throw new RuntimeException("ScheduleModifierDelegate failed", ex);
        }
    }
}
