import mongoose, { Schema } from 'mongoose';

export interface IDevice {
  deviceId: string;
  type: 'TOWER' | 'SWITCH' | 'ROUTER' | 'BASE_STATION' | 'FIBER_NODE';
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
  };
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE';
  connectedDeviceIds: string[];
  configXml: string;
  metadata: {
    manufacturer: string;
    model: string;
    firmwareVersion: string;
    installDate: Date;
  };
}

const deviceSchema = new Schema<IDevice>({
  deviceId: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['TOWER', 'SWITCH', 'ROUTER', 'BASE_STATION', 'FIBER_NODE'],
    required: true,
  },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
    region: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['OPERATIONAL', 'DEGRADED', 'DOWN', 'MAINTENANCE'],
    default: 'OPERATIONAL',
  },
  connectedDeviceIds: [{ type: String }],
  configXml: { type: String, default: '' },
  metadata: {
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    firmwareVersion: { type: String, required: true },
    installDate: { type: Date, required: true },
  },
});

export const DeviceModel = mongoose.model<IDevice>('Device', deviceSchema);
