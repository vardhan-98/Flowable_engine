# Flowable Device Upgrade Workflow Engine

A Spring Boot application that automates device upgrade workflows using Flowable BPMN engine and Timefold Solver for intelligent scheduling. This system manages the complete lifecycle of device upgrades including scheduling, pre-upgrade checks, device reboots, and post-upgrade validation.

## Introduction

This project implements an automated device upgrade workflow system that:
- Orchestrates complex multi-step upgrade processes using BPMN workflows
- Intelligently schedules upgrades based on employee availability, shifts, and capacity
- Provides both manual and automatic scheduling capabilities
- Supports rescheduling with validation and limits
- Sends email notifications at key workflow stages
- Tracks all workflow activities and logs to Elasticsearch

The system is designed for telecom/network environments where device upgrades must be carefully scheduled and monitored.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [How Scheduling Works](#how-scheduling-works)
3. [API Endpoints](#api-endpoints)
4. [Workflow Process](#workflow-process)
5. [Delegates Reference](#delegates-reference)
6. [Build and Test](#build-and-test)
7. [Configuration](#configuration)

---

## Getting Started

### Prerequisites

- **Java 21** or higher
- **Maven 3.6+**
- **PostgreSQL** database
- **Elasticsearch** (for logging)
- **SMTP Server** (for email notifications)

### Installation Process

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Flowable_engine/flowable
   ```

2. **Configure the application**
   
   Edit `src/main/resources/application.properties`:
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:postgresql://localhost:5432/flowable_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   
   # Elasticsearch Configuration
   spring.elasticsearch.uris=http://localhost:9200
   
   # Email Configuration
   spring.mail.host=smtp.your-server.com
   spring.mail.port=587
   spring.mail.username=your_email@example.com
   spring.mail.password=your_password
   
   # Scheduling Configuration
   app.max.devices.per.slot=5
   ```

3. **Build the project**
   ```bash
   # On Unix/Linux/Mac
   ./mvnw clean install
   
   # On Windows
   mvnw.cmd clean install
   ```

4. **Run the application**
   ```bash
   # On Unix/Linux/Mac
   ./mvnw spring-boot:run
   
   # On Windows
   mvnw.cmd spring-boot:run
   ```

5. **Access the application**
   - API Base URL: `http://localhost:8080/api`
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Software Dependencies

The application uses the following key dependencies:
- **Spring Boot 3.5.6** - Application framework
- **Flowable 7.0.1** - BPMN workflow engine
- **Timefold Solver 1.16.0** - Intelligent scheduling optimization
- **PostgreSQL** - Relational database
- **Elasticsearch** - Logging and search
- **Spring Mail** - Email notifications
- **Lombok** - Code generation

---

## How Scheduling Works

The system uses **Timefold Solver** to intelligently assign device upgrades to available employees based on multiple constraints.

### Scheduling Logic

#### 1. **Manual Scheduling** (ScheduleDelegate)
When a specific upgrade time is provided:
- Validates the requested time is in the future
- Creates a 4-hour work window from the exact requested time
- Assigns to the least occupied employee with "upgrade" skill who:
  - Has a shift covering the 4-hour window
  - Is not on leave during the window
  - Has capacity available (< 5 devices per window)
- Sets timer events for pre-upgrade (7 days before) and scheduled upgrade times
- Sends email notification to customer

#### 2. **Auto-Scheduling** (AutoScheduleDelegate)
When no specific time is provided:
- Searches for available 4-hour slots starting 30 days from now
- Looks up to 60 days ahead to find availability
- Uses predefined time slots: 0:00, 4:00, 8:00, 12:00, 16:00, 20:00 UTC
- Selects the first available slot with employee capacity
- Applies same assignment logic as manual scheduling

#### 3. **Key Scheduling Features**
- **4-hour work windows**: Each upgrade is assigned a 4-hour slot
- **Shift-aware**: Respects employee shift times (including overnight shifts)
- **Capacity management**: Maximum 5 devices per employee per slot (configurable)
- **Leave management**: Automatically excludes employees on leave
- **Load balancing**: Assigns to least occupied employee for the day
- **Task reuse**: Multiple workflows can share the same task if scheduled at identical times

#### 4. **Re-scheduling Window**
- Opens 7 days before the scheduled upgrade time
- Allows customers to reschedule up to 3 times
- Re-assignment follows the same scheduling logic
- Tracks reschedule count per workflow

---

## API Endpoints

### 1. Start Batch Device Upgrade

**Endpoint:** `POST /api/devices/start-batch-upgrade`

Starts upgrade workflows for multiple devices in a single batch request.

**Request Body:**
```json
[
  {
    "deviceId": "DEVICE-001",
    "customerEmail": "customer@example.com",
    "scheduledZoneDateTime": "2025-11-15T14:00:00Z"
  },
  {
    "deviceId": "DEVICE-002",
    "customerEmail": "customer2@example.com"
  }
]
```

**Parameters:**
- `deviceId` (required): Unique device identifier
- `customerEmail` (required): Customer email for notifications
- `scheduledZoneDateTime` (optional): ISO 8601 datetime in UTC
  - If provided: Uses manual scheduling at specified time
  - If omitted: Uses auto-scheduling (finds first available slot 30+ days ahead)

**Response:**
```json
{
  "message": "Batch device upgrade initiated",
  "totalDevices": 2,
  "completed": 2,
  "processes": [
    "DEVICE-001: process-instance-id-1",
    "DEVICE-002: process-instance-id-2"
  ]
}
```

**Behavior:**
- Creates a workflow instance for each device
- Each workflow independently goes through the scheduling process
- Manual scheduled times must be in the future
- Invalid times fall back to auto-scheduling
- Returns process instance IDs for tracking

### 2. Reschedule Device Upgrade

**Endpoint:** `POST /api/devices/reschedule/{processInstanceId}`

Reschedules an active workflow to a new time during the re-scheduling window.

**Path Parameter:**
- `processInstanceId`: The Flowable process instance ID

**Request Body:**
```json
{
  "newScheduledZoneDateTime": "2025-11-20T10:00:00Z"
}
```

**Response:**
```json
{
  "message": "Device upgrade rescheduled successfully",
  "processInstanceId": "process-instance-id",
  "newScheduledTime": "2025-11-20T10:00:00Z",
  "preUpgradeTime": "2025-11-13T10:00:00Z",
  "rescheduleCount": 1
}
```

**Validation Rules:**
- Process must be in the "Re-Scheduling Window" state (Activity_19qntoo)
- New time must be in the future
- Maximum 3 reschedules allowed per workflow
- Triggers ScheduleModifierDelegate to reassign employee

**Error Responses:**
- `404`: Process instance not found
- `400`: Not in reschedule window, time in past, or limit exceeded
- `500`: Internal error during rescheduling

### 3. Get Workflow Executions

**Endpoint:** `POST /api/workflow-executions?page=0&size=10`

Retrieves paginated workflow execution records with filtering.

**Request Body (all fields optional):**
```json
{
  "deviceIds": ["DEVICE-001", "DEVICE-002"],
  "workflows": ["DeviceUpgrade"],
  "completed": false,
  "emailContact": "customer@example.com",
  "createdAtFrom": "2025-11-01T00:00:00Z",
  "createdAtTo": "2025-11-30T23:59:59Z",
  "scheduledTimeFrom": "2025-12-01T00:00:00Z",
  "scheduledTimeTo": "2025-12-31T23:59:59Z",
  "processNames": ["Upgrade flow"],
  "processFlowIds": ["Process_1"],
  "sort": {
    "createdAt": "desc",
    "scheduledTime": "asc"
  }
}
```

### 4. Get Process Diagram

**Endpoint:** `GET /api/process-instance/{processInstanceId}/diagram`

Returns BPMN diagram with execution state visualization.

### 5. Get Logs

**Endpoint:** `GET /api/logs?flowId={processInstanceId}`

Retrieves all Elasticsearch logs for a specific workflow.

---

## Workflow Process

The upgrade workflow is defined in `flowable/src/main/resources/processes/upgradeWorkflow.bpmn20.xml`

### Process Flow Diagram

```
Start → Device Compatibility Check → [Gateway]
                                         ↓
                      ┌─────────────────┴─────────────────┐
                      ↓                                   ↓
          Has scheduledUpgradeDateTime?              No scheduled time?
                      ↓                                   ↓
           Schedule and Send Email              AutoSchedule and Send Email
                      ↓                                   ↓
                      └─────────────────┬─────────────────┘
                                        ↓
                            Re-Scheduling Window ←─────┐
                         (Receive Task - 7 days)       │
                                        ↓               │
                          ┌─────────────┼────────┐      │
                          ↓             ↓        ↓      │
                    RescheduleMessage   │   PreUpgradeTimer
                          ↓             │        ↓
                   Schedule Modifier────┘   Device Compatibility Check
                                             ↓
                                        Pre Upgrade Backup
                                             ↓
                                        Scheduled Time Timer
                                             ↓
                                        Upgrade Reboot Device
                                             ↓
                                        Management Port
                                             ↓
                                        Post Reboot Checks
                                             ↓
                                        Device Activation
                                             ↓
                                        VNF Spin UP
                                             ↓
                                        Flow Complete
```

### Key Process Elements

1. **Start Event**: Initiates the workflow
2. **Exclusive Gateway**: Routes to manual or auto-scheduling based on input
3. **Re-Scheduling Window**: 7-day window before upgrade where customer can reschedule
4. **Boundary Timer Events**:
   - PreUpgradeTimer: Fires 7 days before scheduled time
   - Scheduled Time Timer: Fires at exact upgrade time
5. **Service Tasks**: Execute delegates for each step
6. **End Event**: Completes the workflow

---

## Delegates Reference

All delegates are located in `flowable/src/main/java/com/prodapt/flowable/delegate/upgrade/`

### Core Scheduling Delegates

#### 1. **CheckDeviceCompatibilityDelegate** (`DeviceCompatibilityCheck`)
- **Purpose**: Validates device compatibility before scheduling
- **When**: First step after workflow start, and again before pre-upgrade backup
- **Actions**:
  - Checks if device supports the upgrade
  - Validates firmware compatibility
  - Sets compatibility status in workflow variables
  - Logs results to Elasticsearch

#### 2. **ScheduleDelegate** (`Schedule`)
- **Purpose**: Manual scheduling at user-specified time
- **When**: Triggered when `scheduledUpgradeDateTime` variable is set
- **Actions**:
  - Retrieves the specified upgrade time
  - Assigns workflow to employee using SchedulingService
  - Sets timer variables: `scheduledUpgradeDateTime` and `preUpgradeDateTime` (7 days before)
  - Sends email notification to customer
  - Logs scheduling completion

#### 3. **AutoScheduleDelegate** (`AutoSchedule`)
- **Purpose**: Automatic scheduling when no time specified
- **When**: Triggered when `scheduledUpgradeDateTime` is null
- **Actions**:
  - Searches for available slots 30-90 days ahead
  - Selects first available 4-hour slot with employee capacity
  - Assigns workflow to least occupied employee
  - Sets timer variables
  - Sends email notification
  - Logs auto-scheduling results

#### 4. **ScheduleModifierDelegate** (`ScheduleModifier`)
- **Purpose**: Handles rescheduling requests during re-scheduling window
- **When**: Triggered when reschedule message is received
- **Actions**:
  - Retrieves new scheduled time from variables
  - Validates reschedule is allowed (< 3 times)
  - Unassigns from current employee task
  - Reassigns to available employee at new time
  - Updates timer variables
  - Sends reschedule confirmation email
  - Increments reschedule counter

### Pre-Upgrade Delegates

#### 5. **PreUpgradeBackupDelegate** (`PreUpgradeBackup`)
- **Purpose**: Creates device backup before upgrade
- **When**: Triggered by PreUpgradeTimer (7 days before scheduled time)
- **Actions**:
  - Initiates device configuration backup
  - Stores backup reference
  - Validates backup completion
  - Logs backup status

### Upgrade Execution Delegates

#### 6. **RebootDeviceDelegate** (`RebootDevice`)
- **Purpose**: Reboots device to apply upgrade
- **When**: Triggered at scheduled upgrade time
- **Actions**:
  - Sends reboot command to device
  - Monitors reboot progress
  - Waits for device to come back online
  - Logs reboot status

#### 7. **MgmtPortDelegate** (`MgmtPort`)
- **Purpose**: Configures management port settings post-reboot
- **When**: After device reboot completes
- **Actions**:
  - Configures management interface
  - Validates port accessibility
  - Sets up remote access parameters
  - Logs configuration results

#### 8. **PostRebootChecksDelegate** (`PostRebootChecks`)
- **Purpose**: Validates device health after reboot
- **When**: After management port configuration
- **Actions**:
  - Performs health checks
  - Validates services are running
  - Checks network connectivity
  - Verifies upgrade success
  - Logs validation results

#### 9. **DeviceActivationDelegate** (`DeviceActivation`)
- **Purpose**: Activates device for production use
- **When**: After post-reboot checks pass
- **Actions**:
  - Enables device in network
  - Updates device status
  - Restores configurations
  - Logs activation status

#### 10. **VnfSpinUpDelegate** (`VnfSpinUp`)
- **Purpose**: Spins up Virtual Network Functions
- **When**: Final step after device activation
- **Actions**:
  - Initializes VNF instances
  - Configures VNF parameters
  - Validates VNF operation
  - Marks workflow as complete
  - Logs VNF startup results

### Delegate Design Patterns

All delegates follow a consistent pattern:
```java
@Component("DelegateName")
public class DelegateClass implements JavaDelegate {
    
    @Override
    public void execute(DelegateExecution execution) {
        // 1. Extract variables
        String deviceId = (String) execution.getVariable("deviceId");
        String flowId = execution.getProcessInstanceId();
        
        // 2. Log start
        elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", 
            "stepName", "STARTED", "message");
        
        // 3. Execute business logic
        try {
            // Perform delegate-specific actions
            
            // 4. Log completion
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", 
                "stepName", "COMPLETED", "result");
        } catch (Exception e) {
            // 5. Log failure
            elasticsearchService.logEvent(flowId, deviceId, "DeviceUpgrade", 
                "stepName", "FAILED", e.getMessage());
            throw e;
        }
    }
}
```

---

## Build and Test

### Build the Application

```bash
# Clean and build
./mvnw clean install

# Build without tests
./mvnw clean install -DskipTests

# Package as WAR
./mvnw clean package
```

### Run Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=FlowableApplicationTests

# Run with coverage
./mvnw test jacoco:report
```

### Run the Application

```bash
# Development mode with auto-reload
./mvnw spring-boot:run

# With specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Production deployment (after building WAR)
java -jar target/flowable-0.0.1-SNAPSHOT.war
```

### Development Tools

The project includes:
- **Spring Boot DevTools**: Auto-restart on code changes
- **Lombok**: Reduces boilerplate code
- **Swagger/OpenAPI**: API documentation at `/swagger-ui.html`

---

## Configuration

### Key Configuration Properties

Edit `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/flowable_db
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# Flowable
flowable.database-schema-update=true
flowable.async-executor-activate=true

# Elasticsearch
spring.elasticsearch.uris=http://localhost:9200
spring.elasticsearch.username=elastic
spring.elasticsearch.password=password

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Scheduling
app.max.devices.per.slot=5

# Logging
logging.level.com.prodapt.flowable=INFO
logging.level.org.flowable=WARN
```

### Environment Variables

You can override properties with environment variables:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/flowable_db
export SPRING_MAIL_PASSWORD=your-secure-password
export APP_MAX_DEVICES_PER_SLOT=10
```

---

## Project Structure

```
flowable/
├── src/main/java/com/prodapt/flowable/
│   ├── config/              # Configuration classes
│   ├── controller/          # REST API controllers
│   ├── delegate/upgrade/    # BPMN workflow delegates
│   ├── entity/              # JPA entities
│   ├── repository/          # Data repositories
│   └── service/             # Business services
│       └── scheduler/       # Scheduling logic
├── src/main/resources/
│   ├── processes/           # BPMN workflow definitions
│   ├── static/              # Static resources
│   ├── templates/           # Email templates
│   └── application.properties
└── pom.xml                  # Maven configuration
```

---

## Contributing

If you want to contribute to this project:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Additional Resources

- [Flowable Documentation](https://www.flowable.com/open-source/docs)
- [Timefold Solver Guide](https://timefold.ai/docs)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)

---

## License

This project is proprietary software developed for AT&T Flexware device upgrade automation.
