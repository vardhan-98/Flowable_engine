// // Central place for all API endpoints
// // const BASE_URL = "http://localhost:9090/api"; // ✅ replace with process.env.API_URL later
// // const BASE_URL = "http://192.168.5.52:9090/api";
// const BASE_URL = "http://192.168.5.51:8086";
const BASE_URL1 = "http://localhost:8080/api/"
export const API_URLS = {
  // ORCHESTRATION_START: `${BASE_URL}/orchestration/start`,
  // UPLOAD_JSON: 'http://192.168.5.52:9090/orders/upload',
  // GET_TREE_DATA: 'http://192.168.5.52:9090/orders',
  UPLOAD_JSON: 'http://192.168.5.52:9090/orders/upload',
  GET_TREE_DATA: 'http://192.168.5.52:9090/orders',
  UPLOAD_DEVICES: 'http://localhost:8080/devices/upload',
  GET_DEVICES: 'http://192.168.5.52:9090/api/devices/all', 
  GET_PROGRESS: 'http://192.168.5.52:9090/api/devices/status', 
  UPLOAD_SDS_JSON: 'http://192.168.5.52:9090/orders/upload',
  baseurl: `${BASE_URL1}` 
};


import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.5.51:8086",
  headers: { "Content-Type": "application/json" },

});

export default api;


// const BACKEND_1 = "http://192.168.5.52:9090";

// const BACKEND_3 = "http://192.168.5.51:8086";

// export const API_URLS = {
//   UPLOAD_JSON: `${BACKEND_1}/orders/upload`,
//   GET_TREE_DATA: `${BACKEND_1}/orders`,
//   ORCHESTRATION_START: `${BACKEND_1}/orchestration/start`,
//   UPLOAD_DEVICES: `${BACKEND_1}/api/devices/upload`,
//   GET_DEVICES: `${BACKEND_1}/api/devices/all`,
//   GET_PROGRESS: `${BACKEND_1}/api/devices/status`,
//   POST_SERVICEORDER: `${BACKEND_3}/api/customers/createCustomerData`,
//   GET_CUSTOMERS_SITES:`${BACKEND_3}/api/customers/fetchSites`,
//   GET_CUSTOMERS_CONTACTS:`${BACKEND_3}/api/customers/fetchContacts`,
//   GET_CUSTOMERS_SEARCH:`${BACKEND_3}/api/customers/search`
// };

// export default API_URLS;