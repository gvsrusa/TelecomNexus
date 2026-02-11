import { GraphQLError } from 'graphql';
import { DeviceModel } from './models';
import {
  getTelemetry,
  getAlerts,
  getAlertsSummary,
  findAlertById,
  updateAlertStatus,
} from './cassandra';
import { pubsub, NEW_ALERT, TELEMETRY_UPDATE } from './pubsub';
import type { IDevice } from './models';

// DateTime scalar
const DateTimeScalar = {
  __serialize(value: unknown): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    throw new GraphQLError('DateTime must be a Date or ISO string');
  },
  __parseValue(value: unknown): Date {
    if (typeof value === 'string') return new Date(value);
    throw new GraphQLError('DateTime must be an ISO 8601 string');
  },
  __parseLiteral(ast: { kind: string; value?: string }): Date {
    if (ast.kind === 'StringValue' && ast.value) return new Date(ast.value);
    throw new GraphQLError('DateTime must be an ISO 8601 string');
  },
};

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    devices: async (
      _: unknown,
      args: { region?: string | undefined; status?: string | undefined },
    ) => {
      const filter: Record<string, unknown> = {};
      if (args.region) filter['location.region'] = args.region;
      if (args.status) filter['status'] = args.status;
      return DeviceModel.find(filter);
    },

    device: async (_: unknown, args: { deviceId: string }) => {
      return DeviceModel.findOne({ deviceId: args.deviceId });
    },

    telemetry: async (
      _: unknown,
      args: { deviceId: string; timeRange: { start: Date; end: Date } },
    ) => {
      try {
        const start =
          args.timeRange.start instanceof Date
            ? args.timeRange.start
            : new Date(args.timeRange.start as unknown as string);
        const end =
          args.timeRange.end instanceof Date
            ? args.timeRange.end
            : new Date(args.timeRange.end as unknown as string);
        return await getTelemetry(args.deviceId, start, end);
      } catch (err) {
        console.error('[network-service] Failed to fetch telemetry from Cassandra:', err);
        return [];
      }
    },

    alerts: async (
      _: unknown,
      args: {
        deviceId?: string | undefined;
        severity?: string | undefined;
        status?: string | undefined;
      },
    ) => {
      try {
        return await getAlerts({
          deviceId: args.deviceId ?? undefined,
          severity: args.severity ?? undefined,
          status: args.status ?? undefined,
        });
      } catch (err) {
        console.error('[network-service] Failed to fetch alerts from Cassandra:', err);
        return [];
      }
    },

    alertsSummary: async () => {
      try {
        return await getAlertsSummary();
      } catch (err) {
        console.error('[network-service] Failed to fetch alerts summary from Cassandra:', err);
        return { critical: 0, major: 0, minor: 0, info: 0, total: 0 };
      }
    },
  },

  Mutation: {
    acknowledgeAlert: async (_: unknown, args: { alertId: string }) => {
      const alert = await findAlertById(args.alertId);
      if (!alert) {
        throw new GraphQLError(`Alert ${args.alertId} not found`);
      }

      await updateAlertStatus(
        alert.deviceId,
        alert.month,
        alert.timestamp,
        alert.alertId,
        'ACKNOWLEDGED',
      );

      return { ...alert, status: 'ACKNOWLEDGED' };
    },

    resolveAlert: async (_: unknown, args: { alertId: string; resolution: string }) => {
      const alert = await findAlertById(args.alertId);
      if (!alert) {
        throw new GraphQLError(`Alert ${args.alertId} not found`);
      }

      await updateAlertStatus(
        alert.deviceId,
        alert.month,
        alert.timestamp,
        alert.alertId,
        'RESOLVED',
      );

      return {
        ...alert,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      };
    },
  },

  Subscription: {
    newAlert: {
      subscribe: (_: unknown, args: { region?: string | undefined }) => {
        return {
          [Symbol.asyncIterator]() {
            const iterator = pubsub.asyncIterator<Record<string, unknown>>(NEW_ALERT);
            if (!args.region) return iterator;

            // Filter by region
            return {
              async next() {
                while (true) {
                  const result = await iterator.next();
                  if (result.done) return result;
                  const alert = (result.value as Record<string, Record<string, unknown>>)[
                    'newAlert'
                  ];
                  if (alert && alert['region'] === args.region) return result;
                }
              },
              return:
                iterator.return?.bind(iterator) ??
                (async () => ({ value: undefined, done: true as const })),
              throw:
                iterator.throw?.bind(iterator) ??
                (async (e: unknown) => {
                  throw e;
                }),
              [Symbol.asyncIterator]() {
                return this;
              },
            };
          },
        };
      },
    },
    telemetryUpdate: {
      subscribe: (_: unknown, args: { deviceId: string }) => {
        return {
          [Symbol.asyncIterator]() {
            const iterator = pubsub.asyncIterator<Record<string, unknown>>(TELEMETRY_UPDATE);
            return {
              async next() {
                while (true) {
                  const result = await iterator.next();
                  if (result.done) return result;
                  const reading = (result.value as Record<string, Record<string, unknown>>)[
                    'telemetryUpdate'
                  ];
                  if (reading && reading['deviceId'] === args.deviceId) return result;
                }
              },
              return:
                iterator.return?.bind(iterator) ??
                (async () => ({ value: undefined, done: true as const })),
              throw:
                iterator.throw?.bind(iterator) ??
                (async (e: unknown) => {
                  throw e;
                }),
              [Symbol.asyncIterator]() {
                return this;
              },
            };
          },
        };
      },
    },
  },

  // Federation entity resolver
  NetworkDevice: {
    __resolveReference: async (reference: { deviceId: string }) => {
      return DeviceModel.findOne({ deviceId: reference.deviceId });
    },
    connectedDevices: async (parent: IDevice) => {
      if (!parent.connectedDeviceIds || parent.connectedDeviceIds.length === 0) return [];
      return DeviceModel.find({
        deviceId: { $in: parent.connectedDeviceIds },
      });
    },
  },

  Alert: {
    device: async (parent: { deviceId: string }) => {
      return DeviceModel.findOne({ deviceId: parent.deviceId });
    },
  },
};
