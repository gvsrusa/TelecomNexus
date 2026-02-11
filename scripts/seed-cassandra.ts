/**
 * Cassandra Seed Script — S-4.2
 * Populates Cassandra with demo data: telemetry, CDRs, daily usage, alerts
 * Idempotent: truncates tables before inserting
 */
import cassandra from 'cassandra-driver';

const CONTACT_POINTS = (process.env.CASSANDRA_CONTACT_POINTS ?? 'localhost').split(',');
const DATACENTER = process.env.CASSANDRA_DATACENTER ?? 'datacenter1';
const KEYSPACE = process.env.CASSANDRA_KEYSPACE ?? 'telecom_telemetry';

const client = new cassandra.Client({
  contactPoints: CONTACT_POINTS,
  localDataCenter: DATACENTER,
  keyspace: KEYSPACE,
});

// ─── Helpers ──────────────────────────────────────────────────────────────

function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function formatMonth(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Device IDs matching seed-mongo.ts
function getDeviceIds(): string[] {
  const DEVICE_TYPES = [
    { prefix: 'TWR', count: 10, region: 'SOU' },
    { prefix: 'RTR', count: 8, region: 'NOR' },
    { prefix: 'SWT', count: 7, region: 'MID' },
    { prefix: 'BST', count: 3, region: 'WES' },
    { prefix: 'FBR', count: 2, region: 'SOU' },
  ];
  const regions = ['SOU', 'NOR', 'MID', 'WES'];
  const ids: string[] = [];
  let idx = 1;
  for (const dt of DEVICE_TYPES) {
    for (let i = 0; i < dt.count; i++) {
      ids.push(`${dt.prefix}-${regions[idx % regions.length]}-${String(idx).padStart(3, '0')}`);
      idx++;
    }
  }
  return ids;
}

function getCustomerIds(): string[] {
  return Array.from({ length: 50 }, (_, i) => `CUST-${String(i + 1).padStart(4, '0')}`);
}

// ─── Seed Functions ──────────────────────────────────────────────────────

async function seedTelemetry(deviceIds: string[]): Promise<number> {
  console.log('Seeding telemetry (this may take a moment)...');
  const now = new Date();
  let count = 0;

  // 30 days of data, one reading per device every 10 minutes (~4320 per device)
  const INTERVAL_MIN = 10;
  const DAYS = 30;
  const readingsPerDevice = (DAYS * 24 * 60) / INTERVAL_MIN;

  const insertQuery = `
    INSERT INTO device_telemetry (device_id, date, timestamp, cpu_percent, memory_percent, bandwidth_mbps, packet_loss_percent, temperature_c)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const deviceId of deviceIds) {
    // Base values for this device (each device has different characteristics)
    const baseCpu = randFloat(15, 40);
    const baseMem = randFloat(30, 60);
    const baseBw = randFloat(100, 500);
    const baseTemp = randFloat(25, 35);

    const queries: { query: string; params: unknown[] }[] = [];

    for (let r = 0; r < readingsPerDevice; r++) {
      const ts = new Date(now.getTime() - (readingsPerDevice - r) * INTERVAL_MIN * 60000);
      const hour = ts.getUTCHours();

      // Simulate daily patterns: higher CPU/bandwidth during peak hours (9-21)
      const peakFactor = hour >= 9 && hour <= 21 ? 1.3 : 0.8;
      // Occasional spikes
      const spike = Math.random() > 0.98 ? randFloat(1.5, 2.5) : 1;

      const cpu = Math.min(
        99,
        randFloat(baseCpu * peakFactor * spike - 5, baseCpu * peakFactor * spike + 5),
      );
      const mem = Math.min(95, randFloat(baseMem - 3, baseMem + 8));
      const bw = Math.max(
        0,
        randFloat(baseBw * peakFactor * spike - 20, baseBw * peakFactor * spike + 20),
      );
      const packetLoss = Math.random() > 0.95 ? randFloat(0.1, 5) : randFloat(0, 0.1);
      const temp = randFloat(baseTemp - 2, baseTemp + (cpu > 80 ? 15 : 5));

      queries.push({
        query: insertQuery,
        params: [deviceId, formatDate(ts), ts, cpu, mem, bw, packetLoss, temp],
      });

      // Batch insert every 50 rows
      if (queries.length >= 50) {
        await Promise.all(queries.map((q) => client.execute(q.query, q.params, { prepare: true })));
        count += queries.length;
        queries.length = 0;
      }
    }

    // Flush remaining
    if (queries.length > 0) {
      await Promise.all(queries.map((q) => client.execute(q.query, q.params, { prepare: true })));
      count += queries.length;
    }

    process.stdout.write(`\r  Telemetry: ${count} readings inserted...`);
  }
  console.log(`\r✓ Seeded ${count} telemetry readings                    `);
  return count;
}

async function seedAlerts(deviceIds: string[]): Promise<number> {
  console.log('Seeding alerts...');
  const SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR', 'INFO'];
  const STATUSES = ['ACTIVE', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'RESOLVED'];
  const ALERT_TITLES: Record<string, string[]> = {
    CRITICAL: [
      'CPU usage exceeded 95%',
      'Device unreachable',
      'Memory exhaustion detected',
      'Link failure',
    ],
    MAJOR: [
      'High packet loss detected',
      'CPU usage above 80%',
      'Bandwidth capacity at 90%',
      'Temperature warning',
    ],
    MINOR: [
      'Elevated latency',
      'Configuration drift detected',
      'Firmware update available',
      'Minor signal degradation',
    ],
    INFO: [
      'Scheduled maintenance window',
      'Device rebooted successfully',
      'Backup completed',
      'Configuration synced',
    ],
  };

  const insertQuery = `
    INSERT INTO alerts_by_device (device_id, month, timestamp, alert_id, severity, status, title, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let count = 0;
  const now = new Date();

  for (let i = 0; i < 500; i++) {
    const deviceId = pick(deviceIds);
    const severity = pick(SEVERITIES);
    const status = pick(STATUSES);
    const titles = ALERT_TITLES[severity] ?? ALERT_TITLES['INFO']!;
    const title = pick(titles);
    const ts = new Date(now.getTime() - randInt(0, 60) * 86400000 - randInt(0, 86400) * 1000);
    const month = formatMonth(ts);

    await client.execute(
      insertQuery,
      [
        deviceId,
        month,
        ts,
        cassandra.types.Uuid.random(),
        severity,
        status,
        title,
        `${title} on device ${deviceId}. Severity: ${severity}. Auto-detected by monitoring system.`,
      ],
      { prepare: true },
    );
    count++;
  }

  console.log(`✓ Seeded ${count} alerts`);
  return count;
}

async function seedCDRs(customerIds: string[]): Promise<number> {
  console.log('Seeding CDRs...');
  const CALL_TYPES = ['VOICE', 'VOICE', 'VOICE', 'VIDEO', 'VOIP'];
  const CALL_STATUSES = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'MISSED', 'DROPPED'];

  const insertQuery = `
    INSERT INTO cdr_by_customer (customer_id, month, timestamp, call_id, call_type, duration_seconds, status, from_number, to_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let count = 0;
  const now = new Date();

  // 3 months of CDRs
  for (const custId of customerIds) {
    const callsPerMonth = randInt(30, 100);

    for (let m = 0; m < 3; m++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const month = formatMonth(monthDate);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

      const queries: { query: string; params: unknown[] }[] = [];

      for (let c = 0; c < callsPerMonth; c++) {
        const day = randInt(1, daysInMonth);
        const ts = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          day,
          randInt(6, 23),
          randInt(0, 59),
        );
        const callType = pick(CALL_TYPES);
        const status = pick(CALL_STATUSES);
        const duration =
          status === 'COMPLETED' ? randInt(10, 3600) : status === 'DROPPED' ? randInt(5, 120) : 0;

        queries.push({
          query: insertQuery,
          params: [
            custId,
            month,
            ts,
            cassandra.types.Uuid.random(),
            callType,
            duration,
            status,
            `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
            `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
          ],
        });

        if (queries.length >= 50) {
          await Promise.all(
            queries.map((q) => client.execute(q.query, q.params, { prepare: true })),
          );
          count += queries.length;
          queries.length = 0;
        }
      }

      if (queries.length > 0) {
        await Promise.all(queries.map((q) => client.execute(q.query, q.params, { prepare: true })));
        count += queries.length;
      }
    }
    process.stdout.write(`\r  CDRs: ${count} records inserted...`);
  }

  console.log(`\r✓ Seeded ${count} CDRs                               `);
  return count;
}

async function seedDailyUsage(customerIds: string[]): Promise<number> {
  console.log('Seeding daily usage...');

  const insertQuery = `
    INSERT INTO usage_by_day (customer_id, month, date, data_mb, voice_minutes, sms_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  let count = 0;
  const now = new Date();

  // 3 months of daily usage
  for (const custId of customerIds) {
    for (let m = 0; m < 3; m++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const month = formatMonth(monthDate);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

      // Only up to today for current month
      const maxDay = m === 0 ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

      const queries: { query: string; params: unknown[] }[] = [];

      for (let d = 1; d <= maxDay; d++) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const factor = isWeekend ? 1.5 : 1;

        queries.push({
          query: insertQuery,
          params: [
            custId,
            month,
            formatDate(date),
            Math.round(randFloat(50, 800) * factor), // data_mb
            randFloat(5, 120) * factor, // voice_minutes
            randInt(0, 50), // sms_count
          ],
        });
      }

      await Promise.all(queries.map((q) => client.execute(q.query, q.params, { prepare: true })));
      count += queries.length;
    }
    process.stdout.write(`\r  Usage: ${count} records inserted...`);
  }

  console.log(`\r✓ Seeded ${count} daily usage records                  `);
  return count;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Connecting to Cassandra...');
  await client.connect();
  console.log('Connected. Seeding...');

  // Truncate tables
  const tables = ['device_telemetry', 'alerts_by_device', 'cdr_by_customer', 'usage_by_day'];
  for (const table of tables) {
    try {
      await client.execute(`TRUNCATE ${table}`);
    } catch {
      console.warn(`  Warning: Could not truncate ${table}`);
    }
  }
  console.log('Truncated existing data.');

  const deviceIds = getDeviceIds();
  const customerIds = getCustomerIds();

  const telemetryCount = await seedTelemetry(deviceIds);
  const alertCount = await seedAlerts(deviceIds);
  const cdrCount = await seedCDRs(customerIds);
  const usageCount = await seedDailyUsage(customerIds);

  console.log('\n🎉 Cassandra seeding complete!');
  console.log(`  Telemetry readings: ${telemetryCount}`);
  console.log(`  Alerts: ${alertCount}`);
  console.log(`  CDRs: ${cdrCount}`);
  console.log(`  Daily usage: ${usageCount}`);

  await client.shutdown();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
