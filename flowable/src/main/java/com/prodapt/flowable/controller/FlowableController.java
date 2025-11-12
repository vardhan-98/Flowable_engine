package com.prodapt.flowable.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.prodapt.flowable.entity.LogEntry;
import com.prodapt.flowable.entity.Task;
import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.service.FlowableService;
import com.prodapt.flowable.service.FlowableService.DeviceRequest;
import com.prodapt.flowable.service.FlowableService.DiagramResponse;
import com.prodapt.flowable.service.FlowableService.RescheduleRequest;
import com.prodapt.flowable.service.FlowableService.WorkflowFilterRequest;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@Validated
@Slf4j
@CrossOrigin
public class FlowableController {

	@Autowired
	private FlowableService flowableService;

	@PostMapping("/api/workflow-executions")
	public ResponseEntity<Page<WorkflowExecution>> getWorkflowExecutions(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size, @RequestBody(required = false)  WorkflowFilterRequest filter) {
		return ResponseEntity.ok(flowableService.getWorkflowExecutions(page, size, filter));
	}

	@GetMapping("/api/process-instance/{processInstanceId}/diagram")
	public ResponseEntity< DiagramResponse> getProcessInstanceDiagram(@PathVariable String processInstanceId) {
		try {
			 DiagramResponse response = flowableService.getProcessInstanceDiagram(processInstanceId);
			return ResponseEntity.ok(response);
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping("/api/devices/start-batch-upgrade")
	public ResponseEntity<Map<String, Object>> startBatchUpgrade(
			@Valid @RequestBody List< DeviceRequest> devices) {
		return ResponseEntity.ok(flowableService.startBatchUpgrade(devices));
	}

	@PostMapping("/api/devices/reschedule/{processInstanceId}")
	public ResponseEntity<Map<String, Object>> rescheduleDeviceUpgrade(@PathVariable String processInstanceId,
			@Valid @RequestBody  RescheduleRequest request) {
		Map<String, Object> response = flowableService.rescheduleDeviceUpgrade(processInstanceId, request);
		HttpStatus status = (HttpStatus) response.get("status");
		response.remove("status");
		return ResponseEntity.status(status).body(response);
	}

	@GetMapping("/api/logs")
	public ResponseEntity<List<LogEntry>> getLogs(@RequestParam String flowId) {
		return ResponseEntity.ok(flowableService.getLogs(flowId));
	}

	@GetMapping("/api/tasks/{taskId}")
	public ResponseEntity<Task> getTaskById(@PathVariable String taskId) {
		try {
			Task task = flowableService.getTaskById(taskId);
			return ResponseEntity.ok(task);
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@GetMapping(value = "/api/batch-upgrade/template", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
	public ResponseEntity<byte[]> downloadBatchUpgradeTemplate() {
		try {
			byte[] template = flowableService.generateBatchUpgradeTemplate();
			return ResponseEntity.ok()
					.header("Content-Disposition", "attachment; filename=batch_upgrade_template.xlsx")
					.body(template);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping(value = "/api/batch-upgrade/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, Object>> uploadBatchUpgradeExcel(@RequestPart("file") MultipartFile file) {
		try {
			Map<String, Object> response = flowableService.processBatchUpgradeExcel(file);
			if (response.containsKey("status") && response.get("status").equals(HttpStatus.BAD_REQUEST)) {
				return ResponseEntity.badRequest().body(response);
			}
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			Map<String, Object> errorResponse = Map.of("message", "Error processing Excel file: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}
}
