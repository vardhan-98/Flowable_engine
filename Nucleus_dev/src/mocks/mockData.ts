// Comprehensive mock data for NFX 350 Device Upgrades
import { addDays, subDays, format, startOfWeek, endOfWeek, eachDayOfInterval, addHours, subHours, addMinutes, subMinutes, setHours, setMinutes } from 'date-fns';

// Helper functions
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomId = (): string => Math.random().toString(36).substr(2, 9);

// Realistic AT&T locations
const attLocations = [
  'Dallas', 'Atlanta', 'Chicago', 'New York', 'Los Angeles', 
  'Seattle', 'Boston', 'Miami', 'Houston', 'Phoenix'
];

// NFX 350 Device Hostnames with locations
export const generateHostname = (deviceNum: number, location: string): string => {
  return `nfx350-${location.toLowerCase()}-${String(deviceNum).padStart(3, '0')}.att.net`;
};

// Employee data - All with @att.com emails
export const mockEmployees = [
  {
    attUid: "1",
    email: "john.doe@att.com",
    role: "Field Technician",
    skills: ["NFX-350", "VNF", "Network Configuration"],
    firstName: "John",
    lastName: "Doe",
    active: true
  },
  {
    attUid: "9",
    email: "arjun.sharma@att.com",
    role: "Field Technician",
    skills: ["NFX-350", "Network Configuration", "Installation"],
    firstName: "Arjun",
    lastName: "Sharma",
    active: true
  },
  {
    attUid: "2",
    email: "jane.smith@att.com",
    role: "Senior Network Engineer",
    skills: ["NFX-350", "VNF", "Security", "Monitoring"],
    firstName: "Jane",
    lastName: "Smith",
    active: true
  },
  {
    attUid: "10",
    email: "priya.patel@att.com",
    role: "Senior Network Engineer",
    skills: ["NFX-350", "VNF", "Security", "Automation"],
    firstName: "Priya",
    lastName: "Patel",
    active: true
  },
  {
    attUid: "17",
    email: "amit.chopra@att.com",
    role: "Field Technician",
    skills: ["NFX-350", "Network Configuration", "Hardware"],
    firstName: "Amit",
    lastName: "Chopra",
    active: true
  },
  {
    attUid: "3",
    email: "mike.johnson@att.com",
    role: "Network Specialist",
    skills: ["NFX-350", "Troubleshooting", "Installation"],
    firstName: "Mike",
    lastName: "Johnson",
    active: true
  },
  {
    attUid: "11",
    email: "rahul.verma@att.com",
    role: "Network Specialist",
    skills: ["NFX-350", "Troubleshooting", "Performance Optimization"],
    firstName: "Rahul",
    lastName: "Verma",
    active: true
  },
  {
    attUid: "4",
    email: "sarah.wilson@att.com",
    role: "Field Supervisor",
    skills: ["NFX-350", "VNF", "Team Management"],
    firstName: "Sarah",
    lastName: "Wilson",
    active: true
  },
  {
    attUid: "12",
    email: "ananya.singh@att.com",
    role: "Field Supervisor",
    skills: ["NFX-350", "VNF", "Team Leadership", "Quality Assurance"],
    firstName: "Ananya",
    lastName: "Singh",
    active: true
  },
  {
    attUid: "20",
    email: "meera.iyer@att.com",
    role: "Field Supervisor",
    skills: ["NFX-350", "VNF", "Team Management", "Process Improvement"],
    firstName: "Meera",
    lastName: "Iyer",
    active: true
  },
  {
    attUid: "5",
    email: "david.brown@att.com",
    role: "Network Engineer",
    skills: ["NFX-350", "VNF", "Configuration"],
    firstName: "David",
    lastName: "Brown",
    active: true
  },
  {
    attUid: "13",
    email: "vikram.kumar@att.com",
    role: "Network Engineer",
    skills: ["NFX-350", "VNF", "Configuration", "Testing"],
    firstName: "Vikram",
    lastName: "Kumar",
    active: true
  },
  {
    attUid: "18",
    email: "divya.nair@att.com",
    role: "Network Engineer",
    skills: ["NFX-350", "VNF", "Configuration", "Security"],
    firstName: "Divya",
    lastName: "Nair",
    active: true
  },
  {
    attUid: "6",
    email: "lisa.davis@att.com",
    role: "Technical Support",
    skills: ["NFX-350", "Customer Service", "Troubleshooting"],
    firstName: "Lisa",
    lastName: "Davis",
    active: true
  },
  {
    attUid: "14",
    email: "kavita.joshi@att.com",
    role: "Technical Support",
    skills: ["NFX-350", "Customer Service", "Documentation"],
    firstName: "Kavita",
    lastName: "Joshi",
    active: true
  },
  {
    attUid: "19",
    email: "rohan.bhatia@att.com",
    role: "Technical Support",
    skills: ["NFX-350", "Customer Service", "Troubleshooting", "Training"],
    firstName: "Rohan",
    lastName: "Bhatia",
    active: true
  },
  {
    attUid: "7",
    email: "robert.miller@att.com",
    role: "Senior Technician",
    skills: ["NFX-350", "VNF", "Advanced Configuration"],
    firstName: "Robert",
    lastName: "Miller",
    active: true
  },
  {
    attUid: "15",
    email: "sanjay.mehta@att.com",
    role: "Senior Technician",
    skills: ["NFX-350", "VNF", "Advanced Configuration", "Mentoring"],
    firstName: "Sanjay",
    lastName: "Mehta",
    active: true
  },
  {
    attUid: "8",
    email: "emily.garcia@att.com",
    role: "Network Analyst",
    skills: ["Monitoring", "Analytics", "VNF"],
    firstName: "Emily",
    lastName: "Garcia",
    active: true
  },
  {
    attUid: "16",
    email: "neha.gupta@att.com",
    role: "Network Analyst",
    skills: ["Monitoring", "Analytics", "VNF", "Reporting"],
    firstName: "Neha",
    lastName: "Gupta",
    active: true
  }
];

// Device IDs for NFX 350 devices with realistic hostnames
const deviceList = [
  'USRIOTC9PUT0102UJZZ01',
  'USTAISHOUTX0302UJZZ01',
  'USTERRSTLMO0101UJZZ01',
  'USTERRXNLIL0101UJZZ01',
  'USTES0ALPGA0107UJZZ01',
  'USTES0BROGA0108UJZZ01',
  'USTES6ALPGA0111UJZZ01',
  'USTES6ALPGA0112UJZZ01',
  'USTES6ATLGA0106UJZZ01',
  'USTES6ATLGA0107UJZZ01',
  'USTES6ATLGA0108UJZZ01',
  'USTES6BROGA0102UJZZ01',
  'USTES7AAIGA0106UJZZ01'
];

const deviceLocations = [
  'Dallas', 'Dallas', 'Chicago', 'Chicago', 'Atlanta', 'Atlanta', 'Atlanta', 'Atlanta', 'Atlanta', 'Atlanta', 'Atlanta', 'Atlanta', 'Atlanta'
];

export const deviceIds = deviceList.map((deviceId, i) => ({
  deviceId,
  hostname: generateHostname(i + 1, deviceLocations[i]),
  location: deviceLocations[i],
  ipAddress: `10.${randomInt(1, 254)}.${randomInt(1, 254)}.${randomInt(1, 254)}`,
  managementIp: `192.168.${randomInt(1, 254)}.${randomInt(1, 254)}`
}));

// Workflow steps matching component expectations (hyphenated lowercase)
export const workflowSteps = [
  { id: 'check-device-compatibility', name: 'Check Device Compatibility', duration: 5 },
  { id: 'pre-upgrade-backup', name: 'Pre Upgrade Backup', duration: 8 },
  { id: 'reboot-device', name: 'Reboot Device', duration: 10 },
  { id: 'mgmt-port', name: 'Management Port', duration: 3 },
  { id: 'post-reboot-check', name: 'Post Reboot Check', duration: 5 },
  { id: 'device-activation', name: 'Device Activation', duration: 4 },
  { id: 'vnf-spinup-and-config', name: 'VNF Spin Up and Config', duration: 6 }
];

// Status options
export const statuses = ['STARTED', 'SUCCESS', 'FAILED', 'PENDING'];

// Generate comprehensive success logs for API calls
export const generateApiLogs = (flowInstanceId: string, deviceInfo: any, stepIndex: number) => {
  const logs: any[] = [];
  const baseTime = subHours(new Date(), randomInt(1, 24));
  
  const logEntries = [
    {
      subStep: 'BIOS Check',
      workflowStep: 'check-device-compatibility',
      apiCall: 'GET /api/device/bios/version',
      request: { deviceId: deviceInfo.deviceId, hostname: deviceInfo.hostname },
      response: { biosVersion: '2.8.1', compatible: true, requiredVersion: '2.8.0' },
      statusCode: 200,
      duration: 245
    },
    {
      subStep: 'Firmware Check',
      workflowStep: 'check-device-compatibility',
      apiCall: 'GET /api/device/firmware/status',
      request: { deviceId: deviceInfo.deviceId, hostname: deviceInfo.hostname },
      response: { firmwareVersion: '18.4R2-S3', compatible: true, targetVersion: '18.4R3-S1' },
      statusCode: 200,
      duration: 189
    },
    {
      subStep: 'SSD Version Check',
      workflowStep: 'check-device-compatibility',
      apiCall: 'GET /api/device/storage/ssd',
      request: { deviceId: deviceInfo.deviceId, hostname: deviceInfo.hostname },
      response: { ssdVersion: '1.2.3', health: 'GOOD', compatible: true },
      statusCode: 200,
      duration: 156
    },
    {
      subStep: 'Pre-Upgrade Backup',
      workflowStep: 'pre-upgrade-backup',
      apiCall: 'POST /api/device/backup/create',
      request: { deviceId: deviceInfo.deviceId, backupType: 'FULL', includeConfigs: true },
      response: { backupId: `BACKUP-${randomId().toUpperCase()}`, status: 'COMPLETED', backupSize: '2.3GB', location: '/backups/nfx350/' },
      statusCode: 201,
      duration: 8234
    },
    {
      subStep: 'Upgrade Reboot Device',
      workflowStep: 'reboot-device',
      apiCall: 'POST /api/device/reboot',
      request: { deviceId: deviceInfo.deviceId, rebootType: 'UPGRADE', graceful: true },
      response: { rebootInitiated: true, estimatedDowntime: '600s', status: 'REBOOTING' },
      statusCode: 200,
      duration: 645
    },
    {
      subStep: 'Management Port Configuration',
      workflowStep: 'mgmt-port',
      apiCall: 'POST /api/device/mgmt-port/configure',
      request: { deviceId: deviceInfo.deviceId, managementIp: deviceInfo.managementIp, vlan: 100 },
      response: { configured: true, ipAddress: deviceInfo.managementIp, gateway: '192.168.1.1', status: 'ACTIVE' },
      statusCode: 200,
      duration: 423
    },
    {
      subStep: 'Post Reboot Checks',
      workflowStep: 'post-reboot-check',
      apiCall: 'GET /api/device/health/check',
      request: { deviceId: deviceInfo.deviceId, checkType: 'POST_REBOOT' },
      response: { status: 'HEALTHY', cpuUsage: '12%', memoryUsage: '34%', uptime: '45s', allChecksPass: true },
      statusCode: 200,
      duration: 567
    },
    {
      subStep: 'Device Activation',
      workflowStep: 'device-activation',
      apiCall: 'POST /api/device/activate',
      request: { deviceId: deviceInfo.deviceId, activationType: 'PRODUCTION' },
      response: { activated: true, status: 'ACTIVE', timestamp: new Date().toISOString() },
      statusCode: 200,
      duration: 389
    },
    {
      subStep: 'VNF Spin UP',
      workflowStep: 'vnf-spinup-and-config',
      apiCall: 'POST /api/vnf/deploy',
      request: { deviceId: deviceInfo.deviceId, vnfType: 'FIREWALL', vnfVersion: '6.4.2' },
      response: { vnfId: `VNF-${randomId().toUpperCase()}`, status: 'RUNNING', healthStatus: 'HEALTHY' },
      statusCode: 201,
      duration: 6789
    }
  ];

  const cumulativeLogsPerStep = [3, 4, 5, 6, 7, 8, 9];
  const numEntries = cumulativeLogsPerStep[Math.min(stepIndex, cumulativeLogsPerStep.length - 1)];

  logEntries.slice(0, numEntries).forEach((entry, index) => {
    const timestamp = addMinutes(baseTime, index * 2);
    logs.push({
      id: `LOG-${randomId().toUpperCase()}`,
      flowInstanceId,
      deviceId: deviceInfo.deviceId,
      hostname: deviceInfo.hostname,
      timestamp: timestamp.getTime(),
      step: entry.workflowStep,
      stage: 'Upgrade',
      apiCall: entry.apiCall,
      method: entry.apiCall.split(' ')[0],
      endpoint: entry.apiCall.split(' ')[1],
      request: entry.request,
      response: entry.response,
      statusCode: entry.statusCode,
      status: 'SUCCESS',
      duration: entry.duration,
      message: `Successfully executed ${entry.subStep}`,
      logger: 'nfx-upgrade-service'
    });
  });

  if (stepIndex === workflowSteps.length - 1) {
    const finalTimestamp = addMinutes(baseTime, logEntries.length * 2);
    logs.push({
      id: `LOG-${randomId().toUpperCase()}`,
      flowInstanceId,
      deviceId: deviceInfo.deviceId,
      hostname: deviceInfo.hostname,
      timestamp: finalTimestamp.getTime(),
      step: 'flow-complete',
      stage: 'Upgrade',
      apiCall: null,
      method: null,
      endpoint: null,
      request: null,
      response: null,
      statusCode: 200,
      status: 'SUCCESS',
      duration: 0,
      message: 'Successfully completed the entire upgrade flow',
      logger: 'nfx-upgrade-service'
    });
  }

  return logs;
};

// Helper to create non-overlapping time slots
const createTimeSlot = (day: Date, hour: number): { start: Date; end: Date } => {
  const start = new Date(day);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(start.getHours() + 4, 0, 0, 0); // Exactly 4 hours
  return { start, end };
};

// Generate realistic tasks for a given date range with NO OVERLAPS
export const generateTasksForDateRange = (startDate: Date, endDate: Date, employeeId?: string) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const tasks: any[] = [];
  let taskCounter = 0;

  days.forEach((day) => {
    const timeSlots = [
      { hour: 8 },  // 8 AM - 12 PM
      { hour: 13 }, // 1 PM - 5 PM
      { hour: 18 }  // 6 PM - 10 PM (optional)
    ];

    const slotsToUse = randomInt(2, 3);
    
    for (let i = 0; i < slotsToUse; i++) {
      const slot = timeSlots[i];
      const { start: startTime, end: endTime } = createTimeSlot(day, slot.hour);

      const workflowCount = randomInt(1, 4);
      const workflows = [];

      for (let j = 0; j < workflowCount; j++) {
        const device = deviceIds[taskCounter % deviceIds.length];
        const flowInstanceId = `FLOW-${randomId().toUpperCase()}`;
        const assignedEmployee = employeeId 
          ? mockEmployees.find(emp => emp.attUid === employeeId) || randomChoice(mockEmployees)
          : randomChoice(mockEmployees);

        const isCompleted = Math.random() > 0.3;
        const stepIndex = isCompleted 
          ? workflowSteps.length - 1 
          : randomInt(3, workflowSteps.length - 2);
        
        const currentStep = workflowSteps[stepIndex];
        const status = isCompleted ? 'SUCCESS' : (Math.random() > 0.8 ? 'FAILED' : 'STARTED');

        workflows.push({
          flowInstanceId,
          deviceId: device.deviceId,
          hostname: device.hostname,
          location: device.location,
          ipAddress: device.ipAddress,
          step: currentStep.id,
          status: status,
          message: isCompleted 
            ? `NFX 350 upgrade completed successfully for ${device.hostname}`
            : `Processing ${currentStep.name} for ${device.hostname}`,
          assignedDtac: assignedEmployee.attUid,
          assignedEmail: assignedEmployee.email,
          createdAt: startTime.toISOString(),
          lastUpdated: addMinutes(startTime, currentStep.duration * 10).toISOString(),
          completed: isCompleted,
          completedTime: isCompleted ? addHours(startTime, 3).toISOString() : null,
          processName: `NFX 350 Upgrade - ${device.location}`,
          processFlowId: flowInstanceId,
          issuer: randomChoice(mockEmployees).attUid,
          reScheduleCount: 0
        });

        taskCounter++;
      }

      tasks.push({
        id: `TASK-${randomId().toUpperCase()}`,
        name: `Upgrade Task - ${workflowCount} Device${workflowCount > 1 ? 's' : ''}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        workflows,
        workflowCount,
        deviceIds: workflows.map(w => w.deviceId),
        deviceCount: workflowCount,
        customerEmail: `customer.${randomChoice(attLocations).toLowerCase()}@att.com`
      });
    }
  });

  return tasks;
};

// Generate employee data with tasks
export const generateEmployeeData = (employeeId: string, startDate: string, endDate: string) => {
  const employee = mockEmployees.find(emp => emp.attUid === employeeId);
  if (!employee) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const tasks = generateTasksForDateRange(start, end, employeeId);

  return {
    ...employee,
    tasks,
    shift: {
      startTime: "08:00",
      endTime: "18:00",
      timezone: "America/Chicago"
    }
  };
};

// Generate all employees data
export const generateAllEmployeesData = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return mockEmployees.map(employee => {
    const tasks = generateTasksForDateRange(start, end, employee.attUid);

    return {
      ...employee,
      tasks,
      shift: {
        startTime: "08:00",
        endTime: "18:00",
        timezone: "America/Chicago"
      }
    };
  });
};

// Generate upgrade logs for a flow instance with comprehensive API logs
export const generateUpgradeLogs = (flowId: string) => {
  const device = randomChoice(deviceIds);
  const currentStep = randomInt(4, 6);
  
  return generateApiLogs(flowId, device, currentStep);
};

// Generate BPMN diagram data with proper step progression and logical data
export const generateBpmnData = (flowInstanceId: string) => {
  const device = randomChoice(deviceIds);

  // Determine current step index (0 to 6)
  const stepProgress = Math.random();
  let currentStepIndex: number;
  if (stepProgress < 0.15) currentStepIndex = 0;
  else if (stepProgress < 0.30) currentStepIndex = 1;
  else if (stepProgress < 0.45) currentStepIndex = 2;
  else if (stepProgress < 0.60) currentStepIndex = 3;
  else if (stepProgress < 0.75) currentStepIndex = 4;
  else if (stepProgress < 0.90) currentStepIndex = 5;
  else currentStepIndex = 6;

  let isFlowCompleted = false;
  if (currentStepIndex === workflowSteps.length - 1) {
    isFlowCompleted = Math.random() > 0.5;
  }

  // AutoSchedule path only (no Timed/SelfSchedule branches)
  const autoSchedulePath = [
    'StartEvent_1', 'Flow_1', 'Activity_1b98x37', 'Flow_0ulc8vj', 'Gateway_16t1m08',
    'Flow_195h0yc', 'Activity_0jbgw0q', 'Flow_1yq6emr',
    'Activity_19qntoo', 'Event_1shs7a9', 'Flow_0txoykf', 'Activity_1cjfmf7', 'Flow_07zv2lc',
    'Activity_14obmje', 'Flow_to_scheduled_timer', 'Event_1nnppuz',
    'Flow_0jm6pod', 'Activity_0c8whm2', 'Flow_1hrhsxy', 'Event_18e7ds7',
    'Flow_07smcqp', 'Activity_01erw02', 'Flow_1xzsdz5',
    'Activity_030rvyu', 'Flow_170ar3y',
    'Activity_0prcbc', 'Flow_170ar3z', 'Flow_1ngpuao',
    'Activity_0ez1b4u', 'Flow_1ambkp1',
    'Activity_1sg1v2u', 'Flow_1nlaeh2', 'Event_1izn2hj'
  ];

  // Map workflow step ID → BPMN task ID
  const stepToTaskId: Record<string, string> = {
    'check-device-compatibility': 'Activity_1cjfmf7',
    'pre-upgrade-backup':        'Activity_14obmje',
    'reboot-device':             'Activity_01erw02',
    'mgmt-port':                 'Activity_030rvyu',
    'post-reboot-check':         'Activity_0prcbc',
    'device-activation':         'Activity_0ez1b4u',
    'vnf-spinup-and-config':     'Activity_1sg1v2u'
  };

  const currentTaskId = stepToTaskId[workflowSteps[currentStepIndex].id];
  let currentTaskIdx = autoSchedulePath.indexOf(currentTaskId);

  let executedActivities = autoSchedulePath.slice(0, currentTaskIdx);
  let activeActivities = currentTaskIdx >= 0 ? [autoSchedulePath[currentTaskIdx]] : [];
  if (isFlowCompleted) {
    executedActivities.push(autoSchedulePath[currentTaskIdx]);
    executedActivities.push('Event_1izn2hj');
    activeActivities = [];
  }

  // Build activity details
  const activityDetails: any = {};

  // Add the initial compatibility check to completed if we've reached the upgrade steps
  if (currentStepIndex >= 0) {
    activityDetails['Activity_1b98x37'] = {
      name: 'Initial Device Compatibility',
      status: 'completed',
      duration: `${randomInt(1, 5)}m ${randomInt(10, 59)}s`,
      timestamp: subMinutes(new Date(), (currentStepIndex + 1) * 15).toISOString()
    };
  }

  workflowSteps.slice(0, currentStepIndex).forEach((step, i) => {
    const taskId = stepToTaskId[step.id];
    activityDetails[taskId] = {
      name: step.name,
      status: 'completed',
      duration: `${step.duration}m ${randomInt(10, 59)}s`,
      timestamp: subMinutes(new Date(), (currentStepIndex - i) * 12).toISOString()
    };
  });

  if (currentStepIndex < workflowSteps.length) {
    const step = workflowSteps[currentStepIndex];
    const taskId = stepToTaskId[step.id];
    activityDetails[taskId] = {
      name: step.name,
      status: isFlowCompleted ? 'completed' : 'in_progress',
      duration: `${randomInt(1, 3)}m ${randomInt(0, 59)}s`,
      timestamp: subMinutes(new Date(), randomInt(1, 5)).toISOString()
    };
  }

  if (isFlowCompleted) {
    activityDetails['Event_1izn2hj'] = {
      name: 'Flow Complete',
      status: 'completed',
      duration: '0s',
      timestamp: new Date().toISOString()
    };
  }

  workflowSteps.slice(currentStepIndex + 1).forEach(step => {
    const taskId = stepToTaskId[step.id];
    activityDetails[taskId] = {
      name: step.name,
      status: 'pending',
      duration: '0s',
      timestamp: null
    };
  });

  // Full BPMN XML with diagram
  const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:flowable="http://flowable.org/bpmn" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js[](https://demo.bpmn.io)" exporterVersion="18.6.1" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:message id="RescheduleMessage" name="RescheduleMessage"/>
  <bpmn2:process id="Process_1" name="Upgrade flow" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1" name="Start Process">
      <bpmn2:outgoing>Flow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:serviceTask id="Activity_1n2xol4" name="Schedule with time" flowable:async="true" flowable:delegateExpression="\${Schedule}">
      <bpmn2:incoming>Flow_17vd298</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1i750vw</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:boundaryEvent id="Event_1shs7a9" name="PreUpgradeTimer" attachedToRef="Activity_19qntoo">
      <bpmn2:outgoing>Flow_0txoykf</bpmn2:outgoing>
      <bpmn2:timerEventDefinition id="TimerEventDefinition_0oktgsr">
        <bpmn2:timeDate>\${preUpgradeDateTime}</bpmn2:timeDate>
      </bpmn2:timerEventDefinition>
    </bpmn2:boundaryEvent>
    <bpmn2:serviceTask id="Activity_16dpl0s" name="Schedule Modifier" flowable:async="true" flowable:delegateExpression="\${ScheduleModifier}">
      <bpmn2:incoming>Flow_1gq6ek1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1wgr47l</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Activity_14obmje" name="Pre Upgrade Backup" flowable:async="true" flowable:delegateExpression="\${PreUpgradeBackup}">
      <bpmn2:incoming>Flow_07zv2lc</bpmn2:incoming>
      <bpmn2:outgoing>Flow_to_scheduled_timer</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:intermediateCatchEvent id="Event_18e7ds7" name="Scheduled Time">
      <bpmn2:incoming>Flow_1hrhsxy</bpmn2:incoming>
      <bpmn2:outgoing>Flow_07smcqp</bpmn2:outgoing>
      <bpmn2:timerEventDefinition id="TimerEventDefinition_1r0d5hu">
        <bpmn2:timeDate>\${scheduledUpgradeDateTime}</bpmn2:timeDate>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:serviceTask id="Activity_01erw02" name="Upgrade Reboot Device" flowable:async="true" flowable:delegateExpression="\${RebootDevice}">
      <bpmn2:incoming>Flow_07smcqp</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1xzsdz5</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Activity_030rvyu" name="Management Port" flowable:async="true" flowable:delegateExpression="\${MgmtPort}">
      <bpmn2:incoming>Flow_1xzsdz5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_170ar3y</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Activity_0prcbc" name="Post Reboot Checks" flowable:async="true" flowable:delegateExpression="\${PostRebootChecks}">
      <bpmn2:incoming>Flow_170ar3y</bpmn2:incoming>
      <bpmn2:outgoing>Flow_170ar3z</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_1ngpuao</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Activity_0ez1b4u" name="Device Activation" flowable:async="true" flowable:delegateExpression="\${DeviceActivation}">
      <bpmn2:incoming>Flow_170ar3z</bpmn2:incoming>
      <bpmn2:incoming>Flow_1ngpuao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1ambkp1</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Activity_1sg1v2u" name="VNF Spin UP" flowable:async="true" flowable:delegateExpression="\${VnfSpinUp}">
      <bpmn2:incoming>Flow_1ambkp1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1nlaeh2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:endEvent id="Event_1izn2hj" name="Flow Complete">
      <bpmn2:incoming>Flow_1nlaeh2</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1b98x37"/>
    <bpmn2:sequenceFlow id="Flow_1i750vw" sourceRef="Activity_1n2xol4" targetRef="Activity_19qntoo"/>
    <bpmn2:sequenceFlow id="Flow_0txoykf" sourceRef="Event_1shs7a9" targetRef="Activity_1cjfmf7"/>
    <bpmn2:sequenceFlow id="Flow_07zv2lc" sourceRef="Activity_1cjfmf7" targetRef="Activity_14obmje"/>
    <bpmn2:sequenceFlow id="Flow_to_scheduled_timer" sourceRef="Activity_14obmje" targetRef="Event_1nnppuz"/>
    <bpmn2:sequenceFlow id="Flow_07smcqp" sourceRef="Event_18e7ds7" targetRef="Activity_01erw02"/>
    <bpmn2:sequenceFlow id="Flow_1xzsdz5" sourceRef="Activity_01erw02" targetRef="Activity_030rvyu"/>
    <bpmn2:sequenceFlow id="Flow_170ar3y" sourceRef="Activity_030rvyu" targetRef="Activity_0prcbc"/>
    <bpmn2:sequenceFlow id="Flow_170ar3z" sourceRef="Activity_0prcbc" targetRef="Activity_0ez1b4u"/>
    <bpmn2:sequenceFlow id="Flow_1ambkp1" sourceRef="Activity_0ez1b4u" targetRef="Activity_1sg1v2u"/>
    <bpmn2:sequenceFlow id="Flow_1nlaeh2" sourceRef="Activity_1sg1v2u" targetRef="Event_1izn2hj"/>
    <bpmn2:sequenceFlow id="Flow_1wgr47l" sourceRef="Activity_16dpl0s" targetRef="Activity_19qntoo"/>
    <bpmn2:exclusiveGateway id="Gateway_16t1m08">
      <bpmn2:incoming>Flow_0ulc8vj</bpmn2:incoming>
      <bpmn2:outgoing>Flow_17vd298</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_195h0yc</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0elksx4</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_17vd298" sourceRef="Gateway_16t1m08" targetRef="Activity_1n2xol4">
      <bpmn2:conditionExpression xsi:type="bpmn2:tFormalExpression">\${execution.getVariable('scheduledUpgradeDateTime') != null && execution.getVariable('scheduledType') !=="Timed"}</bpmn2:conditionExpression>
    </bpmn2:sequenceFlow>
    <bpmn2:sequenceFlow id="Flow_195h0yc" sourceRef="Gateway_16t1m08" targetRef="Activity_0jbgw0q">
      <bpmn2:conditionExpression xsi:type="bpmn2:tFormalExpression">\${execution.getVariable('scheduledType') !=="AutoScheduled"}</bpmn2:conditionExpression>
    </bpmn2:sequenceFlow>
    <bpmn2:sequenceFlow id="Flow_1yq6emr" sourceRef="Activity_0jbgw0q" targetRef="Activity_19qntoo"/>
    <bpmn2:serviceTask id="Activity_0jbgw0q" name="AutoSchedule" flowable:async="true" flowable:delegateExpression="\${AutoSchedule}">
      <bpmn2:incoming>Flow_195h0yc</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1yq6emr</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sequenceFlow id="Flow_1gq6ek1" sourceRef="Activity_19qntoo" targetRef="Activity_16dpl0s"/>
    <bpmn2:sequenceFlow id="Flow_1ngpuao" sourceRef="Activity_0prcbc" targetRef="Activity_0ez1b4u"/>
    <bpmn2:sequenceFlow id="Flow_0elksx4" sourceRef="Gateway_16t1m08" targetRef="Activity_1id20dg">
      <bpmn2:conditionExpression xsi:type="bpmn2:tFormalExpression">\${execution.getVariable('scheduledType') !=="SelfSchedule"}</bpmn2:conditionExpression>
    </bpmn2:sequenceFlow>
    <bpmn2:serviceTask id="Activity_1id20dg" name="Schedule through email" flowable:delegateExpression="\${EmailSchedule}">
      <bpmn2:incoming>Flow_0elksx4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_014iy7c</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sequenceFlow id="Flow_014iy7c" sourceRef="Activity_1id20dg" targetRef="Activity_1stranv"/>
    <bpmn2:receiveTask id="Activity_1stranv" name="Slot Confirmation" messageRef="Message_3fi5laf">
      <bpmn2:incoming>Flow_014iy7c</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0pzmjl8</bpmn2:outgoing>
    </bpmn2:receiveTask>
    <bpmn2:sequenceFlow id="Flow_0pzmjl8" sourceRef="Activity_1stranv" targetRef="Activity_19qntoo"/>
    <bpmn2:sequenceFlow id="Flow_0jm6pod" sourceRef="Event_1nnppuz" targetRef="Activity_0c8whm2"/>
    <bpmn2:intermediateCatchEvent id="Event_1nnppuz">
      <bpmn2:incoming>Flow_to_scheduled_timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0jm6pod</bpmn2:outgoing>
      <bpmn2:timerEventDefinition id="TimerEventDefinition_0q0w7j5"/>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:task id="Activity_0c8whm2" name="Final Reminder">
      <bpmn2:extensionElements/>
      <bpmn2:incoming>Flow_0jm6pod</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1hrhsxy</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:sequenceFlow id="Flow_1hrhsxy" sourceRef="Activity_0c8whm2" targetRef="Event_18e7ds7"/>
    <bpmn2:receiveTask id="Activity_19qntoo" name="Re-Scheduling Window">
      <bpmn2:incoming>Flow_1i750vw</bpmn2:incoming>
      <bpmn2:incoming>Flow_1wgr47l</bpmn2:incoming>
      <bpmn2:incoming>Flow_1yq6emr</bpmn2:incoming>
      <bpmn2:incoming>Flow_0pzmjl8</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1gq6ek1</bpmn2:outgoing>
    </bpmn2:receiveTask>
    <bpmn2:subProcess id="Activity_1cjfmf7" name="Device Compatibility Check">
      <bpmn2:incoming>Flow_0txoykf</bpmn2:incoming>
      <bpmn2:outgoing>Flow_07zv2lc</bpmn2:outgoing>
      <bpmn2:startEvent id="Event_1uc8qm1">
        <bpmn2:outgoing>Flow_11nuv0l</bpmn2:outgoing>
      </bpmn2:startEvent>
      <bpmn2:task id="Activity_1gsgxk8" name="BIOS Check">
        <bpmn2:incoming>Flow_11nuv0l</bpmn2:incoming>
        <bpmn2:outgoing>Flow_0qd0b8g</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:sequenceFlow id="Flow_11nuv0l" sourceRef="Event_1uc8qm1" targetRef="Activity_1gsgxk8"/>
      <bpmn2:task id="Activity_04akeuj" name="Firmware Check">
        <bpmn2:incoming>Flow_0qd0b8g</bpmn2:incoming>
        <bpmn2:outgoing>Flow_1asukl3</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:sequenceFlow id="Flow_0qd0b8g" sourceRef="Activity_1gsgxk8" targetRef="Activity_04akeuj"/>
      <bpmn2:task id="Activity_1aqkqaq" name="SSD Version Check">
        <bpmn2:incoming>Flow_1asukl3</bpmn2:incoming>
        <bpmn2:outgoing>Flow_1vu35wa</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:sequenceFlow id="Flow_1asukl3" sourceRef="Activity_04akeuj" targetRef="Activity_1aqkqaq"/>
      <bpmn2:task id="Activity_15w8hnx" name="Bluejacket Check">
        <bpmn2:incoming>Flow_1vu35wa</bpmn2:incoming>
        <bpmn2:outgoing>Flow_020vfej</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:sequenceFlow id="Flow_1vu35wa" sourceRef="Activity_1aqkqaq" targetRef="Activity_15w8hnx"/>
      <bpmn2:task id="Activity_0wmd1hv" name="Storage Check">
        <bpmn2:incoming>Flow_020vfej</bpmn2:incoming>
        <bpmn2:outgoing>Flow_0vo1l2r</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:sequenceFlow id="Flow_020vfej" sourceRef="Activity_15w8hnx" targetRef="Activity_0wmd1hv"/>
      <bpmn2:endEvent id="Event_0qdx71s">
        <bpmn2:incoming>Flow_0vo1l2r</bpmn2:incoming>
      </bpmn2:endEvent>
      <bpmn2:sequenceFlow id="Flow_0vo1l2r" sourceRef="Activity_0wmd1hv" targetRef="Event_0qdx71s"/>
    </bpmn2:subProcess>
    <bpmn2:subProcess id="Activity_1b98x37" name="Device Compatibility Check">
      <bpmn2:incoming>Flow_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0ulc8vj</bpmn2:outgoing>
      <bpmn2:startEvent id="Event_1g1rgth">
        <bpmn2:outgoing>Flow_05gc1jf</bpmn2:outgoing>
      </bpmn2:startEvent>
      <bpmn2:task id="Activity_0xb1r7m" name="BIOS Check">
        <bpmn2:incoming>Flow_05gc1jf</bpmn2:incoming>
        <bpmn2:outgoing>Flow_04rkbgh</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:task id="Activity_0acm6pk" name="Firmware Check">
        <bpmn2:incoming>Flow_04rkbgh</bpmn2:incoming>
        <bpmn2:outgoing>Flow_095xyss</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:task id="Activity_0ol9aef" name="SSD Version Check">
        <bpmn2:incoming>Flow_095xyss</bpmn2:incoming>
        <bpmn2:outgoing>Flow_0gxk781</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:task id="Activity_090chyn" name="Bluejacket Check">
        <bpmn2:incoming>Flow_0gxk781</bpmn2:incoming>
        <bpmn2:outgoing>Flow_0nkzcsq</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:task id="Activity_1sceqj1" name="Storage Check">
        <bpmn2:incoming>Flow_0nkzcsq</bpmn2:incoming>
        <bpmn2:outgoing>Flow_14mrhdz</bpmn2:outgoing>
      </bpmn2:task>
      <bpmn2:endEvent id="Event_1gf5gld">
        <bpmn2:incoming>Flow_14mrhdz</bpmn2:incoming>
      </bpmn2:endEvent>
      <bpmn2:sequenceFlow id="Flow_05gc1jf" sourceRef="Event_1g1rgth" targetRef="Activity_0xb1r7m"/>
      <bpmn2:sequenceFlow id="Flow_04rkbgh" sourceRef="Activity_0xb1r7m" targetRef="Activity_0acm6pk"/>
      <bpmn2:sequenceFlow id="Flow_095xyss" sourceRef="Activity_0acm6pk" targetRef="Activity_0ol9aef"/>
      <bpmn2:sequenceFlow id="Flow_0gxk781" sourceRef="Activity_0ol9aef" targetRef="Activity_090chyn"/>
      <bpmn2:sequenceFlow id="Flow_0nkzcsq" sourceRef="Activity_090chyn" targetRef="Activity_1sceqj1"/>
      <bpmn2:sequenceFlow id="Flow_14mrhdz" sourceRef="Activity_1sceqj1" targetRef="Event_1gf5gld"/>
    </bpmn2:subProcess>
    <bpmn2:sequenceFlow id="Flow_0ulc8vj" sourceRef="Activity_1b98x37" targetRef="Gateway_16t1m08"/>
    <bpmn2:textAnnotation id="TextAnnotation_1k0ndmy">
      <bpmn2:text>Happens Scheduled time -7 Days</bpmn2:text>
    </bpmn2:textAnnotation>
    <bpmn2:association id="Association_0otl4s7" associationDirection="None" sourceRef="Event_1shs7a9" targetRef="TextAnnotation_1k0ndmy"/>
    <bpmn2:textAnnotation id="TextAnnotation_0fvqcl6">
      <bpmn2:text>Timer for Scheduled Time</bpmn2:text>
    </bpmn2:textAnnotation>
    <bpmn2:association id="Association_0mo5lj3" associationDirection="None" sourceRef="Event_18e7ds7" targetRef="TextAnnotation_0fvqcl6"/>
  </bpmn2:process>
  <bpmn2:message id="Message_3fi5laf" name="ScheduleConfirmation"/>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="172" y="219" width="36" height="36"/>
        <bpmndi:BPMNLabel>
          <dc:Bounds x="157" y="262" width="67" height="14"/>
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1n2xol4_di" bpmnElement="Activity_1n2xol4">
        <dc:Bounds x="490" y="100" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_16dpl0s_di" bpmnElement="Activity_16dpl0s">
        <dc:Bounds x="690" y="340" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_14obmje_di" bpmnElement="Activity_14obmje">
        <dc:Bounds x="1000" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_18e7ds7_di" bpmnElement="Event_18e7ds7">
        <dc:Bounds x="1432" y="219" width="36" height="36"/>
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1410" y="262" width="80" height="14"/>
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_01erw02_di" bpmnElement="Activity_01erw02">
        <dc:Bounds x="1530" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_030rvyu_di" bpmnElement="Activity_030rvyu">
        <dc:Bounds x="1670" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0prcbc_di" bpmnElement="Activity_0prcbc">
        <dc:Bounds x="1800" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0ez1b4u_di" bpmnElement="Activity_0ez1b4u">
        <dc:Bounds x="1940" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1sg1v2u_di" bpmnElement="Activity_1sg1v2u">
        <dc:Bounds x="2070" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1izn2hj_di" bpmnElement="Event_1izn2hj">
        <dc:Bounds x="2212" y="219" width="36" height="36"/>
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2194" y="262" width="74" height="14"/>
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_16t1m08_di" bpmnElement="Gateway_16t1m08" isMarkerVisible="true">
        <dc:Bounds x="395" y="212" width="50" height="50"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0gaprlc_di" bpmnElement="Activity_0jbgw0q">
        <dc:Bounds x="490" y="197" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1dc5lsz_di" bpmnElement="Activity_1id20dg">
        <dc:Bounds x="370" y="310" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0vxyk70_di" bpmnElement="Activity_1stranv">
        <dc:Bounds x="520" y="310" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0sfsoqu_di" bpmnElement="Activity_19qntoo">
        <dc:Bounds x="690" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1nmz85r_di" bpmnElement="Event_1nnppuz">
        <dc:Bounds x="1162" y="219" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0c8whm2_di" bpmnElement="Activity_0c8whm2">
        <dc:Bounds x="1260" y="197" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Association_0otl4s7_di" bpmnElement="Association_0otl4s7">
        <di:waypoint x="790" y="179"/>
        <di:waypoint x="790" y="135"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Activity_1wihy69_di" bpmnElement="Activity_1cjfmf7">
        <dc:Bounds x="850" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_0ll0iox" bpmnElement="Activity_1b98x37">
        <dc:Bounds x="260" y="197" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1shs7a9_di" bpmnElement="Event_1shs7a9">
        <dc:Bounds x="772" y="179" width="36" height="36"/>
        <bpmndi:BPMNLabel>
          <dc:Bounds x="805" y="173" width="89" height="14"/>
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="TextAnnotation_1k0ndmy_di" bpmnElement="TextAnnotation_1k0ndmy">
        <dc:Bounds x="740" y="80" width="100" height="55"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="TextAnnotation_0fvqcl6_di" bpmnElement="TextAnnotation_0fvqcl6">
        <dc:Bounds x="1416" y="80" width="100" height="55"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="208" y="237"/>
        <di:waypoint x="260" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1i750vw_di" bpmnElement="Flow_1i750vw">
        <di:waypoint x="590" y="140"/>
        <di:waypoint x="740" y="140"/>
        <di:waypoint x="740" y="197"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0txoykf_di" bpmnElement="Flow_0txoykf">
        <di:waypoint x="790" y="179"/>
        <di:waypoint x="790" y="150"/>
        <di:waypoint x="900" y="150"/>
        <di:waypoint x="900" y="197"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_07zv2lc_di" bpmnElement="Flow_07zv2lc">
        <di:waypoint x="950" y="237"/>
        <di:waypoint x="1000" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_to_scheduled_timer_di" bpmnElement="Flow_to_scheduled_timer">
        <di:waypoint x="1100" y="237"/>
        <di:waypoint x="1162" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_07smcqp_di" bpmnElement="Flow_07smcqp">
        <di:waypoint x="1468" y="237"/>
        <di:waypoint x="1530" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1xzsdz5_di" bpmnElement="Flow_1xzsdz5">
        <di:waypoint x="1630" y="237"/>
        <di:waypoint x="1670" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_170ar3y_di" bpmnElement="Flow_170ar3y">
        <di:waypoint x="1770" y="237"/>
        <di:waypoint x="1800" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1ambkp1_di" bpmnElement="Flow_1ambkp1">
        <di:waypoint x="2040" y="237"/>
        <di:waypoint x="2070" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1nlaeh2_di" bpmnElement="Flow_1nlaeh2">
        <di:waypoint x="2170" y="237"/>
        <di:waypoint x="2212" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1wgr47l_di" bpmnElement="Flow_1wgr47l">
        <di:waypoint x="720" y="340"/>
        <di:waypoint x="720" y="277"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_17vd298_di" bpmnElement="Flow_17vd298">
        <di:waypoint x="420" y="212"/>
        <di:waypoint x="420" y="140"/>
        <di:waypoint x="490" y="140"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_195h0yc_di" bpmnElement="Flow_195h0yc">
        <di:waypoint x="445" y="237"/>
        <di:waypoint x="490" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1yq6emr_di" bpmnElement="Flow_1yq6emr">
        <di:waypoint x="590" y="237"/>
        <di:waypoint x="690" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1gq6ek1_di" bpmnElement="Flow_1gq6ek1">
        <di:waypoint x="760" y="277"/>
        <di:waypoint x="760" y="340"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1ngpuao_di" bpmnElement="Flow_1ngpuao">
        <di:waypoint x="1900" y="237"/>
        <di:waypoint x="1940" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0elksx4_di" bpmnElement="Flow_0elksx4">
        <di:waypoint x="420" y="262"/>
        <di:waypoint x="420" y="310"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_014iy7c_di" bpmnElement="Flow_014iy7c">
        <di:waypoint x="470" y="350"/>
        <di:waypoint x="520" y="350"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0pzmjl8_di" bpmnElement="Flow_0pzmjl8">
        <di:waypoint x="620" y="350"/>
        <di:waypoint x="655" y="350"/>
        <di:waypoint x="655" y="260"/>
        <di:waypoint x="690" y="260"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0jm6pod_di" bpmnElement="Flow_0jm6pod">
        <di:waypoint x="1198" y="237"/>
        <di:waypoint x="1260" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1hrhsxy_di" bpmnElement="Flow_1hrhsxy">
        <di:waypoint x="1360" y="237"/>
        <di:waypoint x="1432" y="237"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Association_0mo5lj3_di" bpmnElement="Association_0mo5lj3">
        <di:waypoint x="1450" y="219"/>
        <di:waypoint x="1450" y="135"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0ulc8vj_di" bpmnElement="Flow_0ulc8vj">
        <di:waypoint x="360" y="237"/>
        <di:waypoint x="395" y="237"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
  <bpmndi:BPMNDiagram id="BPMNDiagram_0q9c8fa">
    <bpmndi:BPMNPlane id="BPMNPlane_0dvbetw" bpmnElement="Activity_1cjfmf7">
      <bpmndi:BPMNShape id="Event_1uc8qm1_di" bpmnElement="Event_1uc8qm1">
        <dc:Bounds x="202" y="112" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1gsgxk8_di" bpmnElement="Activity_1gsgxk8">
        <dc:Bounds x="290" y="90" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_04akeuj_di" bpmnElement="Activity_04akeuj">
        <dc:Bounds x="290" y="220" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1aqkqaq_di" bpmnElement="Activity_1aqkqaq">
        <dc:Bounds x="450" y="220" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_15w8hnx_di" bpmnElement="Activity_15w8hnx">
        <dc:Bounds x="450" y="90" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0wmd1hv_di" bpmnElement="Activity_0wmd1hv">
        <dc:Bounds x="630" y="90" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0qdx71s_di" bpmnElement="Event_0qdx71s">
        <dc:Bounds x="782" y="112" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_11nuv0l_di" bpmnElement="Flow_11nuv0l">
        <di:waypoint x="238" y="130"/>
        <di:waypoint x="290" y="130"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0qd0b8g_di" bpmnElement="Flow_0qd0b8g">
        <di:waypoint x="340" y="170"/>
        <di:waypoint x="340" y="220"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1asukl3_di" bpmnElement="Flow_1asukl3">
        <di:waypoint x="390" y="260"/>
        <di:waypoint x="450" y="260"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1vu35wa_di" bpmnElement="Flow_1vu35wa">
        <di:waypoint x="500" y="220"/>
        <di:waypoint x="500" y="170"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_020vfej_di" bpmnElement="Flow_020vfej">
        <di:waypoint x="550" y="130"/>
        <di:waypoint x="630" y="130"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0vo1l2r_di" bpmnElement="Flow_0vo1l2r">
        <di:waypoint x="730" y="130"/>
        <di:waypoint x="782" y="130"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1w0fzjv">
    <bpmndi:BPMNPlane id="BPMNPlane_06qtnpv" bpmnElement="Activity_1b98x37">
      <bpmndi:BPMNShape id="BPMNShape_0xui037" bpmnElement="Event_1g1rgth">
        <dc:Bounds x="180" y="182" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_0212e4m" bpmnElement="Activity_0xb1r7m">
        <dc:Bounds x="268" y="160" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_00s3h8q" bpmnElement="Activity_0acm6pk">
        <dc:Bounds x="268" y="290" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_1actgx3" bpmnElement="Activity_0ol9aef">
        <dc:Bounds x="428" y="290" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_0kv5rdx" bpmnElement="Activity_090chyn">
        <dc:Bounds x="428" y="160" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_17mn4r0" bpmnElement="Activity_1sceqj1">
        <dc:Bounds x="608" y="160" width="100" height="80"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_1o3vnx3" bpmnElement="Event_1gf5gld">
        <dc:Bounds x="760" y="182" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="BPMNEdge_0vc6nhe" bpmnElement="Flow_05gc1jf">
        <di:waypoint x="216" y="200"/>
        <di:waypoint x="268" y="200"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BPMNEdge_0q8xxrj" bpmnElement="Flow_04rkbgh">
        <di:waypoint x="318" y="240"/>
        <di:waypoint x="318" y="290"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BPMNEdge_0iaj529" bpmnElement="Flow_095xyss">
        <di:waypoint x="368" y="330"/>
        <di:waypoint x="428" y="330"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BPMNEdge_1s3euyc" bpmnElement="Flow_0gxk781">
        <di:waypoint x="478" y="290"/>
        <di:waypoint x="478" y="240"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BPMNEdge_1ykpg9k" bpmnElement="Flow_0nkzcsq">
        <di:waypoint x="528" y="200"/>
        <di:waypoint x="608" y="200"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BPMNEdge_1veonsv" bpmnElement="Flow_14mrhdz">
        <di:waypoint x="708" y="200"/>
        <di:waypoint x="760" y="200"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

  return {
    bpmnXml,
    executedActivities,
    activeActivities,
    activityDetails
  };
};

// Generate workflow executions for the Workflows page with logical, sane data
export const generateWorkflowExecutions = (count: number) => {
  const executions: any[] = [];

  for (let i = 0; i < count; i++) {
    const device = deviceIds[i % deviceIds.length];
    const createdAt = subHours(new Date(), randomInt(1, 168));
    const scheduledTime = addHours(createdAt, randomInt(24, 72));
    const deviceCompatibilityTime = addHours(createdAt, 2);
    const assignedEmployee = randomChoice(mockEmployees);
    const issuer = randomChoice(mockEmployees);
    
    const isCompleted = i % 3 === 0;
    const stepIndex = isCompleted 
      ? workflowSteps.length - 1 
      : Math.min(randomInt(0, workflowSteps.length - 1), workflowSteps.length - 1);
    const currentStep = workflowSteps[stepIndex];
    const status = isCompleted ? 'SUCCESS' : (i % 7 === 0 ? 'FAILED' : 'STARTED');

    executions.push({
      flowInstanceId: `FLOW-${randomId().toUpperCase()}`,
      deviceId: device.deviceId,
      hostname: device.hostname,
      location: device.location,
      ipAddress: device.ipAddress,
      managementIp: device.managementIp,
      workflow: "Upgrade Workflow",
      step: currentStep.id,
      status: status,
      message: isCompleted 
        ? `NFX 350 upgrade completed successfully for ${device.hostname}` 
        : status === 'FAILED'
        ? `Error during ${currentStep.name} for ${device.hostname} - please check device logs`
        : `Processing ${currentStep.name} for ${device.hostname} - ${Math.round((stepIndex / workflowSteps.length) * 100)}% complete`,
      assignedDtac: assignedEmployee.attUid,
      assignedEmail: assignedEmployee.email,
      assignedName: `${assignedEmployee.firstName} ${assignedEmployee.lastName}`,
      createdAt: createdAt.toISOString(),
      scheduledTime: scheduledTime.toISOString(),
      deviceCompatibilityTime: deviceCompatibilityTime.toISOString(),
      localCustomerEmailContact: `customer.${device.location.toLowerCase()}@att.com`,
      localCustomerMobileContact: `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      issuer: issuer.attUid,
      issuerEmail: issuer.email,
      issuerName: `${issuer.firstName} ${issuer.lastName}`,
      processName: `NFX 350 Upgrade Process`,
      processFlowId: `FLOW-${randomId().toUpperCase()}`,
      completed: isCompleted,
      completedTime: isCompleted ? addHours(scheduledTime, 4).toISOString() : null,
      lastUpdated: isCompleted 
        ? addHours(scheduledTime, 4).toISOString()
        : addHours(createdAt, randomInt(1, 12)).toISOString(),
      reScheduleCount: i < 5 ? 0 : randomInt(0, 1),
      progress: Math.round((stepIndex / workflowSteps.length) * 100)
    });
  }

  return executions;
};

// Generate available time slots for rescheduling
export const generateAvailableSlots = (startDate: string, endDate: string, skill: string) => {
  const slots: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const current = new Date(start);
  while (current < end) {
    const hour = current.getHours();
    if (hour >= 8 && hour <= 14) {
      slots.push(current.toISOString());
    }
    current.setHours(current.getHours() + 4);
  }

  return slots.filter(() => Math.random() > 0.3);
};

// Generate workflows for a specific task ID with realistic data
export const generateWorkflowsForTask = (taskId: string) => {
  const workflows: any[] = [];
  const deviceCount = randomInt(1, 4);

  for (let i = 0; i < deviceCount; i++) {
    const device = deviceIds[i];
    const flowInstanceId = `FLOW-${randomId().toUpperCase()}`;
    const assignedEmployee = randomChoice(mockEmployees);
    const issuer = randomChoice(mockEmployees);

    const isCompleted = Math.random() > 0.3;
    const stepIndex = isCompleted 
      ? workflowSteps.length - 1 
      : randomInt(3, workflowSteps.length - 2);
    
    const currentStep = workflowSteps[stepIndex];
    const status = isCompleted ? 'SUCCESS' : (Math.random() > 0.9 ? 'FAILED' : 'STARTED');
    const createdAt = subHours(new Date(), 2);

    workflows.push({
      flowInstanceId,
      deviceId: device.deviceId,
      hostname: device.hostname,
      location: device.location,
      step: currentStep.id,
      status: status,
      message: isCompleted 
        ? `${currentStep.name} completed successfully for ${device.hostname}`
        : `Processing ${currentStep.name} for ${device.hostname}`,
      assignedDtac: assignedEmployee.attUid,
      assignedEmail: assignedEmployee.email,
      createdAt: createdAt.toISOString(),
      lastUpdated: addMinutes(createdAt, currentStep.duration * 10).toISOString(),
      completed: isCompleted,
      completedTime: isCompleted ? addHours(createdAt, 3).toISOString() : null,
      processName: `NFX 350 Upgrade - ${device.location}`,
      processFlowId: flowInstanceId,
      issuer: issuer.attUid,
      reScheduleCount: 0
    });
  }

  return workflows;
};
