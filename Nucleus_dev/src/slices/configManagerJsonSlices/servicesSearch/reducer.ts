// File: src/redux/slices/serviceSlice.ts
import { createSlice, type PayloadAction} from '@reduxjs/toolkit';

interface ServiceState {
  serviceName: string;
  site: string;
}

const initialState: ServiceState = {
  serviceName: '',
  site: '',
};

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setServiceName: (state, action: PayloadAction<string>) => {
      state.serviceName = action.payload;
    },
    setSite: (state, action: PayloadAction<string>) => {
      state.site = action.payload;
    },
  },
});

export const { setServiceName, setSite } = serviceSlice.actions;

export default serviceSlice.reducer;