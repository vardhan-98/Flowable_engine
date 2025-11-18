import { createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {NetworkServiceFile} from '../../../types/ConfigMangerJsonInterface';

interface FileState {
  file: File | null;
  uploadedFiles: NetworkServiceFile[];
}

const initialState: FileState = {
  file: null,
  uploadedFiles: [],
};

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setFile(state, action: PayloadAction<File | null>) {
      state.file = action.payload;
    },
    setUploadedFiles(state, action: PayloadAction<NetworkServiceFile[]>) {
      state.uploadedFiles = action.payload;
    },
  },
});

 export const { setFile, setUploadedFiles } = fileSlice.actions;
 export default fileSlice.reducer;