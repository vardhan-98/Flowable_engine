import React, { useState, useEffect } from 'react';
// import API_URLS from "../../utils/ApiUrls";
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { API_URLS } from '../../utils/ApiUrls';
interface WorkflowExecution {
  flowInstanceId: string;
  deviceId: string;
  workflow: string;
  step: string;
  message: string;
  assignedDtac: string | null;
  createdAt: string;
  scheduledTime: string;
  deviceCompatibilityTime: string | null;
  localCustomerEmailContact: string;
  localCustomerMobileContact: string | null;
  issuer: string | null;
  processName: string;
  processFlowId: string;
  completed: boolean;
  completedTime: string | null;
  lastUpdated: string;
  reScheduleCount: number;
}

interface Pageable {
  page: number;
  size: number;
  sort: { property: string; direction: string }[];
}

interface WorkflowExecutionsResponse {
  content: WorkflowExecution[];
  pageable: Pageable & {
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

interface Filters {
  deviceIds: string[];
  workflows: string[];
  completed: boolean | null;
  emailContact: string;
  createdAtFrom: string;
  createdAtTo: string;
  scheduledTimeFrom: string;
  scheduledTimeTo: string;
  processNames: string[];
  processFlowIds: string[];
  sort: { createdAt: 'asc' | 'desc' };
}

const BASE_URL = API_URLS.baseurl;

const Workflows: React.FC = () => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    deviceIds: [],
    workflows: [],
    completed: null,
    emailContact: '',
    createdAtFrom: '',
    createdAtTo: '',
    scheduledTimeFrom: '',
    scheduledTimeTo: '',
    processNames: [],
    processFlowIds: [],
    sort: { createdAt: 'desc' },
  });

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleExecution, setRescheduleExecution] = useState<WorkflowExecution | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [skill, setSkill] = useState<'Upgrade' | 'newInstall'>('Upgrade');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const minDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

  // Reset modal state when closing
  const handleCloseModal = () => {
    setShowRescheduleModal(false);
    setRescheduleExecution(null);
    setAvailableSlots([]);
    setSelectedSlot('');
    setSelectedDate('');
    setSkill('Upgrade');
  };

  // Handle date change to fetch slots
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(''); // Reset selected slot when date changes
  };

  // Handle skill change to fetch slots
  const handleSkillChange = (newSkill: 'Upgrade' | 'newInstall') => {
    setSkill(newSkill);
    setSelectedSlot(''); // Reset selected slot when skill changes
  };

  useEffect(() => {
    fetchWorkflowExecutions();
  }, [page, size, filters]);

  // Effect to fetch available slots when date or skill changes
  useEffect(() => {
    if (selectedDate && skill) {
      fetchAvailableSlots();
    }
  }, [selectedDate, skill]);

  const fetchWorkflowExecutions = async () => {
    setLoading(true);
    try {
      const requestBody = {
        ...filters,
        sort: filters.sort.createdAt === 'asc' ? { createdAt: 'asc' } : { createdAt: 'desc' },
      };

      const response = await fetch(`${BASE_URL}workflow-executions?page=${page}&size=${size}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workflow executions');
      }

      const data: WorkflowExecutionsResponse = await response.json();
      setExecutions(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
      setExecutions([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filters change
  };

  const handleReschedule = (execution: WorkflowExecution) => {
    if (new Date(execution.scheduledTime) <= new Date()) {
      alert('Cannot reschedule past scheduled times');
      return;
    }
    setRescheduleExecution(execution);
    fetchAvailableSlots();
    setShowRescheduleModal(true);
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    setRescheduleLoading(true);
    try {
      // Create the selected date
      const selected = new Date(selectedDate);
      const year = selected.getFullYear();
      const month = selected.getMonth();
      const day = selected.getDate();

      // Set start to previous day 18:30 UTC
      const startDate = new Date(Date.UTC(year, month, day - 1, 18, 30, 0)).toISOString();
      // Set end to selected day 18:29 UTC
      const endDate = new Date(Date.UTC(year, month, day, 18, 29, 59)).toISOString();

      const response = await fetch(`${BASE_URL}employees/available-slots?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&skill=${skill}`);

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const slots: string[] = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!selectedSlot || !rescheduleExecution) return;

    setRescheduleLoading(true);
    try {
      const response = await fetch(`${BASE_URL}devices/reschedule/${rescheduleExecution.flowInstanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newScheduledZoneDateTime: selectedSlot,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Device upgrade rescheduled successfully');
        setShowRescheduleModal(false);
        fetchWorkflowExecutions(); // Refresh the table
      } else {
        alert(result.message || 'Failed to reschedule');
      }
    } catch (error) {
      console.error('Error rescheduling:', error);
      alert('Error during reschedule');
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Workflow Executions</h1>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device IDs</label>
            <input
              type="text"
              value={filters.deviceIds.join(', ')}
              onChange={(e) => handleFilterChange('deviceIds', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="device1, device2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow</label>
            <input
              type="text"
              value={filters.workflows.join(', ')}
              onChange={(e) => handleFilterChange('workflows', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="workflow name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.completed === null ? '' : filters.completed.toString()}
              onChange={(e) => handleFilterChange('completed', e.target.value === '' ? null : e.target.value === 'true' ? true : false)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Completed</option>
              <option value="false">Not Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
            <input
              type="email"
              value={filters.emailContact}
              onChange={(e) => handleFilterChange('emailContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium">Advanced:</span> Use date range filters, process names, and sorting in the detailed view
        </div>
      </div>

      {/* Table */}
      {/* <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flow Instance ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned DTAC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issuer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Re-schedule Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <span>Loading workflow executions...</span>
                    </div>
                  </td>
                </tr>
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No workflow executions found</p>
                  </td>
                </tr>
              ) : (
                executions.map((execution) => (
                  <tr key={execution.flowInstanceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{execution.flowInstanceId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.deviceId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.workflow}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.step}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        execution.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {execution.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={execution.message}>{execution.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.assignedDtac || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(execution.scheduledTime)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.localCustomerEmailContact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.issuer || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.processName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        execution.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {execution.completed ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{execution.reScheduleCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleReschedule(execution)}
                        disabled={(() => {
                          const scheduledDate = new Date(execution.scheduledTime);
                          const currentDate = new Date();
                          const sevenDaysFromNow = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
                          return scheduledDate <= currentDate || scheduledDate <= sevenDaysFromNow;
                        })()}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div> */}

       <TableContainer
              sx={{
                overflowX: "auto",
                "&::-webkit-scrollbar": { height: 10 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#9e9e9e",
                  borderRadius: 8,
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#757575",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: 8,
                },
              }}
            >
              <Table sx={{ minWidth: 1400, whiteSpace: "nowrap" }}>
                <TableHead sx={{ bgcolor: "#F4F4FB" }}>
                  <TableRow>
                    {[
                      "Flow Instance ID",
                      "Device ID",
                      "Workflow",
                      "Step",
                      "Status",
                      "Message",
                      "Assigned DTAC",
                      "Scheduled Time",
                      "Customer Email",
                      "Issuer",
                      "Process Name",
                      "Completed",
                      "Re-schedule Count",
                      "Actions",
                    ].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          color: "text.secondary",
                          py: 1.5,
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
      
                <TableBody>
                  {loading ? (
                    <TableRow   sx={{
                                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }, // light gray for odd rows
                                    '&:nth-of-type(even)': { backgroundColor: '#ffffff' }, // white for even rows
                                    '&:hover': { backgroundColor: '#f1f1ff' }, // light violet hover
                                    transition: 'background-color 0.2s ease',
                                }}>
                      <TableCell colSpan={14} align="center" sx={{ py: 8 }}>
                        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                          <CircularProgress size={30} color="primary" />
                          <Typography>Loading workflow executions...</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : executions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} align="center" sx={{ py: 8 }}>
                        <Typography color="textSecondary">No workflow executions found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    executions.map((execution) => {
                      const scheduledDate = new Date(execution.scheduledTime);
                      const currentDate = new Date();
                      const sevenDaysFromNow = new Date(
                        currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
                      );
                      const disableButton =
                        scheduledDate <= currentDate || scheduledDate <= sevenDaysFromNow;
      
                      return (
                        <TableRow
                          key={execution.flowInstanceId}
                          hover
                          sx={{ "&:hover": { backgroundColor: "#F4F4FB" } }}
                        >
                          <TableCell sx={{ fontFamily: "monospace" }}>
                            {execution.flowInstanceId}
                          </TableCell>
                          <TableCell>{execution.deviceId}</TableCell>
                          <TableCell>{execution.workflow}</TableCell>
                          <TableCell>{execution.step}</TableCell>
                          <TableCell>
                            <Chip
                              label={execution.completed ? "Completed" : "In Progress"}
                              size="small"
                              color={execution.completed ? "success" : "warning"}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title={execution.message}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ maxWidth: 200, cursor: "default" }}
                              >
                                {execution.message || "-"}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{execution.assignedDtac || "-"}</TableCell>
                          <TableCell>{formatDate(execution.scheduledTime)}</TableCell>
                          <TableCell>{execution.localCustomerEmailContact}</TableCell>
                          <TableCell>{execution.issuer || "-"}</TableCell>
                          <TableCell>{execution.processName}</TableCell>
                          <TableCell>
                            <Chip
                              label={execution.completed ? "Yes" : "No"}
                              size="small"
                              color={execution.completed ? "success" : "error"}
                            />
                          </TableCell>
                          <TableCell>{execution.reScheduleCount}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleReschedule(execution)}
                              disabled={disableButton}
                              sx={{
                                bgcolor: "primary.main",
                                textTransform: "none",
                                "&:hover": { bgcolor: "primary.dark" },
                              }}
                            >
                              Reschedule
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

      {/* Pagination Controls at bottom */}
      {/* <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mt-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Page Size:</label>
            <select
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="ml-2 px-2 py-1 border border-gray-300 rounded-md"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <span className="text-sm text-gray-600">
            Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} entries
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1 || totalPages === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div> */}

<Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      mt={3}
      sx={{
        border: "1px solid #E0E0E0",
        borderRadius: 2,
        backgroundColor: "white",
        boxShadow: 1,
      }}
    >
      {/* Left Section: Page Size + Info */}
      <Box display="flex" alignItems="center" gap={3}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Page Size</InputLabel>
          <Select
            label="Page Size"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="textSecondary">
          Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of{" "}
          {totalElements} entries
        </Typography>
      </Box>

      {/* Right Section: Pagination Buttons */}
      <Box display="flex" alignItems="center" gap={2}>
        <Button
          variant="contained"
          color="primary"
          disabled={page === 0}
          onClick={() => setPage(Math.max(0, page - 1))}
        >
          Previous
        </Button>

        <Typography variant="body2">
          Page {page + 1} of {totalPages}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          disabled={page === totalPages - 1 || totalPages === 0}
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
        >
          Next
        </Button>
      </Box>
    </Box>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{backgroundColor: 'oklch(0.21 0.03 264.67 / 0.45)'}}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 border-2 border-gray-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reschedule Device Upgrade</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Device:</strong> {rescheduleExecution?.deviceId}<br />
                <strong>Current Scheduled:</strong> {formatDate(rescheduleExecution?.scheduledTime || '')}
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={minDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Skill Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
              <select
                value={skill}
                onChange={(e) => handleSkillChange(e.target.value as 'Upgrade' | 'newInstall')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Upgrade">Upgrade</option>
                <option value="newInstall">New Install</option>
              </select>
            </div>

            {/* Available Slots */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Slots {selectedDate && skill ? `(for ${new Date(selectedDate).toLocaleDateString()})` : ''}
              </label>
              {selectedDate && skill ? (
                rescheduleLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading available slots...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-500 p-3 border border-gray-200 rounded-md">No available slots found for the selected date and skill</p>
                ) : (
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-40"
                  >
                    <option value="">Select a slot</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {formatDate(slot)}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <p className="text-gray-500 p-3 border border-gray-200 rounded-md">Please select both date and skill to see available slots</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 hover:text-red-700"
                disabled={rescheduleLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleConfirm}
                disabled={!selectedSlot || rescheduleLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {rescheduleLoading ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;
