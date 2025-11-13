package com.prodapt.flowable.delegate.upgrade.compatibilityDelegates;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.prodapt.flowable.service.ElasticsearchService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("CheckDeviceDetails")
@RequiredArgsConstructor
public class CheckDeviceDetailsDelegate implements JavaDelegate {

    @Autowired
    private final ElasticsearchService elasticsearchService;

    @Autowired
    private final RestTemplate restTemplate;

    @Value("${nfx.service.base.mock.url}")
    private String baseUrl;

    @Value("${nfx.service.auth.token:}")
    private String authToken;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();
        String step = (String) execution.getVariable("step");

        String url = baseUrl + "/check_device_details";

        try {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", step, "STARTED",
                    "Checking device details via " + url);

            var requestBody = java.util.Map.of(
                "flowInstanceID", flowId,
                "deviceID", deviceId,
                "step", step
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            if (authToken != null && !authToken.isBlank()) {
                headers.set("Authorization", authToken.startsWith("Bearer ") ? authToken : "Bearer " + authToken);
            }

            HttpEntity<java.util.Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            if (resp.getStatusCode().is2xxSuccessful()) {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", step, "SUCCESS",
                        "Device details check API responded with status " + resp.getStatusCode().value());
            } else {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", step, "FAILED",
                        "Device details check API responded with non-2xx status " + resp.getStatusCode().value());
                throw new RuntimeException("CheckDeviceDetailsDelegate failed with status " + resp.getStatusCode().value());
            }
        } catch (Exception ex) {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", step, "FAILED",
                    "Device details check failed: " + ex.getMessage());
            throw new RuntimeException("CheckDeviceDetailsDelegate failed", ex);
        }
    }
}
