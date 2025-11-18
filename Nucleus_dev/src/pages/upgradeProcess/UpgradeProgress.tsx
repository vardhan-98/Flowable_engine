import React, { useState, useEffect, useMemo, useRef } from 'react';
// import API_URLS from '../../utils/ApiUrls';
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
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  RadioButtonUnchecked,
  Schedule,
  Memory,
  Refresh,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  AspectRatio,
} from '@mui/icons-material';

// BPMN imports
import BpmnViewer from 'bpmn-js/lib/Viewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import { API_URLS } from '../../utils/ApiUrls';

interface UpgradeTaskData {
  id: string;
  flowInstanceId: string;
  deviceId: string;
  stage: string;
  timestamp: number;
  step: string;
  status: string;
  message: string;
  logger: string;
}

interface UpgradeProgressProps {
  flowInstanceId?: string;
  deviceId?: string;
}

interface BpmnData {
  bpmnXml: string;
  executedActivities: string[];
  activeActivities: string[];
  activityDetails: Record<string, any>;
}

const formatDate = (timestamp: number) => {
  try {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return timestamp.toString();
  }
};

const HeaderBox = styled(Box)(({ theme }) => ({
  // background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  // borderBottom: `4px solid ${theme.palette.primary.light}`,
  // padding: theme.spacing(5, 0),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  color : 'black',
  padding : "0px"
}));

const StepperContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  "& .MuiStepper-alternativeLabel .MuiStepConnector-line": {
    marginTop: "10px",
  },
}));

const CustomStepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean; error?: boolean };
}>(({ theme, ownerState }) => ({
  display: 'flex',
  height: 40,
  width: 40,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: '50%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  ...(ownerState.completed && {
    color: theme.palette.success.main,
    backgroundColor: alpha(theme.palette.success.main, 0.1),
  }),
  ...(ownerState.error && {
    color: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.1),
  }),
  ...(ownerState.active && {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  }),
}));

const CustomStepIcon = (props: { active?: boolean; completed?: boolean; error?: boolean; onClick?: () => void }) => {
  const { active, completed, error, onClick } = props;

  if (completed) {
    return (
      <CustomStepIconRoot ownerState={{ completed }} onClick={onClick}>
        <CheckCircle sx={{ fontSize: 28 }} />
      </CustomStepIconRoot>
    );
  }

  if (error) {
    return (
      <CustomStepIconRoot ownerState={{ error }} onClick={onClick}>
        <ErrorIcon sx={{ fontSize: 28 }} />
      </CustomStepIconRoot>
    );
  }

  if (active) {
    return (
      <CustomStepIconRoot ownerState={{ active }} onClick={onClick}>
        <CircularProgress size={24} thickness={4} />
      </CustomStepIconRoot>
    );
  }

  return (
    <CustomStepIconRoot ownerState={{}} onClick={onClick}>
      <RadioButtonUnchecked sx={{ fontSize: 28, color: 'action.disabled' }} />
    </CustomStepIconRoot>
  );
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  '&.MuiTableCell-head': {
    backgroundColor: '#5fbbe4',
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#ffffff'
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
  },
  '&:last-child td': {
    borderBottom: 0,
  },
}));

const UpgradeProgress: React.FC<UpgradeProgressProps> = ({ flowInstanceId, deviceId }) => {
  const theme = useTheme();
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [fetchedLogs, setFetchedLogs] = useState<UpgradeTaskData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [prevInProgress, setPrevInProgress] = useState<number>(-1);
  const [userManuallySelected, setUserManuallySelected] = useState(false);
  const [view, setView] = useState<'stepper' | 'all-logs' | 'console'>('stepper');
  const isInitialMount = useRef(true);

  // BPMN state
  const [bpmnData, setBpmnData] = useState<BpmnData | null>(null);
  const bpmnContainerRef = useRef<HTMLDivElement | null>(null);
  const bpmnViewerRef = useRef<any>(null);

  const steps = [
    'check-device-compatibility',
    'pre-upgrade-backup',
    'reboot-device',
    'mgmt-port',
    'post-reboot-check',
    'device-activation',
    'vnf-spinup-and-config',
  ];

  const stepLabels = [
    'Device Compatibility',
    'Pre-upgrade Backup',
    'Reboot Device',
    'Management Port',
    'Post-reboot Check',
    'Device Activation',
    'VNF Spinup & Config',
  ];

  useEffect(() => {
    if (flowInstanceId) {
      const fetchLogs = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await fetch(`${API_URLS.baseurl}logs?flowId=${flowInstanceId}`);
          if (!response.ok) throw new Error('Failed to fetch logs');
          const data: UpgradeTaskData[] = await response.json();
          const allowedSteps = [...steps, 'flow-complete'];
          const filteredLogs = data.filter(log => allowedSteps.includes(log.step));
          setFetchedLogs(filteredLogs);
        } catch (err) {
          console.error('Error fetching logs:', err);
          setError('Failed to load upgrade logs. Please try again.');
          setFetchedLogs([]);
        } finally {
          setLoading(false);
        }
      };

      fetchLogs();
      const intervalId = setInterval(fetchLogs, 15000);
      return () => clearInterval(intervalId);
    }
  }, [flowInstanceId]);

  // Fetch BPMN data with polling
  useEffect(() => {
    if (flowInstanceId) {
      const fetchBpmnData = async () => {
        try {
          const response = await fetch(`${API_URLS.baseurl}process-instance/${flowInstanceId}/diagram`);
          if (!response.ok) throw new Error('Failed to fetch BPMN diagram');
          const data: BpmnData = await response.json();
          setBpmnData(data);
        } catch (err) {
          console.error('Error fetching BPMN data:', err);
          setBpmnData(null);
        }
      };

      fetchBpmnData();
      const intervalId = setInterval(fetchBpmnData, 15000);
      return () => clearInterval(intervalId);
    }
  }, [flowInstanceId]);

  // Create and render BPMN Viewer
  useEffect(() => {
    if (bpmnData && bpmnContainerRef.current) {
      console.log('Creating BPMN viewer with data:', bpmnData);

      // Inject custom CSS for BPMN element coloring
      const styleId = 'bpmn-custom-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Executed activities - Green */
          .highlight-executed .djs-visual > :nth-child(1) {
            fill: rgba(76, 175, 80, 0.3) !important;
            stroke: #4caf50 !important;
            stroke-width: 3px !important;
          }
          
          .highlight-executed .djs-visual > circle,
          .highlight-executed .djs-visual > rect,
          .highlight-executed .djs-visual > path,
          .highlight-executed .djs-visual > polygon {
            fill: rgba(76, 175, 80, 0.3) !important;
            stroke: #4caf50 !important;
            stroke-width: 3px !important;
          }

          /* Active activities - Blue with pulse */
          .highlight-active .djs-visual > :nth-child(1) {
            fill: rgba(25, 118, 210, 0.3) !important;
            stroke: #1976d2 !important;
            stroke-width: 3px !important;
            animation: bpmn-pulse 2s infinite;
          }
          
          .highlight-active .djs-visual > circle,
          .highlight-active .djs-visual > rect,
          .highlight-active .djs-visual > path,
          .highlight-active .djs-visual > polygon {
            fill: rgba(25, 118, 210, 0.3) !important;
            stroke: #1976d2 !important;
            stroke-width: 3px !important;
            animation: bpmn-pulse 2s infinite;
          }

          @keyframes bpmn-pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }

          /* Executed flows - Green */
          .highlight-executed-flow .djs-visual > path {
            stroke: #4caf50 !important;
            stroke-width: 2px !important;
          }

          .highlight-executed-flow .djs-visual > polyline {
            stroke: #4caf50 !important;
            stroke-width: 2px !important;
          }

          /* Active flows - Blue */
          .highlight-active-flow .djs-visual > path {
            stroke: #1976d2 !important;
            stroke-width: 2px !important;
            animation: bpmn-pulse 2s infinite;
          }

          .highlight-active-flow .djs-visual > polyline {
            stroke: #1976d2 !important;
            stroke-width: 2px !important;
            animation: bpmn-pulse 2s infinite;
          }
        `;
        document.head.appendChild(style);
      }

      const viewer = new BpmnViewer({
        container: bpmnContainerRef.current,
        keyboard: {
          bindTo: window,
        },
      });
      bpmnViewerRef.current = viewer;

      viewer.importXML(bpmnData.bpmnXml).then(({ warnings }) => {
        console.log('BPMN XML imported successfully', warnings);

        const canvas = viewer.get('canvas') as any;
        const elementRegistry = viewer.get('elementRegistry') as any;

        // Zoom to fit
        canvas.zoom('fit-viewport');

        // Remove all existing markers first
        elementRegistry.forEach((element: any) => {
          canvas.removeMarker(element.id, 'highlight-executed');
          canvas.removeMarker(element.id, 'highlight-active');
          canvas.removeMarker(element.id, 'highlight-executed-flow');
          canvas.removeMarker(element.id, 'highlight-active-flow');
        });

        // Apply markers to executed activities
        bpmnData.executedActivities.forEach(activityId => {
          const element = elementRegistry.get(activityId);
          if (element) {
            console.log('Highlighting executed element:', activityId, element.type);
            
            // Check if it's a flow (sequence flow)
            if (element.type === 'bpmn:SequenceFlow') {
              canvas.addMarker(activityId, 'highlight-executed-flow');
            } else {
              // For tasks, events, gateways, etc.
              canvas.addMarker(activityId, 'highlight-executed');
            }
          } else {
            console.log('Element not found for executed activity:', activityId);
          }
        });

        // Apply markers to active activities
        bpmnData.activeActivities.forEach(activityId => {
          const element = elementRegistry.get(activityId);
          if (element) {
            console.log('Highlighting active element:', activityId, element.type);
            
            // Check if it's a flow (sequence flow)
            if (element.type === 'bpmn:SequenceFlow') {
              canvas.addMarker(activityId, 'highlight-active-flow');
            } else {
              // For tasks, events, gateways, etc.
              canvas.addMarker(activityId, 'highlight-active');
            }
          } else {
            console.log('Element not found for active activity:', activityId);
          }
        });

      }).catch(err => {
        console.error('Error importing BPMN:', err);
      });

      return () => {
        if (bpmnViewerRef.current) {
          bpmnViewerRef.current.destroy();
          bpmnViewerRef.current = null;
        }
      };
    }
  }, [bpmnData]);

  // Zoom control functions
  const zoomIn = () => {
    if (bpmnViewerRef.current) {
      const canvas = bpmnViewerRef.current.get('canvas');
      canvas.zoom(canvas.zoom() + 0.1);
    }
  };

  const zoomOut = () => {
    if (bpmnViewerRef.current) {
      const canvas = bpmnViewerRef.current.get('canvas');
      canvas.zoom(canvas.zoom() - 0.1);
    }
  };

  const zoomToFit = () => {
    if (bpmnViewerRef.current) {
      const canvas = bpmnViewerRef.current.get('canvas');
      canvas.zoom('fit-viewport');
    }
  };

  const resetZoom = () => {
    if (bpmnViewerRef.current) {
      const canvas = bpmnViewerRef.current.get('canvas');
      canvas.zoom(1);
    }
  };

  const logsArray = fetchedLogs;

  const { logsByStep, stepStatuses } = useMemo(() => {
    const logsByStep = logsArray.reduce((acc, log) => {
      acc[log.step] = acc[log.step] || [];
      acc[log.step].push(log);
      return acc;
    }, {} as Record<string, UpgradeTaskData[]>);

    const hasCompleted = logsArray.some(log => log.step === 'flow-complete' && log.status === 'SUCCESS');

    let stepStatuses = steps.map(() => 'pending');

    for (let i = 0; i < steps.length; i++) {
      const stepLogs = logsByStep[steps[i]] || [];
      if (stepLogs.length > 0) {
        const latestLog = stepLogs.sort((a, b) => b.timestamp - a.timestamp)[0];
        stepStatuses[i] = latestLog.status === 'FAILED' ? 'failed' : 'completed';
      }
    }

    if (hasCompleted) {
      stepStatuses.fill('completed');
    } else {
      const failedIndex = stepStatuses.findIndex(s => s === 'failed');
      if (failedIndex !== -1) {
        for (let j = 0; j < failedIndex; j++) {
          stepStatuses[j] = 'completed';
        }
        for (let j = failedIndex + 1; j < steps.length; j++) {
          stepStatuses[j] = 'pending';
        }
      } else {
        let lastProcessed = -1;
        for (let i = steps.length - 1; i >= 0; i--) {
          if (stepStatuses[i] !== 'pending') {
            lastProcessed = i;
            break;
          }
        }
        if (lastProcessed !== -1) {
          for (let j = 0; j < lastProcessed; j++) {
            if (stepStatuses[j] === 'pending') {
              stepStatuses[j] = 'completed';
            }
          }
          stepStatuses[lastProcessed] = 'in-progress';
          for (let j = lastProcessed + 1; j < steps.length; j++) {
            stepStatuses[j] = 'pending';
          }
        } else {
          stepStatuses[0] = 'in-progress';
        }
      }
    }

    return { logsByStep, stepStatuses };
  }, [logsArray, steps]);

  useEffect(() => {
    const inProgressIndex = stepStatuses.findIndex(status => status === 'in-progress');
    if (isInitialMount.current) {
      if (inProgressIndex !== -1) {
        setSelectedStep(inProgressIndex);
        setPrevInProgress(inProgressIndex);
      } else {
        setSelectedStep(steps.length - 1);
        setPrevInProgress(steps.length - 1);
      }
      isInitialMount.current = false;
      return;
    }

    if (!userManuallySelected && inProgressIndex !== -1 && inProgressIndex > prevInProgress) {
      setSelectedStep(inProgressIndex);
      setPrevInProgress(inProgressIndex);
    } else if (inProgressIndex !== -1 && inProgressIndex > prevInProgress) {
      setPrevInProgress(inProgressIndex);
      setUserManuallySelected(false);
      setSelectedStep(inProgressIndex);
    }
  }, [stepStatuses, steps.length, prevInProgress, userManuallySelected]);

  const getStatusChip = (status: string) => {
    const chipProps = {
      SUCCESS: { label: 'Success', color: 'success' as const, icon: <CheckCircle /> },
      FAILED: { label: 'Failed', color: 'error' as const, icon: <ErrorIcon /> },
      PENDING: { label: 'Pending', color: 'warning' as const, icon: <Schedule /> },
      DEFAULT: { label: status, color: 'default' as const, icon: <Memory /> },
    };
    const props = chipProps[status as keyof typeof chipProps] || chipProps.DEFAULT;
    return <Chip {...props} size="small" sx={{ fontWeight: 500 }} />;
  };

  const sortedLogs = useMemo(
    () => (logsByStep[steps[selectedStep]] || []).sort((a, b) => b.timestamp - a.timestamp),
    [logsByStep, selectedStep, steps]
  );

  const allSortedLogs = useMemo(
    () => logsArray.sort((a, b) => b.timestamp - a.timestamp),
    [logsArray]
  );

  const consoleLogText = useMemo(
    () =>
      allSortedLogs
        .map(
          log =>
            `${formatDate(log.timestamp)} [${log.status}] ${log.step} (${log.stage}): ${log.message}`
        )
        .join('\n'),
    [allSortedLogs]
  );

  const activeStep = stepStatuses.findIndex(status => status === 'in-progress');
  const maxSelectableIndex = activeStep >= 0 ? activeStep : steps.length - 1;
  const completedSteps = stepStatuses.filter(s => s === 'completed').length;
  const failedSteps = stepStatuses.filter(s => s === 'failed').length;

  return (
    <Box sx={{ minHeight: { xs: 'auto', md: '100vh' }, bgcolor: 'grey.50' }}>
      {/* <HeaderBox sx={{ background: 'linear-gradient(180deg, rgb(37, 152, 203) 0%, rgb(0, 153, 220) 100%)' }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center">
            <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                NFX Device Upgrade
              </Typography>
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(e, newView) => {
                  if (newView) setView(newView);
                }}
                sx={{
                  bgcolor: '#5fbbe4',
                  borderRadius: 10,
                  height: 32,
                }}
              >
                <ToggleButton
                  value="stepper"
                  sx={{
                    color: 'black',
                    bgcolor: 'white',
                    borderRadius: 10,
                    fontWeight: 500,
                    '&.Mui-selected': {
                      color: 'white',
                      bgcolor: '#5fbbe4',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: '#0099DC',
                    },
                  }}
                >
                  Stepper
                </ToggleButton>
                <ToggleButton
                  value="console"
                  sx={{
                    color: 'black',
                    bgcolor: 'white',
                    borderRadius: 10,
                    fontWeight: 500,
                    '&.Mui-selected': {
                      color: 'white',
                      bgcolor: '#5fbbe4',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: '#0099DC',
                    },
                  }}
                >
                  Console Logs
                </ToggleButton>
                <ToggleButton
                  value="all-logs"
                  sx={{
                    color: 'black',
                    bgcolor: 'white',
                    borderRadius: 10,
                    fontWeight: 500,
                    '&.Mui-selected': {
                      color: 'white',
                      bgcolor: '#5fbbe4',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: '#0099DC',
                    },
                  }}
                >
                  All Logs
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  borderRadius: 10,
                }}
              >
                Device ID: {deviceId || 'N/A'}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  borderRadius: 10,
                }}
              >
                Flow Instance ID: {flowInstanceId || 'AUEISABNEAU0102UJZZXX'}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  borderRadius: 10,
                }}
              >
                Completed Steps: {completedSteps}/{steps.length}
              </Typography>
              {failedSteps > 0 && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    backdropFilter: 'blur(10px)',
                    px: 2,
                    borderRadius: 10,
                  }}
                >
                  Failed Steps: {failedSteps}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Container>
      </HeaderBox> */}
      
      <div className="flex justify-between items-center mb-2 p-1 px-3 bg-white border border-gray-200" >
  <h5 className="text-[18px] font-semibold text-[#333333]" > Device Upgrade Page </h5>
{/* <nav className="text-sm text-gray-600">
          {breadcrumbLabels.map((label, idx) => (
            <span key={label}>
              {label}
              {idx !== breadcrumbLabels.length - 1 && (
                <span className="mx-0.5">/</span>
              )}
            </span>
          ))}
        </nav> */}
</div>

{/* <HeaderBox
  sx={{
    backgroundColor: '#f5f7fa', // light background similar to your screenshot
    py: 1,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
  }}
> */}
{/* <Container> */ }
<Stack
      direction="row"
alignItems = "center"
justifyContent = "space-between"
sx = {{ width: '100%', px: 2, py: 1 }}
    >
  {/* Left Side */ }
  < Typography
variant = "subtitle1"
sx = {{
  color: 'black',
    fontWeight: 400,
      fontSize: '0.95rem',
        }}
      >
  Host Name: { deviceId || flowInstanceId || 'device-034' }
</Typography>

{/* Center */ }
<Typography
        variant="subtitle1"
sx = {{
  color: 'black',
    fontWeight: 400,
      fontSize: '0.95rem',
        }}
      >
  Flow Instance ID : {flowInstanceId || 'flow-instance-034'}
    </Typography>

{/* Right Side */ }
<Typography
        variant="subtitle1"
sx = {{
  color: 'black',
    fontWeight: 400,
      fontSize: '0.95rem',
        }}
      >
  Current Version: 3.1
    </Typography>
    < Typography
variant = "subtitle1"
sx = {{
  color: 'black',
    fontWeight: 400,
      fontSize: '0.95rem',
        }}
      >
  Target Version: 3.2
    </Typography>
    </Stack>

      <Container sx={ { py: 1, px: '0 !important' } }>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Stack
          direction="row"
        alignItems = "center"
        justifyContent = "center"
        sx = {{
          width: '100%',
            position: 'relative',
          }}
        >
          <ToggleButtonGroup
            value={ view }
        exclusive
        onChange = {(e, newView) => {
          if (newView) setView(newView);
        }}
        sx = {{
          display: 'flex',
            width: '100%', // 🔹 full width
              // borderRadius: 10,
              overflow: 'hidden',
                height: 40,
                  bgcolor: 'transparent',
                    border: '1px solid #d0d0d0',
            }}
          >
          <ToggleButton
              value="stepper"
        sx = {{
          flex: 1, // 🔹 each button takes equal width
            color: 'black',
              fontWeight: 500,
                borderRadius: 0,
                  '&.Mui-selected': {
            color: 'white',
              bgcolor: '#5fbbe4',
                },
          '&.Mui-selected:hover': {
            bgcolor: '#0099DC',
                },
        }}
            >
          STEPPER
          </ToggleButton>
        
          < ToggleButton
        value = "console"
        sx = {{
          flex: 1,
            color: 'black',
              fontWeight: 500,
                borderRadius: 0,
                  '&.Mui-selected': {
            color: 'white',
              bgcolor: '#5fbbe4',
                },
          '&.Mui-selected:hover': {
            bgcolor: '#0099DC',
                },
        }}
            >
          CONSOLE LOGS
            </ToggleButton>
        
            < ToggleButton
        value = "all-logs"
        sx = {{
          flex: 1,
            color: 'black',
              fontWeight: 500,
                borderRadius: 0,
                  '&.Mui-selected': {
            color: 'white',
              bgcolor: '#5fbbe4',
                },
          '&.Mui-selected:hover': {
            bgcolor: '#0099DC',
                },
        }}
            >
          ALL LOGS
            </ToggleButton>
            </ToggleButtonGroup>
            </Stack>

        {view === 'stepper' && (
          <>
            <StepperContainer elevation={3}>
              <Stepper activeStep={activeStep !== -1 ? activeStep : steps.length} alternativeLabel>
                {steps.map((step, index) => {
                  const isError = stepStatuses[index] === 'failed';
                  const isCompleted = stepStatuses[index] === 'completed';
                  return (
                    <Step key={step} completed={isCompleted}>
                      <StepLabel
                        error={isError}
                        StepIconComponent={(props) => (
                          <CustomStepIcon
                            {...props}
                            error={isError}
                            onClick={() => {
                              if (index <= maxSelectableIndex) {
                                setSelectedStep(index);
                                setUserManuallySelected(true);
                              }
                            }}
                          />
                        )}
                        sx={{ cursor: index <= maxSelectableIndex ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (index <= maxSelectableIndex) {
                            setSelectedStep(index);
                            setUserManuallySelected(true);
                          }
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            fontWeight: selectedStep === index ? 600 : 400,
                            color: selectedStep === index ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          {stepLabels[index]}
                        </Typography>
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </StepperContainer>

            <Card elevation={3} sx={{ mt: 4, borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {stepLabels[selectedStep]}
                      </Typography>
                      {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Step {selectedStep + 1} of {steps.length}
                      </Typography> */}
                    </Box>

                    <Stack direction="row"
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                      }}
                    >
                      <Chip
                        label={`Started: ${sortedLogs.filter((log) => log.status === 'STARTED').length}`}
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          color: '#1976d2',
                          borderColor: '#1976d2',
                        }} />
                      <Chip
                        label={`Success: ${sortedLogs.filter((log) => log.status === 'SUCCESS').length}`}
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={`Error: ${sortedLogs.filter((log) => log.status === 'FAILED').length}`}
                        color="error"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={`Pending: ${sortedLogs.filter((log) => log.status === 'PENDING').length}`}
                        color="warning"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Stack>
                    {loading && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Refresh
                          sx={{
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Refreshing...
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width="20%">Timestamp</StyledTableCell>
                        <StyledTableCell width="50%">Message</StyledTableCell>
                        <StyledTableCell width="15%">Status</StyledTableCell>
                        <StyledTableCell width="15%">Stage</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedLogs.length > 0 ? (
                        sortedLogs.map((log) => (
                          <StyledTableRow key={log.id}>
                            <StyledTableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.813rem' }}>
                              {formatDate(log.timestamp)}
                            </StyledTableCell>
                            <StyledTableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {log.message}
                            </StyledTableCell>
                            <StyledTableCell>{getStatusChip(log.status)}</StyledTableCell>
                            <StyledTableCell>
                              <Chip label={log.stage} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                            </StyledTableCell>
                          </StyledTableRow>
                        ))
                      ) : (
                        <TableRow>
                          <StyledTableCell colSpan={4} align="center" sx={{ py: 8 }}>
                            <Memory sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                              No logs available for this step
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Logs will appear here once the step begins execution
                            </Typography>
                          </StyledTableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
              {/* <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  p: 2,
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Chip
                  label={`Started: ${sortedLogs.filter((log) => log.status === 'STARTED').length}`}
                  variant="outlined"
                  sx={{ fontWeight: 500, color: '#1976d2', borderColor: '#1976d2' }}
                />
                <Chip
                  label={`Success: ${sortedLogs.filter((log) => log.status === 'SUCCESS').length}`}
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                <Chip
                  label={`Error: ${sortedLogs.filter((log) => log.status === 'FAILED').length}`}
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                <Chip
                  label={`Pending: ${sortedLogs.filter((log) => log.status === 'PENDING').length}`}
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Box> */}
            </Card>
          </>
        )}

        {view === 'all-logs' && (
          <Card elevation={3} sx={{ mt: 4, borderRadius: 2, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      BPMN Flow Diagram
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton onClick={zoomIn} size="small" color="primary">
                      <ZoomIn />
                    </IconButton>
                    <IconButton onClick={zoomOut} size="small" color="primary">
                      <ZoomOut />
                    </IconButton>
                    <IconButton onClick={zoomToFit} size="small" color="primary">
                      <CenterFocusStrong />
                    </IconButton>
                    <IconButton onClick={resetZoom} size="small" color="primary">
                      <AspectRatio />
                    </IconButton>
                    {loading && (
                      <Refresh
                        sx={{
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
                        }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Box>
              <Box
                ref={bpmnContainerRef}
                sx={{
                  width: '100%',
                  height: 300,
                  bgcolor: 'white',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  position: 'relative',
                  overflow: 'auto',
                  padding: 2,
                }}
              >
                {!bpmnData && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      bgcolor: 'grey.100',
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Loading BPMN diagram...
                    </Typography>
                  </Box>
                )}
                {bpmnData && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1.5,
                      boxShadow: 2,
                      maxWidth: 220,
                      zIndex: 1000,
                    }}
                  >
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 1 }}>
                      Legend
                    </Typography>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: 'rgba(76, 175, 80, 0.5)', border: '2px solid #4caf50', borderRadius: 0.5 }} />
                        <Typography variant="caption">
                          Executed ({bpmnData.executedActivities.length})
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: 'rgba(25, 118, 210, 0.5)', border: '2px solid #1976d2', borderRadius: 0.5 }} />
                        <Typography variant="caption">
                          Active ({bpmnData.activeActivities.length})
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', fontSize: '0.7rem' }}>
                      Scroll to view full diagram
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  justifyContent : 'space-between'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  All Logs
                </Typography>
              {/* </Box> */}
               {/* <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                p: 2,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
              }}
            > */}
            <Stack direction = "row" sx={{gap: 1}}>
              <Chip
                label={`Started: ${allSortedLogs.filter((log) => log.status === 'STARTED').length}`}
                variant="outlined"
                sx={{ fontWeight: 500, color: '#1976d2', borderColor: '#1976d2' }}
              />
              <Chip
                label={`Success: ${allSortedLogs.filter((log) => log.status === 'SUCCESS').length}`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
              <Chip
                label={`Error: ${allSortedLogs.filter((log) => log.status === 'FAILED').length}`}
                color="error"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
              <Chip
                label={`Pending: ${allSortedLogs.filter((log) => log.status === 'PENDING').length}`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
              </Stack>
            </Box>
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell width="15%">Timestamp</StyledTableCell>
                      <StyledTableCell width="40%">Message</StyledTableCell>
                      <StyledTableCell width="15%">Status</StyledTableCell>
                      <StyledTableCell width="15%">Stage</StyledTableCell>
                      <StyledTableCell width="15%">Step</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allSortedLogs.length > 0 ? (
                      allSortedLogs.map((log) => (
                        <StyledTableRow key={log.id}>
                          <StyledTableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.813rem' }}>
                            {formatDate(log.timestamp)}
                          </StyledTableCell>
                          <StyledTableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {log.message}
                          </StyledTableCell>
                          <StyledTableCell>{getStatusChip(log.status)}</StyledTableCell>
                          <StyledTableCell>
                            <Chip label={log.stage} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip label={log.step} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                          </StyledTableCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <TableRow>
                        <StyledTableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <Memory sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                          <Typography variant="body1" color="text.secondary" fontWeight={500}>
                            No logs available
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Logs will appear here once execution begins
                          </Typography>
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
           
          </Card>
        )}

        {view === 'console' && (
          <Card elevation={3} sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                Console Logs
              </Typography>
              <TextField
                multiline
                fullWidth
                value={consoleLogText}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{
                  bgcolor: 'grey.100',
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  },
                  '& .MuiInputBase-input': {
                    minHeight: 400,
                    maxHeight: 500,
                    overflow: 'auto',
                  },
                }}
              />
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default UpgradeProgress;
