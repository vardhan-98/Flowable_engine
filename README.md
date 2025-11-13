# Flowable Engine - Device Upgrade Workflow Management System

A comprehensive workflow management system built with Spring Boot and Flowable BPM for orchestrating device upgrade processes. The system provides automated scheduling, task assignment, progress tracking, and integration with external services for seamless device management.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [Build and Test](#build-and-test)
- [How Scheduling Works](#how-scheduling-works)
  - [Batch Upgrade via API](#batch-upgrade-via-api)
  - [Excel Sheet Upload](#excel-sheet-upload)
  - [Task Assignment and Management](#task-assignment-and-management)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [External API Calls](#external-api-calls)
- [Workflow Process](#workflow-process)
- [Delegates Reference](#delegates-reference)
- [Configuration](#configuration)

## Getting Started

### Prerequisites

- **Java**: JDK 21 or higher
- **PostgreSQL**: Version 12 or higher
- **Elasticsearch**: Version 7.x or 8.x
- **Maven**: 3.6+ for building the project
- **Python**: 3.8+ (for running the mock NFX service)

### Environment Setup

1. **PostgreSQL Setup**:
   ```bash
   # Create database
   createdb flowable

   # Update connection details in application.properties if needed
   spring.datasource.url=jdbc:postgresql://localhost:5432/flowable
   spring.datasource.username=postgres
   spring.datasource.password=root
   ```

2. **Elasticsearch Setup**:
   ```bash
   # Start Elasticsearch (adjust path as needed)
   # Default configuration expects ES at http://192.168.5.52:8081
   # Update spring.elasticsearch.uris in application.properties if different
   ```

3. **Email Configuration** (Optional):
   - Update SMTP settings in `application.properties` for email notifications
   - Default configuration uses Gmail SMTP

### Running the Application

1. **Clone and Build**:
   ```bash
   git clone https://github.com/vardhan-98/Flowable_engine.git
   cd Flowable_engine/flowable
   mvn clean install
   ```

2. **Start Mock NFX Service**:
   ```bash
   cd flowable
   python script.py
   ```
   This starts the FastAPI mock server on `http://localhost:8000`

3. **Run the Application**:
   ```bash
   mvn spring-boot:run
   ```
   The application will start on `http://localhost:8080`

4. **Access Points**:
   - **API Documentation**: `http://localhost:8080/swagger-ui.html`
   - **Application**: `http://localhost:8080`

## Build and Test

### Building the Project

```bash
# Clean and build
mvn clean install

# Build without tests
mvn clean install -DskipTests

# Run tests only
mvn test
```

### Database Initialization

The application automatically creates database schemas and loads sample data on startup:

- **flowable_internal**: Flowable BPM engine tables
- **app_data**: Application-specific entities
- **Sample Employees**: 6 sample employees are created if the database is empty

### Testing

```bash
# Run unit tests
mvn test

# Run integration tests
mvn verify

# Generate test reports
mvn surefire-report:report
```

## How Scheduling Works

The system supports two primary methods for scheduling device upgrades: direct API calls and Excel file uploads. Both methods handle batch processing, duplicate detection, and conflict resolution.

### Batch Upgrade via API

**Endpoint**: `POST /api/devices/start-batch-upgrade`

**Request Body**:
```json
[
  {
    "deviceId": "cpe.example.com",
    "customerEmail": "customer@example.com",
    "assignedDtac": "john.doe",
    "scheduledZoneDateTime": "2025-11-15T14:00:00Z"
  }
]
```

**Response**:
```json
{
  "message": "Batch device upgrade initiated",
  "processes": ["cpe.example.com: process-instance-id"],
  "totalDevices": 1,
  "completed": 1
}
```

### Excel Sheet Upload

**Template Download**: `GET /api/batch-upgrade/template`

**Upload Endpoint**: `POST /api/batch-upgrade/upload`

**Excel Format**:
| Serial Number | uCPE Host Name | Date (DD-MM-YYYY UTC) | Time (HH:mm UTC) | assignedDtac attuid | Customer Email |
|---------------|---------------|----------------------|------------------|-------------------|----------------|
| 1 | cpe.example.com | 15-11-2025 | 14:00 | john.doe | customer@example.com |

**Upload Response**:
```json
{
  "message": "Batch upgrade processed with overwrites pending confirmation",
  "overwriteId": "uuid-here",
  "overwrites": [...],
  "newDevicesProcessed": 5,
  "duplicatesSkipped": 2,
  "failedDevices": []
}
```

**Confirm Overwrites**: `POST /api/batch-upgrade/confirm/{overwriteId}`

### Task Assignment and Management

- **Automatic Assignment**: Workflows are automatically assigned to tasks based on scheduled time and available employees
- **Task Grouping**: Multiple workflows can be grouped into a single task for the same employee and time slot
- **Reassignment**: Workflows can be reassigned to different employees via API
- **3-Day Rule**: Scheduled upgrades cannot be rescheduled if within 3 days of execution

## Database Schema

The application uses a dual-schema approach for clean separation of concerns:

### Schema Overview

```
flowable_internal (Flowable BPM Tables)
├── ACT_* tables for process definitions, executions, history

app_data (Application Tables)
├── employee
├── task
├── workflow_execution
```

### Entity Relationships

```
Employee (1) ──── (N) Task
    │                   │
    │                   │
    └── (1) ──── (N) WorkflowExecution
                    │
                    │
                    └── (N) ──── (1) Task
```

### Key Tables

#### Employee
```sql
CREATE TABLE employee (
    att_uid VARCHAR PRIMARY KEY,
    email VARCHAR NOT NULL,
    role VARCHAR,
    skills TEXT[], -- PostgreSQL array
    first_name VARCHAR,
    last_name VARCHAR,
    is_active BOOLEAN DEFAULT true
);
```

#### Task
```sql
CREATE TABLE task (
    id VARCHAR PRIMARY KEY,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    assigned_user_id VARCHAR REFERENCES employee(att_uid),
    workflow_count INTEGER DEFAULT 0
);
```

#### WorkflowExecution
```sql
CREATE TABLE workflow_execution (
    flow_instance_id VARCHAR PRIMARY KEY,
    device_id VARCHAR,
    step VARCHAR,
    message TEXT,
    assigned_dtac VARCHAR,
    created_at TIMESTAMP,
    scheduled_time TIMESTAMP,
    device_compatibility_time TIMESTAMP,
    local_customer_email_contact VARCHAR,
    local_customer_mobile_contact VARCHAR,
    issuer VARCHAR,
    process_name VARCHAR,
    process_flow_id VARCHAR,
    task_id VARCHAR REFERENCES task(id),
    completed BOOLEAN DEFAULT false,
    completed_time TIMESTAMP,
    last_updated TIMESTAMP,
    re_schedule_count INTEGER,
    status VARCHAR
);
```

## API Endpoints

### Workflow Management

#### Get Workflow Executions
**Endpoint:** `POST /api/workflow-executions`  
**Method:** POST  
**Purpose:** Retrieve paginated workflow executions with optional filtering and sorting

**Query Parameters:**
- `page` (integer, default: 0): Page number for pagination
- `size` (integer, default: 10): Number of items per page

**Request Body:**
```json
{
  "deviceIds": ["cpe1", "cpe2"],
  "workflows": ["workflow1"],
  "completed": false,
  "emailContact": "customer@example.com",
  "createdAtFrom": "2023-01-01T00:00:00Z",
  "createdAtTo": "2023-12-31T23:59:59Z",
  "scheduledTimeFrom": "2023-01-01T00:00:00Z",
  "scheduledTimeTo": "2023-12-31T23:59:59Z",
  "processNames": ["Upgrade Process"],
  "processFlowIds": ["Process_1"],
  "sort": {
    "createdAt": "desc",
    "deviceId": "asc"
  }
}
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "flowInstanceId": "process-instance-id",
      "deviceId": "cpe.example.com",
      "step": "STARTED",
      "message": "Workflow initiated",
      "assignedDtac": "john.doe",
      "createdAt": "2023-11-14T10:00:00Z",
      "scheduledTime": "2023-11-20T14:00:00Z",
      "deviceCompatibilityTime": null,
      "localCustomerEmailContact": "customer@example.com",
      "localCustomerMobileContact": null,
      "issuer": null,
      "processName": "Device Upgrade Process",
      "processFlowId": "Process_1",
      "taskId": "task-uuid",
      "completed": false,
      "completedTime": null,
      "lastUpdated": "2023-11-14T10:00:00Z",
      "reScheduleCount": 0,
      "status": "STARTED"
    }
  ],
  "pageable": {
    "page": 0,
    "size": 10,
    "sort": ["createdAt: DESC"]
  },
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

#### Get Process Instance Diagram
**Endpoint:** `GET /api/process-instance/{processInstanceId}/diagram`  
**Method:** GET  
**Purpose:** Retrieve BPMN diagram and execution details for a specific process instance

**Path Parameters:**
- `processInstanceId` (string): The ID of the process instance

**Response (200 OK):**
```json
{
  "bpmnXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><bpmn:definitions...>",
  "executedActivities": ["Activity_1", "Activity_2"],
  "activeActivities": ["Activity_3"],
  "activityDetails": {
    "Activity_1": {
      "startTime": "2023-11-14T10:00:00Z",
      "endTime": "2023-11-14T10:05:00Z"
    }
  }
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "timestamp": "2023-11-14T10:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Error retrieving diagram"
}
```

#### Get Task Details
**Endpoint:** `GET /api/tasks/{taskId}`  
**Method:** GET  
**Purpose:** Retrieve detailed information about a specific task

**Path Parameters:**
- `taskId` (string): The ID of the task

**Response (200 OK):**
```json
{
  "id": "task-uuid",
  "startTime": "2023-11-20T14:00:00Z",
  "endTime": "2023-11-20T15:00:00Z",
  "assignedUserId": "john.doe",
  "workflowCount": 3
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "timestamp": "2023-11-14T10:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Error retrieving task"
}
```

#### Get Logs for Flow Instance
**Endpoint:** `GET /api/logs`  
**Method:** GET  
**Purpose:** Retrieve Elasticsearch logs for a specific flow instance

**Query Parameters:**
- `flowId` (string, required): The flow instance ID to retrieve logs for

**Response (200 OK):**
```json
[
  {
    "id": "log-id-1",
    "flowId": "process-instance-id",
    "deviceId": "cpe.example.com",
    "step": "check_device_details",
    "stage": "STARTED",
    "message": "Checking device compatibility",
    "timestamp": "2023-11-14T10:00:00Z"
  },
  {
    "id": "log-id-2",
    "flowId": "process-instance-id",
    "deviceId": "cpe.example.com",
    "step": "check_device_details",
    "stage": "COMPLETED",
    "message": "Device compatibility check passed",
    "timestamp": "2023-11-14T10:05:00Z"
  }
]
```

#### Cancel Workflow
**Endpoint:** `DELETE /api/workflow/{processInstanceId}`  
**Method:** DELETE  
**Purpose:** Cancel/abort a running workflow process

**Path Parameters:**
- `processInstanceId` (string): The ID of the process instance to cancel

**Response (200 OK):**
```json
{
  "message": "Workflow aborted successfully",
  "processInstanceId": "process-instance-id",
  "status": "OK"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Process instance not found",
  "status": "NOT_FOUND"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Process instance is already completed and cannot be cancelled",
  "status": "BAD_REQUEST"
}
```

### Scheduling

#### Start Batch Upgrade
**Endpoint:** `POST /api/devices/start-batch-upgrade`  
**Method:** POST  
**Purpose:** Initiate batch device upgrade processes for multiple devices

**Request Body:**
```json
[
  {
    "deviceId": "cpe.example.com",
    "customerEmail": "customer@example.com",
    "assignedDtac": "john.doe",
    "scheduledZoneDateTime": "2025-11-15T14:00:00Z"
  },
  {
    "deviceId": "cpe2.example.com",
    "customerEmail": "customer2@example.com",
    "assignedDtac": "jane.smith",
    "scheduledZoneDateTime": "2025-11-16T10:00:00Z"
  }
]
```

**Response (200 OK):**
```json
{
  "message": "Batch device upgrade initiated",
  "processes": [
    "cpe.example.com: process-instance-id-1",
    "cpe2.example.com: process-instance-id-2"
  ],
  "totalDevices": 2,
  "completed": 2
}
```

#### Reschedule Device Upgrade
**Endpoint:** `POST /api/devices/reschedule/{processInstanceId}`  
**Method:** POST  
**Purpose:** Reschedule an existing device upgrade workflow

**Path Parameters:**
- `processInstanceId` (string): The ID of the process instance to reschedule

**Request Body:**
```json
{
  "newScheduledZoneDateTime": "2025-11-16T10:00:00Z",
  "assignedDTAC": "jane.smith"
}
```

**Response (200 OK):**
```json
{
  "message": "Device upgrade rescheduled successfully",
  "processInstanceId": "process-instance-id",
  "newScheduledTime": "2025-11-16T10:00:00Z",
  "preUpgradeTime": "2025-11-09T10:00:00Z",
  "rescheduleCount": 1,
  "status": "OK"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Process instance not found",
  "status": "NOT_FOUND"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Reschedule limit exceeded. Maximum 3 reschedules allowed.",
  "currentRescheduleCount": 3,
  "maxRescheduleCount": 3,
  "status": "BAD_REQUEST"
}
```

#### Download Batch Upgrade Template
**Endpoint:** `GET /api/batch-upgrade/template`  
**Method:** GET  
**Purpose:** Download Excel template for batch upgrade data entry

**Response (200 OK):**
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename=batch_upgrade_template.xlsx`
- Body: Excel file with template format

#### Upload Batch Upgrade Excel
**Endpoint:** `POST /api/batch-upgrade/upload`  
**Method:** POST  
**Purpose:** Upload Excel file containing batch upgrade data for processing

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: Multipart file (Excel .xlsx format)

**Response (200 OK):**
```json
{
  "message": "Batch upgrade processed with overwrites pending confirmation",
  "overwriteId": "uuid-string",
  "overwrites": [
    {
      "deviceId": "cpe.example.com",
      "oldValues": {
        "scheduledTime": "2025-11-15T14:00:00Z",
        "assignedDtac": "john.doe",
        "customerEmail": "old@example.com"
      },
      "newValues": {
        "scheduledTime": "2025-11-16T10:00:00Z",
        "assignedDtac": "jane.smith",
        "customerEmail": "new@example.com"
      },
      "changes": ["scheduledTime", "assignedDtac", "customerEmail"]
    }
  ],
  "newDevicesProcessed": 5,
  "duplicatesSkipped": 2,
  "failedDevices": [],
  "totalDevices": 7
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Validation errors found in Excel file",
  "errors": [
    "Row 2: Date must be in DD-MM-YYYY format",
    "Row 3: Customer Email is required"
  ],
  "status": "BAD_REQUEST"
}
```

#### Confirm Batch Upgrade Overwrites
**Endpoint:** `POST /api/batch-upgrade/confirm/{overwriteId}`  
**Method:** POST  
**Purpose:** Confirm and apply pending overwrites from batch upgrade processing

**Path Parameters:**
- `overwriteId` (string): The overwrite session ID from upload response

**Response (200 OK):**
```json
{
  "message": "Batch upgrade overwrites confirmed and processed",
  "updatedProcesses": [
    "cpe.example.com: process-instance-id-1",
    "cpe2.example.com: process-instance-id-2"
  ],
  "failedUpdates": [],
  "totalOverwrites": 2,
  "successfulUpdates": 2,
  "status": "OK"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Overwrite session not found or expired",
  "status": "NOT_FOUND"
}
```

### Employee Management

#### Get Active Employees in Date Range
**Endpoint:** `GET /api/employees`  
**Method:** GET  
**Purpose:** Retrieve list of active employees available within a specified date range

**Query Parameters:**
- `startDate` (string, required): Start date in ISO 8601 format (e.g., 2023-11-14T00:00:00Z)
- `endDate` (string, required): End date in ISO 8601 format (e.g., 2023-11-20T23:59:59Z)

**Response (200 OK):**
```json
[
  {
    "attUid": "john.doe",
    "email": "john.doe@company.com",
    "role": "Technician",
    "skills": ["networking", "security"],
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  },
  {
    "attUid": "jane.smith",
    "email": "jane.smith@company.com",
    "role": "Senior Technician",
    "skills": ["networking", "security", "cloud"],
    "firstName": "Jane",
    "lastName": "Smith",
    "isActive": true
  }
]
```

**Error Response (400 Bad Request):**
```json
"Invalid date format. Use ISO 8601 format (e.g., 2023-11-14T00:00:00Z)"
```

#### Get Employee with Tasks
**Endpoint:** `GET /api/employees/{attUid}`  
**Method:** GET  
**Purpose:** Retrieve detailed employee information including assigned tasks within a date range

**Path Parameters:**
- `attUid` (string): Employee's ATT UID

**Query Parameters:**
- `startDate` (string, optional): Start date in ISO 8601 format (default: 30 days ago)
- `endDate` (string, optional): End date in ISO 8601 format (default: 30 days from now)

**Response (200 OK):**
```json
{
  "attUid": "john.doe",
  "email": "john.doe@company.com",
  "role": "Technician",
  "skills": ["networking", "security"],
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "tasks": [
    {
      "id": "task-uuid-1",
      "startTime": "2023-11-20T14:00:00Z",
      "endTime": "2023-11-20T15:00:00Z",
      "assignedUserId": "john.doe",
      "workflowCount": 2
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
"{}"
```

#### Reassign Workflow
**Endpoint:** `POST /api/employees/reassign`  
**Method:** POST  
**Purpose:** Reassign a workflow from one employee to another

**Request Body:**
```json
{
  "workflowId": "process-instance-id",
  "newEmployeeAttUid": "jane.smith"
}
```

**Response (200 OK):**
```json
"Workflow reassigned successfully"
```

**Error Response (400 Bad Request):**
```json
"Workflow ID is required"
```

**Error Response (404 Not Found):**
```json
"Workflow not found or employee not found"
```

### Testing Endpoints

#### Test Email Functionality
**Endpoint:** `GET /api/test-emails`  
**Method:** GET  
**Purpose:** Test email sending functionality (development/testing only)

**Response (200 OK):**
```json
"Test emails sent successfully to harshvardhan.r@prodapt.com"
```

### Detailed Examples

#### Get Workflow Executions
```bash
POST /api/workflow-executions?page=0&size=10
Content-Type: application/json

{
  "deviceIds": ["cpe1", "cpe2"],
  "completed": false,
  "sort": {"createdAt": "desc"}
}
```

#### Start Batch Upgrade
```bash
POST /api/devices/start-batch-upgrade
Content-Type: application/json

[
  {
    "deviceId": "cpe.example.com",
    "customerEmail": "customer@example.com",
    "assignedDtac": "john.doe",
    "scheduledZoneDateTime": "2025-11-15T14:00:00Z"
  }
]
```

#### Reschedule Device Upgrade
```bash
POST /api/devices/reschedule/process-instance-id
Content-Type: application/json

{
  "newScheduledZoneDateTime": "2025-11-16T10:00:00Z",
  "assignedDTAC": "jane.smith"
}
```

#### Reassign Workflow
```bash
POST /api/employees/reassign
Content-Type: application/json

{
  "workflowId": "process-instance-id",
  "newEmployeeAttUid": "jane.smith"
}
```

## External API Calls

The system integrates with external NFX (Network Function Virtualization) services for device operations. All external calls are made via REST APIs with comprehensive logging.

### NFX Service Endpoints

| Path | Method | Purpose | Request Body | Response | Significance |
|------|--------|---------|--------------|----------|--------------|
| `/check_device_details` | POST | Validate device compatibility | `{flowInstanceID, deviceID, step}` | Device details JSON | Ensures device meets upgrade requirements before proceeding |
| `/pre_upgrade_backup` | POST | Create system backup | `{flowInstanceID, deviceID, step}` | Backup details | Critical safety step to prevent data loss during upgrade |
| `/reboot_device` | POST | Reboot device | `{flowInstanceID, deviceID, step}` | Status confirmation | Prepares device for upgrade installation |
| `/mgmt_port` | POST | Verify management port | `{flowInstanceID, deviceID, step}` | Port status | Ensures device connectivity post-reboot |
| `/post_reboot_checks` | POST | Validate post-reboot state | `{flowInstanceID, deviceID, step}` | Health check results | Confirms device stability after reboot |
| `/device_activation` | POST | Activate device services | `{flowInstanceID, deviceID, step}` | Activation status | Enables device functionality |
| `/vnf_spinup_and_config` | POST | Start VNF services | `{flowInstanceID, deviceID, step}` | Service status | Final step - brings up virtual network functions |
| `/stage_upgrade_image` | POST | Stage upgrade image | `{flowInstanceID, deviceID, step}` | Image details | Prepares upgrade files for deployment |
| `/verify_and_upgrade_bios` | POST | BIOS firmware update | `{flowInstanceID, deviceID, step}` | Update status | Hardware-level firmware upgrade |
| `/verify_and_upgrade_bluejacket` | POST | Bluejacket update | `{flowInstanceID, deviceID, step}` | Update status | Platform software update |
| `/verify_and_upgrade_nic` | POST | NIC firmware update | `{flowInstanceID, deviceID, step}` | Update status | Network interface firmware upgrade |
| `/verify_and_upgrade_ssd` | POST | SSD firmware update | `{flowInstanceID, deviceID, step}` | Update status | Storage firmware upgrade |

### External Call Pattern

All external API calls follow this pattern:
1. **Logging Start**: Log initiation to Elasticsearch
2. **HTTP Request**: POST to NFX service with authentication
3. **Response Validation**: Check for 2xx status codes
4. **Logging Result**: Log success/failure with details
5. **Error Handling**: Throw exceptions on failures

### Authentication

External calls support Bearer token authentication:
```java
headers.set("Authorization", "Bearer " + authToken);
```

## Workflow Process

The upgrade workflow is defined in `upgradeWorkflow.bpmn20.xml` and follows a comprehensive device upgrade lifecycle.

### Process Flow Overview

```
Start Process
    ↓
Device Compatibility Check (Subprocess)
    ↓
DTAC Assignment
    ↓
Reminder Emails (Parallel Process)
    ↓
Re-Scheduling Window (Receive Task)
    ↓
Schedule Modifier
    ↓
Pre-Upgrade Backup (3 days before)
    ↓
Gateway: Staging Flag Check
    ├── True: Image Staging → Device Compatibility → Reboot
    └── False: Device Compatibility → Reboot
    ↓
Management Port Check
    ↓
Post-Reboot Checks
    ↓
Device Activation
    ↓
VNF Spin-Up
    ↓
Flow Complete
```

### Key Decision Points

1. **Staging Flag**: Determines whether image staging is needed
   - `stagingFlag == "true"`: Perform image staging before compatibility checks
   - `stagingFlag == "false"`: Skip staging, proceed directly to compatibility

2. **Reminder System**: Parallel email reminders at multiple intervals
   - 7 days before: Weekly reminders if >7 days remaining
   - 3 days before: Daily reminders until 3 days out
   - 2 days before: Daily reminders until 2 days out
   - 1 day before: Daily reminders until 1 day out

3. **Re-scheduling Window**: User-triggered pause point
   - Process waits at "Re-Scheduling Window" receive task
   - External trigger required to continue or reschedule

### Timer Events

- **Pre-Upgrade Timer**: Triggers 3 days before scheduled time for backup
- **Scheduled Time Timer**: Main execution trigger at scheduled datetime
- **Reminder Timers**: Recurring timers for email notifications

### Error Handling

- All delegate failures are logged and cause process termination
- Workflow status updated in database on each step
- Comprehensive error tracking via Elasticsearch

## Delegates Reference

Delegates are Java classes that execute specific workflow steps. All delegates implement `JavaDelegate` and are automatically discovered by Flowable.

| Delegate | Purpose | Operations | Description |
|----------|---------|------------|-------------|
| `ScheduleDelegate` | Initial workflow scheduling | Assign to task, set timers | Assigns workflow to employee task, calculates pre-upgrade timing |
| `ScheduleModifierDelegate` | Handle rescheduling | Update process variables | Processes rescheduling requests and updates workflow timing |
| `PreUpgradeBackupDelegate` | System backup | Call NFX backup API | Creates device backup before upgrade operations |
| `ImageStagingDelegate` | Image preparation | Stage upgrade files | Downloads and prepares upgrade images on device |
| `CheckDeviceDetailsDelegate` | Compatibility validation | Hardware/software checks | Validates device meets upgrade requirements |
| `VerifyAndUpgradeBiosDelegate` | Firmware update | BIOS version check/update | Ensures BIOS firmware is current |
| `VerifyAndUpgradeBluejacketDelegate` | Platform update | Bluejacket check/update | Updates platform software layer |
| `VerifyAndUpgradeNicDelegate` | Network firmware | NIC firmware check/update | Updates network interface firmware |
| `VerifyAndUpgradeSsdDelegate` | Storage firmware | SSD firmware check/update | Updates storage device firmware |
| `RebootDeviceDelegate` | Device restart | Controlled reboot | Safely reboots device for upgrade |
| `MgmtPortDelegate` | Connectivity check | Port validation | Verifies management port accessibility |
| `PostRebootChecksDelegate` | Health validation | Post-reboot tests | Confirms device health after reboot |
| `DeviceActivationDelegate` | Service enablement | Activate services | Enables device services post-upgrade |
| `VnfSpinUpDelegate` | VNF orchestration | Start virtual functions | Launches virtual network functions |
| `ReminderEmailDelegate` | Notification system | Send emails | Sends scheduled reminder emails to stakeholders |

### Delegate Implementation Pattern

All delegates follow this consistent pattern:

```java
@Component("DelegateName")
public class DelegateNameDelegate implements JavaDelegate {
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ElasticsearchService elasticsearchService;

    @Override
    public void execute(DelegateExecution execution) {
        // Extract variables
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();

        // Log start
        elasticsearchService.logEvent(flowId, deviceId, "stage", "step", "STARTED", "message");

        // Make external API call
        // Handle response
        // Log result or throw exception
    }
}
```

## Configuration

### application.properties

```properties
# Application
spring.application.name=flowable
server.port=8080

# Database - PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/flowable
spring.datasource.username=postgres
spring.datasource.password=root
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS flowable_internal; CREATE SCHEMA IF NOT EXISTS app_data; SET search_path TO app_data, flowable_internal, public

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.default_schema=app_data

# Elasticsearch
spring.elasticsearch.uris=http://192.168.5.52:8081
spring.elasticsearch.connection-timeout=10s
spring.elasticsearch.socket-timeout=30s

# Flowable BPM
flowable.database-schema=flowable_internal
flowable.database-schema-update=true
flowable.process.definition-cache-limit=512
flowable.async-executor.enabled=true
flowable.async-executor.core-pool-size=4
flowable.async-executor.max-pool-size=8
flowable.history-level=full

# External Services
nfx.service.base.mock.url=http://localhost:8000
nfx.service.auth.token=

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.protocol=smtp
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.enable=false
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/flowable` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `root` |
| `SPRING_ELASTICSEARCH_URIS` | Elasticsearch URLs | `http://192.168.5.52:8081` |
| `NFX_SERVICE_BASE_MOCK_URL` | NFX service base URL | `http://localhost:8000` |
| `NFX_SERVICE_AUTH_TOKEN` | NFX API authentication token | (empty) |
| `SPRING_MAIL_USERNAME` | Email username | Gmail address |
| `SPRING_MAIL_PASSWORD` | Email app password | Gmail app password |

### Key Configuration Notes

- **Database Schemas**: Separate schemas prevent conflicts between Flowable tables and application data
- **Async Execution**: Flowable async executor improves performance for long-running tasks
- **History Level**: Full history tracking enables detailed process analytics
- **Email**: Requires Gmail app password for SMTP authentication
- **Elasticsearch**: Used for logging and audit trails, not strictly required for basic operation

---

This comprehensive system provides end-to-end workflow management for device upgrades, combining powerful BPM capabilities with robust external integrations and detailed monitoring. The modular architecture supports easy extension and customization for various upgrade scenarios.
