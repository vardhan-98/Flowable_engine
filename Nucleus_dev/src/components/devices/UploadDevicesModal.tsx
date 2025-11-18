import React, { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { IconButton } from '@mui/material';


import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import type { AppDispatch } from '../../slices';
// import type { ProgressStatus } from '../../types/Devices';
import { fetchDevices, fetchProgress, uploadDevices } from '../../slices/devices/thunk';
import type { ProgressStatus } from '../../types/Devices';


interface Props {
  open: boolean;
  onClose: () => void;
}

const DeviceUploadDialog: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ message: string; totalDevices: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (!showProgress && isPolling) {
      const pollProgressAndDevices = async () => {
        try {
          const resultAction = await dispatch(fetchProgress());
          const data = resultAction.payload as ProgressStatus;
          const { processed, total } = data;
          console.log(`Polling discovery progress: ${processed}/${total}`);
          //Fetch current device list (even partial progress)
          await dispatch(fetchDevices());
          //Stop polling once discovery completes
          if (processed >= total) {
            if (interval) clearInterval(interval);
            setIsPolling(false);
            console.log('Discovery completed — polling stopped');
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      };
      pollProgressAndDevices();
      interval = setInterval(pollProgressAndDevices, 10000);
    }
    // Cleanup when dialog reopens or component unmounts
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showProgress, isPolling, dispatch]);


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const file = droppedFiles[0];
      if (file.type === 'application/json' || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
        setFile(file);
        if (inputRef.current) inputRef.current.value = '';
      } else {
        alert('Only JSON or CSV files are supported.');
      }
    }
  };

  const handleCancel = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClose();
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadResult(null);
      setError(null);
      setProgress(0);
    }
  };

  const handleUploadClick = () => {
    // Manually trigger click on the hidden input
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleStartUpload = () => {
    if (file) setShowConfirmation(true);
  };

  const handleConfirmUpload = async () => {      
    if (!file) return;
    onClose();
    setShowConfirmation(false);
    setShowProgress(true);
    setLoading(true);
    setProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      const result = await dispatch(
        uploadDevices({
          file,
          onProgress: (percent) => setProgress(percent),
        })
      ).unwrap();

      setUploadResult(result);
    } catch (err: any) {
      setError(err || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressDialogClose = () => {
    // Only allow closing when upload is finished
    if (!loading) {
      // Reset upload-related states
      setFile(null);
      setProgress(0);
      setShowProgress(false);
      setUploadResult(null);
      setError(null);
      if (uploadResult && uploadResult.totalDevices > 0 && !error) {
        setIsPolling(true);
      } else {
        setIsPolling(false);
      }
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={(event, reason) => {
        if (reason !== 'backdropClick') onClose();
      }} maxWidth="sm" fullWidth>
        <DialogTitle className='bg-[#F3F6F9]' sx={{
          padding: '8px 12px', display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>Upload</span>
          <IconButton
            onClick={handleCancel}
            size="small"
            sx={{ color: '#666666' }}  // gray color
            aria-label="close"
          >
            <IoMdClose />
          </IconButton>

        </DialogTitle>
        <DialogContent className='!p-[40px]'>
          <Box
            className={`p-6 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors ${dragActive ? 'border-[#0077b6] bg-[#e0f7ff]' : 'border-[#0099DC]'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <IoCloudUploadOutline className='w-[61px] h-[37px] text-[#0099DC]' />
              <h1 className="text-center p-2 font-semibold">Import Devices</h1>
              <p className="text-center pb-2 text-[#666666] text-[14px] semibold">Drag and drop your file here, or click to browseSupports JSON files </p>
            </div>

            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              ref={inputRef}
              className="hidden"
              id="upload-input"
            />
            <Button
              variant="contained"
              className="p-2 !cursor-pointer !bg-[#0099DC] !text-white"
              onClick={handleUploadClick}
              disabled={loading}
            >
              Upload Json
            </Button>

            {file && (
              <p className="mt-2 text-[14px] semibold p-2 text-[#666666]">Selected: {file.name}</p>
            )}
          </Box>
        </DialogContent>
        <DialogActions className='bg-[#F3F6F9]'>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            variant="contained"
            className="p-2 !cursor-pointer !bg-[#0099DC] !text-white"
            onClick={handleStartUpload}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}

      <Dialog open={showConfirmation} maxWidth="xs" fullWidth onClose={(event, reason) => {
        if (reason !== 'backdropClick') setShowConfirmation(false);
      }}>
        {/* Confirmation Dialog */}
        <DialogTitle sx={{
          padding: '8px 12px', backgroundColor: '#F3F6F9', display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Confirmation</span>
          <IconButton
            onClick={() => setShowConfirmation(false)}
            size="small"
            sx={{ color: '#666666' }}
            aria-label="close"
          >
            <IoMdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '20px 20px' }}>
          <Typography sx={{ padding: '20px 20px', text: '#666666' }}>
            Device discovery has been started for the imported devices. Please click here for the discovery status.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#F3F6F9!important' }}>
          <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
          <Button onClick={handleConfirmUpload} variant="contained" className='!bg-[#0099DC] !text-white'>
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Progress Dialog */}
      <Dialog
        open={showProgress}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleProgressDialogClose();
        }}
        PaperProps={{
          sx: {
            width: 448,
            height: 211,
            borderRadius: '10px',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#F3F6F9',
            color: '#1A1A1A',
            fontSize: '16px',
            fontWeight: 500,
            borderBottom: '1px solid #E0E0E0',
            p: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Device discovery in progress</span>
          <IconButton
            onClick={handleProgressDialogClose}
            size="small"
            sx={{ color: '#666666' }}
            aria-label="close"
          >
            <IoMdClose />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          {!uploadResult && !error && (
            <>
              <Box position="relative" display="inline-flex">
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={80}
                  thickness={5}
                  sx={{
                    color: '#00AEEF',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1A1A1A' }}>
                    {`${progress}%`}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {uploadResult && (
            <Typography sx={{ mt: 2, fontSize: '14px', color: 'green', fontWeight: 500 }}>
              {uploadResult.message} <br />
              Total Devices: {uploadResult.totalDevices}
            </Typography>
          )}

          {error && (
            <Typography sx={{ mt: 2, color: 'red', fontWeight: 500 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
      </Dialog>

    </>
  );
};

export default DeviceUploadDialog;
