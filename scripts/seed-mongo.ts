/**
 * MongoDB Seed Script — S-4.1
 * Populates MongoDB with demo data: customers, plans, tickets, invoices, payments, devices
 * Idempotent: drops and recreates all data
 */
import mongoose, { Schema, Types } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/telecom_nexus';

// ─── Schemas (inline so seed script is self-contained) ────────────────────

const CustomerSchema = new Schema(
  {
    customerId: { type: String, unique: true },
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: { street: String, city: String, state: String, zip: String, country: String },
    activePlanId: Schema.Types.ObjectId,
    accountStatus: { type: String, default: 'ACTIVE' },
    autoPayEnabled: { type: Boolean, default: false },
    defaultPaymentMethod: String,
  },
  { timestamps: true },
);

const PlanSchema = new Schema({
  planCode: { type: String, unique: true },
  name: String,
  description: String,
  monthlyPrice: Number,
  currency: { type: String, default: 'USD' },
  features: {
    dataLimitGB: Number,
    voiceMinutes: Number,
    smsCount: Number,
    hotspotGB: Number,
    internationalRoaming: Boolean,
    fiveGAccess: Boolean,
  },
  isActive: { type: Boolean, default: true },
  tier: String,
});

const TicketSchema = new Schema(
  {
    ticketId: { type: String, unique: true },
    customerId: String,
    category: String,
    subject: String,
    status: String,
    priority: String,
    messages: [{ sender: String, senderName: String, content: String, timestamp: Date }],
  },
  { timestamps: true },
);

const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, unique: true },
  customerId: String,
  billingPeriod: { start: Date, end: Date },
  lineItems: [{ description: String, category: String, amount: Number }],
  totalAmount: Number,
  currency: { type: String, default: 'USD' },
  status: String,
  dueDate: Date,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const PaymentSchema = new Schema({
  paymentId: { type: String, unique: true },
  customerId: String,
  invoiceId: Schema.Types.ObjectId,
  amount: Number,
  method: String,
  status: String,
  transactionRef: String,
  processedAt: { type: Date, default: Date.now },
});

const DeviceSchema = new Schema({
  deviceId: { type: String, unique: true },
  type: String,
  name: String,
  location: { lat: Number, lng: Number, address: String, region: String },
  status: String,
  connectedDeviceIds: [String],
  configXml: String,
  metadata: { manufacturer: String, model: String, firmwareVersion: String, installDate: Date },
});

// ─── Helpers ──────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function padId(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

// ─── Reference Data ──────────────────────────────────────────────────────

const FIRST_NAMES = [
  'James',
  'Maria',
  'David',
  'Sarah',
  'Wei',
  'Priya',
  'Michael',
  'Aisha',
  'Carlos',
  'Yuki',
  'Robert',
  'Fatima',
  'William',
  'Mei',
  'Ahmed',
  'Elena',
  'Raj',
  'Isabella',
  'John',
  'Nkechi',
  'Thomas',
  'Sophia',
  'Daniel',
  'Amara',
  'Mohammed',
  'Grace',
  'Alejandro',
  'Hana',
  'Kevin',
  'Olga',
  'Brian',
  'Chiara',
  'Marcus',
  'Lin',
  'Andre',
  'Suki',
  'Paulo',
  'Ingrid',
  'Omar',
  'Keiko',
  'Victor',
  'Aditi',
  'Samuel',
  'Zara',
  'Diego',
  'Mina',
  'Nathan',
  'Leila',
  'Eric',
  'Anya',
];

const LAST_NAMES = [
  'Johnson',
  'Patel',
  'Chen',
  'Rodriguez',
  'Smith',
  'Kim',
  'Williams',
  'Singh',
  'Brown',
  'Tanaka',
  'Garcia',
  'Okafor',
  'Martinez',
  'Lee',
  'Wilson',
  'Nguyen',
  'Anderson',
  'Ali',
  'Thomas',
  'Yamamoto',
  'Jackson',
  'Kumar',
  'White',
  'Hassan',
  'Harris',
  'Suzuki',
  'Clark',
  'Nakamura',
  'Lewis',
  'Das',
  'Walker',
  'Petrov',
  'Hall',
  'Zhang',
  'Young',
  'Sato',
  'King',
  'Johansson',
  'Wright',
  'Ito',
  'Lopez',
  'Sharma',
  'Hill',
  'Ibrahim',
  'Green',
  'Park',
  'Adams',
  'Costa',
  'Baker',
  'Müller',
];

const CITIES = [
  { city: 'Dallas', state: 'TX', zip: '75201', region: 'South' },
  { city: 'Austin', state: 'TX', zip: '73301', region: 'South' },
  { city: 'New York', state: 'NY', zip: '10001', region: 'Northeast' },
  { city: 'Chicago', state: 'IL', zip: '60601', region: 'Midwest' },
  { city: 'San Francisco', state: 'CA', zip: '94102', region: 'West' },
  { city: 'Seattle', state: 'WA', zip: '98101', region: 'West' },
  { city: 'Miami', state: 'FL', zip: '33101', region: 'South' },
  { city: 'Denver', state: 'CO', zip: '80201', region: 'West' },
  { city: 'Boston', state: 'MA', zip: '02101', region: 'Northeast' },
  { city: 'Atlanta', state: 'GA', zip: '30301', region: 'South' },
  { city: 'Portland', state: 'OR', zip: '97201', region: 'West' },
  { city: 'Phoenix', state: 'AZ', zip: '85001', region: 'West' },
];

const STREETS = [
  '123 Main St',
  '456 Oak Ave',
  '789 Elm Blvd',
  '101 Pine Rd',
  '202 Maple Ln',
  '303 Cedar Dr',
  '404 Birch Way',
  '505 Walnut Ct',
  '606 Spruce Pl',
  '707 Ash St',
];

const PLANS = [
  {
    planCode: 'PLAN-BASIC-TALK',
    name: 'Basic Talk',
    tier: 'BASIC',
    monthlyPrice: 24.99,
    description: 'Essential voice and text plan for light users',
    features: {
      dataLimitGB: 2,
      voiceMinutes: 500,
      smsCount: 500,
      hotspotGB: 0,
      internationalRoaming: false,
      fiveGAccess: false,
    },
  },
  {
    planCode: 'PLAN-BASIC-CONNECT',
    name: 'Basic Connect',
    tier: 'BASIC',
    monthlyPrice: 29.99,
    description: 'Basic data connectivity with essential features',
    features: {
      dataLimitGB: 5,
      voiceMinutes: 1000,
      smsCount: 1000,
      hotspotGB: 1,
      internationalRoaming: false,
      fiveGAccess: false,
    },
  },
  {
    planCode: 'PLAN-STD-PLUS',
    name: 'Standard Plus',
    tier: 'STANDARD',
    monthlyPrice: 49.99,
    description: 'Balanced plan with generous data and features',
    features: {
      dataLimitGB: 25,
      voiceMinutes: null,
      smsCount: null,
      hotspotGB: 5,
      internationalRoaming: false,
      fiveGAccess: false,
    },
  },
  {
    planCode: 'PLAN-STD-STREAM',
    name: 'Standard Stream',
    tier: 'STANDARD',
    monthlyPrice: 54.99,
    description: 'Optimized for streaming with HD video',
    features: {
      dataLimitGB: 50,
      voiceMinutes: null,
      smsCount: null,
      hotspotGB: 10,
      internationalRoaming: false,
      fiveGAccess: true,
    },
  },
  {
    planCode: 'PLAN-PREM-UNLIM',
    name: 'Premium Unlimited',
    tier: 'PREMIUM',
    monthlyPrice: 79.99,
    description: 'Unlimited everything with 5G and international roaming',
    features: {
      dataLimitGB: null,
      voiceMinutes: null,
      smsCount: null,
      hotspotGB: 25,
      internationalRoaming: true,
      fiveGAccess: true,
    },
  },
  {
    planCode: 'PLAN-PREM-FAMILY',
    name: 'Premium Family',
    tier: 'PREMIUM',
    monthlyPrice: 89.99,
    description: 'Premium plan designed for families with shared hotspot',
    features: {
      dataLimitGB: null,
      voiceMinutes: null,
      smsCount: null,
      hotspotGB: 50,
      internationalRoaming: true,
      fiveGAccess: true,
    },
  },
  {
    planCode: 'PLAN-ENT-PRO',
    name: 'Enterprise Pro',
    tier: 'ENTERPRISE',
    monthlyPrice: 149.99,
    description: 'Professional enterprise plan with SLA guarantees',
    features: {
      dataLimitGB: null,
      voiceMinutes: null,
      smsCount: null,
      hotspotGB: 100,
      internationalRoaming: true,
      fiveGAccess: true,
    },
  },
  {
    planCode: 'PLAN-ENT-GLOBAL',
    name: 'Enterprise Global',
    tier: 'ENTERPRISE',
    monthlyPrice: 199.99,
    description: 'Global enterprise coverage with priority support',
    features: {
      dataLimitGB: null,
      voiceMinutes: null,
      smsCount: null,
      hotspotGB: 200,
      internationalRoaming: true,
      fiveGAccess: true,
    },
  },
];

const DEVICE_TYPES = [
  {
    prefix: 'TWR',
    type: 'TOWER',
    count: 10,
    manufacturers: ['Ericsson', 'Nokia', 'Huawei'],
    models: ['RBS 6601', 'AirScale mMIMO', 'AAU5613'],
  },
  {
    prefix: 'RTR',
    type: 'ROUTER',
    count: 8,
    manufacturers: ['Cisco', 'Juniper', 'Arista'],
    models: ['ASR 9000', 'MX480', 'DCS-7280'],
  },
  {
    prefix: 'SWT',
    type: 'SWITCH',
    count: 7,
    manufacturers: ['Cisco', 'Arista', 'Dell'],
    models: ['Nexus 9300', 'DCS-7050', 'S5248'],
  },
  {
    prefix: 'BST',
    type: 'BASE_STATION',
    count: 3,
    manufacturers: ['Samsung', 'Nokia'],
    models: ['Compact Macro', 'AirScale BTS'],
  },
  {
    prefix: 'FBR',
    type: 'FIBER_NODE',
    count: 2,
    manufacturers: ['Ciena', 'Infinera'],
    models: ['6500 Packet', 'GX G42'],
  },
];

const REGIONS = ['South', 'Northeast', 'Midwest', 'West'];
const TICKET_CATEGORIES = ['BILLING', 'NETWORK', 'DEVICE', 'PLAN', 'OTHER'] as const;
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const PAYMENT_METHODS = ['CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET'] as const;
const ACCOUNT_STATUSES = [
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'SUSPENDED',
  'PENDING',
] as const; // weighted toward ACTIVE

const TICKET_SUBJECTS: Record<string, string[]> = {
  BILLING: [
    'Incorrect charge on my bill',
    'Need payment extension',
    'Dispute overage fees',
    'Refund request for double charge',
    'Questions about line item',
  ],
  NETWORK: [
    'Slow internet speeds',
    'No coverage in my area',
    'Dropped calls frequently',
    'Cannot connect to 5G',
    'Network outage in my neighborhood',
  ],
  DEVICE: [
    'Phone not receiving calls',
    'SIM card not recognized',
    'Device overheating',
    'Cannot activate new device',
    'Screen replacement inquiry',
  ],
  PLAN: [
    'Want to upgrade my plan',
    'Need to add international roaming',
    'Family plan inquiry',
    'Data usage not tracking correctly',
    'Plan comparison help',
  ],
  OTHER: [
    'Account verification issue',
    'Need to update billing address',
    'Transfer of ownership',
    'Request for usage report',
    'General inquiry',
  ],
};

const AGENT_RESPONSES = [
  "Thank you for reaching out. I've reviewed your account and I can help you with this.",
  'I understand your concern. Let me look into this right away for you.',
  "I've escalated this to our specialized team. You should receive an update within 24 hours.",
  "After investigating, I've found the root cause of the issue. Here's what we can do...",
  "I've applied the necessary changes to your account. Please allow 1-2 business days for it to take effect.",
  'Great news! The issue has been resolved. Is there anything else I can help you with?',
];

// ─── Seed Functions ──────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Seeding...');

  const db = mongoose.connection.db!;

  // Drop existing collections
  const collections = ['customers', 'plans', 'tickets', 'invoices', 'payments', 'devices'];
  for (const name of collections) {
    try {
      await db.dropCollection(name);
    } catch {
      /* may not exist */
    }
  }
  console.log('Dropped existing collections.');

  // Register models
  const Plan = mongoose.model('Plan', PlanSchema);
  const Customer = mongoose.model('Customer', CustomerSchema);
  const Ticket = mongoose.model('Ticket', TicketSchema);
  const Invoice = mongoose.model('Invoice', InvoiceSchema);
  const Payment = mongoose.model('Payment', PaymentSchema);
  const Device = mongoose.model('Device', DeviceSchema);

  // 1. Seed Plans (8)
  const plans = await Plan.insertMany(
    PLANS.map((p) => ({ ...p, currency: 'USD', isActive: true })),
  );
  console.log(`✓ Seeded ${plans.length} plans`);

  // 2. Seed Customers (50)
  const customers = [];
  for (let i = 1; i <= 50; i++) {
    const loc = pick(CITIES);
    const plan = pick(plans);
    customers.push({
      customerId: `CUST-${padId(i, 4)}`,
      firstName: FIRST_NAMES[i - 1] ?? pick(FIRST_NAMES),
      lastName: LAST_NAMES[i - 1] ?? pick(LAST_NAMES),
      email: `customer${i}@example.com`,
      phone: `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
      address: {
        street: pick(STREETS),
        city: loc.city,
        state: loc.state,
        zip: loc.zip,
        country: 'US',
      },
      activePlanId: plan._id,
      accountStatus: pick(ACCOUNT_STATUSES),
      autoPayEnabled: Math.random() > 0.4,
      defaultPaymentMethod: pick(PAYMENT_METHODS),
    });
  }
  const insertedCustomers = await Customer.insertMany(customers);
  console.log(`✓ Seeded ${insertedCustomers.length} customers`);

  // 3. Seed Tickets (200)
  const tickets = [];
  for (let i = 1; i <= 200; i++) {
    const cust = pick(insertedCustomers);
    const category = pick([...TICKET_CATEGORIES]);
    const status = pick([...TICKET_STATUSES]);
    const subjects = TICKET_SUBJECTS[category] ?? TICKET_SUBJECTS['OTHER']!;
    const subject = pick(subjects);

    const messages = [
      {
        sender: 'CUSTOMER',
        senderName: `${cust.customerId}`,
        content: `${subject}. I need help resolving this issue.`,
        timestamp: new Date(Date.now() - randInt(1, 30) * 86400000),
      },
    ];
    // Add agent responses based on status
    if (status !== 'OPEN') {
      messages.push({
        sender: 'AGENT',
        senderName: 'Support Agent',
        content: pick(AGENT_RESPONSES),
        timestamp: new Date(messages[0]!.timestamp.getTime() + randInt(1, 12) * 3600000),
      });
    }
    if (status === 'RESOLVED' || status === 'CLOSED') {
      messages.push({
        sender: 'AGENT',
        senderName: 'Support Agent',
        content: 'This issue has been resolved. Closing the ticket.',
        timestamp: new Date(
          messages[messages.length - 1]!.timestamp.getTime() + randInt(1, 24) * 3600000,
        ),
      });
    }

    tickets.push({
      ticketId: `TKT-${padId(i, 4)}`,
      customerId: cust.customerId as string,
      category,
      subject,
      status,
      priority: pick([...TICKET_PRIORITIES]),
      messages,
    });
  }
  await Ticket.insertMany(tickets);
  console.log(`✓ Seeded ${tickets.length} tickets`);

  // 4. Seed Invoices (300) — ~6 per customer over 6 months
  const invoices = [];
  const now = new Date();
  let invoiceNum = 1;
  for (const cust of insertedCustomers) {
    const plan = plans.find((p) => p._id.equals(cust.activePlanId as Types.ObjectId));
    const price = plan?.monthlyPrice ?? 49.99;

    for (let m = 0; m < 6; m++) {
      const start = new Date(now.getFullYear(), now.getMonth() - m - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - m, 0);
      const dueDate = new Date(end.getTime() + 15 * 86400000);
      const isPaid = m > 0 || Math.random() > 0.3;
      const overage = Math.random() > 0.7 ? Math.round(Math.random() * 20 * 100) / 100 : 0;
      const tax = Math.round(price * 0.08 * 100) / 100;
      const total = Math.round((price + overage + tax) * 100) / 100;

      invoices.push({
        invoiceNumber: `INV-${padId(invoiceNum++, 6)}`,
        customerId: cust.customerId as string,
        billingPeriod: { start, end },
        lineItems: [
          {
            description: `${plan?.name ?? 'Plan'} — Monthly`,
            category: 'BASE_PLAN',
            amount: price,
          },
          ...(overage > 0
            ? [{ description: 'Data overage', category: 'OVERAGE', amount: overage }]
            : []),
          { description: 'State & local tax', category: 'TAX', amount: tax },
        ],
        totalAmount: total,
        status: isPaid ? 'PAID' : dueDate < now ? 'OVERDUE' : 'DUE',
        dueDate,
        paidAt: isPaid ? new Date(dueDate.getTime() - randInt(1, 10) * 86400000) : undefined,
      });
    }
  }
  await Invoice.insertMany(invoices);
  console.log(`✓ Seeded ${invoices.length} invoices`);

  // 5. Seed Payments (250) — for paid invoices
  const paidInvoices = await Invoice.find({ status: 'PAID' }).limit(250);
  const payments = paidInvoices.map((inv, i) => ({
    paymentId: `PAY-${padId(i + 1, 6)}`,
    customerId: inv.customerId as string,
    invoiceId: inv._id,
    amount: inv.totalAmount as number,
    method: pick([...PAYMENT_METHODS]),
    status: Math.random() > 0.05 ? 'SUCCESS' : pick(['FAILED', 'REFUNDED']),
    transactionRef: `TXN-${Date.now()}-${randInt(1000, 9999)}-${i}`,
    processedAt: inv.paidAt ?? new Date(),
  }));
  await Payment.insertMany(payments);
  console.log(`✓ Seeded ${payments.length} payments`);

  // 6. Seed Network Devices (30)
  const devices = [];
  let deviceIdx = 1;
  const deviceIds: string[] = [];

  for (const dt of DEVICE_TYPES) {
    for (let i = 0; i < dt.count; i++) {
      const region = REGIONS[deviceIdx % REGIONS.length]!;
      const regionCities = CITIES.filter((c) => c.region === region);
      const loc = regionCities.length > 0 ? pick(regionCities) : pick(CITIES);
      const deviceId = `${dt.prefix}-${region.substring(0, 3).toUpperCase()}-${padId(deviceIdx, 3)}`;
      deviceIds.push(deviceId);

      devices.push({
        deviceId,
        type: dt.type,
        name: `${dt.type.replace('_', ' ')} ${region} #${i + 1}`,
        location: {
          lat: 25 + Math.random() * 23,
          lng: -122 + Math.random() * 50,
          address: `${pick(STREETS)}, ${loc.city}, ${loc.state}`,
          region,
        },
        status: pick([
          'OPERATIONAL',
          'OPERATIONAL',
          'OPERATIONAL',
          'OPERATIONAL',
          'DEGRADED',
          'MAINTENANCE',
        ]),
        connectedDeviceIds: [], // will populate after
        configXml: '',
        metadata: {
          manufacturer: pick(dt.manufacturers),
          model: pick(dt.models),
          firmwareVersion: `${randInt(1, 5)}.${randInt(0, 9)}.${randInt(0, 99)}`,
          installDate: new Date(Date.now() - randInt(180, 1800) * 86400000),
        },
      });
      deviceIdx++;
    }
  }

  // Create adjacency graph (each device connects to 1-3 others)
  for (const device of devices) {
    const others = deviceIds.filter((id) => id !== device.deviceId);
    const connCount = randInt(1, 3);
    device.connectedDeviceIds = [];
    for (let c = 0; c < connCount && others.length > 0; c++) {
      const idx = randInt(0, others.length - 1);
      device.connectedDeviceIds.push(others[idx]!);
      others.splice(idx, 1);
    }
  }

  await Device.insertMany(devices);
  console.log(`✓ Seeded ${devices.length} network devices`);

  // Recreate indexes
  await db.collection('customers').createIndex({ customerId: 1 }, { unique: true });
  await db.collection('plans').createIndex({ planCode: 1 }, { unique: true });
  await db.collection('tickets').createIndex({ ticketId: 1 }, { unique: true });
  await db.collection('invoices').createIndex({ invoiceNumber: 1 }, { unique: true });
  await db.collection('payments').createIndex({ paymentId: 1 }, { unique: true });
  await db.collection('devices').createIndex({ deviceId: 1 }, { unique: true });
  console.log('✓ Recreated indexes');

  console.log('\n🎉 MongoDB seeding complete!');
  console.log(`  Plans: ${plans.length}`);
  console.log(`  Customers: ${insertedCustomers.length}`);
  console.log(`  Tickets: ${tickets.length}`);
  console.log(`  Invoices: ${invoices.length}`);
  console.log(`  Payments: ${payments.length}`);
  console.log(`  Devices: ${devices.length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
