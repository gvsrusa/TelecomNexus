import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphQLError } from 'graphql';

// Mock the models
vi.mock('../models', () => ({
  DeviceModel: {
    findOne: vi.fn(),
    find: vi.fn(),
  },
}));

// Mock cassandra functions
vi.mock('../cassandra', () => ({
  getTelemetry: vi.fn(),
  getAlerts: vi.fn(),
  getAlertsSummary: vi.fn(),
  findAlertById: vi.fn(),
  updateAlertStatus: vi.fn(),
}));

// Mock pubsub
vi.mock('../pubsub', () => ({
  pubsub: { publish: vi.fn() },
  NEW_ALERT: 'NEW_ALERT',
  TELEMETRY_UPDATE: 'TELEMETRY_UPDATE',
}));

import { resolvers } from '../resolvers';
import { DeviceModel } from '../models';
import {
  getTelemetry,
  getAlerts,
  getAlertsSummary,
  findAlertById,
  updateAlertStatus,
} from '../cassandra';

const mockedDeviceModel = vi.mocked(DeviceModel);
const mockedGetTelemetry = vi.mocked(getTelemetry);
const mockedGetAlerts = vi.mocked(getAlerts);
const mockedGetAlertsSummary = vi.mocked(getAlertsSummary);
const mockedFindAlertById = vi.mocked(findAlertById);
const mockedUpdateAlertStatus = vi.mocked(updateAlertStatus);

describe('Network Service Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query.devices', () => {
    it('returns all devices when no filters', async () => {
      const mockDevices = [{ deviceId: 'DEV-001' }, { deviceId: 'DEV-002' }];
      mockedDeviceModel.find.mockResolvedValue(mockDevices as never);

      const result = await resolvers.Query.devices(null, {});
      expect(mockedDeviceModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockDevices);
    });

    it('filters by region', async () => {
      mockedDeviceModel.find.mockResolvedValue([] as never);

      await resolvers.Query.devices(null, { region: 'US-EAST' });
      expect(mockedDeviceModel.find).toHaveBeenCalledWith({
        'location.region': 'US-EAST',
      });
    });

    it('filters by status', async () => {
      mockedDeviceModel.find.mockResolvedValue([] as never);

      await resolvers.Query.devices(null, { status: 'OPERATIONAL' });
      expect(mockedDeviceModel.find).toHaveBeenCalledWith({
        status: 'OPERATIONAL',
      });
    });

    it('filters by both region and status', async () => {
      mockedDeviceModel.find.mockResolvedValue([] as never);

      await resolvers.Query.devices(null, {
        region: 'US-EAST',
        status: 'DOWN',
      });
      expect(mockedDeviceModel.find).toHaveBeenCalledWith({
        'location.region': 'US-EAST',
        status: 'DOWN',
      });
    });
  });

  describe('Query.device', () => {
    it('returns a single device by deviceId', async () => {
      const mockDevice = { deviceId: 'DEV-001', name: 'Core Router 1' };
      mockedDeviceModel.findOne.mockResolvedValue(mockDevice as never);

      const result = await resolvers.Query.device(null, {
        deviceId: 'DEV-001',
      });
      expect(result).toEqual(mockDevice);
    });

    it('returns null for non-existent device', async () => {
      mockedDeviceModel.findOne.mockResolvedValue(null as never);

      const result = await resolvers.Query.device(null, {
        deviceId: 'DEV-999',
      });
      expect(result).toBeNull();
    });
  });

  describe('Query.telemetry', () => {
    it('calls getTelemetry with correct params', async () => {
      const mockReadings = [{ cpu: 50, memory: 70 }];
      mockedGetTelemetry.mockResolvedValue(mockReadings as never);

      const start = new Date('2026-01-01');
      const end = new Date('2026-01-02');

      const result = await resolvers.Query.telemetry(null, {
        deviceId: 'DEV-001',
        timeRange: { start, end },
      });

      expect(mockedGetTelemetry).toHaveBeenCalledWith('DEV-001', start, end);
      expect(result).toEqual(mockReadings);
    });
  });

  describe('Query.alerts', () => {
    it('calls getAlerts with filter params', async () => {
      mockedGetAlerts.mockResolvedValue([] as never);

      await resolvers.Query.alerts(null, {
        deviceId: 'DEV-001',
        severity: 'CRITICAL',
      });

      expect(mockedGetAlerts).toHaveBeenCalledWith({
        deviceId: 'DEV-001',
        severity: 'CRITICAL',
        status: undefined,
      });
    });
  });

  describe('Query.alertsSummary', () => {
    it('returns summary from Cassandra', async () => {
      const summary = { critical: 5, major: 10 };
      mockedGetAlertsSummary.mockResolvedValue(summary as never);

      const result = await resolvers.Query.alertsSummary();
      expect(result).toEqual(summary);
    });
  });

  describe('Mutation.acknowledgeAlert', () => {
    it('acknowledges an existing alert', async () => {
      const mockAlert = {
        alertId: 'ALERT-001',
        deviceId: 'DEV-001',
        month: '2026-01',
        timestamp: new Date(),
        status: 'ACTIVE',
      };
      mockedFindAlertById.mockResolvedValue(mockAlert as never);
      mockedUpdateAlertStatus.mockResolvedValue(undefined as never);

      const result = await resolvers.Mutation.acknowledgeAlert(null, {
        alertId: 'ALERT-001',
      });

      expect(result.status).toBe('ACKNOWLEDGED');
      expect(mockedUpdateAlertStatus).toHaveBeenCalledWith(
        'DEV-001',
        '2026-01',
        mockAlert.timestamp,
        'ALERT-001',
        'ACKNOWLEDGED',
      );
    });

    it('throws when alert not found', async () => {
      mockedFindAlertById.mockResolvedValue(null as never);

      await expect(
        resolvers.Mutation.acknowledgeAlert(null, {
          alertId: 'ALERT-999',
        }),
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('Mutation.resolveAlert', () => {
    it('resolves an existing alert', async () => {
      const mockAlert = {
        alertId: 'ALERT-001',
        deviceId: 'DEV-001',
        month: '2026-01',
        timestamp: new Date(),
        status: 'ACKNOWLEDGED',
      };
      mockedFindAlertById.mockResolvedValue(mockAlert as never);
      mockedUpdateAlertStatus.mockResolvedValue(undefined as never);

      const result = await resolvers.Mutation.resolveAlert(null, {
        alertId: 'ALERT-001',
        resolution: 'Fixed the issue',
      });

      expect(result.status).toBe('RESOLVED');
      expect(result.resolvedAt).toBeInstanceOf(Date);
    });

    it('throws when alert not found', async () => {
      mockedFindAlertById.mockResolvedValue(null as never);

      await expect(
        resolvers.Mutation.resolveAlert(null, {
          alertId: 'ALERT-999',
          resolution: 'N/A',
        }),
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('NetworkDevice.__resolveReference', () => {
    it('looks up device by deviceId', async () => {
      const mockDevice = { deviceId: 'DEV-001' };
      mockedDeviceModel.findOne.mockResolvedValue(mockDevice as never);

      const result = await resolvers.NetworkDevice.__resolveReference({
        deviceId: 'DEV-001',
      });
      expect(result).toEqual(mockDevice);
    });
  });

  describe('NetworkDevice.connectedDevices', () => {
    it('returns connected devices', async () => {
      const connected = [{ deviceId: 'DEV-002' }];
      mockedDeviceModel.find.mockResolvedValue(connected as never);

      const parent = {
        deviceId: 'DEV-001',
        connectedDeviceIds: ['DEV-002'],
      };
      const result = await resolvers.NetworkDevice.connectedDevices(parent as never);
      expect(mockedDeviceModel.find).toHaveBeenCalledWith({
        deviceId: { $in: ['DEV-002'] },
      });
      expect(result).toEqual(connected);
    });

    it('returns empty array when no connections', async () => {
      const parent = { deviceId: 'DEV-001', connectedDeviceIds: [] };
      const result = await resolvers.NetworkDevice.connectedDevices(parent as never);
      expect(result).toEqual([]);
    });
  });
});
