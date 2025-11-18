import React, { useState, useEffect } from 'react';
// import API_URLS from "../../utils/ApiUrls";
import Task from './CalendarWithTabs';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  styled,
  Card,
  CardContent,
  Stack,
  alpha,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import { API_URLS } from '../../utils/ApiUrls';

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


interface BatchUpgradeProgressProps {
  task: any;
  onDeviceClick?: (deviceId: string, flowInstanceId: string) => void;
}

const BASE_URL = API_URLS.baseurl;

const BatchUpgradeProgress: React.FC<BatchUpgradeProgressProps> = ({ task, onDeviceClick }) => {
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<string>('all');
  const [pollingActive, setPollingActive] = useState(true);

  const steps = [
    'check-device-compatibility',
    'pre-upgrade-backup',
    'reboot-device',
    'mgmt-port',
    'post-reboot-check',
    'device-activation',
    'vnf-spinup-and-config'
  ];

  // Format step names for display
  const formatStepName = (step: string) => {
    return step
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get the latest step for each device
  const getDeviceLatestSteps = (workflowsData: WorkflowExecution[]) => {
    const deviceLatestStep: Record<string, WorkflowExecution> = {};

    workflowsData.forEach(workflow => {
      const timestamp = new Date(workflow.lastUpdated).getTime();
      if (!deviceLatestStep[workflow.deviceId] || timestamp > new Date(deviceLatestStep[workflow.deviceId].lastUpdated).getTime()) {
        deviceLatestStep[workflow.deviceId] = workflow;
      }
    });

    return deviceLatestStep;
  };

  useEffect(() => {
    let intervalId:any;

    const fetchWorkflows = async () => {
      try {
        const response = await fetch(`${BASE_URL}tasks/${task.id}`);
        const data = await response.json();
        const workflowsData = data.workflows as WorkflowExecution[];
        setWorkflows(workflowsData);

        // Get unique device IDs
        const uniqueDevices = [...new Set(workflowsData.map(workflow => workflow.deviceId))];

        // Check if all devices have completed
        const deviceLatestSteps = getDeviceLatestSteps(workflowsData);
        const allDevicesCompleted = uniqueDevices.length > 0 && uniqueDevices.every(deviceId => {
          const latestWorkflow = deviceLatestSteps[deviceId];
          return latestWorkflow && latestWorkflow.completed && latestWorkflow.status === 'SUCCESS';
        });

        // Stop polling if all devices completed
        if (allDevicesCompleted) {
          setPollingActive(false);
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          console.log('All devices completed upgrade process, stopping polling');
        }
      } catch (error) {
        console.error('Error fetching workflows:', error);
        setWorkflows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();

    // Poll every 3 seconds if polling is active
    if (pollingActive) {
      intervalId = setInterval(fetchWorkflows, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [task.id, pollingActive]);

  // Calculate counts for each step based on latest device positions
  const getStepCounts = () => {
    const counts: Record<string, number> = {};
    const deviceLatestSteps = getDeviceLatestSteps(workflows);

    // Initialize counts
    steps.forEach(step => counts[step] = 0);
    counts.all = Object.keys(deviceLatestSteps).length;

    // Count devices currently at each step
    Object.values(deviceLatestSteps).forEach(latestWorkflow => {
      // Only count if the step is in our steps array (exclude flow-complete)
      if (steps.includes(latestWorkflow.step)) {
        counts[latestWorkflow.step]++;
      }
    });

    return counts;
  };

  const stepCounts = getStepCounts();

  // Filter workflows based on selected step
  const getFilteredWorkflows = () => {
    const deviceLatestSteps = getDeviceLatestSteps(workflows);

    if (selectedStep === 'all') {
      // Show all latest workflows for each device
      return Object.values(deviceLatestSteps);
    } else {
      // Show only devices currently at the selected step
      return Object.values(deviceLatestSteps).filter(workflow => workflow.step === selectedStep);
    }
  };

  const filteredWorkflows = getFilteredWorkflows();

  // Truncate flow instance ID for display
  const truncateFlowId = (flowId: string) => flowId.length > 15 ? flowId.substring(0, 15) + '...' : flowId;

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">Loading batch upgrade progress...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Page header strip */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg" style={{background: '#0099DC', borderRadius: '30px'}}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {task.name}
              </h2>
              <div className="flex items-center gap-6 text-blue-100">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                  Task ID: {task.id}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  {task.deviceCount || task.deviceIds?.length || 0} Devices
                </span>
                {task.customerEmail && (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    {task.customerEmail}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg">
                <span className={`w-3 h-3 rounded-full ${pollingActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                <span className="text-black font-medium">{pollingActive ? 'Live Updates' : 'Completed'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Cards */}
      <div className="max-w-7xl mx-auto mt-8 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
          {/* All Devices Card */}
          <div
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all shadow-sm ${
              selectedStep === 'all'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedStep('all')}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stepCounts.all}</div>
              <div className="text-sm font-medium text-gray-700">All Devices</div>
              <div className="text-xs text-gray-500 mt-1">Total Active</div>
            </div>
          </div>

          {/* Step Cards */}
          {steps.map((step) => (
            <div
              key={step}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all shadow-sm ${
                selectedStep === step
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedStep(step)}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-1">{stepCounts[step] || 0}</div>
                <div className="text-sm font-medium text-gray-700 leading-tight">{formatStepName(step)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stepCounts[step] > 0 ? 'Active' : 'None'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedStep === 'all' 
                ? 'All Device Status' 
                : `Devices at: ${formatStepName(selectedStep)}`}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredWorkflows.length} device{filteredWorkflows.length !== 1 ? 's' : ''}
            </p>
          </div>
          {/* <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Step
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flow Instance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned DTAC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Process Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issuer
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkflows.length > 0 ? (
                  filteredWorkflows
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .map((workflow) => (
                      <tr key={`${workflow.deviceId}-${workflow.flowInstanceId}`} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 underline-offset-2"
                            onClick={() => onDeviceClick?.(workflow.deviceId, workflow.flowInstanceId)}
                          >
                            {workflow.deviceId}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatStepName(workflow.step)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            workflow.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-800'
                              : workflow.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : workflow.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {workflow.status === 'SUCCESS' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            )}
                            {workflow.status === 'FAILED' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                            )}
                            {workflow.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={workflow.message}>
                          {workflow.message || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(workflow.lastUpdated).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          <button
                            className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 underline-offset-2"
                            onClick={() => onDeviceClick?.(workflow.deviceId, workflow.flowInstanceId)}
                            title={workflow.flowInstanceId}
                          >
                            {truncateFlowId(workflow.flowInstanceId)}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {workflow.assignedDtac || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {workflow.processName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {workflow.issuer || '-'}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        <p className="text-gray-500 font-medium">No devices at this step</p>
                        <p className="text-sm text-gray-400">Try selecting a different step or "All Devices"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div> */}

          <TableContainer
  sx={{
    width: '100%',
    overflowX: 'auto',
    borderRadius: 2,
    boxShadow: 'none',
    '&::-webkit-scrollbar': {
      height: 10, // scrollbar height
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#9e9e9e',
      borderRadius: 8,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#757575',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#f1f1f1',
      borderRadius: 8,
    },
  }}
>
  <Table
    sx={{
      minWidth: '1200px', // ensures scrollable width
      whiteSpace: 'nowrap', // keeps cells in a single line
      borderCollapse: 'separate',
      borderSpacing: 0,
    }}
  >
    <TableHead sx={{ bgcolor: '#5fbbe4'}}>
      <TableRow sx={{color: '#ffffff' }}>
        {[
          'Device ID',
          'Current Step',
          'Status',
          'Message',
          'Last Updated',
          'Flow Instance',
          'Assigned DTAC',
          'Process Name',
          'Issuer',
        ].map(header => (
          <TableCell
            key={header}
            sx={{
              fontWeight: 'bold',
              fontSize: '0.8rem',
              color: 'text.secondary',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {header}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>

    <TableBody>
      {filteredWorkflows.length > 0 ? (
        filteredWorkflows
          .sort(
            (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
          )
          .map(workflow => (
            <TableRow
              key={`${workflow.deviceId}-${workflow.flowInstanceId}`}
              hover
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <TableCell>
                <Button
                  variant="text"
                  onClick={() =>
                    onDeviceClick?.(workflow.deviceId, workflow.flowInstanceId)
                  }
                  sx={{ color: 'primary.main', textTransform: 'none' }}
                >
                  {workflow.deviceId}
                </Button>
              </TableCell>

              <TableCell>{formatStepName(workflow.step)}</TableCell>

              <TableCell>
                <Chip
                  label={workflow.status}
                  color={
                    workflow.status === 'SUCCESS'
                      ? 'success'
                      : workflow.status === 'FAILED'
                      ? 'error'
                      : workflow.status === 'PENDING'
                      ? 'warning'
                      : 'default'
                  }
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Tooltip title={workflow.message}>
                  <Typography variant="body2" noWrap maxWidth={200}>
                    {workflow.message || '-'}
                  </Typography>
                </Tooltip>
              </TableCell>

              <TableCell>{new Date(workflow.lastUpdated).toLocaleString()}</TableCell>

              <TableCell>
                <Tooltip title={workflow.flowInstanceId}>
                <Button noWrap maxWidth={200}
                  variant="text"
                  onClick={() =>
                    onDeviceClick?.(workflow.deviceId, workflow.flowInstanceId)
                  }
                  sx={{ color: 'primary.main', textTransform: 'none' }}
                >
                  {truncateFlowId(workflow.flowInstanceId)}
                </Button>
                </Tooltip>
              </TableCell>

              <TableCell>{workflow.assignedDtac || '-'}</TableCell>
              <TableCell>{workflow.processName || '-'}</TableCell>
              <TableCell>{workflow.issuer || '-'}</TableCell>
            </TableRow>
          ))
      ) : (
        <TableRow>
          <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
            <Typography color="textSecondary" fontWeight={500}>
              No devices at this step
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try selecting a different step or "All Devices"
            </Typography>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>

          

          {/* <TableContainer className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                {[
                  'Device ID',
                  'Current Step',
                  'Status',
                  'Message',
                  'Last Updated',
                  'Flow Instance',
                  'Assigned DTAC',
                  'Process Name',
                  'Issuer',
                ].map(header => (
                  <TableCell key={header} sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkflows.length > 0 ? (
                filteredWorkflows
                  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                  .map(workflow => (
                    <TableRow
                      key={`${workflow.deviceId}-${workflow.flowInstanceId}`}
                      hover
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Button
                          variant="text"
                          onClick={() => onDeviceClick?.(workflow.deviceId, workflow.flowInstanceId)}
                          sx={{ color: 'primary.main', textTransform: 'none' }}
                        >
                          {workflow.deviceId}
                        </Button>
                      </TableCell>
                      <TableCell>{formatStepName(workflow.step)}</TableCell>
                      <TableCell>
                        <Chip
                          label={workflow.status}
                          color={
                            workflow.status === 'SUCCESS'
                              ? 'success'
                              : workflow.status === 'FAILED'
                              ? 'error'
                              : workflow.status === 'PENDING'
                              ? 'warning'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={workflow.message}>
                          <Typography variant="body2" noWrap maxWidth={200}>
                            {workflow.message || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {new Date(workflow.lastUpdated).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          onClick={() => onDeviceClick?.(workflow.deviceId, workflow.flowInstanceId)}
                          sx={{ color: 'primary.main', textTransform: 'none' }}
                        >
                          {truncateFlowId(workflow.flowInstanceId)}
                        </Button>
                      </TableCell>
                      <TableCell>{workflow.assignedDtac || '-'}</TableCell>
                      <TableCell>{workflow.processName || '-'}</TableCell>
                      <TableCell>{workflow.issuer || '-'}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary" fontWeight={500}>
                      No devices at this step
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Try selecting a different step or "All Devices"
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer> */}

        </div>
      </div>
    </div>
  );
};

export default BatchUpgradeProgress;
