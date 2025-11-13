# Flowable Engine - Device Upgrade Orchestration System

A comprehensive workflow orchestration system built with Spring Boot and Flowable BPM for managing automated device upgrade processes. The system handles complex upgrade workflows with scheduling, monitoring, email notifications, and integration with external device management APIs.

## Detailed Table of Contents

### 1. Introduction and Overview
- [1.1 What is Flowable BPM Engine?](#11-what-is-flowable-bpm-engine)
- [1.2 Importance of Workflow Orchestration](#12-importance-of-workflow-orchestration)
- [1.3 System Architecture Overview](#13-system-architecture-overview)
- [1.4 Key Features and Capabilities](#14-key-features-and-capabilities)
- [1.5 Business Value and Use Cases](#15-business-value-and-use-cases)

### 2. Delegates in Depth
- [2.1 Understanding Java Delegates in Flowable](#21-understanding-java-delegates-in-flowable)
- [2.2 Importance of Delegates in Workflow Automation](#22-importance-of-delegates-in-workflow-automation)
- [2.3 Delegate Lifecycle and Execution](#23-delegate-lifecycle-and-execution)
- [2.4 Common Delegate Patterns](#24-common-delegate-patterns)
- [2.5 Detailed Delegate Operations](#25-detailed-delegate-operations)
  - [2.5.1 CheckDeviceDetailsDelegate](#251-checkdevicedetailsdelegate)
  - [2.5.2 RebootDeviceDelegate](#252-rebootdevicedelegate)
  - [2.5.3 ReminderEmailDelegate](#253-reminderemaildelegate)
  - [2.5.4 Compatibility Delegates](#254-compatibility-delegates)
  - [2.5.5 ScheduleModifierDelegate](#255-schedulemodifierdelegate)
  - [2.5.6 Other Delegates](#256-other-delegates)
- [2.6 Delegate Error Handling](#26-delegate-error-handling)
- [2.7 Delegate Logging and Monitoring](#27-delegate-logging-and-monitoring)

### 3. Workflow Decision Making
- [3.1 BPMN Elements for Decision Making](#31-bpmn-elements-for-decision-making)
- [3.2 Exclusive Gateways and Conditions](#32-exclusive-gateways-and-conditions)
- [3.3 Timer Events and Scheduling](#33-timer-events-and-scheduling)
- [3.4 Boundary Events](#34-boundary-events)
- [3.5 Variable Evaluation](#35-variable-evaluation)
- [3.6 Sub-process Execution](#36-sub-process-execution)

### 4. Internal Endpoints and Controllers
- [4.1 REST API Architecture](#41-rest-api-architecture)
- [4.2 FlowableController Endpoints](#42-flowablecontroller-endpoints)
- [4.3 EmployeeController Endpoints](#43-employeecontroller-endpoints)
- [4.4 Request/Response Patterns](#44-requestresponse-patterns)
- [4.5 Authentication and Security](#45-authentication-and-security)
- [4.6 Error Handling in APIs](#46-error-handling-in-apis)

### 5. External API Integration
- [5.1 NFX Service Architecture](#51-nfx-service-architecture)
- [5.2 API Calling Patterns from Delegates](#52-api-calling-patterns-from-delegates)
- [5.3 Authentication Mechanisms](#53-authentication-mechanisms)
- [5.4 Detailed External Endpoints](#54-detailed-external-endpoints)
- [5.5 Error Handling and Retry Logic](#55-error-handling-and-retry-logic)
- [5.6 API Performance and Monitoring](#56-api-performance-and-monitoring)

### 6. Workflow Process Deep Dive
- [6.1 Complete Workflow Lifecycle](#61-complete-workflow-lifecycle)
- [6.2 Device Compatibility Check Phase](#62-device-compatibility-check-phase)
- [6.3 Scheduling and Notification Phase](#63-scheduling-and-notification-phase)
- [6.4 Pre-Upgrade Preparation](#64-pre-upgrade-preparation)
- [6.5 Upgrade Execution](#65-upgrade-execution)
- [6.6 Post-Upgrade Verification](#66-post-upgrade-verification)
- [6.7 Workflow Completion](#67-workflow-completion)

### 7. Configuration and Best Practices
- [7.1 Application Properties Configuration](#71-application-properties-configuration)
- [7.2 Database Configuration](#72-database-configuration)
- [7.3 External Service Configuration](#73-external-service-configuration)
- [7.4 Flowable Engine Configuration](#74-flowable-engine-configuration)
- [7.5 Development Best Practices](#75-development-best-practices)

### 8. Troubleshooting and Examples
- [8.1 Common Issues and Solutions](#81-common-issues-and-solutions)
- [8.2 Sample Workflow Executions](#82-sample-workflow-executions)
- [8.3 Testing Strategies](#83-testing-strategies)
- [8.4 Performance Optimization](#84-performance-optimization)

---

## 1. Introduction and Overview

### 1.1 What is Flowable BPM Engine?

Flowable BPM (Business Process Management) is a powerful open-source workflow and Business Process Management (BPM) platform that enables organizations to model, execute, and monitor business processes. At its core, Flowable provides a robust engine that interprets BPMN (Business Process Model and Notation) diagrams and executes them as running process instances.

#### Key Components of Flowable:
- **Process Engine**: The heart of Flowable that executes BPMN processes
- **DMN Engine**: For decision table execution
- **CMMN Engine**: For case management
- **Form Engine**: For dynamic form generation
- **IDM Engine**: For identity management

#### BPMN 2.0 Standard:
BPMN (Business Process Model and Notation) is the global standard for process modeling. It provides a graphical notation that business users and technical developers can understand. BPMN diagrams consist of various elements:

- **Events**: Things that happen during a process (start, end, intermediate)
- **Activities**: Work that needs to be performed (tasks, sub-processes)
- **Gateways**: Decision points in the process
- **Sequence Flows**: The order of execution
- **Data Objects**: Information used or produced
- **Pools and Lanes**: Organizational boundaries

In this system, we use BPMN 2.0 to model complex device upgrade workflows that involve multiple steps, decisions, timers, and external integrations.

### 1.2 Importance of Workflow Orchestration

Workflow orchestration is critical in modern enterprise applications because it provides:

#### Process Automation:
- Eliminates manual intervention in repetitive tasks
- Reduces human error
- Ensures consistent execution across all instances
- Enables 24/7 operation without human supervision

#### Complex Process Management:
- Handles multi-step processes with dependencies
- Manages parallel execution paths
- Coordinates between different systems and services
- Maintains process state across long-running operations

#### Business Rules Enforcement:
- Ensures compliance with business policies
- Implements approval workflows
- Manages exception handling
- Provides audit trails for regulatory requirements

#### Scalability and Reliability:
- Handles high-volume processing
- Provides fault tolerance and recovery
- Enables horizontal scaling
- Maintains performance under load

In the context of device upgrades, workflow orchestration ensures that each device goes through a systematic, reliable upgrade process that includes compatibility checks, scheduling, backups, actual upgrades, and verification - all coordinated automatically.

### 1.3 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│  (Web UI, Mobile Apps, External Systems)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 REST API Layer                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  FlowableController    │  EmployeeController           │ │
│  │  - Workflow Mgmt       │  - Employee Tasks             │ │
│  │  - Batch Operations    │  - Task Assignment            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Business Logic Layer                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  FlowableService      │  EmployeeService               │ │
│  │  - Process Execution  │  - Employee Mgmt               │ │
│  │  - Task Management    │  - Assignment Logic            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  SchedulingService    │  EmailService                  │ │
│  │  - Batch Processing   │  - Notifications               │ │
│  │  - Excel Handling     │  - Templates                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Flowable BPM Engine                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Process Engine      │  Delegate Execution             │ │
│  │  - BPMN Execution    │  - Java Delegates               │ │
│  │  - Task Management   │  - External Calls               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Delegate Classes                                      │ │
│  │  - Device Operations  │  - Email Notifications         │ │
│  │  - API Integrations  │  - Scheduling Logic             │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Persistence Layer                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL          │  Elasticsearch                  │ │
│  │  - Application Data  │  - Event Logs                   │ │
│  │  - Flowable Tables   │  - Audit Trail                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              External Systems                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  NFX Service         │  Email Server                   │ │
│  │  - Device Mgmt       │  - SMTP                         │ │
│  │  - VNF Operations    │  - Notifications                │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Layer Descriptions:

**Client Layer**: Web interfaces, mobile applications, and external systems that interact with the workflow system.

**API Layer**: RESTful endpoints that expose workflow functionality. Controllers handle HTTP requests and responses.

**Business Logic Layer**: Services that implement business rules, data processing, and coordination between components.

**BPM Engine Layer**: Core Flowable engine that executes BPMN processes and manages workflow state.

**Persistence Layer**: Databases for storing application data, workflow instances, and audit logs.

**External Systems**: Third-party services for device management, email delivery, and other integrations.

### 1.4 Key Features and Capabilities

#### Automated Device Upgrade Orchestration:
- **Batch Processing**: Handle multiple devices simultaneously through Excel uploads
- **Intelligent Scheduling**: Automated timer-based workflow triggers
- **Compatibility Verification**: Pre-upgrade checks for hardware/software requirements
- **Rollback Capabilities**: Backup and recovery mechanisms
- **Real-time Monitoring**: Live tracking of upgrade progress

#### Advanced Workflow Features:
- **Dynamic Decision Making**: Conditional execution based on device characteristics
- **Timer Events**: Scheduled notifications and deadline management
- **Parallel Processing**: Concurrent execution of independent tasks
- **Exception Handling**: Robust error recovery and notification
- **Audit Trail**: Complete logging of all workflow activities

#### Integration Capabilities:
- **External API Calls**: Seamless integration with device management systems
- **Email Notifications**: Automated communication with stakeholders
- **Database Persistence**: Reliable storage of workflow state
- **Search and Analytics**: Elasticsearch-based event indexing

#### Operational Excellence:
- **Scalability**: Handle large volumes of concurrent workflows
- **Reliability**: Fault-tolerant execution with retry mechanisms
- **Monitoring**: Comprehensive logging and health checks
- **Security**: Authentication and authorization controls

### 1.5 Business Value and Use Cases

#### Operational Efficiency:
- Reduces manual intervention in device upgrade processes
- Minimizes downtime through optimized scheduling
- Ensures consistent execution across all upgrades
- Provides visibility into upgrade progress and issues

#### Risk Mitigation:
- Automated compatibility checks prevent failed upgrades
- Backup procedures protect against data loss
- Rollback capabilities ensure system recoverability
- Audit trails support compliance requirements

#### Cost Optimization:
- Reduces labor costs through automation
- Minimizes failed upgrades and rework
- Optimizes resource utilization
- Enables predictive maintenance scheduling

#### Use Cases:
1. **Network Equipment Upgrades**: Telecom infrastructure modernization
2. **Server Farm Updates**: Data center hardware refreshes
3. **IoT Device Management**: Large-scale device firmware updates
4. **Industrial Automation**: Manufacturing equipment upgrades
5. **Cloud Migration**: Legacy system modernization

---

## 2. Delegates in Depth

### 2.1 Understanding Java Delegates in Flowable

Java Delegates are the workhorses of Flowable BPM processes. They are Java classes that implement the `org.flowable.engine.delegate.JavaDelegate` interface and contain the actual business logic that gets executed when a service task is reached in a BPMN process.

#### The JavaDelegate Interface:
```java
public interface JavaDelegate {
    void execute(DelegateExecution execution);
}
```

The `execute` method is called by the Flowable engine when the service task is activated. The `DelegateExecution` parameter provides access to:
- Process variables
- Process instance information
- Task context
- Engine services

#### Delegate Registration:
Delegates are registered as Spring components using the `@Component` annotation with a unique name:

```java
@Component("DelegateName")
public class MyDelegate implements JavaDelegate {
    // implementation
}
```

In the BPMN XML, delegates are referenced using the `flowable:delegateExpression` attribute:
```xml
<serviceTask id="Task1" name="My Task" flowable:delegateExpression="${MyDelegate}" />
```

#### Delegate Types:
1. **JavaDelegate**: Single execution method
2. **ActivityBehavior**: More control over activity execution
3. **ExecutionListener**: Listen to execution events
4. **TaskListener**: Listen to task events

### 2.2 Importance of Delegates in Workflow Automation

Delegates are crucial because they bridge the gap between the graphical BPMN model and the actual business logic implementation. They enable:

#### Business Logic Encapsulation:
- Isolate complex business rules from process flow
- Enable code reusability across different processes
- Facilitate unit testing of business logic
- Support different implementations for different environments

#### External System Integration:
- Call REST APIs, databases, message queues
- Send emails, notifications
- Interact with legacy systems
- Coordinate with other microservices

#### Process Control:
- Make decisions based on business rules
- Update process variables
- Trigger subprocesses or events
- Handle exceptions and errors

#### Monitoring and Auditing:
- Log execution details
- Update audit trails
- Send metrics to monitoring systems
- Track performance indicators

Without delegates, BPMN processes would be limited to simple routing and manual tasks. Delegates provide the computational power and integration capabilities that make workflows truly automated and valuable.

### 2.3 Delegate Lifecycle and Execution

#### Execution Context:
When a delegate executes, it receives a `DelegateExecution` object that provides:

```java
public interface DelegateExecution {
    String getProcessInstanceId();           // Unique process instance ID
    String getProcessDefinitionId();         // BPMN process definition ID
    String getCurrentActivityId();           // Current activity ID
    Object getVariable(String name);         // Get process variable
    void setVariable(String name, Object value); // Set process variable
    Map<String, Object> getVariables();      // Get all variables
    // ... more methods
}
```

#### Variable Scoping:
- **Process Variables**: Available throughout the entire process instance
- **Task Local Variables**: Scoped to specific tasks
- **Transient Variables**: Not persisted, used for temporary calculations

#### Execution Flow:
1. Process reaches service task
2. Flowable engine instantiates delegate (or reuses Spring bean)
3. `execute()` method called with DelegateExecution
4. Delegate performs business logic
5. Process variables updated if needed
6. Execution continues to next element

#### Asynchronous Execution:
Delegates can be marked as asynchronous using `flowable:async="true"` in BPMN:
```xml
<serviceTask flowable:async="true" flowable:delegateExpression="${MyDelegate}" />
```

This allows the process to continue without waiting for the delegate to complete, improving performance for long-running operations.

### 2.4 Common Delegate Patterns

#### API Call Delegate Pattern:
```java
@Slf4j
@Component("ApiCallDelegate")
@RequiredArgsConstructor
public class ApiCallDelegate implements JavaDelegate {

    private final RestTemplate restTemplate;
    private final ElasticsearchService loggingService;

    @Value("${external.api.url}")
    private String apiUrl;

    @Override
    public void execute(DelegateExecution execution) {
        String processId = execution.getProcessInstanceId();
        String entityId = (String) execution.getVariable("entityId");

        try {
            // Log start
            loggingService.logEvent(processId, entityId, "OPERATION", "step", "STARTED", "Starting API call");

            // Prepare request
            Map<String, Object> request = Map.of(
                "processId", processId,
                "entityId", entityId,
                "step", "operation-step"
            );

            // Make API call
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

            // Check response
            if (response.getStatusCode().is2xxSuccessful()) {
                loggingService.logEvent(processId, entityId, "OPERATION", "step", "SUCCESS", "API call successful");
            } else {
                throw new RuntimeException("API call failed with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            loggingService.logEvent(processId, entityId, "OPERATION", "step", "FAILED", "API call failed: " + e.getMessage());
            throw new RuntimeException("Delegate execution failed", e);
        }
    }
}
```

#### Email Notification Delegate Pattern:
```java
@Slf4j
@Component("EmailDelegate")
public class EmailDelegate implements JavaDelegate {

    @Autowired
    private EmailService emailService;

    @Override
    public void execute(DelegateExecution execution) {
        String recipient = (String) execution.getVariable("email");
        String subject = (String) execution.getVariable("subject");
        String processId = execution.getProcessInstanceId();

        emailService.sendEmail(recipient, subject, processId);
    }
}
```

#### Decision Delegate Pattern:
```java
@Component("DecisionDelegate")
public class DecisionDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) {
        // Evaluate conditions
        boolean condition1 = evaluateCondition1(execution);
        boolean condition2 = evaluateCondition2(execution);

        // Set decision variables
        execution.setVariable("decisionResult", condition1 && condition2);
        execution.setVariable("alternativePath", condition1 || condition2);
    }
}
```

### 2.5 Detailed Delegate Operations

#### 2.5.1 CheckDeviceDetailsDelegate

The `CheckDeviceDetailsDelegate` is responsible for verifying device specifications and compatibility before proceeding with the upgrade process.

**Purpose**: This delegate performs initial device validation to ensure the device meets minimum requirements for upgrade.

**Execution Flow**:
1. Extract device ID and flow instance ID from process variables
2. Construct API request payload with standardized format
3. Set authentication headers (Bearer token)
4. Make HTTP POST call to `/check_device_details` endpoint
5. Validate response status (must be 2xx)
6. Log success or failure to Elasticsearch
7. Throw RuntimeException on failure to trigger BPMN error handling

**Key Code Analysis**:
```java
String url = baseUrl + "/check_device_details";

var requestBody = java.util.Map.of(
    "flowInstanceID", flowId,
    "deviceID", deviceId,
    "step", "check-device-details"
);
```

**Error Scenarios**:
- Network timeouts
- Authentication failures
- Invalid device ID
- External service unavailable
- Non-2xx HTTP responses

**Logging Pattern**:
- STARTED: "Checking device details via [URL]"
- SUCCESS: "Device details check API responded with status [CODE]"
- FAILED: "Device details check API responded with non-2xx status [CODE]" or exception message

**Importance**: This is the first validation step. Failure here prevents incompatible devices from proceeding through the expensive upgrade process.

#### 2.5.2 RebootDeviceDelegate

The `RebootDeviceDelegate` handles remote device reboot operations during the upgrade sequence.

**Purpose**: Safely reboot the device as part of the upgrade process, ensuring the device is in the correct state for subsequent operations.

**Execution Flow**:
1. Retrieve device and process identifiers
2. Prepare standardized request payload
3. Configure HTTP headers with authentication
4. Execute POST request to `/reboot_device`
5. Verify successful response (2xx status)
6. Log operation result
7. Propagate exceptions for workflow error handling

**Technical Details**:
- Uses Spring `RestTemplate` for HTTP communication
- Implements bearer token authentication
- Includes comprehensive error logging
- Follows consistent payload structure across all device operations

**Integration Points**:
- Depends on `nfx.service.base.mock.url` configuration
- Requires `nfx.service.auth.token` for authentication
- Updates Elasticsearch with operation logs
- Throws exceptions to trigger BPMN error boundaries

**Business Impact**: Device reboot is critical for applying firmware updates and ensuring system stability post-upgrade.

#### 2.5.3 ReminderEmailDelegate

The `ReminderEmailDelegate` manages automated email notifications throughout the upgrade scheduling process.

**Purpose**: Send timely reminders to stakeholders about upcoming device upgrades, reducing no-show rates and improving coordination.

**Execution Flow**:
1. Extract email address, device ID, and scheduling information
2. Retrieve process instance context
3. Delegate to `EmailService` for actual email sending
4. Include upgrade details in email content

**Key Features**:
- Uses `EmailService` for template processing
- Supports multiple reminder types (7-day, 3-day, 2-day, 1-day)
- Includes device and scheduling context
- Configurable sender address

**Email Content Structure**:
- Subject: Upgrade reminder with date
- Body: Device details, upgrade schedule, contact information
- HTML formatting with company branding
- Process instance tracking for audit purposes

**Business Value**: Automated reminders ensure stakeholders are informed and prepared, reducing scheduling conflicts and improving upgrade success rates.

#### 2.5.4 Compatibility Delegates

The system includes several specialized delegates for hardware/software compatibility verification:

**VerifyAndUpgradeBiosDelegate**:
- Checks BIOS version compatibility
- Performs BIOS updates if necessary
- Validates firmware requirements

**VerifyAndUpgradeNicDelegate**:
- Network interface card validation
- Driver updates and compatibility checks
- Network configuration verification

**VerifyAndUpgradeSsdDelegate**:
- Solid-state drive firmware checks
- Storage capacity validation
- Performance requirement assessment

**VerifyAndUpgradeBluejacketDelegate**:
- Base system firmware verification
- Core platform compatibility
- System stability checks

**Common Patterns**:
- All follow similar API calling structure
- Use standardized request/response formats
- Implement consistent error handling
- Log to Elasticsearch for monitoring

**Execution Sequence**: These delegates run in a specific order within the Device Compatibility Check sub-process, ensuring cumulative validation.

#### 2.5.5 ScheduleModifierDelegate

The `ScheduleModifierDelegate` handles rescheduling requests with built-in attempt limits.

**Purpose**: Allow stakeholders to request schedule changes while preventing abuse through attempt limitations.

**Key Features**:
- Implements 3-attempt limit for rescheduling
- Tracks reschedule attempts per workflow
- Sends confirmation emails for approved changes
- Updates process variables with new dates

**Business Logic**:
```java
int attempts = (Integer) execution.getVariable("rescheduleAttempts");
if (attempts >= 3) {
    throw new RuntimeException("Maximum reschedule attempts exceeded");
}
```

**Integration**: Works with message events and receive tasks in BPMN for asynchronous reschedule handling.

#### 2.5.6 Other Delegates

**PreUpgradeBackupDelegate**: Creates system backups before modifications
**MgmtPortDelegate**: Configures management network interfaces
**PostRebootChecksDelegate**: Verifies system health after reboot
**DeviceActivationDelegate**: Activates device post-upgrade
**VnfSpinUpDelegate**: Deploys Virtual Network Functions
**ImageStagingDelegate**: Prepares upgrade images
**ScheduleDelegate**: Handles initial scheduling logic

### 2.6 Delegate Error Handling

All delegates implement comprehensive error handling:

#### Exception Propagation:
- RuntimeExceptions bubble up to BPMN engine
- Triggers error boundaries or event sub-processes
- Enables workflow-level error recovery

#### Logging Strategy:
- All errors logged to Elasticsearch
- Include context (process ID, device ID, operation)
- Distinguish between temporary and permanent failures

#### Recovery Patterns:
- Retry mechanisms for transient failures
- Compensation actions for partial failures
- Notification triggers for manual intervention

### 2.7 Delegate Logging and Monitoring

#### Elasticsearch Integration:
Every delegate logs structured events:
```json
{
  "processId": "flow-instance-123",
  "deviceId": "device-456",
  "operation": "DeviceUpgrade",
  "step": "reboot-device",
  "status": "STARTED| SUCCESS | FAILED",
  "message": "Detailed operation message",
  "timestamp": "2025-11-14T04:00:00Z"
}
```

#### Monitoring Benefits:
- Real-time operation tracking
- Performance metrics collection
- Error rate monitoring
- Audit trail maintenance
- Troubleshooting support

---

## 3. Workflow Decision Making

### 3.1 BPMN Elements for Decision Making

Flowable uses several BPMN elements to implement decision logic:

#### Exclusive Gateways:
- Represented as diamonds with X
- Only one outgoing sequence flow is taken
- Based on conditions or expressions

#### Inclusive Gateways:
- Allow multiple paths to be taken
- All conditions evaluated independently

#### Parallel Gateways:
- Synchronize multiple parallel flows
- No conditions, all paths executed

#### Event-Based Gateways:
- Route based on events rather than conditions
- First event to occur determines path

### 3.2 Exclusive Gateways and Conditions

The upgrade workflow uses exclusive gateways extensively:

```xml
<exclusiveGateway id="Gateway_0lsc1ux">
  <outgoing>Flow_0ffn60g</outgoing>
  <outgoing>Flow_0s96oyv</outgoing>
</exclusiveGateway>

<sequenceFlow sourceRef="Gateway_0lsc1ux" targetRef="Activity_0qf4otk">
  <conditionExpression>${stagingFlag=="false"}</conditionExpression>
</sequenceFlow>

<sequenceFlow sourceRef="Gateway_0lsc1ux" targetRef="Activity_1nf5tab">
  <conditionExpression>${stagingFlag=="true"}</conditionExpression>
</sequenceFlow>
```

**Condition Evaluation**:
- Uses Java Unified Expression Language (JUEL)
- Access to process variables
- Support for complex expressions
- Default flow if no conditions match

### 3.3 Timer Events and Scheduling

#### Timer Event Types:
1. **Time Date**: Specific date/time
2. **Time Duration**: Relative duration
3. **Time Cycle**: Repeating intervals

#### Examples in the Workflow:
```xml
<!-- Boundary Timer -->
<boundaryEvent attachedToRef="Activity_19qntoo">
  <timerEventDefinition>
    <timeDate>${java.time.ZonedDateTime.parse(scheduledUpgradeDateTime).minusDays(3).toString()}</timeDate>
  </timerEventDefinition>
</boundaryEvent>

<!-- Intermediate Timer -->
<intermediateCatchEvent>
  <timerEventDefinition>
    <timeDuration>P7D</timeDuration>
  </timerEventDefinition>
</intermediateCatchEvent>
```

#### Timer Calculations:
- Use Java Time API expressions
- Parse scheduled dates from variables
- Calculate offsets (days, hours, minutes)
- Support for business days vs calendar days

### 3.4 Boundary Events

Boundary events attach to activities and trigger when the activity is active:

#### Timer Boundary Events:
- Trigger after timeout
- Interrupt or non-interrupting
- Used for escalations and reminders

#### Error Boundary Events:
- Catch exceptions from delegates
- Enable error recovery workflows
- Provide alternative paths

### 3.5 Variable Evaluation

Process variables drive decision making:

#### Variable Types:
- String, Integer, Boolean, Date
- Complex objects (serialized)
- Collections and maps

#### Expression Examples:
```java
${stagingFlag == "true"}
${(java.time.ZonedDateTime.parse(scheduledUpgradeDateTime).toInstant().toEpochMilli() - java.time.Instant.now().toEpochMilli()) / (1000.0 * 60 * 60 * 24) > 7}
${deviceType == "SERVER" && firmwareVersion < 2.1}
```

### 3.6 Sub-process Execution

Sub-processes encapsulate complex logic:

#### Embedded Sub-processes:
- Part of main process definition
- Share parent variables
- Can have own start/end events

#### Benefits:
- Modularity and reusability
- Simplified main process flow
- Scoped variable handling
- Easier testing and maintenance

---

## 4. Internal Endpoints and Controllers

### 4.1 REST API Architecture

The system exposes RESTful APIs through Spring MVC controllers:

#### Controller Structure:
- `@RestController` for JSON responses
- `@RequestMapping` for base paths
- `@CrossOrigin` for CORS support
- Comprehensive validation with `@Valid`

#### Common Patterns:
- HTTP status codes for responses
- Structured error responses
- Pagination for list endpoints
- Filtering and sorting capabilities

### 4.2 FlowableController Endpoints

#### Workflow Management:
```java
@PostMapping("/api/workflow-executions")
public ResponseEntity<Page<WorkflowExecution>> getWorkflowExecutions(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestBody(required = false) WorkflowFilterRequest filter)
```

**Purpose**: Retrieve paginated workflow executions with optional filtering.

**Parameters**:
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)
- `filter`: Optional filter criteria (status, date range, device ID)

**Response**: Paginated list of WorkflowExecution objects.

#### Process Diagram:
```java
@GetMapping("/api/process-instance/{processInstanceId}/diagram")
public ResponseEntity<DiagramResponse> getProcessInstanceDiagram(@PathVariable String processInstanceId)
```

**Purpose**: Generate visual diagram of workflow instance.

**Implementation**: Uses Flowable's diagram generation capabilities to create PNG/SVG representations of the current process state.

#### Batch Operations:
```java
@PostMapping("/api/devices/start-batch-upgrade")
public ResponseEntity<Map<String, Object>> startBatchUpgrade(@Valid @RequestBody List<DeviceRequest> devices)
```

**Purpose**: Initiate batch upgrade for multiple devices.

**Request Body**:
```json
[
  {
    "deviceId": "DEV-001",
    "scheduledDate": "2025-12-01T10:00:00Z",
    "customerEmail": "admin@company.com"
  }
]
```

#### Reschedule Endpoint:
```java
@PostMapping("/api/devices/reschedule/{processInstanceId}")
public ResponseEntity<Map<String, Object>> rescheduleDeviceUpgrade(
    @PathVariable String processInstanceId,
    @Valid @RequestBody RescheduleRequest request)
```

**Purpose**: Handle reschedule requests with validation.

**Business Logic**: Checks attempt limits, updates scheduling, sends notifications.

### 4.3 EmployeeController Endpoints

#### Employee Queries:
```java
@GetMapping
public ResponseEntity<?> getActiveEmployeesInDateRange(
    @RequestParam String startDate,
    @RequestParam String endDate)
```

**Purpose**: Find employees available for upgrade tasks within date range.

**Date Format**: ISO 8601 (e.g., "2025-11-14T00:00:00Z")

#### Employee Details:
```java
@GetMapping("/{attUid}")
public ResponseEntity<?> getEmployeeWithTasks(
    @PathVariable String attUid,
    @RequestParam(required = false) String startDate,
    @RequestParam(required = false) String endDate)
```

**Purpose**: Get employee information with associated tasks.

**Response**: Employee object with task assignments and availability.

#### Task Reassignment:
```java
@PostMapping("/reassign")
public ResponseEntity<?> reassignWorkflow(@RequestBody ReassignWorkflowRequest request)
```

**Request Body**:
```json
{
  "workflowId": "flow-123",
  "newEmployeeAttUid": "employee456"
}
```

**Validation**: Ensures workflow exists and employee is available.

### 4.4 Request/Response Patterns

#### Standard Response Structure:
```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
}
```

#### Error Responses:
```java
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Field 'email' is required"],
  "timestamp": "2025-11-14T04:00:00"
}
```

#### Pagination Response:
```java
{
  "content": [...],
  "pageable": {
    "page": 0,
    "size": 10,
    "sort": ["createdDate,desc"]
  },
  "totalElements": 150,
  "totalPages": 15,
  "first": true,
  "last": false
}
```

### 4.5 Authentication and Security

#### Current Implementation:
- Basic CORS configuration
- No authentication on endpoints (development mode)
- Plans for JWT/OAuth integration

#### Security Headers:
```java
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // ... additional security headers
    }
}
```

### 4.6 Error Handling in APIs

#### Global Exception Handler:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("INVALID_REQUEST", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
```

#### Validation Errors:
- Uses Bean Validation (`@Valid`, `@NotNull`, etc.)
- Returns field-level error details
- Supports custom validation annotations

---

## 5. External API Integration

### 5.1 NFX Service Architecture

The system integrates with Network Function Virtualization (NFX) services for device operations:

#### Service Architecture:
- RESTful APIs with JSON payloads
- Bearer token authentication
- Standardized request/response formats
- Comprehensive error handling

#### Base Configuration:
```properties
nfx.service.base.mock.url=http://localhost:8000
nfx.service.auth.token=${NFX_AUTH_TOKEN}
```

### 5.2 API Calling Patterns from Delegates

All delegates follow a consistent pattern for external API calls:

#### Standard Implementation:
```java
@Override
public void execute(DelegateExecution execution) {
    String deviceId = (String) execution.getVariable("deviceId");
    String flowId = execution.getProcessInstanceId();

    String url = baseUrl + "/endpoint_path";

    try {
        // Start logging
        elasticsearchService.logEvent(flowId, deviceId, "OPERATION", "step", "STARTED", "Starting operation");

        // Prepare request
        var requestBody = Map.of(
            "flowInstanceID", flowId,
            "deviceID", deviceId,
            "step", "operation-step"
        );

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (authToken != null && !authToken.isBlank()) {
            headers.set("Authorization", authToken.startsWith("Bearer ") ? authToken : "Bearer " + authToken);
        }

        // Make call
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        // Handle response
        if (response.getStatusCode().is2xxSuccessful()) {
            elasticsearchService.logEvent(flowId, deviceId, "OPERATION", "step", "SUCCESS", "Operation completed");
        } else {
            elasticsearchService.logEvent(flowId, deviceId, "OPERATION", "step", "FAILED", "Non-2xx response: " + response.getStatusCode());
            throw new RuntimeException("Operation failed with status " + response.getStatusCode());
        }

    } catch (Exception e) {
        elasticsearchService.logEvent(flowId, deviceId, "OPERATION", "step", "FAILED", "Operation failed: " + e.getMessage());
        throw new RuntimeException("Delegate execution failed", e);
    }
}
```

### 5.3 Authentication Mechanisms

#### Bearer Token Authentication:
- Tokens configured via environment variables
- Automatic "Bearer " prefix addition
- Support for token rotation
- Secure token storage practices

#### Header Construction:
```java
HttpHeaders headers = new HttpHeaders();
headers.set("Content-Type", "application/json");
if (authToken != null && !authToken.isBlank()) {
    String token = authToken.startsWith("Bearer ") ? authToken : "Bearer " + authToken;
    headers.set("Authorization", token);
}
```

### 5.4 Detailed External Endpoints

#### 1. Device Details Check
- **Endpoint**: `POST /check_device_details`
- **Delegate**: `CheckDeviceDetailsDelegate`
- **Purpose**: Validate device specifications and compatibility
- **Used In**: Device Compatibility Check sub-process

#### 2. BIOS Upgrade
- **Endpoint**: `POST /verify_and_upgrade_bios`
- **Delegate**: `VerifyAndUpgradeBiosDelegate`
- **Purpose**: Update BIOS firmware to compatible version
- **Used In**: Compatibility verification phase

#### 3. NIC Upgrade
- **Endpoint**: `POST /verify_and_upgrade_nic`
- **Delegate**: `VerifyAndUpgradeNicDelegate`
- **Purpose**: Update network interface firmware
- **Used In**: Hardware compatibility checks

#### 4. SSD Upgrade
- **Endpoint**: `POST /verify_and_upgrade_ssd`
- **Delegate**: `VerifyAndUpgradeSsdDelegate`
- **Purpose**: Update storage device firmware
- **Used In**: Storage compatibility validation

#### 5. Bluejacket Upgrade
- **Endpoint**: `POST /verify_and_upgrade_bluejacket`
- **Delegate**: `VerifyAndUpgradeBluejacketDelegate`
- **Purpose**: Update base system firmware
- **Used In**: Platform compatibility checks

#### 6. Pre-Upgrade Backup
- **Endpoint**: `POST /pre_upgrade_backup`
- **Delegate**: `PreUpgradeBackupDelegate`
- **Purpose**: Create system backups before upgrade
- **Used In**: Pre-upgrade preparation

#### 7. Image Staging
- **Endpoint**: `POST /stage_upgrade_image`
- **Delegate**: `ImageStagingDelegate`
- **Purpose**: Prepare upgrade images for deployment
- **Used In**: Pre-upgrade preparation (conditional)

#### 8. Device Reboot
- **Endpoint**: `POST /reboot_device`
- **Delegate**: `RebootDeviceDelegate`
- **Purpose**: Remotely reboot device during upgrade
- **Used In**: Upgrade execution phase

#### 9. Management Port Configuration
- **Endpoint**: `POST /mgmt_port`
- **Delegate**: `MgmtPortDelegate`
- **Purpose**: Configure management network interfaces
- **Used In**: Post-reboot configuration

#### 10. Post-Reboot Checks
- **Endpoint**: `POST /post_reboot_checks`
- **Delegate**: `PostRebootChecksDelegate`
- **Purpose**: Verify system health after reboot
- **Used In**: Post-upgrade verification

#### 11. Device Activation
- **Endpoint**: `POST /device_activation`
- **Delegate**: `DeviceActivationDelegate`
- **Purpose**: Activate device after successful upgrade
- **Used In**: Post-upgrade activation

#### 12. VNF Spin-up
- **Endpoint**: `POST /vnf_spinup_and_config`
- **Delegate**: `VnfSpinUpDelegate`
- **Purpose**: Deploy and configure Virtual Network Functions
- **Used In**: Final upgrade step

### 5.5 Error Handling and Retry Logic

#### Current Implementation:
- Single attempt with immediate failure
- Comprehensive error logging
- Exception propagation to workflow engine

#### Potential Enhancements:
- Retry mechanisms for transient failures
- Circuit breaker patterns
- Exponential backoff strategies
- Dead letter queues for persistent failures

#### Error Classification:
- **Transient**: Network timeouts, temporary service unavailability
- **Permanent**: Authentication failures, invalid requests
- **Business Logic**: Device not ready, compatibility issues

### 5.6 API Performance and Monitoring

#### Performance Metrics:
- Response time tracking
- Success/failure rates
- Throughput monitoring
- Error rate analysis

#### Monitoring Integration:
- All API calls logged to Elasticsearch
- Correlation IDs for request tracing
- Performance dashboards
- Alerting on failure thresholds

---

## 6. Workflow Process Deep Dive

### 6.1 Complete Workflow Lifecycle

The upgrade workflow follows a comprehensive lifecycle from initiation to completion:

#### 1. Process Initiation
- Triggered by batch upload or individual device request
- Process variables initialized (deviceId, scheduledDate, customerEmail, etc.)
- Initial validation and setup

#### 2. Device Compatibility Verification
- Sequential execution of compatibility checks
- BIOS, NIC, SSD, and platform validation
- Failure at any step terminates the process

#### 3. Scheduling and Notification Setup
- DTAC assignment for field technicians
- Reminder email scheduling (7-day intervals)
- Reschedule window configuration

#### 4. Pre-Upgrade Preparation
- Backup creation (3 days before scheduled time)
- Conditional image staging based on stagingFlag
- Final reminder sequence activation

#### 5. Upgrade Execution
- Scheduled timer wait
- Device reboot and configuration
- Post-reboot health checks
- Device activation and VNF deployment

#### 6. Completion
- Process end event
- Final status recording
- Audit trail completion

### 6.2 Device Compatibility Check Phase

This sub-process performs sequential hardware/software validation:

#### Execution Order:
1. **Check Device Details**: Initial specification validation
2. **Verify Bluejacket**: Base firmware compatibility
3. **Verify BIOS**: Motherboard firmware checks
4. **Verify NIC**: Network interface validation
5. **Verify SSD**: Storage subsystem verification

#### Failure Handling:
- Any delegate failure terminates the sub-process
- Error logged with specific failure reason
- Process moves to error state
- Manual intervention may be required

#### Success Path:
- All validations pass
- Process variables updated with compatibility status
- Flow continues to scheduling phase

### 6.3 Scheduling and Notification Phase

#### DTAC Assignment:
- Automatic assignment based on availability
- Date range filtering for technician availability
- Task creation for assigned technician

#### Reminder Email System:
- Multi-level reminder cascade
- Timer-based notifications
- Configurable intervals (7, 3, 2, 1 days before)

#### Reschedule Handling:
- Message event for reschedule requests
- Attempt limit enforcement (3 attempts)
- Email confirmations for approved changes

### 6.4 Pre-Upgrade Preparation

#### Backup Operations:
- Triggered by boundary timer (3 days before)
- Comprehensive system backup creation
- Verification of backup integrity

#### Image Staging:
- Conditional execution based on stagingFlag
- Upgrade image preparation and validation
- Network optimization for large file transfers

#### Final Reminders:
- Accelerated reminder schedule near upgrade time
- Daily notifications in final week
- Stakeholder preparation and coordination

### 6.5 Upgrade Execution

#### Timer Synchronization:
- Precise timing based on scheduled datetime
- Timezone-aware calculations
- Buffer time for preparation

#### Sequential Operations:
1. **Device Reboot**: Controlled system restart
2. **Management Port Config**: Network interface setup
3. **Post-Reboot Checks**: System health verification
4. **Device Activation**: Service enablement
5. **VNF Spin-up**: Virtual function deployment

#### Parallel Processing:
- Some operations may run concurrently
- Synchronization at key checkpoints
- Resource contention management

### 6.6 Post-Upgrade Verification

#### Health Checks:
- System responsiveness validation
- Service availability confirmation
- Performance baseline comparison
- Error log analysis

#### Activation Confirmation:
- Device status verification
- Service registration
- Monitoring system updates
- Stakeholder notifications

### 6.7 Workflow Completion

#### Success Criteria:
- All delegates executed successfully
- External systems confirmed operation
- No critical errors logged
- Process variables updated appropriately

#### Completion Actions:
- End event triggered
- Final status recorded
- Audit logs finalized
- Cleanup operations performed

---

## 7. Configuration and Best Practices

### 7.1 Application Properties Configuration

#### Database Configuration:
```properties
# PostgreSQL Connection
spring.datasource.url=jdbc:postgresql://localhost:5432/flowable
spring.datasource.username=postgres
spring.datasource.password=root
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

#### Flowable Engine Settings:
```properties
# Database Schema Management
flowable.database-schema-update=true

# Async Executor for background tasks
flowable.async-executor.enabled=true
flowable.async-executor.core-pool-size=4
flowable.async-executor.max-pool-size=8

# History levels for audit trails
flowable.history-level=full
```

#### External Service Configuration:
```properties
# NFX Service Integration
nfx.service.base.mock.url=http://localhost:8000
nfx.service.auth.token=${NFX_AUTH_TOKEN:}

# Elasticsearch for logging
spring.elasticsearch.uris=http://192.168.5.52:8081
spring.elasticsearch.connection-timeout=10s
spring.elasticsearch.socket-timeout=30s
```

#### Email Configuration:
```properties
# SMTP Settings
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls
