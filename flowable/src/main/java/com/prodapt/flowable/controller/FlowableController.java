package com.prodapt.flowable.controller;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import org.flowable.engine.RuntimeService;
import org.flowable.engine.runtime.ProcessInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@RestController
public class FlowableController {

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private WorkflowExecutionRepository workflowExecutionRepository;

    @Data
    public static class DeviceRequest {
        @NotBlank(message = "Device ID is required")
        private String deviceId;

        @NotBlank(message = "Customer email is required")
        @Email(message = "Invalid email format")
        private String customerEmail;

        // Optional field - no validation annotation needed
        private String scheduledZoneDateTime;
    }

    @Data
    public static class RescheduleRequest {
        @NotBlank(message = "New scheduled date time is required")
        private String newScheduledZoneDateTime;
    }

    @PostMapping("/api/devices/start-batch-upgrade")
    public ResponseEntity<Map<String, Object>> startBatchUpgrade(@Valid @RequestBody List<@Valid DeviceRequest> devices) {
        Map<String, Object> response = new HashMap<>();
        List<String> startedProcesses = new java.util.ArrayList<>();

        for (DeviceRequest device : devices) {
            try {
                // Create execution variables
                Map<String, Object> variables = new HashMap<>();
                variables.put("deviceId", device.getDeviceId());
                variables.put("customerEmail", device.getCustomerEmail());

                // Validate and set scheduledUpgradeDateTime only if provided
                if (device.getScheduledZoneDateTime() != null && !device.getScheduledZoneDateTime().trim().isEmpty()) {
                    try {
                        ZonedDateTime scheduledTime = ZonedDateTime.parse(device.getScheduledZoneDateTime());
                        variables.put("scheduledUpgradeDateTime", scheduledTime);

                        // Set preUpgradeDateTime (7 days before scheduled time)
                        ZonedDateTime preUpgradeTime = scheduledTime.minusDays(7);
                        variables.put("preUpgradeDateTime", preUpgradeTime);
                    } catch (Exception e) {
                        // Skip setting the variable if parsing fails
                        // Continue with process creation without scheduled time
                    }
                }

                // Start process instance
                ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("Process_1", variables);
                startedProcesses.add(device.getDeviceId() + ": " + processInstance.getId());

            } catch (Exception e) {
                startedProcesses.add(device.getDeviceId() + ": FAILED - " + e.getMessage());
            }
        }

        response.put("message", "Batch device upgrade initiated");
        response.put("processes", startedProcesses);
        response.put("totalDevices", devices.size());
        response.put("completed", startedProcesses.size());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/devices/reschedule/{processInstanceId}")
    public ResponseEntity<Map<String, Object>> rescheduleDeviceUpgrade(
            @PathVariable String processInstanceId,
            @Valid @RequestBody RescheduleRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Find the workflow execution record
            Optional<WorkflowExecution> workflowOpt = workflowExecutionRepository.findById(processInstanceId);

            if (!workflowOpt.isPresent()) {
                response.put("message", "Process instance not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            WorkflowExecution workflowExecution = workflowOpt.get();

            // Check reschedule limit (max 3 times)
            Integer currentCount = workflowExecution.getReScheduleCount() != null ? workflowExecution.getReScheduleCount() : 0;
            if (currentCount >= 3) {
                response.put("message", "Reschedule limit exceeded. Maximum 3 reschedules allowed.");
                response.put("currentRescheduleCount", currentCount);
                response.put("maxRescheduleCount", 3);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Parse and validate new scheduled time
            ZonedDateTime newScheduledTime;
            try {
                newScheduledTime = ZonedDateTime.parse(request.getNewScheduledZoneDateTime());
            } catch (Exception e) {
                response.put("message", "Invalid date time format. Please use ISO format.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Check if new time is in the future
            if (newScheduledTime.isBefore(ZonedDateTime.now())) {
                response.put("message", "New scheduled time must be in the future");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            runtimeService.messageEventReceived("Message_Reschedule", processInstanceId, Map.of("newScheduledUpgradeDateTime", newScheduledTime));

            response.put("message", "Device upgrade rescheduled successfully");
            response.put("processInstanceId", processInstanceId);
            response.put("newScheduledTime", newScheduledTime.toString());
            response.put("preUpgradeTime", newScheduledTime.minusDays(7).toString());
            response.put("rescheduleCount", currentCount + 1);

        } catch (Exception e) {
            response.put("message", "Reschedule failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        return ResponseEntity.ok(response);
    }

}
