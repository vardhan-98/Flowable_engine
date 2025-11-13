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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prodapt.flowable.service.ElasticsearchService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("VerifyAndUpgradeBluejacket")
@RequiredArgsConstructor
public class VerifyAndUpgradeBluejacketDelegate implements JavaDelegate {

    @Autowired
    private final ElasticsearchService elasticsearchService;

    @Autowired
    private final RestTemplate restTemplate;

    @Autowired
    private final ObjectMapper objectMapper;

    @Value("${nfx.service.base.mock.url}")
    private String baseUrl;

    @Value("${nfx.service.auth.token:}")
    private String authToken;

    @Override
    public void execute(DelegateExecution execution) {
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();
        String step = (String) execution.getVariable("step");

        String url = baseUrl + "/verify_and_upgrade_bluejacket";

        try {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", step, "STARTED",
                    "Verifying and upgrading bluejacket via " + url);

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
                // Parse response to check for stagingFlag
                try {
                    JsonNode responseJson = objectMapper.readTree(resp.getBody());
                    if (responseJson.has("stagingFlag")) {
                        boolean stagingFlagValue = responseJson.get("stagingFlag").asBoolean();
                        execution.setVariable("stagingFlag", String.valueOf(stagingFlagValue));
                        log.info("Set stagingFlag to: {}", stagingFlagValue);
                    } else {
                        // Default to false if not present
                        execution.setVariable("stagingFlag", "false");
                        log.warn("stagingFlag not found in response, defaulting to false");
                    }
                } catch (Exception parseEx) {
                    // Default to false if parsing fails
                    execution.setVariable("stagingFlag", "false");
                    log.warn("Failed to parse stagingFlag from response, defaulting to false: {}", parseEx.getMessage());
                }

                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", step, "SUCCESS",
                        "Bluejacket verification and upgrade API responded with status " + resp.getStatusCode().value());
            } else {
                elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", step, "FAILED",
                        "Bluejacket verification and upgrade API responded with non-2xx status " + resp.getStatusCode().value());
                throw new RuntimeException("VerifyAndUpgradeBluejacketDelegate failed with status " + resp.getStatusCode().value());
            }
        } catch (Exception ex) {
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", step, "FAILED",
                    "Bluejacket verification and upgrade failed: " + ex.getMessage());
            throw new RuntimeException("VerifyAndUpgradeBluejacketDelegate failed", ex);
        }
    }
}
