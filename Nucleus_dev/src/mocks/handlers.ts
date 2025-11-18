import { http, HttpResponse } from 'msw';
import {
  generateEmployeeData,
  generateAllEmployeesData,
  generateUpgradeLogs,
  generateBpmnData,
  generateWorkflowExecutions,
  generateAvailableSlots,
  generateWorkflowsForTask,
  mockEmployees
} from './mockData';

// Mock handlers for all API endpoints
export const handlers = [
  // POST /api/orchestration/start - Device activation
  http.post('http://localhost:9090/api/orchestration/start', () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json({
          success: true,
          message: 'Device activation started successfully',
          timestamp: new Date().toISOString()
        }));
      }, 1000);
    });
  }),

  // GET /api/employees/{id} - Get employee tasks for specific employee
  http.get('http://localhost:8080/api/employees/:id', ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      return HttpResponse.json({
        error: 'Missing startDate or endDate parameters',
        message: 'Both startDate and endDate are required'
      }, { status: 400 });
    }

    const employeeData = generateEmployeeData(id as string, startDate, endDate);

    if (!employeeData) {
      return HttpResponse.json({
        error: 'Employee not found',
        message: `No employee found with ID: ${id}`
      }, { status: 404 });
    }

    return HttpResponse.json(employeeData);
  }),

  // GET /api/employees - Get all employees with tasks
  http.get('http://localhost:8080/api/employees', ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      return HttpResponse.json({
        error: 'Missing startDate or endDate parameters',
        message: 'Both startDate and endDate are required'
      }, { status: 400 });
    }

    const employeesData = generateAllEmployeesData(startDate, endDate);
    return HttpResponse.json(employeesData);
  }),

  // POST /api/reschedule-task - Reschedule a task
  http.post('http://localhost:8080/api/reschedule-task', async ({ request }) => {
    const body = await request.json() as {
      taskId: string;
      newStartTime: string;
      newEndTime: string;
      employeeId: string;
      username: string;
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate required fields
    if (!body.taskId || !body.newStartTime || !body.newEndTime || !body.employeeId) {
      return HttpResponse.json({
        error: 'Missing required fields',
        message: 'taskId, newStartTime, newEndTime, and employeeId are required'
      }, { status: 400 });
    }

    // Validate time duration is exactly 4 hours
    const start = new Date(body.newStartTime);
    const end = new Date(body.newEndTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (durationHours !== 4) {
      return HttpResponse.json({
        error: 'Invalid duration',
        message: 'Task duration must be exactly 4 hours'
      }, { status: 400 });
    }

    // Check if employee exists
    const employee = mockEmployees.find(emp => emp.attUid === body.employeeId);
    if (!employee) {
      return HttpResponse.json({
        error: 'Employee not found',
        message: `No employee found with ID: ${body.employeeId}`
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      message: `Task ${body.taskId} rescheduled successfully`,
      taskId: body.taskId,
      newStartTime: body.newStartTime,
      newEndTime: body.newEndTime,
      employeeId: body.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      duration: '4 hours'
    });
  }),

  // GET /api/logs - Get upgrade logs for a flow instance
  http.get('http://localhost:8080/api/logs', ({ request }) => {
    const url = new URL(request.url);
    const flowId = url.searchParams.get('flowId');

    if (!flowId) {
      return HttpResponse.json({
        error: 'Missing flowId parameter',
        message: 'flowId parameter is required'
      }, { status: 400 });
    }

    try {
      const logs = generateUpgradeLogs(flowId);
      return HttpResponse.json(logs);
    } catch (error) {
      console.error('Error generating upgrade logs:', error);
      return HttpResponse.json({
        error: 'Failed to generate logs',
        message: 'An error occurred while generating upgrade logs'
      }, { status: 500 });
    }
  }),

  // GET /api/process-instance/{flowInstanceId}/diagram - Get BPMN diagram data
  http.get('http://localhost:8080/api/process-instance/:flowInstanceId/diagram', ({ params }) => {
    const { flowInstanceId } = params;

    if (!flowInstanceId) {
      return HttpResponse.json({
        error: 'Missing flowInstanceId parameter',
        message: 'flowInstanceId is required'
      }, { status: 400 });
    }

    try {
      const bpmnData = generateBpmnData(flowInstanceId as string);
      return HttpResponse.json(bpmnData);
    } catch (error) {
      console.error('Error generating BPMN data:', error);
      return HttpResponse.json({
        error: 'Failed to generate BPMN diagram',
        message: 'An error occurred while generating the BPMN diagram'
      }, { status: 500 });
    }
  }),

  // POST /api/workflow-executions - Get paginated workflow executions with filters
  http.post('http://localhost:8080/api/workflow-executions', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');

    // Parse request body for filters
    const body = await request.json().catch(() => ({})) as any;

    // Generate mock workflow executions
    const allExecutions = generateWorkflowExecutions(100);

    // Apply filters if provided
    let filteredExecutions = allExecutions;

    if (body.deviceIds && Array.isArray(body.deviceIds) && body.deviceIds.length > 0) {
      filteredExecutions = filteredExecutions.filter((exec: any) =>
        body.deviceIds.includes(exec.deviceId)
      );
    }

    if (body.workflows && Array.isArray(body.workflows) && body.workflows.length > 0) {
      filteredExecutions = filteredExecutions.filter((exec: any) =>
        body.workflows.some((wf: string) => exec.workflow.toLowerCase().includes(wf.toLowerCase()))
      );
    }

    if (body.completed !== null && body.completed !== undefined) {
      filteredExecutions = filteredExecutions.filter((exec: any) =>
        exec.completed === body.completed
      );
    }

    if (body.emailContact) {
      filteredExecutions = filteredExecutions.filter((exec: any) =>
        exec.localCustomerEmailContact.toLowerCase().includes(body.emailContact.toLowerCase())
      );
    }

    if (body.processNames && Array.isArray(body.processNames) && body.processNames.length > 0) {
      filteredExecutions = filteredExecutions.filter((exec: any) =>
        body.processNames.includes(exec.processName)
      );
    }

    // Apply sorting
    if (body.sort && body.sort.createdAt) {
      filteredExecutions.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return body.sort.createdAt === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Apply pagination
    const totalElements = filteredExecutions.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const content = filteredExecutions.slice(startIndex, endIndex);

    return HttpResponse.json({
      content,
      pageable: {
        page,
        size,
        sort: [{
          property: 'createdAt',
          direction: body.sort?.createdAt === 'asc' ? 'ASC' : 'DESC'
        }],
        offset: startIndex,
        paged: true,
        unpaged: false
      },
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page === totalPages - 1,
      numberOfElements: content.length,
      empty: content.length === 0
    });
  }),

  // GET /api/employees/available-slots - Get available time slots (4-hour intervals)
  http.get('http://localhost:8080/api/employees/available-slots', ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const skill = url.searchParams.get('skill');

    if (!startDate || !endDate || !skill) {
      return HttpResponse.json({
        error: 'Missing required parameters',
        message: 'startDate, endDate, and skill are required'
      }, { status: 400 });
    }

    try {
      // Generate available time slots (all 4-hour slots)
      const slots = generateAvailableSlots(startDate, endDate, skill);
      return HttpResponse.json(slots);
    } catch (error) {
      console.error('Error generating available slots:', error);
      return HttpResponse.json({
        error: 'Failed to generate available slots',
        message: 'An error occurred while generating available time slots'
      }, { status: 500 });
    }
  }),

  // POST /api/devices/reschedule/{flowInstanceId} - Reschedule device upgrade
  http.post('http://localhost:8080/api/devices/reschedule/:flowInstanceId', async ({ params, request }) => {
    const { flowInstanceId } = params;
    const body = await request.json() as { newScheduledZoneDateTime: string };

    if (!flowInstanceId || !body.newScheduledZoneDateTime) {
      return HttpResponse.json({
        error: 'Missing required parameters',
        message: 'flowInstanceId and newScheduledZoneDateTime are required'
      }, { status: 400 });
    }

    // Validate that new time is in the future
    const newTime = new Date(body.newScheduledZoneDateTime);
    if (newTime <= new Date()) {
      return HttpResponse.json({
        error: 'Invalid scheduled time',
        message: 'Scheduled time must be in the future'
      }, { status: 400 });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return HttpResponse.json({
      success: true,
      message: `Device upgrade for flow ${flowInstanceId} rescheduled successfully`,
      flowInstanceId,
      newScheduledTime: body.newScheduledZoneDateTime,
      timestamp: new Date().toISOString()
    });
  }),

  // GET /api/tasks/{taskId} - Get task details with workflows
  http.get('http://localhost:8080/api/tasks/:taskId', ({ params }) => {
    const taskId = params.taskId as string;

    if (!taskId) {
      return HttpResponse.json({
        error: 'Missing taskId parameter',
        message: 'taskId is required'
      }, { status: 400 });
    }

    try {
      // Generate workflows for this task
      const workflows = generateWorkflowsForTask(taskId);
      const deviceIds = [...new Set(workflows.map(w => w.deviceId))];

      return HttpResponse.json({
        id: taskId,
        name: `Upgrade Task - ${workflows.length} Device${workflows.length !== 1 ? 's' : ''}`,
        workflows,
        workflowCount: workflows.length,
        deviceIds: deviceIds,
        deviceCount: deviceIds.length,
        customerEmail: `customer@att.com`,
        createdAt: new Date().toISOString(),
        status: workflows.every(w => w.completed) ? 'completed' : 'in_progress'
      });
    } catch (error) {
      console.error('Error generating task workflows:', error);
      return HttpResponse.json({
        error: 'Failed to generate task data',
        message: 'An error occurred while generating task workflows'
      }, { status: 500 });
    }
  })
];
