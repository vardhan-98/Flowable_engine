// File: src/redux/slices/treeSlice.ts
import { createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type { NetworkServiceNode } from '../../../types/ConfigMangerJsonInterface';

interface TreeState {
  treeData: NetworkServiceNode[];
  selectedRow: string | null;
  expandedIds: Record<string, boolean>;
}

const initialState: TreeState = {
  treeData: [],
  selectedRow: null,
  expandedIds: {},
};

const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {
    setTreeData: (state, action: PayloadAction<NetworkServiceNode[]>) => {
      state.treeData = action.payload;
    },
    setSelectedRow: (state, action: PayloadAction<string | null>) => {
      state.selectedRow = action.payload;
    },
    setExpandedIds: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.expandedIds = action.payload;
    },
    toggleExpandedId: (state, action: PayloadAction<string>) => {
      state.expandedIds = {
        ...state.expandedIds,
        [action.payload]: !state.expandedIds[action.payload],
      };
    },
  },
});

export const { setTreeData, setSelectedRow, setExpandedIds, toggleExpandedId } = treeSlice.actions;

export default treeSlice.reducer;