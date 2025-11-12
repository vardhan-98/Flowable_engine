package com.prodapt.flowable.service;

import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.ArrayList;
import java.util.regex.Pattern;
import java.nio.charset.StandardCharsets;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import org.flowable.engine.RuntimeService;
import org.flowable.engine.history.HistoricProcessInstance;
import org.flowable.engine.history.HistoricActivityInstance;
import org.flowable.engine.repository.ProcessDefinition;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.runtime.ProcessInstance;
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
import org.springframework.stereotype.Service;

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
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FlowableService {

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

	public Page<WorkflowExecution> getWorkflowExecutions(int page, int size, Object filter) {
		// Assuming filter is WorkflowFilterRequest, but since it's in controller, we'll cast or adjust
		// For now, implement the logic
		WorkflowFilterRequest filterReq = (WorkflowFilterRequest) filter;

		if (filterReq == null) {
			filterReq = new WorkflowFilterRequest();
		}

		Specification<WorkflowExecution> spec = WorkflowExecutionSpecification.withFilters(filterReq.getDeviceIds(),
				filterReq.getWorkflows(), filterReq.getCompleted(), filterReq.getEmailContact(), filterReq.getCreatedAtFrom(),
				filterReq.getCreatedAtTo(), filterReq.getScheduledTimeFrom(), filterReq.getScheduledTimeTo(),
				filterReq.getProcessNames(), filterReq.getProcessFlowIds());

		Sort sortObj = Sort.unsorted();
		if (filterReq.getSort() != null && !filterReq.getSort().isEmpty()) {
			List<Sort.Order> orders = new ArrayList<>();
			for (Map.Entry<String, String> entry : filterReq.getSort().entrySet()) {
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
		return result;
	}

	public DiagramResponse getProcessInstanceDiagram(String processInstanceId) {
		try {
			HistoricProcessInstance historicProcessInstance = historyService.createHistoricProcessInstanceQuery()
					.processInstanceId(processInstanceId).singleResult();

			if (historicProcessInstance == null) {
				throw new RuntimeException("Process instance not found");
			}

			String processDefinitionId = historicProcessInstance.getProcessDefinitionId();

			BpmnModel bpmnModel = repositoryService.getBpmnModel(processDefinitionId);
			BpmnXMLConverter converter = new BpmnXMLConverter();
			byte[] xmlBytes = converter.convertToXML(bpmnModel);
			String bpmnXml = new String(xmlBytes, StandardCharsets.UTF_8);

			// Get executed activities
			List<String> executedActivities = new ArrayList<>();
			Map<String, ActivityDetail> activityDetails = new HashMap<>();
			List<HistoricActivityInstance> historicActivityInstances = historyService
					.createHistoricActivityInstanceQuery().processInstanceId(processInstanceId).finished().list();

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

			return response;
		} catch (Exception e) {
			throw new RuntimeException("Error retrieving diagram", e);
		}
	}

	public Map<String, Object> startBatchUpgrade(List<DeviceRequest> devices) {
		Map<String, Object> response = new HashMap<>();
		List<String> startedProcesses = new ArrayList<>();

		// Fetch process definition details outside the loop for efficiency
		ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery()
				.processDefinitionKey("UpgradeFlow").latestVersion().singleResult();
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
				variables.put("assignedDTAC", device.getAssignedDtac());
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
				workflowExecution.setAssignedDtac(device.getAssignedDtac());

				startedProcesses.add(device.getDeviceId() + ": " + processInstance.getId());

			} catch (Exception e) {
				startedProcesses.add(device.getDeviceId() + ": FAILED - " + e.getMessage());
			}
		}

		response.put("message", "Batch device upgrade initiated");
		response.put("processes", startedProcesses);
		response.put("totalDevices", devices.size());
		response.put("completed", startedProcesses.size());

		return response;
	}

	public Map<String, Object> rescheduleDeviceUpgrade(String processInstanceId, RescheduleRequest request) {
		Map<String, Object> response = new HashMap<>();

		try {
			Optional<WorkflowExecution> workflowOpt = workflowExecutionRepository.findById(processInstanceId);

			if (!workflowOpt.isPresent()) {
				response.put("message", "Process instance not found");
				response.put("status", HttpStatus.NOT_FOUND);
				return response;
			}

			WorkflowExecution workflowExecution = workflowOpt.get();

			Integer currentCount = workflowExecution.getReScheduleCount() != null
					? workflowExecution.getReScheduleCount()
					: 0;

			if (currentCount >= 3) {
				response.put("message", "Reschedule limit exceeded. Maximum 3 reschedules allowed.");
				response.put("currentRescheduleCount", currentCount);
				response.put("maxRescheduleCount", 3);
				response.put("status", HttpStatus.BAD_REQUEST);
				return response;
			}

			ZonedDateTime newScheduledTime;
			try {
				newScheduledTime = ZonedDateTime.parse(request.getNewScheduledZoneDateTime());
			} catch (Exception e) {
				response.put("message", "Invalid date time format. Please use ISO format.");
				response.put("status", HttpStatus.BAD_REQUEST);
				return response;
			}

			if (newScheduledTime.isBefore(ZonedDateTime.now())) {
				response.put("message", "New scheduled time must be in the future");
				response.put("status", HttpStatus.BAD_REQUEST);
				return response;
			}

			// Verify the process is at the reschedule window
			List<String> activeActivities = runtimeService.getActiveActivityIds(processInstanceId);
			log.info("Active activities for {}: {}", processInstanceId, activeActivities);
			if (!activeActivities.contains("Activity_19qntoo")) {
				response.put("message", "Process not in reschedule window - current activities: " + activeActivities);
				response.put("status", HttpStatus.BAD_REQUEST);
				return response;
			}

			// Trigger the receiveTask execution directly
			Execution execution = runtimeService.createExecutionQuery().processInstanceId(processInstanceId)
					.activityId("Activity_19qntoo").singleResult();

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
			response.put("status", HttpStatus.OK);

		} catch (Exception e) {
			log.error("Reschedule failed", e);
			response.put("message", "Reschedule failed: " + e.getMessage());
			response.put("status", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return response;
	}

	public List<LogEntry> getLogs(String flowId) {
		List<LogEntry> logs = elasticsearchService.getLogsByFlowId(flowId);
		return logs;
	}

	public Task getTaskById(String taskId) {
		try {
			Optional<Task> task = taskRepository.findById(taskId);
			if (task.isPresent()) {
				return task.get();
			} else {
				throw new RuntimeException("Task not found");
			}
		} catch (Exception e) {
			throw new RuntimeException("Error retrieving task", e);
		}
	}

	public byte[] generateBatchUpgradeTemplate() throws IOException {
		try (Workbook workbook = new XSSFWorkbook()) {
			Sheet sheet = workbook.createSheet("Batch Upgrade");

			// Create header row
			Row headerRow = sheet.createRow(0);
			String[] headers = {"Serial Number", "uCPE Host Name", "Date (DD-MM-YYYY UTC)", "Time (HH:mm UTC)", "assignedDtac attuid", "Customer Email"};
			for (int i = 0; i < headers.length; i++) {
				Cell cell = headerRow.createCell(i);
				cell.setCellValue(headers[i]);
			}

			// Create sample data row
			Row sampleRow = sheet.createRow(1);
			sampleRow.createCell(0).setCellValue(1);
			sampleRow.createCell(1).setCellValue("cpe.example.com");
			sampleRow.createCell(2).setCellValue("15-11-2025");
			sampleRow.createCell(3).setCellValue("14:00");
			sampleRow.createCell(4).setCellValue("user@domain.com");
			sampleRow.createCell(5).setCellValue("customer@example.com");

			// Auto-size columns
			for (int i = 0; i < headers.length; i++) {
				sheet.autoSizeColumn(i);
			}

			// Write to byte array
			try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
				workbook.write(outputStream);
				return outputStream.toByteArray();
			}
		}
	}

	public Map<String, Object> processBatchUpgradeExcel(MultipartFile file) throws IOException {
		List<BatchUpgradeRow> rows = new ArrayList<>();
		List<String> validationErrors = new ArrayList<>();

		try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
			Sheet sheet = workbook.getSheetAt(0);

			// Skip header row
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null) continue;

				BatchUpgradeRow batchRow = new BatchUpgradeRow();
				try {
					batchRow.setSerialNumber((int) row.getCell(0).getNumericCellValue());
					batchRow.setUCpeHostName(getCellValueAsString(row.getCell(1)));
					batchRow.setDate(getCellValueAsString(row.getCell(2)));
					batchRow.setTime(getCellValueAsString(row.getCell(3)));
					batchRow.setAssignedDtacAttuid(getCellValueAsString(row.getCell(4)));
					batchRow.setCustomerEmail(getCellValueAsString(row.getCell(5)));

					// Validate row
					String error = validateBatchUpgradeRow(batchRow);
					if (error != null) {
						validationErrors.add("Row " + (i + 1) + ": " + error);
					} else {
						rows.add(batchRow);
					}
				} catch (Exception e) {
					validationErrors.add("Row " + (i + 1) + ": Error parsing row - " + e.getMessage());
				}
			}
		}

		if (!validationErrors.isEmpty()) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("message", "Validation errors found in Excel file");
			errorResponse.put("errors", validationErrors);
			errorResponse.put("status", HttpStatus.BAD_REQUEST);
			return errorResponse;
		}

		// Convert to DeviceRequest and start batch upgrade
		List<DeviceRequest> devices = rows.stream().map(this::convertToDeviceRequest).toList();
		return startBatchUpgrade(devices);
	}

	private String getCellValueAsString(Cell cell) {
		if (cell == null) return "";
		switch (cell.getCellType()) {
			case STRING:
				return cell.getStringCellValue().trim();
			case NUMERIC:
				if (DateUtil.isCellDateFormatted(cell)) {
					return cell.getDateCellValue().toString(); // Handle dates if needed
				} else {
					return String.valueOf((int) cell.getNumericCellValue());
				}
			case BOOLEAN:
				return String.valueOf(cell.getBooleanCellValue());
			default:
				return "";
		}
	}

	private String validateBatchUpgradeRow(BatchUpgradeRow row) {
		if (row.getUCpeHostName() == null || row.getUCpeHostName().trim().isEmpty()) {
			return "uCPE Host Name is required";
		}
		if (row.getDate() == null || row.getDate().trim().isEmpty()) {
			return "Date is required";
		}
		if (!Pattern.matches("\\d{2}-\\d{2}-\\d{4}", row.getDate())) {
			return "Date must be in DD-MM-YYYY format";
		}
		if (row.getTime() == null || row.getTime().trim().isEmpty()) {
			return "Time is required";
		}
		if (!Pattern.matches("\\d{2}:\\d{2}", row.getTime())) {
			return "Time must be in HH:mm format";
		}
		try {
			int hour = Integer.parseInt(row.getTime().substring(0, 2));
			int minute = Integer.parseInt(row.getTime().substring(3, 5));
			if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
				return "Invalid time format";
			}
		} catch (Exception e) {
			return "Invalid time format";
		}
		if (row.getAssignedDtacAttuid() == null || row.getAssignedDtacAttuid().trim().isEmpty()) {
			return "assignedDtac attuid is required";
		}
		if (row.getCustomerEmail() == null || row.getCustomerEmail().trim().isEmpty()) {
			return "Customer Email is required";
		}
		if (!Pattern.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$", row.getCustomerEmail())) {
			return "Invalid email format";
		}
		return null; // No errors
	}

	private DeviceRequest convertToDeviceRequest(BatchUpgradeRow row) {
		DeviceRequest request = new DeviceRequest();
		request.setDeviceId(row.getUCpeHostName());
		request.setCustomerEmail(row.getCustomerEmail());
		request.setAssignedDtac(row.getAssignedDtacAttuid());

		// Combine date and time into ISO format UTC
		String isoDateTime = row.getDate().substring(6, 10) + "-" + row.getDate().substring(3, 5) + "-" + row.getDate().substring(0, 2) +
							 "T" + row.getTime() + ":00Z";
		request.setScheduledZoneDateTime(isoDateTime);

		return request;
	}

	@Data
	public static class DeviceRequest {
		@NotBlank(message = "Device ID is required")
		private String deviceId;

		@NotBlank(message = "Customer email is required")
		@Email(message = "Invalid email format")
		private String customerEmail;
		@NotBlank
		private String assignedDtac;
		

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
		private LinkedHashMap<String, String> sort; // Changed to LinkedHashMap
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

	@Data
	public static class BatchUpgradeRow {
		private Integer serialNumber;
		private String uCpeHostName;
		private String date; // DD-MM-YYYY
		private String time; // HH:mm
		private String assignedDtacAttuid;
		private String customerEmail;
	}
}
