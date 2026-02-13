import { create } from 'xmlbuilder2';
import type { IDevice } from '../models';

export function generateSampleDeviceConfig(device: IDevice): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('deviceConfig')
    .ele('deviceId')
    .txt(device.deviceId)
    .up()
    .ele('type')
    .txt(device.type)
    .up()
    .ele('firmwareVersion')
    .txt(device.metadata.firmwareVersion)
    .up()
    .ele('settings')
    .ele('region')
    .txt(device.location.region)
    .up()
    .up();

  return doc.end({ prettyPrint: true });
}
