import React, { useState, useEffect } from 'react';
import CalendarView from '../calendarView/calendarView';
import UpgradeProgress from '../upgradeProcess/UpgradeProgress';
import BatchUpgradeProgress from '../CalendarWithTabs/BatchUpgradeProgress';
import Workflows from '../CalendarWithTabs/Workflows';
import { startOfWeek, endOfWeek } from 'date-fns';
import { API_URLS } from '../../utils/ApiUrls';
// import API_URLS from "../../utils/ApiUrls";
 
interface WorkflowExecution {
  flowInstanceId: string;
  deviceId: string;
  step: string;
  status: string;
  message: string;
  assignedDtac: string;
  createdAt: string;
  lastUpdated: string;
  completed: boolean;
  completedTime: string | null;
  processName: string;
  processFlowId: string;
  issuer: string;
  reScheduleCount: number;
}
 
interface Task {
  id: string;
  startTime: string;
  endTime: string;
  workflows: WorkflowExecution[];
  workflowCount: number;
}
 
interface DtacEmployee {
  attUid: string;
  email: string;
  role: string;
  skills: any;
  tasks: Task[];
  shift: any;
  firstName: string;
  lastName: string;
  active: boolean;
}
 
const appendZ = (timeStr: string): string => timeStr.endsWith('Z') ? timeStr : `${timeStr}Z`;
 
const toLocalDateTimeString = (date: Date): string => {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};
 
const CalendarWithTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dtac');
  const [eventTabs, setEventTabs] = useState<{ id: string; title: string; task: Task }[]>([]);
  const [dtacEvents, setDtacEvents] = useState<any[]>([]);
  const [msimResources, setMsimResources] = useState<any[]>([]);
  const [msimEvents, setMsimEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string>('1');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [dtacLoading, setDtacLoading] = useState(false);
  const [dtacDate, setDtacDate] = useState<Date>(new Date());
  const [msimDate, setMsimDate] = useState<Date>(new Date());
 
  // Helper: Get start and end of current week (Mon–Sun)
  const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
    const end = endOfWeek(date, { weekStartsOn: 1 }).toISOString();
    return { start, end };
  };
 
  // Helper: Get start and end of a single day (00:00 today to 00:00 tomorrow to include overnight tasks)
  const getDayRange = (date: Date) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    return { start, end };
  };
 
  // Convert Task to CalendarEvent
  const taskToCalendarEvent = (task: Task, userId: string) => {
    const start = new Date(appendZ(task.startTime));
    const end = new Date(appendZ(task.endTime));
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
   
    // Get unique device IDs from workflows
    const deviceIds = [...new Set(task.workflows.map((w: WorkflowExecution) => w.deviceId))];
   
    // Determine overall task status based on workflows
    const allCompleted = task.workflows.every((w: WorkflowExecution) => w.completed);
    const anyFailed = task.workflows.some((w: WorkflowExecution) => w.status === 'FAILED');
    const taskStatus = anyFailed ? 'failed' : allCompleted ? 'completed' : 'in-progress';
 
    return {
      id: task.id,
      title: `${deviceIds.length} Device${deviceIds.length !== 1 ? 's' : ''} - ${deviceIds.slice(0, 2).join(', ')}${deviceIds.length > 2 ? '...' : ''}`,
      start,
      end,
      extendedProps: {
        userId,
        description: `Status: ${taskStatus}, Workflows: ${task.workflowCount}, Duration: ${durationMinutes} min`,
        durationMinutes,
        status: taskStatus,
        task,
        workflowCount: task.workflowCount
      }
    };
  };
 
  // Fetch employee tasks for DTAC
  const fetchEmployeeTasks = async (id: string, startDate: string, endDate: string) => {
    try {
      setDtacLoading(true);
      const dtacResponse = await fetch(
        `${API_URLS.baseurl}employees/${id}?startDate=${startDate}&endDate=${endDate}`
      );
      const dtacData: DtacEmployee = await dtacResponse.json();
 
      // Convert tasks to calendar events
      const dtacCalendarEvents = dtacData.tasks.map((task: Task) =>
        taskToCalendarEvent(task, dtacData.attUid)
      );
 
      setDtacEvents(dtacCalendarEvents);
      setEmployeeName(`${dtacData.firstName} ${dtacData.lastName}`);
    } catch (error) {
      console.error('Error fetching employee tasks:', error);
      setDtacEvents([]);
      setEmployeeName('');
    } finally {
      setDtacLoading(false);
    }
  };
 
  // Fetch MSIM data
  const fetchMsimData = async (startDate: string, endDate: string) => {
    try {
      const msimResponse = await fetch(
        `${API_URLS.baseurl}employees?startDate=${startDate}&endDate=${endDate}`
      );
      const msimData: DtacEmployee[] = await msimResponse.json();
 
      // Map to resources (employees)
      const resources = msimData.map(employee => ({
        id: employee.attUid,
        title: `${employee.firstName} ${employee.lastName}`
      }));
 
      // Map tasks to calendar events
      const msimCalendarEvents = msimData.flatMap(employee =>
        employee.tasks.map((task: Task) => {
          const event = taskToCalendarEvent(task, employee.attUid);
          return {
            ...event,
            resourceId: employee.attUid
          };
        })
      );
 
      setMsimResources(resources);
      setMsimEvents(msimCalendarEvents);
    } catch (error) {
      console.error('Error fetching MSIM data:', error);
      setMsimResources([]);
      setMsimEvents([]);
    }
  };
 
  // Fetch data once on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        setDtacDate(now);
        setMsimDate(now);
 
        const week = getWeekRange(now);
        await fetchEmployeeTasks(employeeId, week.start, week.end);
 
        const day = getDayRange(now);
        await fetchMsimData(day.start, day.end);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, []);
 
  // Handle manual employee ID submit
  const handleEmployeeIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeId.trim()) {
      const { start, end } = getWeekRange(dtacDate);
      await fetchEmployeeTasks(employeeId.trim(), start, end);
    }
  };
 
  // Handle date changes from DTAC CalendarView
  const handleDtacDateChange = async (date: Date) => {
    setDtacDate(date);
    const { start, end } = getWeekRange(date);
    if (employeeId) {
      await fetchEmployeeTasks(employeeId, start, end);
    }
  };
 
  // Handle date changes from MSIM CalendarView
  const handleMsimDateChange = async (date: Date) => {
    setMsimDate(date);
    const { start, end } = getDayRange(date);
    await fetchMsimData(start, end);
  };
 
  // Handle user clicking on a date in DTAC calendar
  const handleDateClick = async (date: Date) => {
    const startDate = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
    const endDate = endOfWeek(date, { weekStartsOn: 1 }).toISOString();
    await fetchEmployeeTasks(employeeId, startDate, endDate);
  };
 
  // Handle event change (drag/drop/resize) in MSIM
  const handleEventChange = async (info: any) => {
    const { event, revert } = info;
    const taskId = event.id;
    let resourceId = event._def?.resourceIds?.[0];
    if (!resourceId) {
      resourceId = info.newResource?.id;
    }
    if (!resourceId) {
      resourceId = event.resourceId;
    }
    const newStartTime = event.start.toISOString();
    const newEndTime = event.end.toISOString();
    const username = 'string'; // Hardcoded as per instructions
 
    if (!resourceId || !taskId) {
      revert();
      return;
    }
 
    // Optional: Prevent multi-day spans to avoid glitches
    const startDate = new Date(newStartTime).toDateString();
    const endDate = new Date(newEndTime).toDateString();
    if (startDate !== endDate) {
      alert('Task cannot span multiple days in day view in MSIM.');
      revert();
      return;
    }
 
    const localStart = toLocalDateTimeString(event.start);
    const localEnd = toLocalDateTimeString(event.end);
    const confirmMessage = `Save changes to task "${event.title}"?\nNew Start: ${localStart}\nNew End: ${localEnd}\nNew Employee ID: ${resourceId}`;
    if (!window.confirm(confirmMessage)) {
      revert();
      return;
    }
 
    const body = {
      taskId,
      newStartTime,
      newEndTime,
      employeeId: resourceId,
      username,
    };
 
    try {
      const response = await fetch(`${API_URLS.baseurl}reschedule-task`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
 
      if (!response.ok) {
        throw new Error('Failed to reschedule task');
      }
 
      // Refetch MSIM data to sync with backend
      const { start, end } = getDayRange(msimDate);
      await fetchMsimData(start, end);
    } catch (error) {
      console.error('Error rescheduling task:', error);
      alert('Error saving changes. Reverting local change.');
      revert();
    }
  };
 
  // Handle event click - open appropriate view based on workflow count
  const handleEventClick = async (event: any) => {
    const task = event.extendedProps?.task as Task;
   
    if (!task || !task.workflows || task.workflows.length === 0) {
      alert('No workflow data available for this task');
      return;
    }
 
    const taskId = event.id;
    const workflowCount = task.workflows.length;
 
    // Single workflow - open UpgradeProgress directly
    if (workflowCount === 1) {
      const workflow = task.workflows[0];
      const newTab = {
        id: `${taskId}-single`,
        title: `Device: ${workflow.deviceId}`,
        task: task
      };
 
      if (!eventTabs.find(tab => tab.id === newTab.id)) {
        setEventTabs(prev => [...prev, newTab]);
      }
      setActiveTab(newTab.id);
    }
    // Multiple workflows - open BatchUpgradeProgress
    else {
      const deviceIds = [...new Set(task.workflows.map((w: WorkflowExecution) => w.deviceId))];
      const newTab = {
        id: taskId,
        title: `Task: ${deviceIds.length} Devices`,
        task: task
      };
 
      if (!eventTabs.find(tab => tab.id === taskId)) {
        setEventTabs(prev => [...prev, newTab]);
      }
      setActiveTab(taskId);
    }
  };
 
  const closeTab = (tabId: string) => {
    setEventTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab('dtac');
    }
  };
 
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }
 
  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === 'dtac'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('dtac')}
        >
          DTAC
        </button>
 
        <button
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === 'msim'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('msim')}
        >
          MSIM
        </button>
 
        <button
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === 'workflows'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('workflows')}
        >
          Workflows
        </button>
 
        {eventTabs.map(tab => (
          <div key={tab.id} className="flex items-center">
            <button
              className={`px-4 py-2 font-semibold ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.title}
            >
              {tab.title}
            </button>
            <button
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => closeTab(tab.id)}
              aria-label={`Close ${tab.title}`}
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}
      </div>
 
      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'dtac' && (
          <div className="p-4">
            <div className="mb-4 flex justify-between items-center">
              <form onSubmit={handleEmployeeIdSubmit} className="flex gap-2 items-center">
                <label htmlFor="employeeId" className="font-medium text-gray-700">
                  Employee ID:
                </label>
                <input
                  type="text"
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter employee ID"
                  disabled={dtacLoading}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0099DC] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={dtacLoading}
                >
                  {dtacLoading ? 'Loading...' : 'Fetch Tasks'}
                </button>
              </form>
              {employeeName && <span className="font-medium text-gray-900">{employeeName}</span>}
            </div>
 
            <CalendarView
              type="user"
              events={dtacEvents}
              onEventClick={handleEventClick}
              onDateClick={(info: any) => handleDateClick(new Date(info.date))}
              height="500px"
              onDateChange={handleDtacDateChange}
            />
          </div>
        )}
 
        {activeTab === 'msim' && (
          <div className="p-4">
            <CalendarView
              type="resource"
              events={msimEvents}
              resources={msimResources}
              onEventClick={handleEventClick}
              onEventChange={handleEventChange}
              height="500px"
              onDateChange={handleMsimDateChange}
            />
          </div>
        )}
 
        {activeTab === 'workflows' && (
          <div className="p-4">
            <Workflows />
          </div>
        )}
 
        {eventTabs.map(tab => (
          activeTab === tab.id && (
            <div key={tab.id} className="p-4">
              {tab.task.workflows.length === 1 ? (
                // Single device upgrade progress
                <UpgradeProgress
                  deviceId={tab.task.workflows[0].deviceId}
                  flowInstanceId={tab.task.workflows[0].flowInstanceId}
                />
              ) : (
                // Batch upgrade progress (multiple workflows)
                <BatchUpgradeProgress
                  task={tab.task}
                  onDeviceClick={(deviceId: string, flowInstanceId: string) => {
                    const workflow = tab.task.workflows.find(w => w.deviceId === deviceId);
                    if (workflow) {
                      const newTask: Task = {
                        id: `${tab.task.id}-${deviceId}`,
                        startTime: tab.task.startTime,
                        endTime: tab.task.endTime,
                        workflows: [workflow],
                        workflowCount: 1
                      };
                      const newTab = {
                        id: `${deviceId}`,
                        title: `Device: ${deviceId}`,
                        task: newTask
                      };
                      if (!eventTabs.find(t => t.id === newTab.id)) {
                        setEventTabs(prev => [...prev, newTab]);
                      }
                      setActiveTab(newTab.id);
                    }
                  }}
                />
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
};
 
export default CalendarWithTabs;