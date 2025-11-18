import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, TextField, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import type { RootState } from '../../slices';
import type { DeviceFormData } from '../../types/Devices';


interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onClose }) => {
  const loading = useSelector((state: RootState) => state.devices.loading);
  const [formData, setFormData] = useState<DeviceFormData>({
    customerName: '',
    siteName: '',
    deviceHostname: '',
    serialNumber: '',
    model: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Device</DialogTitle>
      <DialogContent>
        <Box component="form" className="mt-4 space-y-6">

          {/* Row 1 */}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight={500} mb={1}>
                Customer Name
              </Typography>
              <TextField
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                fullWidth
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={500} mb={1}>
                Site Name
              </Typography>
              <TextField
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="Enter site name"
                fullWidth
              />
            </Box>
          </Box>

          {/* Row 2 */}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight={500} mb={1}>
                Device Hostname
              </Typography>
              <TextField
                name="deviceHostname"
                value={formData.deviceHostname}
                onChange={handleChange}
                placeholder="Enter device hostname"
                fullWidth
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={500} mb={1}>
                Serial Number
              </Typography>
              <TextField
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="Enter serial number"
                fullWidth
              />
            </Box>
          </Box>

          {/* Row 3 */}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight={500} mb={1}>
                Model
              </Typography>
              <TextField
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Enter model name"
                fullWidth
              />
            </Box>

          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={loading} variant="contained">
          {loading ? 'Adding...' : 'Add Device'}
        </Button>
      </DialogActions>
    </Dialog>


  );
};

export default AddDeviceModal;