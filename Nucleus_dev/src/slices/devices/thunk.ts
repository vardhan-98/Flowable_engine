// src/redux/thunks/deviceThunks.ts (Updated with axios)
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type {UploadDevicesResponse } from '../../types/Devices';
import API_URLS from '../../utils/ApiUrls';

//Define the expected payload type
interface UploadDevicesArgs {
  file: File;
  onProgress?: (percent: number) => void;
}

// Fetch all devices
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://192.168.5.52:9090/api/devices/all");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch devices');
    }
  }
);

export const fetchProgress = createAsyncThunk(
  'devices/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://192.168.5.52:9090/api/devices/status");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch progress');
    }
  }
);

// Upload multiple devices via file

export const uploadDevices = createAsyncThunk<
  UploadDevicesResponse,
  UploadDevicesArgs,
  { rejectValue: string }
>(
  'devices/uploadDevices',
  async ({ file, onProgress }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<UploadDevicesResponse>(
         "http://192.168.5.52:9090/api/devices/upload",
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            if (event.total && onProgress) {
              const percent = Math.round((event.loaded * 100) / event.total);
              onProgress(percent);
            }
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Upload failed';
      return rejectWithValue(message);
    }
  }
);

// export const uploadDevices = createAsyncThunk<
//   UploadDevicesResponse,
//   // UploadDevicesArgs,
//   { rejectValue: string }
// >(
//   'devices/uploadDevices',
//   async (file, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       const response = await axios.post<UploadDevicesResponse>(
//         API_URLS.UPLOAD_DEVICES,
//         formData,
//         {
//           headers: { 'Content-Type': 'multipart/form-data' },
//           // onUploadProgress: (event) => {
//           //   if (event.total && onProgress) {
//           //     const percent = Math.round((event.loaded * 100) / event.total);
//           //     onProgress(percent);
//           //   }
//           // },
//         }
//       );

//       return response.data;
//     } catch (error: any) {
//       const message = error.response?.data?.message || error.message || 'Upload failed';
//       return rejectWithValue(message);
//     }
//   }
// );



// export const addDevice = createAsyncThunk(
//   'devices/addDevice',
//   async (formData: DeviceFormData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/api/devices', formData);
//       return response.data;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || 'Failed to add device');
//     }
//   }
// );

// // Delete a device by ID
// export const deleteDevice = createAsyncThunk(
//   'devices/deleteDevice',
//   async (id: string, { rejectWithValue }) => {
//     try {
//       await axios.delete(`/api/devices/${id}`);
//       return id; // return the deleted device id if you want to remove it from state
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || 'Delete failed');
//     }
//   }
// );
