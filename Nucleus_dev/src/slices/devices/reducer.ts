// src/redux/slices/devicesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {fetchDevices, uploadDevices } from './thunk';
import type { DevicesState } from '../../types/Devices';

// const initialState: DevicesState = {
//   devices: [],
//   loading: false,
//   error: null,
//   currentPage: 0,
//   itemsPerPage: 10,
//   searchTerm: '',
// };

const initialState: DevicesState = {
  devices: [],
  loading: false,
  error: null,
  uploadMessage: undefined,
  totalUploadedDevices: undefined,
};


const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadMessage = undefined;
        state.totalUploadedDevices = undefined;
      })
      .addCase(uploadDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadMessage = action.payload.message;
        state.totalUploadedDevices = action.payload.totalDevices;
      })
      .addCase(uploadDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Upload failed';
      })
  },
});

// export const { setSearchTerm, setCurrentPage, setItemsPerPage } = devicesSlice.actions;
export default devicesSlice.reducer;