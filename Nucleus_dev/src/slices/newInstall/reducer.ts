import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// import type { FormState, UploadedFile } from "../../types/NewInstall";
// import { searchCustomersThunk, uploadSdsJsonThunk } from "./thunk";
import type { Contact, Site, UploadedFile } from "../../types/NewInstall";
import { createCustomerDataThunk, fetchContactsThunk, fetchSitesThunk, searchCustomersThunk, uploadSdsJsonThunk } from "./thunk";
import type { NetworkServiceNode } from "../../types/ConfigMangerJsonInterface";
// import { uploadSdsJsonThunk } from "../thunks/uploadSdsThunk";

interface ActivationState {
  // formData: FormState;
  uploadedFile: UploadedFile;
  activeStep: number;
  steps: string[];
  loading: boolean;
  error: string | null;
  message: string | null;
  searchResults: string[]; // backend returns { customers: ["Name"] }
  loadingSearch: boolean;
  selectedCustomerName?: string | null;
  contacts: Contact[];
  loadingContacts: boolean;
  sites: Site[];
  completedSteps: number[];
  loadingSites: boolean;
  treeData: NetworkServiceNode[];
}

const initialState: ActivationState = {
  uploadedFile: { file: null },
  activeStep: 0,
  steps: ["service-order", "upload-sds", "stage-0", "stage-1", "completed"],
  loading: false,
  error: null,
  message: null,
  searchResults: [],
  loadingSearch: false,
  selectedCustomerName: null,
  contacts: [],
  loadingContacts: false,
  sites: [],
  completedSteps: [],
  loadingSites: false,
  treeData: [],
};

const activationSlice = createSlice({
  name: "activation",
  initialState,
  reducers: {
    setSelectedCustomerName(state, action: PayloadAction<string | null>) {
      state.selectedCustomerName = action.payload;
      if (!action.payload) {
        state.contacts = [];
        state.sites = [];
      }
    },
    setTreeData: (state, action: PayloadAction<NetworkServiceNode[]>) => {
      state.treeData = action.payload;
    },
    clearCustomerState(state) {
      state.searchResults = [];
      state.selectedCustomerName = null;
      state.contacts = [];
      state.sites = [];
      state.error = null;
    },
    setUploadedFile: (state, action: PayloadAction<File | null>) => {
      state.uploadedFile.file = action.payload;
    },
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
    setStepCompleted: (state, action: PayloadAction<number>) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
    },
    resetSteps: (state) => {
      state.completedSteps = [];
      state.activeStep = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSdsJsonThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(uploadSdsJsonThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message; // ✅ get backend message
        state.uploadedFile.file = null; // ✅ clear after success
      })
      .addCase(uploadSdsJsonThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to upload";
      })
      .addCase(searchCustomersThunk.pending, (s) => {
        s.loadingSearch = true;
        s.error = null;
      })
      .addCase(searchCustomersThunk.fulfilled, (s, a) => {
        s.loadingSearch = false;
        s.searchResults = a.payload || [];
      })
      .addCase(searchCustomersThunk.rejected, (s, a) => {
        s.loadingSearch = false;
        s.error = a.error.message ?? "Failed to search customers";
      })

      .addCase(fetchContactsThunk.pending, (s) => {
        s.loadingContacts = true;
        s.error = null;
      })
      .addCase(fetchContactsThunk.fulfilled, (s, a) => {
        s.loadingContacts = false;
        s.contacts = a.payload || [];
      })
      .addCase(fetchContactsThunk.rejected, (s, a) => {
        s.loadingContacts = false;
        s.error = a.error.message ?? "Failed to fetch contacts";
      })

      .addCase(fetchSitesThunk.pending, (s) => {
        s.loadingSites = true;
        s.error = null;
      })
      .addCase(fetchSitesThunk.fulfilled, (s, a) => {
        s.loadingSites = false;
        s.sites = a.payload || [];
      })
      .addCase(fetchSitesThunk.rejected, (s, a) => {
        s.loadingSites = false;
        s.error = a.error.message ?? "Failed to fetch sites";
      })

      .addCase(createCustomerDataThunk.pending, (s) => {
        s.error = null;
      })
      .addCase(createCustomerDataThunk.fulfilled, (s) => {
        // optionally refresh results or set selected
      })
      .addCase(createCustomerDataThunk.rejected, (s, a) => {
        s.error = a.error.message ?? "Failed to create customer data";
      });

  },
});

export const { setSelectedCustomerName, clearCustomerState, setActiveStep,resetSteps, setStepCompleted, setUploadedFile } =
  activationSlice.actions;

export default activationSlice.reducer;
