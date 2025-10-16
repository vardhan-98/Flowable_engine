package com.prodapt.flowable.delegate.upgrade;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.service.ElasticsearchService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("Schedule")
@RequiredArgsConstructor
public class ScheduleDelegate implements JavaDelegate {

    @Autowired
    private final ElasticsearchService elasticsearchService;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();

        // Mock implementation - user will fill in the logic later
        elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "STARTED",
                "Schedule delegate executed - placeholder implementation");

        log.info("Schedule delegate executed for deviceId: {}", deviceId);

        // TODO: Implement scheduling logic here

        elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "schedule", "COMPLETED",
                "Schedule delegate completed - awaiting user implementation");
    }
}
