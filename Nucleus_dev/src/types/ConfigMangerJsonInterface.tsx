export interface ConfigManagerJsonResponse {
  message: string;
}

export interface JsonFileUploadResponse {
  message: string;
}

// export interface UploadedFile {
//   fileName: string;
//   json: TreeNode[];
// }

// export interface ServiceCharacteristic {
//   readnames: string;
//   name: string;
//   value: string | null;
//   description?: string;
//   sensitive?: boolean;
// }

// export interface TreeNode {
//   extId: string;
//   description: string;
//   isPrimary: boolean
//   serviceSpecId: string;
//   action: string | null;
//   serviceCharacteristic: ServiceCharacteristic[];
//   children: TreeNode[];
//   parentId?: string;
//   level?: number;
// }

export interface NetworkServiceFile {
  fileName: string;
  json: NetworkServiceNode[];
}

export interface NetworkServiceNode {
  extId: string;
  description: string;
  isPrimary: boolean | null;
  children: NetworkServiceNode[];
  metadata?: Metadata;
}

export interface Metadata {
  relatedEntityReadables: RelatedEntityReadable[];
  relatedEntity: RelatedEntity[];
  serviceCharacteristicReadables: ServiceCharacteristicReadable[];
  serviceCharacteristic: ServiceCharacteristic;
}

export interface RelatedEntityReadable {
  id: string;
  role: string;
  readnames: string;
}

export interface RelatedEntity {
  id: string;
  role: string;
}

export interface ServiceCharacteristicReadable {
  key: string;
  readnames: string;
  value: string | null;
}

export interface ServiceCharacteristic {
  interface1: string;
  portType: string | null;
  configurePort: string;
  internalInterface: string;
  portConnectMode: string;
  portMode: string;
  portState: string;
  portUsage: string;
  portSpeed: string;
  portDuplex: string;
  nativeVlanId: string;
  vlanIdInner: string;
}
