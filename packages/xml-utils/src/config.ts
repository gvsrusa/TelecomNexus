import type { NetworkDevice } from '@telecom-nexus/types';
import { create } from 'xmlbuilder2';
import { DOMParser } from '@xmldom/xmldom';

export interface DeviceConfig {
  deviceId: string;
  type: string;
  firmwareVersion: string;
  settings: Record<string, string>;
}

export function parseDeviceConfig(xml: string): DeviceConfig {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const root = doc.documentElement;
  const getText = (name: string) => root.getElementsByTagName(name)[0]?.textContent ?? '';

  const settings: Record<string, string> = {};
  const settingsEl = root.getElementsByTagName('settings')[0];
  if (settingsEl) {
    for (const child of settingsEl.children) {
      settings[child.tagName] = child.textContent ?? '';
    }
  }

  return {
    deviceId: getText('deviceId'),
    type: getText('type'),
    firmwareVersion: getText('firmwareVersion'),
    settings,
  };
}

export function generateSampleDeviceConfig(device: NetworkDevice): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('deviceConfig')
    .ele('deviceId').txt(device.deviceId).up()
    .ele('type').txt(device.type).up()
    .ele('firmwareVersion').txt(device.metadata.firmwareVersion).up()
    .ele('settings')
    .ele('region').txt(device.location.region).up()
    .up();

  return doc.end({ prettyPrint: true });
}
