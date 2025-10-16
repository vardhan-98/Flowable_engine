package com.prodapt.flowable.delegate.upgrade;

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
@Component("DeviceActivation")
@RequiredArgsConstructor
public class DeviceActivationDelegate implements JavaDelegate {

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

        String url = baseUrl + "/device_activation";

        try {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "device-activation", "STARTED",
                    "Running device activation via " + url);

            var requestBody = java.util.Map.of(
                "flowInstanceID", flowId,
                "deviceID", deviceId,
                "step", "device-activation"
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            if (authToken != null && !authToken.isBlank()) {
                headers.set("Authorization", authToken.startsWith("Bearer ") ? authToken : "Bearer " + authToken);
            }

            HttpEntity<java.util.Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            if (resp.getStatusCode().is2xxSuccessful()) {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "device-activation", "SUCCESS",
                        "Device activation API responded with status " + resp.getStatusCodeValue());
            } else {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "device-activation", "FAILED",
                        "Device activation API responded with non-2xx status " + resp.getStatusCodeValue());
                throw new RuntimeException("DeviceActivationDelegate failed with status " + resp.getStatusCodeValue());
            }
        } catch (Exception ex) {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", "device-activation", "FAILED",
                    "Device activation failed: " + ex.getMessage());
            throw new RuntimeException("DeviceActivationDelegate failed", ex);
        }
    }
}
