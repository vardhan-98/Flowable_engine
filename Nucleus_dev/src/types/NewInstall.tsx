// export interface CustomerInfo {
//   name: string;
//   description: string;
// }

// export interface SiteInfo {
//   name: string;
//   description: string;
// }

// export interface ServiceRequest {
//   gpsServiceRequest: string;
// }

// export interface FormState {
//   customer: CustomerInfo;
//   site: SiteInfo;
//   service: ServiceRequest;
//   uploadedFile: File | null;
// }

// type StepId = 'service-order' | 'upload-sds' | 'stage-0' | 'stage-1' | 'completed';

// export interface StepConfig {
//   id: StepId;
//   label: string;
//   number: string;
//   substeps?: string[];
// }

// export interface CustomerInfo {
//   name: string;
//   description: string;
// }

// export interface SiteInfo {
//   name: string;
//   description: string;
// }

// export interface ServiceRequest {
//   gpsServiceRequest: string;
// }

// export interface FormState {
  

//   customerName: string;


//   contactName: string;
//   contactPhone: string;
//   contactEmail: string;


//   gpsSiteId: string;
//   siteName: string;
//   siteCountry: string;
//   siteState: string;
//   siteCity: string;
//   siteAddress: string;
//   siteZip: string;
//   localContactName: string;
//   localContactPhone: string;
//   localContactEmail: string;
//   serviceLine: string;
//   ucpeHostName: string;
//   jumpServerHostName: string;
//   devicesId: number;
// }


// src/types/customers.ts

export interface CustomerSummary {
  // id?: number;
  customer_name: string;
}

export interface Contact {
  // id: number;
  customer_contact_name: string;
  customer_contact_phone: string | null;
  customer_contact_email: string | null;
  // customer_id?: number;
  // site_id?: number;
}

export interface Site {
  // id: number;
  gps_site_id: string | null;
  ucpe_host_name: string | null;
  site_name: string | null;
  service_location_country?: string | null;
  service_location_state?: string | null;
  service_location_city?: string | null;
  service_location_address?: string | null;
  service_location_zip?: string | null;
  lcon_phone?: string | null;
  lcon_name?: string | null;
  lcon_email?: string | null;
  service_line?: string | null;
  jump_server_host_name?: string | null;
  // customers_id?: number;
  // devices_id?: number;
}

export interface CreateCustomerPayload {
  customer_name: string;
  site: Partial<Site>;
  contact: Partial<Contact>;
}


export interface UploadedFile {
  file: File | null
}

export interface UploadedNmProfile {
  file: File | null
}

export type StepId =
  | "service-order"
  | "upload-nm-profile"
  | "upload-sds"
  | "Validation"
  | "stage-0"
  | "stage-1"
  | "completed";

export interface StepConfig {
  id: StepId;
  label: string;
  substeps?: string[];
}