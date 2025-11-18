// File: src/redux/slices/attributeSlice.ts
import { createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {ServiceCharacteristicReadable } from '../../../types/ConfigMangerJsonInterface';


interface AttributeState {
  attributes: ServiceCharacteristicReadable[];
  selectedAttr: ServiceCharacteristicReadable | null;
  formData: { label: string; value: string; description: string };
}

const initialState: AttributeState = {
  attributes: [],
  selectedAttr: null,
  formData: { label: '', value: '', description: '' },
};

const attributeSlice = createSlice({
  name: 'attribute',
  initialState,
  reducers: {
    setAttributes: (state, action: PayloadAction<ServiceCharacteristicReadable[]>) => {
      state.attributes = action.payload;
    },
    setSelectedAttr: (state, action: PayloadAction<ServiceCharacteristicReadable | null>) => {
      state.selectedAttr = action.payload;
    },
    setFormData: (state, action: PayloadAction<{ label: string; value: string; description: string }>) => {
      state.formData = action.payload;
    },
  },
});

export const { setAttributes, setSelectedAttr, setFormData } = attributeSlice.actions;

export default attributeSlice.reducer;