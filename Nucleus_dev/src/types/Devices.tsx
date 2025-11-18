// src/types/device.ts
export interface Device { 
  ipAddress: string;
  deviceType: string;
  hostname: string;
  osVersion: string;
  serialNumber: string;
  hardwareModel: string;
  status: string;
  masterIdentifier: string;
  description: string;
}

export interface DeviceFormData {
  customerName: string;
  siteName: string;
  deviceHostname: string;
  serialNumber: string;
  model: string;
}

export interface DevicesState {
  devices: Device[];
  loading: boolean;
  error: string | null;
  uploadMessage?: string;
  totalUploadedDevices?: number;
}


// Define what the thunk returns on success
export interface UploadDevicesResponse {
  totalDevices: number;
  message: string;
}

// src/types/Progress.ts
export interface ProgressStatus {
  processed: number;
  total: number;
  success: number;
  pending: number;
  failed: number;
}
