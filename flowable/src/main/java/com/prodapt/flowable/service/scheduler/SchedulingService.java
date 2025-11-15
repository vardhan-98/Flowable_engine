package com.prodapt.flowable.service.scheduler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.runtime.ProcessInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.prodapt.flowable.entity.WorkflowExecution;
import com.prodapt.flowable.repository.WorkflowExecutionRepository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SchedulingService {

	// Static map to store overwrite data with auto-cleanup
	private static final java.util.concurrent.ConcurrentHashMap<String, OverwriteData> overwriteStore = new java.util.concurrent.ConcurrentHashMap<>();
	private static final long OVERWRITE_EXPIRY_MINUTES = 3;

	// Scheduled cleanup task
	static {
		java.util.concurrent.ScheduledExecutorService cleanupExecutor = java.util.concurrent.Executors.newSingleThreadScheduledExecutor();
		cleanupExecutor.scheduleAtFixedRate(() -> {
			ZonedDateTime now = ZonedDateTime.now();
			overwriteStore.entrySet().removeIf(entry -> {
				boolean expired = entry.getValue().getCreatedAt().plusMinutes(OVERWRITE_EXPIRY_MINUTES).isBefore(now);
				if (expired) {
					log.info("Cleaning up expired overwrite data with ID: {}", entry.getKey());
				}
				return expired;
			});
		}, 1, 1, java.util.concurrent.TimeUnit.MINUTES); // Run every minute
	}

	@Autowired
	private RuntimeService runtimeService;

	@Autowired
	private RepositoryService repositoryService;

	@Autowired
	private WorkflowExecutionRepository workflowExecutionRepository;

	@Autowired
	private com.prodapt.flowable.repository.EmployeeRepository employeeRepository;

	@Autowired
	private com.prodapt.flowable.repository.TaskRepository taskRepository;

	public Map<String, Object> startBatchUpgrade(List<DeviceRequest> devices) {
		Map<String, Object> response = new HashMap<>();
		List<String> startedProcesses = new ArrayList<>();

		// Fetch process definition details outside the loop for efficiency
		org.flowable.engine.repository.ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery()
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
						// Convert to Instant for Flowable timer compatibility
						variables.put("scheduledUpgradeDateTime", scheduledTime.toInstant());

						ZonedDateTime preUpgradeTime = scheduledTime.minusDays(7);
						variables.put("preUpgradeDateTime", preUpgradeTime.toInstant());
					} catch (Exception e) {
						// Continue without scheduled time
					}
				}
				variables.put("assignedDTAC", device.getAssignedDtac());
				ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("UpgradeFlow", variables);

				WorkflowExecution workflowExecution = new WorkflowExecution();
				workflowExecution.setFlowInstanceId(processInstance.getId());
				workflowExecution.setDeviceId(device.getDeviceId());
				workflowExecution.setLocalCustomerEmailContact(device.getCustomerEmail());
				workflowExecution.setProcessName(processName);
				workflowExecution.setProcessFlowId(processFlowId);
				workflowExecution.setStatus("STARTED");
				workflowExecution.setAssignedDtac(device.getAssignedDtac());
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

		return response;
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
				if (row == null || isRowEmpty(row)) continue;

				BatchUpgradeRow batchRow = new BatchUpgradeRow();
				try {
					// Parse serial number
					batchRow.setSerialNumber(parseSerialNumber(row.getCell(0)));
					
					// Parse uCPE hostname
					batchRow.setUCpeHostName(getCellValueAsString(row.getCell(1)));

					// Parse date - handles both string and date formatted cells
					batchRow.setDate(parseDateCell(row.getCell(2)));

					// Parse time - handles both string and date/time formatted cells
					batchRow.setTime(parseTimeCell(row.getCell(3)));

					// Parse DTAC and email
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
					log.error("Error parsing row {}: {}", i + 1, e.getMessage());
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

		// Convert to DeviceRequest
		List<DeviceRequest> devices = rows.stream().map(this::convertToDeviceRequest).toList();
		
		// Get device IDs for lookup
		List<String> deviceIds = devices.stream().map(DeviceRequest::getDeviceId).distinct().toList();

		// Find existing workflows
		List<WorkflowExecution> existingWorkflows = workflowExecutionRepository.findByDeviceIds(deviceIds);

		// Create map for quick lookup
		Map<String, WorkflowExecution> existingWorkflowMap = new HashMap<>();
		for (WorkflowExecution workflow : existingWorkflows) {
			existingWorkflowMap.put(workflow.getDeviceId(), workflow);
		}

		// Categorize devices
		OverwriteData overwriteData = new OverwriteData();
		List<DeviceRequest> newDevicesToProcess = new ArrayList<>();
		List<FailedDevice> failedDevices = new ArrayList<>();
		int duplicatesSkipped = 0;

		for (DeviceRequest device : devices) {
			WorkflowExecution existing = existingWorkflowMap.get(device.getDeviceId());

			if (existing == null) {
				// New device - process immediately
				newDevicesToProcess.add(device);
			} else {
				// Existing device - check for changes
				OverwriteDevice overwrite = new OverwriteDevice(device.getDeviceId(), existing, device);

				if (!overwrite.getChanges().isEmpty()) {
					// Has changes - add to overwrites
					overwriteData.getOverwrites().add(overwrite);
				} else {
					// Check if this is a failed reschedule attempt (scheduledTime change blocked by 3-day rule)
					if (!Objects.equals(existing.getScheduledTime(),
						device.getScheduledZoneDateTime() != null && !device.getScheduledZoneDateTime().trim().isEmpty()
							? ZonedDateTime.parse(device.getScheduledZoneDateTime()) : null)) {

						// Scheduled time was different but blocked by 3-day rule
						FailedDevice failed = new FailedDevice();
						failed.setDeviceId(device.getDeviceId());
						failed.setReason("Cannot reschedule: upgrade scheduled within 3 days");
						failed.setScheduledTime(existing.getScheduledTime());
						failedDevices.add(failed);
					} else {
						// No changes - skip duplicate
						duplicatesSkipped++;
					}
				}
			}
		}

		// Process new devices immediately
		List<String> newDevicesProcessed = new ArrayList<>();
		List<String> failedProcesses = new ArrayList<>();
		if (!newDevicesToProcess.isEmpty()) {
			Map<String, Object> result = startBatchUpgrade(newDevicesToProcess);
			@SuppressWarnings("unchecked")
			List<String> processes = (List<String>) result.get("processes");
			if (processes != null) {
				for (String process : processes) {
					if (process.contains("FAILED")) {
						failedProcesses.add(process);
					} else {
						newDevicesProcessed.add(process.split(": ")[0]);
					}
				}
			}
		}

		// Prepare response
		BatchUpgradeResponse response = new BatchUpgradeResponse();
		response.setTotalDevices(devices.size());
		response.setNewDevicesProcessed(newDevicesProcessed);
		response.setDuplicatesSkipped(duplicatesSkipped);
		response.setFailedDevices(failedDevices);

		if (!overwriteData.getOverwrites().isEmpty()) {
			// Store overwrite data
			overwriteStore.put(overwriteData.getId(), overwriteData);
			response.setMessage("Batch upgrade processed with overwrites pending confirmation");
			response.setOverwriteId(overwriteData.getId());
			response.setOverwrites(overwriteData.getOverwrites());

			log.info("Created overwrite session {} with {} overwrites", overwriteData.getId(), overwriteData.getOverwrites().size());
		} else {
			response.setMessage("Batch upgrade completed successfully");
		}

		// Build response map conditionally based on whether there are overwrites
		Map<String, Object> result = new HashMap<>();
		result.put("message", response.getMessage());
		result.put("newDevicesProcessed", response.getNewDevicesProcessed().size());
		result.put("duplicatesSkipped", response.getDuplicatesSkipped());
		result.put("failedDevices", response.getFailedDevices());
		result.put("totalDevices", response.getTotalDevices());

		// Include failed processes if any
		if (!failedProcesses.isEmpty()) {
			result.put("failedProcesses", failedProcesses);
		}

		// Only include overwrite fields if there are overwrites pending
		if (response.getOverwriteId() != null) {
			result.put("overwriteId", response.getOverwriteId());
		}
		if (response.getOverwrites() != null && !response.getOverwrites().isEmpty()) {
			result.put("overwrites", response.getOverwrites());
		}

		return result;
	}

	public Map<String, Object> confirmBatchUpgradeOverwrites(String overwriteId) {
		Map<String, Object> response = new HashMap<>();

		try {
			// Retrieve overwrite data
			OverwriteData overwriteData = overwriteStore.get(overwriteId);
			if (overwriteData == null) {
				response.put("message", "Overwrite session not found or expired");
				response.put("status", HttpStatus.NOT_FOUND);
				return response;
			}

			// Check if expired
			if (overwriteData.getCreatedAt().plusMinutes(OVERWRITE_EXPIRY_MINUTES).isBefore(ZonedDateTime.now())) {
				overwriteStore.remove(overwriteId); // Clean up expired data
				response.put("message", "Overwrite session has expired");
				response.put("status", HttpStatus.GONE);
				return response;
			}

			// Process overwrites - update existing workflows
			List<String> updatedProcesses = new ArrayList<>();
			List<String> failedUpdates = new ArrayList<>();

			for (OverwriteDevice overwrite : overwriteData.getOverwrites()) {
				try {
					// Find existing workflow
					List<WorkflowExecution> existingWorkflows = workflowExecutionRepository.findByDeviceIds(
						List.of(overwrite.getDeviceId()));

					if (existingWorkflows.isEmpty()) {
						failedUpdates.add(overwrite.getDeviceId() + ": Workflow not found");
						continue;
					}

					WorkflowExecution existingWorkflow = existingWorkflows.get(0);

					// Update workflow with new values
					if (overwrite.getChanges().contains("scheduledTime") && overwrite.getNewValues().getScheduledTime() != null) {
						existingWorkflow.setScheduledTime(overwrite.getNewValues().getScheduledTime());
					}
					if (overwrite.getChanges().contains("assignedDtac")) {
						existingWorkflow.setAssignedDtac(overwrite.getNewValues().getAssignedDtac());
					}
					if (overwrite.getChanges().contains("customerEmail")) {
						existingWorkflow.setLocalCustomerEmailContact(overwrite.getNewValues().getCustomerEmail());
					}

					// Update process variables if process is still running
					try {
						Map<String, Object> variables = new HashMap<>();
						if (overwrite.getChanges().contains("scheduledTime") && overwrite.getNewValues().getScheduledTime() != null) {
							// Convert to Instant for Flowable timer compatibility
							variables.put("scheduledUpgradeDateTime", overwrite.getNewValues().getScheduledTime().toInstant());
							ZonedDateTime preUpgradeTime = overwrite.getNewValues().getScheduledTime().minusDays(7);
							variables.put("preUpgradeDateTime", preUpgradeTime.toInstant());
						}
						if (overwrite.getChanges().contains("assignedDtac")) {
							variables.put("assignedDTAC", overwrite.getNewValues().getAssignedDtac());
						}
						if (overwrite.getChanges().contains("customerEmail")) {
							variables.put("customerEmail", overwrite.getNewValues().getCustomerEmail());
						}

						if (!variables.isEmpty()) {
							runtimeService.setVariables(existingWorkflow.getFlowInstanceId(), variables);
						}
					} catch (Exception e) {
						log.warn("Could not update runtime variables for process {}: {}", existingWorkflow.getFlowInstanceId(), e.getMessage());
						// Continue with database update even if runtime update fails
					}

					// Save updated workflow
					existingWorkflow.setStatus("OVERWRITTEN");
					workflowExecutionRepository.save(existingWorkflow);

					updatedProcesses.add(overwrite.getDeviceId() + ": " + existingWorkflow.getFlowInstanceId());

				} catch (Exception e) {
					failedUpdates.add(overwrite.getDeviceId() + ": " + e.getMessage());
					log.error("Failed to update workflow for device {}: {}", overwrite.getDeviceId(), e.getMessage());
				}
			}

			// Remove processed overwrite data
			overwriteStore.remove(overwriteId);

			response.put("message", "Batch upgrade overwrites confirmed and processed");
			response.put("updatedProcesses", updatedProcesses);
			response.put("failedUpdates", failedUpdates);
			response.put("totalOverwrites", overwriteData.getOverwrites().size());
			response.put("successfulUpdates", updatedProcesses.size());
			response.put("status", HttpStatus.OK);

			log.info("Processed overwrite confirmation {}: {} successful, {} failed",
				overwriteId, updatedProcesses.size(), failedUpdates.size());

		} catch (Exception e) {
			log.error("Error confirming overwrites", e);
			response.put("message", "Error confirming overwrites: " + e.getMessage());
			response.put("status", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return response;
	}

	public com.prodapt.flowable.entity.Task assignWorkflowToTask(ZonedDateTime scheduledTime, String assignedDtac, WorkflowExecution workflow) {
		// Find employee
		com.prodapt.flowable.entity.Employee employee = employeeRepository.findByAttUid(assignedDtac)
			.orElseThrow(() -> new RuntimeException("Employee not found: " + assignedDtac));

		// Check if task already exists for this employee and time
		Optional<com.prodapt.flowable.entity.Task> existingTaskOpt = taskRepository.findByAssignedEmployeeAttUidAndStartTime(assignedDtac, scheduledTime);

		if (existingTaskOpt.isPresent()) {
			// Append to existing task
			com.prodapt.flowable.entity.Task existingTask = existingTaskOpt.get();
			existingTask.getWorkflows().add(workflow);
			existingTask.setWorkflowCount(existingTask.getWorkflowCount() + 1);
			workflow.setTask(existingTask);
			return taskRepository.save(existingTask);
		} else {
			// Create new task
			com.prodapt.flowable.entity.Task newTask = new com.prodapt.flowable.entity.Task();
			newTask.setId(UUID.randomUUID().toString());
			newTask.setStartTime(scheduledTime);
			newTask.setEndTime(scheduledTime.plusHours(1));
			newTask.setAssignedEmployee(employee);
			newTask.setWorkflows(new ArrayList<>(List.of(workflow)));
			newTask.setWorkflowCount(1);
			workflow.setTask(newTask);
			return taskRepository.save(newTask);
		}
	}

	/**
	 * Check if a row is completely empty
	 */
	private boolean isRowEmpty(Row row) {
		for (int i = 0; i < 6; i++) {
			Cell cell = row.getCell(i);
			if (cell != null && cell.getCellType() != org.apache.poi.ss.usermodel.CellType.BLANK 
				&& !getCellValueAsString(cell).isEmpty()) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Parse serial number from cell, handling both numeric and string formats
	 */
	private Integer parseSerialNumber(Cell cell) {
		if (cell == null) {
			throw new IllegalArgumentException("Serial Number is required");
		}
		
		String value = getCellValueAsString(cell);
		if (value.isEmpty()) {
			throw new IllegalArgumentException("Serial Number is required");
		}
		
		try {
			return Integer.parseInt(value);
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException("Serial Number must be a valid number");
		}
	}

	/**
	 * Parse date cell, handling both string (DD-MM-YYYY) and date formatted cells
	 */
	private String parseDateCell(Cell cell) {
		if (cell == null) {
			return "";
		}

		// Handle date-formatted cells
		if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
			java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd-MM-yyyy");
			return sdf.format(cell.getDateCellValue());
		}

		// Handle string cells
		String dateStr = getCellValueAsString(cell);
		if (!dateStr.isEmpty()) {
			// Check if it's already in the correct format or needs conversion
			if (dateStr.contains("/")) {
				// Convert DD/MM/YYYY to DD-MM-YYYY
				dateStr = dateStr.replace("/", "-");
			}
		}
		
		return dateStr;
	}

	/**
	 * Parse time cell, handling both string (HH:mm) and date/time formatted cells
	 */
	private String parseTimeCell(Cell cell) {
		if (cell == null) {
			return "";
		}

		// Handle date/time formatted cells
		if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
			java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("HH:mm");
			return sdf.format(cell.getDateCellValue());
		}

		// Handle string cells
		String timeStr = getCellValueAsString(cell);
		if (!timeStr.isEmpty()) {
			// Remove seconds if present (HH:mm:ss -> HH:mm)
			if (timeStr.matches("\\d{2}:\\d{2}:\\d{2}")) {
				timeStr = timeStr.substring(0, 5);
			}
			// Handle 12-hour format if needed
			timeStr = timeStr.trim();
		}
		
		return timeStr;
	}

	/**
	 * Extract cell value as string, handling different cell types
	 */
	private String getCellValueAsString(Cell cell) {
		if (cell == null) {
			return "";
		}
		
		switch (cell.getCellType()) {
			case STRING:
				return cell.getStringCellValue().trim();
			case NUMERIC:
				// Return integer if it's a whole number, otherwise decimal
				double numValue = cell.getNumericCellValue();
				if (numValue == Math.floor(numValue)) {
					return String.valueOf((int) numValue);
				}
				return String.valueOf(numValue);
			case BOOLEAN:
				return String.valueOf(cell.getBooleanCellValue());
			case FORMULA:
				// Evaluate formula and return result
				try {
					return cell.getStringCellValue().trim();
				} catch (IllegalStateException e) {
					return String.valueOf(cell.getNumericCellValue());
				}
			case BLANK:
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
	public static class BatchUpgradeRow {
		private Integer serialNumber;
		private String uCpeHostName;
		private String date; // DD-MM-YYYY
		private String time; // HH:mm
		private String assignedDtacAttuid;
		private String customerEmail;
	}

	@Data
	public static class OverwriteDevice {
		private String deviceId;
		private DeviceValues oldValues;
		private DeviceValues newValues;
		private List<String> changes;

		public OverwriteDevice(String deviceId, WorkflowExecution existing, DeviceRequest newRequest) {
			this.deviceId = deviceId;
			this.oldValues = new DeviceValues();
			this.newValues = new DeviceValues();
			this.changes = new ArrayList<>();

			// Set old values from existing workflow
			oldValues.setScheduledTime(existing.getScheduledTime());
			oldValues.setAssignedDtac(existing.getAssignedDtac());
			oldValues.setCustomerEmail(existing.getLocalCustomerEmailContact());

			// Set new values from request
			newValues.setAssignedDtac(newRequest.getAssignedDtac());
			newValues.setCustomerEmail(newRequest.getCustomerEmail());
			if (newRequest.getScheduledZoneDateTime() != null && !newRequest.getScheduledZoneDateTime().trim().isEmpty()) {
				try {
					newValues.setScheduledTime(ZonedDateTime.parse(newRequest.getScheduledZoneDateTime()));
				} catch (Exception e) {
					// Keep null if parsing fails
				}
			}

			// Determine changes, but check 3-day rule for scheduledTime
			if (!Objects.equals(oldValues.getScheduledTime(), newValues.getScheduledTime())) {
				// Check if existing scheduled time is within 3 days
				if (oldValues.getScheduledTime() != null &&
					oldValues.getScheduledTime().isBefore(ZonedDateTime.now().plusDays(3))) {
					// Cannot reschedule - existing time is too close
					// Don't add "scheduledTime" to changes
				} else {
					changes.add("scheduledTime");
				}
			}
			if (!Objects.equals(oldValues.getAssignedDtac(), newValues.getAssignedDtac())) {
				changes.add("assignedDtac");
			}
			if (!Objects.equals(oldValues.getCustomerEmail(), newValues.getCustomerEmail())) {
				changes.add("customerEmail");
			}
		}
	}

	@Data
	public static class DeviceValues {
		private ZonedDateTime scheduledTime;
		private String assignedDtac;
		private String customerEmail;
	}

	@Data
	public static class OverwriteData {
		private String id;
		private List<OverwriteDevice> overwrites;
		private ZonedDateTime createdAt;
		private List<DeviceRequest> newDevices;

		public OverwriteData() {
			this.id = UUID.randomUUID().toString();
			this.overwrites = new ArrayList<>();
			this.newDevices = new ArrayList<>();
			this.createdAt = ZonedDateTime.now();
		}
	}

	@Data
	public static class FailedDevice {
		private String deviceId;
		private String reason;
		private String details;
		private ZonedDateTime scheduledTime;
	}

	@Data
	public static class BatchUpgradeResponse {
		private String message;
		private String overwriteId;
		private List<OverwriteDevice> overwrites;
		private List<String> newDevicesProcessed;
		private Integer duplicatesSkipped;
		private List<FailedDevice> failedDevices;
		private Integer totalDevices;
	}
}
