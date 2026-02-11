import { cassandraClient, cassandra } from './client';

export interface AlertRow {
  alertId: string;
  deviceId: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  timestamp: Date;
  resolvedAt: Date | null;
}

/**
 * Query alerts with optional filters.
 */
export async function getAlerts(filters: {
  deviceId?: string | undefined;
  severity?: string | undefined;
  status?: string | undefined;
}): Promise<AlertRow[]> {
  let query: string;
  const params: unknown[] = [];

  if (filters.deviceId) {
    // Query specific device's alerts (current and previous 2 months)
    const now = new Date();
    const months: string[] = [];
    for (let m = 0; m < 3; m++) {
      const d = new Date(now);
      d.setUTCMonth(d.getUTCMonth() - m);
      months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
    }

    query = `
      SELECT device_id, month, timestamp, alert_id, severity, status, title, description
      FROM alerts_by_device
      WHERE device_id = ? AND month IN (?, ?, ?)
    `;
    params.push(filters.deviceId, ...months);
  } else {
    // Broad query — full table scan for demo (no WHERE clause needed)
    query = `
      SELECT device_id, month, timestamp, alert_id, severity, status, title, description
      FROM alerts_by_device
    `;
  }

  const result = await cassandraClient.execute(query, params, {
    prepare: true,
  });

  let rows: AlertRow[] = result.rows.map((row) => ({
    alertId: String(row['alert_id']),
    deviceId: String(row['device_id']),
    severity: String(row['severity']),
    title: String(row['title']),
    description: String(row['description']),
    status: String(row['status']),
    timestamp: row['timestamp'] as Date,
    resolvedAt: null,
  }));

  // Apply in-memory filters
  if (filters.severity) {
    rows = rows.filter((r) => r.severity === filters.severity);
  }
  if (filters.status) {
    rows = rows.filter((r) => r.status === filters.status);
  }

  return rows.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get alerts summary (count by severity).
 */
export async function getAlertsSummary(): Promise<{
  critical: number;
  major: number;
  minor: number;
  info: number;
  total: number;
}> {
  const alerts = await getAlerts({ status: 'ACTIVE' });
  const summary = { critical: 0, major: 0, minor: 0, info: 0, total: 0 };

  for (const alert of alerts) {
    summary.total++;
    switch (alert.severity) {
      case 'CRITICAL':
        summary.critical++;
        break;
      case 'MAJOR':
        summary.major++;
        break;
      case 'MINOR':
        summary.minor++;
        break;
      case 'INFO':
        summary.info++;
        break;
    }
  }

  return summary;
}

/**
 * Find a specific alert by alertId (uses ALLOW FILTERING for demo).
 */
export async function findAlertById(alertId: string): Promise<
  | {
      alertId: string;
      deviceId: string;
      month: string;
      timestamp: Date;
      severity: string;
      status: string;
      title: string;
      description: string;
    }
  | undefined
> {
  const query = `
    SELECT device_id, month, timestamp, alert_id, severity, status, title, description
    FROM alerts_by_device
    WHERE alert_id = ?
    ALLOW FILTERING
  `;

  const result = await cassandraClient.execute(query, [cassandra.types.Uuid.fromString(alertId)], {
    prepare: true,
  });

  const row = result.rows[0];
  if (!row) return undefined;

  return {
    alertId: String(row['alert_id']),
    deviceId: String(row['device_id']),
    month: String(row['month']),
    timestamp: row['timestamp'] as Date,
    severity: String(row['severity']),
    status: String(row['status']),
    title: String(row['title']),
    description: String(row['description']),
  };
}

/**
 * Update alert status in Cassandra.
 */
export async function updateAlertStatus(
  deviceId: string,
  month: string,
  timestamp: Date,
  alertId: string,
  newStatus: string,
): Promise<void> {
  const query = `
    UPDATE alerts_by_device
    SET status = ?
    WHERE device_id = ? AND month = ? AND timestamp = ? AND alert_id = ?
  `;
  await cassandraClient.execute(
    query,
    [newStatus, deviceId, month, timestamp, cassandra.types.Uuid.fromString(alertId)],
    { prepare: true },
  );
}
