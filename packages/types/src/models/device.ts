import type { DeviceId } from '../branded';
import type { DeviceStatus, DeviceType } from '../enums';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  region: string;
}

export interface DeviceMetadata {
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  installDate: Date;
}

export interface NetworkDevice {
  _id?: unknown;
  deviceId: DeviceId;
  type: DeviceType;
  name: string;
  location: GeoLocation;
  status: DeviceStatus;
  connectedDeviceIds: string[];
  configXml: string;
  metadata: DeviceMetadata;
}
