// src/redux/thunks/uploadSdsThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
//import API_URLS from "../../utils/ApiUrls";
import type { Contact, CreateCustomerPayload, Site } from "../../types/NewInstall";
import api, { API_URLS } from "../../utils/ApiUrls";
// import { API_URLS } from "../../api/apiUrls";

interface UploadResponse {
  message: string;
}

// interface CustomerSearchResponse {
//   customers: string[];
// }

export const uploadSdsJsonThunk = createAsyncThunk<
  UploadResponse,
  File,
  { rejectValue: string }
>(
  "activation/uploadSdsJson",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<UploadResponse>(
        API_URLS.UPLOAD_SDS_JSON,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload SDS JSON"
      );
    }
  }
);

// search customers by name (POST as you provided)
// export const searchCustomersThunk = createAsyncThunk(
//   "customers/search",
//   async (query: string) => {
//     const res = await api.get("/customers/search", { search_name: query, limit: 10 });

//     return res.data.customers as string[];
//   }
// );

export const searchCustomersThunk = createAsyncThunk(
  "customers/search",
  async (query: string) => {
    const res = await api.get("/customers/search", {
      params: { search_name: query, limit: 10 }, // ✅ Use params
    });
    return res.data.customers as string[];
  }
);

// fetch contacts by customer name (GET /customers/<name>/contacts)
export const fetchContactsThunk = createAsyncThunk(
  "customers/fetchContacts",
  async (customerName: string) => {
    const encoded = encodeURIComponent(customerName);
    const res = await api.get(`/customers/${encoded}/contacts`);
    return res.data as Contact[];
  }
);

// fetch sites by customer name (GET /customers/<name>/sites)
export const fetchSitesThunk = createAsyncThunk(
  "customers/fetchSites",
  async (customerName: string) => {
    const encoded = encodeURIComponent(customerName);
    const res = await api.get(`/customers/${encoded}/sites`);
    return res.data as Site[];
  }
);

// create customer + site + contact (POST /customerData/)
export const createCustomerDataThunk = createAsyncThunk(
  "customers/createCustomerData",
  async (payload: CreateCustomerPayload) => {
    const res = await api.post("/customers/add/", payload);
    return res.data;
  }
);


// export const searchCustomersThunk = createAsyncThunk<
//   string[],
//   string,
//   { rejectValue: string }
// >(
//   "activation/searchCustomers",
//   async (searchName, { rejectWithValue }) => {
//     try {
//       const response = await axios.get<CustomerSearchResponse>(
//         `http://192.168.5.51:8086/customers/search`,
//         {
//           params: { search_name: searchName, limit: 10 },
//         }
//       );
//       return response.data.customers;
//     } catch (error: any) {
//       return rejectWithValue("Failed to fetch customers");
//     }
//   }
// );

// customerSlice.ts
// export const fetchCustomerSearch = createAsyncThunk(
//   "customers/search",
//   async (query: string) => {
//     const res = await axios.get(`http://192.168.5.51:8086/customers/search=${query}`);
//     return res.data.customers;
//   }
// );

