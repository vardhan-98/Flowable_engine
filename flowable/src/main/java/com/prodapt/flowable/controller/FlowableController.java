package com.prodapt.flowable.controller;

import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.ArrayList;
import java.nio.charset.StandardCharsets;

import org.flowable.engine.RuntimeService;
import org.flowable.engine.history.HistoricProcessInstance;
import org.flowable.engine.history.HistoricActivityInstance;
import org.flowable.engine.repository.ProcessDefinition;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.engine.runtime.ActivityInstance;
import org.flowable.engine.runtime.Execution;
import org.flowable.bpmn.model.BpmnModel;
import org.flowable.bpmn.converter.BpmnXMLConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.entity.WorkflowExecutionSpecification;
import com.prodapt.flowable.entity.LogEntry;
import com.prodapt.flowable.entity.Task;
import com.prodapt.flowable.service.ElasticsearchService;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;
import com.prodapt.flowable.repository.TaskRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.validation.annotation.Validated;
import lombok.extern.slf4j.Slf4j;

@RestController
@Validated
@Slf4j
@CrossOrigin
public class FlowableController {

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private HistoryService historyService;

    @Autowired
    private RepositoryService repositoryService;

    @Autowired
    private WorkflowExecutionRepository workflowExecutionRepository;

    @Autowired
    private ElasticsearchService elasticsearchService;

    @Autowired
    private TaskRepository taskRepository;

    @Data
    public static class DeviceRequest {
        @NotBlank(message = "Device ID is required")
        private String deviceId;

        @NotBlank(message = "Customer email is required")
        @Email(message = "Invalid email format")
        private String customerEmail;

        private String scheduledZoneDateTime;
    }

    @Data
    public static class RescheduleRequest {
        @NotBlank(message = "New scheduled date time is required")
        private String newScheduledZoneDateTime;
    }

    @Data
    public static class WorkflowFilterRequest {
        private List<String> deviceIds;
        private List<String> workflows;
        private Boolean completed;
        private String emailContact;
        private String createdAtFrom;
        private String createdAtTo;
        private String scheduledTimeFrom;
        private String scheduledTimeTo;
        private List<String> processNames;
        private List<String> processFlowIds;
        private LinkedHashMap<String, String> sort;  // Changed to LinkedHashMap
    }

    @Data
    public static class DiagramResponse {
        private String bpmnXml;
        private List<String> executedActivities;
        private List<String> activeActivities;
        private Map<String, ActivityDetail> activityDetails;
    }

    @Data
    public static class ActivityDetail {
        private ZonedDateTime startTime;
        private ZonedDateTime endTime;
    }

    @PostMapping("/api/workflow-executions")
    public ResponseEntity<Page<WorkflowExecution>> getWorkflowExecutions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestBody(required = false) WorkflowFilterRequest filter) {

        if (filter == null) {
            filter = new WorkflowFilterRequest();
        }

        Specification<WorkflowExecution> spec = WorkflowExecutionSpecification.withFilters(
                filter.getDeviceIds(),
                filter.getWorkflows(),
                filter.getCompleted(),
                filter.getEmailContact(),
                filter.getCreatedAtFrom(),
                filter.getCreatedAtTo(),
                filter.getScheduledTimeFrom(),
                filter.getScheduledTimeTo(),
                filter.getProcessNames(),
                filter.getProcessFlowIds());

        Sort sortObj = Sort.unsorted();
        if (filter.getSort() != null && !filter.getSort().isEmpty()) {
            List<Sort.Order> orders = new ArrayList<>();
            for (Map.Entry<String, String> entry : filter.getSort().entrySet()) {
                String dir = entry.getValue().toLowerCase();
                if ("asc".equals(dir)) {
                    orders.add(Sort.Order.asc(entry.getKey()));
                } else {
                    orders.add(Sort.Order.desc(entry.getKey()));
                }
            }
            sortObj = Sort.by(orders);
        } else {
            sortObj = Sort.by("createdAt").descending();
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<WorkflowExecution> result = workflowExecutionRepository.findAll(spec, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/process-instance/{processInstanceId}/diagram")
    public ResponseEntity<DiagramResponse> getProcessInstanceDiagram(@PathVariable String processInstanceId) {
        try {
            HistoricProcessInstance historicProcessInstance = historyService.createHistoricProcessInstanceQuery()
                    .processInstanceId(processInstanceId).singleResult();

            if (historicProcessInstance == null) {
                return ResponseEntity.notFound().build();
            }

            String processDefinitionId = historicProcessInstance.getProcessDefinitionId();

            BpmnModel bpmnModel = repositoryService.getBpmnModel(processDefinitionId);
            BpmnXMLConverter converter = new BpmnXMLConverter();
            byte[] xmlBytes = converter.convertToXML(bpmnModel);
            String bpmnXml = new String(xmlBytes, StandardCharsets.UTF_8);

            // Get executed activities
            List<String> executedActivities = new ArrayList<>();
            Map<String, ActivityDetail> activityDetails = new HashMap<>();
            List<HistoricActivityInstance> historicActivityInstances = historyService.createHistoricActivityInstanceQuery()
                    .processInstanceId(processInstanceId).finished().list();

            for (HistoricActivityInstance instance : historicActivityInstances) {
                if (!executedActivities.contains(instance.getActivityId())) {
                    executedActivities.add(instance.getActivityId());
                }
                ActivityDetail detail = new ActivityDetail();
                // Convert Date to ZonedDateTime
                detail.setStartTime(instance.getStartTime() != null
                    ? ZonedDateTime.ofInstant(instance.getStartTime().toInstant(), ZoneOffset.UTC)
                    : null);
                detail.setEndTime(instance.getEndTime() != null
                    ? ZonedDateTime.ofInstant(instance.getEndTime().toInstant(), ZoneOffset.UTC)
                    : null);
                activityDetails.put(instance.getActivityId(), detail);
            }

            // Get active activities
            List<String> activeActivities = new ArrayList<>();
            try {
                activeActivities = runtimeService.getActiveActivityIds(processInstanceId);
            } catch (Exception e) {
                // Process is completed, no active activities
            }

            DiagramResponse response = new DiagramResponse();
            response.setBpmnXml(bpmnXml);
            response.setExecutedActivities(executedActivities);
            response.setActiveActivities(activeActivities);
            response.setActivityDetails(activityDetails);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/api/devices/start-batch-upgrade")
    public ResponseEntity<Map<String, Object>> startBatchUpgrade(@Valid @RequestBody List<@Valid DeviceRequest> devices) {
        Map<String, Object> response = new HashMap<>();
        List<String> startedProcesses = new ArrayList<>();

        // Fetch process definition details outside the loop for efficiency
        ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery().processDefinitionKey("Process_1").latestVersion().singleResult();
        String processName = processDefinition.getName();
        String processFlowId = processDefinition.getId();

        for (DeviceRequest device : devices) {
            try {
                Map<String, Object> variables = new HashMap<>();
                variables.put("deviceId", device.getDeviceId());
                variables.put("customerEmail", device.getCustomerEmail());

                if (device.getScheduledZoneDateTime() != null && !device.getScheduledZoneDateTime().trim().isEmpty()) {
                    try {
                        ZonedDateTime scheduledTime = ZonedDateTime.parse(device.getScheduledZoneDateTime());
                        variables.put("scheduledUpgradeDateTime", scheduledTime);

                        ZonedDateTime preUpgradeTime = scheduledTime.minusDays(7);
                        variables.put("preUpgradeDateTime", preUpgradeTime);
                    } catch (Exception e) {
                        // Continue without scheduled time
                    }
                }

                ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("Process_1", variables);

                WorkflowExecution workflowExecution = new WorkflowExecution();
                workflowExecution.setFlowInstanceId(processInstance.getId());
                workflowExecution.setDeviceId(device.getDeviceId());
                workflowExecution.setWorkflow("DeviceUpgrade");
                workflowExecution.setLocalCustomerEmailContact(device.getCustomerEmail());
                workflowExecution.setProcessName(processName);
                workflowExecution.setProcessFlowId(processFlowId);
                workflowExecution.setStatus("STARTED");
                workflowExecutionRepository.save(workflowExecution);

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
            Optional<WorkflowExecution> workflowOpt = workflowExecutionRepository.findById(processInstanceId);

            if (!workflowOpt.isPresent()) {
                response.put("message", "Process instance not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            WorkflowExecution workflowExecution = workflowOpt.get();

            Integer currentCount = workflowExecution.getReScheduleCount() != null 
                ? workflowExecution.getReScheduleCount() : 0;
            
            if (currentCount >= 3) {
                response.put("message", "Reschedule limit exceeded. Maximum 3 reschedules allowed.");
                response.put("currentRescheduleCount", currentCount);
                response.put("maxRescheduleCount", 3);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            ZonedDateTime newScheduledTime;
            try {
                newScheduledTime = ZonedDateTime.parse(request.getNewScheduledZoneDateTime());
            } catch (Exception e) {
                response.put("message", "Invalid date time format. Please use ISO format.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (newScheduledTime.isBefore(ZonedDateTime.now())) {
                response.put("message", "New scheduled time must be in the future");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Verify the process is at the reschedule window
            List<String> activeActivities = runtimeService.getActiveActivityIds(processInstanceId);
            log.info("Active activities for {}: {}", processInstanceId, activeActivities);
            if (!activeActivities.contains("Activity_19qntoo")) {
                response.put("message", "Process not in reschedule window - current activities: " + activeActivities);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Trigger the receiveTask execution directly
            Execution execution = runtimeService.createExecutionQuery()
                .processInstanceId(processInstanceId)
                .activityId("Activity_19qntoo")
                .singleResult();

            if (execution == null) {
                throw new RuntimeException("No execution found at the reschedule window");
            }

            log.info("Triggering execution {} for reschedule", execution.getId());
            runtimeService.trigger(execution.getId(), Map.of("newScheduledUpgradeDateTime", newScheduledTime));

            // Update the workflow execution status and reschedule count
            workflowExecution.setStatus("RESCHEDULED");
            workflowExecution.setReScheduleCount(currentCount + 1);
            workflowExecutionRepository.save(workflowExecution);

            response.put("message", "Device upgrade rescheduled successfully");
            response.put("processInstanceId", processInstanceId);
            response.put("newScheduledTime", newScheduledTime.toString());
            response.put("preUpgradeTime", newScheduledTime.minusDays(7).toString());
            response.put("rescheduleCount", currentCount + 1);

        } catch (Exception e) {
            log.error("Reschedule failed", e);
            response.put("message", "Reschedule failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/logs")
    public ResponseEntity<List<LogEntry>> getLogs(@RequestParam String flowId) {
        try {
            List<LogEntry> logs = elasticsearchService.getLogsByFlowId(flowId);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/api/tasks/{taskId}")
    public ResponseEntity<Task> getTaskById(@PathVariable String taskId) {
        try {
            Optional<Task> task = taskRepository.findById(taskId);
            if (task.isPresent()) {
                return ResponseEntity.ok(task.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
