/**
 * Live Telemetry Generator — S-4.3
 * Continuously generates synthetic telemetry for all 30 devices every 10 seconds.
 * Simulates realistic patterns: gradual CPU increases, bandwidth spikes, occasional packet loss.
 * JavaScript (intentionally not TypeScript per PRD).
 *
 * Usage: node scripts/generate-telemetry.js
 */

// @ts-nocheck
const cassandra = require('cassandra-driver');

const CONTACT_POINTS = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost').split(',');
const DATACENTER = process.env.CASSANDRA_DATACENTER || 'datacenter1';
const KEYSPACE = process.env.CASSANDRA_KEYSPACE || 'telecom_telemetry';
const INTERVAL_MS = Number(process.env.TELEMETRY_INTERVAL_MS || 10000);

const client = new cassandra.Client({
  contactPoints: CONTACT_POINTS,
  localDataCenter: DATACENTER,
  keyspace: KEYSPACE,
});

// Generate device IDs matching seed-mongo.ts
function getDeviceIds() {
  const DEVICE_TYPES = [
    { prefix: 'TWR', count: 10 },
    { prefix: 'RTR', count: 8 },
    { prefix: 'SWT', count: 7 },
    { prefix: 'BST', count: 3 },
    { prefix: 'FBR', count: 2 },
  ];
  const regions = ['SOU', 'NOR', 'MID', 'WES'];
  const ids = [];
  let idx = 1;
  for (const dt of DEVICE_TYPES) {
    for (let i = 0; i < dt.count; i++) {
      ids.push(`${dt.prefix}-${regions[idx % regions.length]}-${String(idx).padStart(3, '0')}`);
      idx++;
    }
  }
  return ids;
}

function randFloat(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function formatDate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

const deviceIds = getDeviceIds();

// Each device has persistent base characteristics
const deviceState = {};
for (const id of deviceIds) {
  deviceState[id] = {
    baseCpu: randFloat(20, 45),
    baseMem: randFloat(35, 60),
    baseBw: randFloat(100, 500),
    baseTemp: randFloat(26, 34),
    trend: 0, // gradual trend for CPU
  };
}

const insertQuery = `
  INSERT INTO device_telemetry (device_id, date, timestamp, cpu_percent, memory_percent, bandwidth_mbps, packet_loss_percent, temperature_c)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

let tickCount = 0;

async function generateTick() {
  const now = new Date();
  const hour = now.getUTCHours();
  const peakFactor = hour >= 9 && hour <= 21 ? 1.3 : 0.8;
  const dateStr = formatDate(now);

  const queries = deviceIds.map((deviceId) => {
    const state = deviceState[deviceId];

    // Gradual CPU trend (oscillates over time)
    state.trend = Math.sin(tickCount / 30) * 10;

    // Occasional spike
    const spike = Math.random() > 0.97 ? randFloat(1.5, 2.2) : 1;

    const cpu = Math.min(
      99,
      Math.max(
        1,
        randFloat(
          (state.baseCpu + state.trend) * peakFactor * spike - 3,
          (state.baseCpu + state.trend) * peakFactor * spike + 3,
        ),
      ),
    );
    const mem = Math.min(95, Math.max(5, randFloat(state.baseMem - 2, state.baseMem + 5)));
    const bw = Math.max(
      0,
      randFloat(state.baseBw * peakFactor * spike - 15, state.baseBw * peakFactor * spike + 15),
    );
    const packetLoss = Math.random() > 0.96 ? randFloat(0.5, 8) : randFloat(0, 0.05);
    const temp = randFloat(state.baseTemp - 1, state.baseTemp + (cpu > 80 ? 12 : 3));

    return client.execute(insertQuery, [deviceId, dateStr, now, cpu, mem, bw, packetLoss, temp], {
      prepare: true,
    });
  });

  await Promise.all(queries);
  tickCount++;

  const time = now.toISOString().substring(11, 19);
  process.stdout.write(`\r[${time}] Tick ${tickCount}: ${deviceIds.length} readings written`);
}

async function main() {
  console.log('Connecting to Cassandra...');
  await client.connect();
  console.log(
    `Connected. Generating telemetry every ${INTERVAL_MS / 1000}s for ${deviceIds.length} devices.`,
  );
  console.log('Press Ctrl+C to stop.\n');

  // Initial tick
  await generateTick();

  // Repeat
  setInterval(async () => {
    try {
      await generateTick();
    } catch (err) {
      console.error('\nError generating telemetry:', err.message);
    }
  }, INTERVAL_MS);
}

main().catch((err) => {
  console.error('Failed to start telemetry generator:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await client.shutdown();
  process.exit(0);
});
