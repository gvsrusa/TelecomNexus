import { cassandraClient, cassandra } from './client';

export interface TelemetryRow {
  deviceId: string;
  timestamp: Date;
  cpuPercent: number;
  memoryPercent: number;
  bandwidthMbps: number;
  packetLossPercent: number;
  temperatureCelsius: number;
}

/**
 * Get telemetry readings for a device within a time range.
 * Iterates over date partitions since PK is (device_id, date).
 */
export async function getTelemetry(
  deviceId: string,
  start: Date,
  end: Date,
): Promise<TelemetryRow[]> {
  const readings: TelemetryRow[] = [];

  // Generate all dates between start and end
  const currentDate = new Date(start);
  currentDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setUTCHours(23, 59, 59, 999);

  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);

    const query = `
      SELECT device_id, timestamp, cpu_percent, memory_percent,
             bandwidth_mbps, packet_loss_percent, temperature_c
      FROM device_telemetry
      WHERE device_id = ? AND date = ? AND timestamp >= ? AND timestamp <= ?
    `;

    const result = await cassandraClient.execute(query, [deviceId, dateStr, start, end], {
      prepare: true,
    });

    for (const row of result.rows) {
      readings.push({
        deviceId: String(row['device_id']),
        timestamp: row['timestamp'] as Date,
        cpuPercent: Number(row['cpu_percent']),
        memoryPercent: Number(row['memory_percent']),
        bandwidthMbps: Number(row['bandwidth_mbps']),
        packetLossPercent: Number(row['packet_loss_percent']),
        temperatureCelsius: Number(row['temperature_c']),
      });
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function formatDate(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export { cassandra };
