# Product Requirements Document (PRD)

## TelecomNexus — Unified Telecom Customer & Network Operations Platform

---

| Field              | Detail                                      |
|--------------------|---------------------------------------------|
| **Document Version** | 1.0                                        |
| **Date**             | February 11, 2026                          |
| **Author**           | Venkata                                    |
| **Status**           | Draft                                      |
| **Project Codename** | TelecomNexus                               |

---

## 1. Executive Summary

TelecomNexus is a full-stack, production-grade demo platform that simulates a modern telecommunications company's digital ecosystem. The platform consists of three independently deployable micro frontends — a **Customer Self-Service Portal**, a **Network Operations Center (NOC) Dashboard**, and a **Billing & Analytics Console** — unified under a single shell application. The backend is powered by a GraphQL API federation layer sitting atop Node.js microservices, with MongoDB handling transactional customer and billing data and Apache Cassandra managing high-volume, time-series network telemetry data.

This project demonstrates end-to-end mastery of modern web development, distributed data architecture, and enterprise-grade frontend composition patterns — all within a realistic telecom domain.

---

## 2. Goals & Objectives

### 2.1 Primary Goals

- Demonstrate proficiency across the entire specified technology stack in a single, cohesive, real-world-inspired application.
- Showcase micro frontend architecture with independently developed, tested, and deployed frontend modules.
- Illustrate the correct use of polyglot NoSQL persistence — MongoDB for document-oriented data and Cassandra for high-write, time-series telemetry.
- Present a clean, responsive, accessible UI built with Bootstrap 5 and React, rendered via Next.js with SSR/SSG where appropriate.

### 2.2 Success Criteria

| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | All listed technologies are meaningfully integrated | Each technology serves a clear, justified architectural role (not shoehorned) |
| 2 | Micro frontends operate independently | Each MFE can be started, built, and tested in isolation |
| 3 | End-to-end data flow works | User action in the UI → GraphQL mutation → service layer → database → reflected in UI |
| 4 | Responsive design | All views render correctly on mobile (375px), tablet (768px), and desktop (1440px) |
| 5 | Type safety | Zero `any` types in production code; full TypeScript strict mode |
| 6 | Demo-ready | A seeded database and scripted walkthrough allow a 15-minute live demo |

---

## 3. Technology Stack & Version Matrix

### 3.1 Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | 19.x | UI component library across all micro frontends |
| **Next.js** | 15.x (App Router) | Framework for each micro frontend; provides SSR, SSG, API routes, and routing |
| **TypeScript** | 5.7.x | Language for all frontend and backend code; strict mode enforced |
| **Bootstrap** | 5.3.x | Responsive grid, utility classes, and base component styling |
| **React-Bootstrap** | 2.10.x | Bootstrap components as React components |
| **Module Federation** | via `@module-federation/nextjs-mf` 8.x | Micro frontend composition; runtime module sharing between Next.js apps |
| **Apollo Client** | 3.12.x | GraphQL client for data fetching, caching, and state management |
| **HTML5** | — | Semantic markup, `<canvas>` for network topology, `<video>` for help center |
| **XML** | — | Configuration manifests, RSS feed for network alerts, SVG markup for icons |

### 3.2 Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js** | 22.x LTS | Runtime for all backend services |
| **JavaScript (ESM)** | ES2024 | Utility scripts, seed scripts, and build tooling |
| **TypeScript** | 5.7.x | Primary language for all service code |
| **Apollo Server** | 4.x | GraphQL server for each domain subgraph |
| **Apollo Gateway / Router** | 2.x (Gateway) | GraphQL federation gateway composing subgraphs |
| **Express.js** | 5.x | HTTP server underpinning Apollo Server and REST health/webhook endpoints |
| **GraphQL** | 16.x (spec: Oct 2021) | API query language; schema-first design with federation directives |

### 3.3 Data Layer

| Technology | Version | Role |
|---|---|---|
| **MongoDB** | 8.x (via Docker) | Document store for customers, plans, billing, tickets |
| **Mongoose** | 8.x | ODM for MongoDB; schema validation and middleware |
| **Apache Cassandra** | 5.x (via Docker) | Wide-column store for network telemetry, CDR (Call Detail Records), event logs |
| **cassandra-driver** | 4.7.x | Node.js driver for Cassandra |

### 3.4 DevOps & Tooling

| Technology | Version | Role |
|---|---|---|
| **Docker & Docker Compose** | Latest | Containerization of all services and databases |
| **Turborepo** | 2.x | Monorepo build orchestration |
| **ESLint** | 9.x (flat config) | Linting |
| **Prettier** | 3.x | Code formatting |
| **Vitest** | 2.x | Unit and integration testing |
| **Playwright** | 1.49.x | End-to-end testing |
| **GitHub Actions** | — | CI/CD pipeline |

---

## 4. Architecture Overview

### 4.1 High-Level Architecture Diagram (Textual)

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │  MFE 1:      │  │  MFE 2:          │  │  MFE 3:           │  │
│  │  Customer     │  │  NOC Dashboard   │  │  Billing &        │  │
│  │  Portal       │  │                  │  │  Analytics         │  │
│  │  (Next.js)    │  │  (Next.js)       │  │  (Next.js)        │  │
│  └──────┬───────┘  └────────┬─────────┘  └─────────┬─────────┘  │
│         │                   │                       │            │
│  ┌──────┴───────────────────┴───────────────────────┴─────────┐  │
│  │              Shell Application (Next.js Host)               │  │
│  │         Module Federation Runtime · Shared Layout           │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │ GraphQL (HTTPS)
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Apollo Gateway (Federation)                      │
│                    Port 4000 · Node.js / TS                        │
└──────┬─────────────────────┬──────────────────────┬────────────────┘
       │                     │                      │
       ▼                     ▼                      ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Customer     │   │ Network          │   │ Billing          │
│ Subgraph     │   │ Subgraph         │   │ Subgraph         │
│ Port 4001    │   │ Port 4002        │   │ Port 4003        │
│ Apollo 4     │   │ Apollo 4         │   │ Apollo 4         │
└──────┬───────┘   └────────┬─────────┘   └────────┬─────────┘
       │                    │                       │
       ▼                    ▼                       ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  MongoDB     │   │   Cassandra      │   │   MongoDB        │
│  (customers, │   │   (telemetry,    │   │   (invoices,     │
│   plans,     │   │    CDRs,         │   │    payments,     │
│   tickets)   │   │    events)       │   │    usage)        │
└──────────────┘   └──────────────────┘   └──────────────────┘
```

### 4.2 Micro Frontend Architecture

The application follows a **host-remote Module Federation** pattern.

**Shell (Host) Application** — `apps/shell`
- Owns the global layout: top navigation bar, sidebar, footer.
- Handles authentication context (simulated JWT).
- Dynamically loads remote MFE modules at runtime via Module Federation.
- Provides shared dependencies (React, React-DOM, Apollo Client, Bootstrap CSS) to avoid duplication.

**Remote MFE 1 — Customer Portal** — `apps/customer-portal`
- Exposes: `./CustomerApp` (root component), `./AccountOverview`, `./PlanSelector`, `./SupportTickets`.
- Can run standalone on `localhost:3001` for independent development.

**Remote MFE 2 — NOC Dashboard** — `apps/noc-dashboard`
- Exposes: `./NOCApp`, `./NetworkTopology`, `./AlertsFeed`, `./TelemetryCharts`.
- Can run standalone on `localhost:3002`.

**Remote MFE 3 — Billing Console** — `apps/billing-console`
- Exposes: `./BillingApp`, `./InvoiceList`, `./UsageBreakdown`, `./PaymentHistory`.
- Can run standalone on `localhost:3003`.

### 4.3 Monorepo Structure

```
telecom-nexus/
├── apps/
│   ├── shell/                    # Host Next.js app
│   ├── customer-portal/          # Remote MFE 1
│   ├── noc-dashboard/            # Remote MFE 2
│   ├── billing-console/          # Remote MFE 3
│   ├── gateway/                  # Apollo Gateway
│   └── services/
│       ├── customer-service/     # Customer subgraph
│       ├── network-service/      # Network subgraph
│       └── billing-service/      # Billing subgraph
├── packages/
│   ├── ui/                       # Shared React + Bootstrap component library
│   ├── graphql-schema/           # Shared types, fragments, operations
│   ├── config/                   # Shared ESLint, TS, Prettier configs
│   ├── xml-utils/                # XML parsing/generation utilities
│   └── types/                    # Shared TypeScript interfaces & enums
├── docker/
│   ├── docker-compose.yml
│   ├── mongo-init/
│   └── cassandra-init/
├── scripts/
│   ├── seed-mongo.ts
│   ├── seed-cassandra.ts
│   └── generate-telemetry.js     # JavaScript utility script
├── turbo.json
├── package.json
└── tsconfig.base.json
```

---

## 5. Feature Requirements

### 5.1 MFE 1 — Customer Self-Service Portal

#### 5.1.1 Account Dashboard

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| CP-01 | Display customer profile (name, phone numbers, email, address) fetched via GraphQL query | Apollo Client `useQuery`, MongoDB |
| CP-02 | Show active plan details with data/voice/SMS quotas and current usage as progress bars | React-Bootstrap `ProgressBar`, GraphQL fragment composition |
| CP-03 | Render account status badge (Active, Suspended, Pending) with color coding | Bootstrap badges, TypeScript union types |
| CP-04 | SSR the initial account page for fast LCP (Largest Contentful Paint) | Next.js `generateMetadata`, server components |

#### 5.1.2 Plan Management

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| CP-05 | List all available plans in a responsive card grid (Bootstrap grid) | `Row`, `Col`, `Card` from React-Bootstrap |
| CP-06 | Allow plan comparison: user selects up to 3 plans → side-by-side feature table | HTML5 `<table>`, TypeScript generics for plan comparison logic |
| CP-07 | "Change Plan" flow: select plan → confirm → GraphQL mutation → optimistic UI update | Apollo Client `useMutation` with `optimisticResponse` |
| CP-08 | Plan data sourced from MongoDB `plans` collection; cached via Apollo InMemoryCache | Cache normalization by plan ID |

#### 5.1.3 Support Ticket System

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| CP-09 | Create new support ticket with category dropdown, description textarea, and file upload placeholder | React-Bootstrap `Form`, HTML5 `<input type="file">` |
| CP-10 | List existing tickets with status filters (Open, In Progress, Resolved, Closed) | GraphQL query with `where` filter argument |
| CP-11 | Ticket detail view with conversation thread (customer messages + agent responses) | Nested GraphQL types, MongoDB embedded documents |
| CP-12 | Real-time ticket status updates via GraphQL subscriptions (WebSocket) | `graphql-ws`, Apollo Client `useSubscription` |

### 5.2 MFE 2 — Network Operations Center Dashboard

#### 5.2.1 Network Topology Viewer

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| NOC-01 | Render an interactive network topology map showing towers, switches, and routers as nodes | HTML5 `<canvas>` or `<svg>`, D3.js optional |
| NOC-02 | Nodes are color-coded by health status (green/yellow/red) | TypeScript enum `NodeHealth`, XML-based SVG icons |
| NOC-03 | Click a node to open a detail panel with device metadata | GraphQL query by `deviceId`, Bootstrap `Offcanvas` component |
| NOC-04 | Topology data stored in MongoDB (`devices` collection with adjacency references) | Mongoose population for graph traversal |

#### 5.2.2 Live Telemetry Dashboard

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| NOC-05 | Display real-time charts for: CPU load, memory utilization, bandwidth throughput, packet loss | Recharts or Chart.js, data from Cassandra |
| NOC-06 | Time-range selector: Last 1h, 6h, 24h, 7d | GraphQL query with `timeRange` argument, Cassandra time-range partition scan |
| NOC-07 | Auto-refresh every 10 seconds with visual countdown indicator | `setInterval` + Apollo `pollInterval`, Bootstrap `Spinner` |
| NOC-08 | Telemetry data modeled in Cassandra with partition key `(device_id, date)` and clustering key `timestamp` | Optimized for time-series reads; demonstrates Cassandra data modeling |

#### 5.2.3 Alerts & Incidents

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| NOC-09 | Real-time alerts feed showing network incidents (severity: Critical, Major, Minor, Info) | GraphQL subscriptions, Bootstrap `Alert` variants |
| NOC-10 | Alert acknowledgment workflow: Acknowledge → Investigate → Resolve | GraphQL mutations updating MongoDB status |
| NOC-11 | Alerts exportable as XML feed (RSS 2.0 format) for integration with external monitoring tools | Node.js XML generation using `xmlbuilder2` |
| NOC-12 | Alert history searchable by device, severity, and date range | Cassandra `alerts_by_device` table, GraphQL filtering |

### 5.3 MFE 3 — Billing & Analytics Console

#### 5.3.1 Invoice Management

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| BIL-01 | List invoices with month, amount, status (Paid, Due, Overdue) in a sortable table | React-Bootstrap `Table`, TypeScript sorting utilities |
| BIL-02 | Invoice detail view showing line items: base plan, add-ons, taxes, discounts | Nested GraphQL type `Invoice → LineItem[]` |
| BIL-03 | "Pay Now" button triggers a simulated payment GraphQL mutation | Mutation with idempotency key to prevent double-pay |
| BIL-04 | Invoice data stored in MongoDB `invoices` collection with TTL index for archival | Mongoose TTL index, demonstrates MongoDB indexing |

#### 5.3.2 Usage Analytics

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| BIL-05 | Data usage chart: daily consumption over the current billing cycle | Recharts `AreaChart`, Cassandra `usage_by_day` table |
| BIL-06 | Voice call log: searchable, paginated list of CDRs (Call Detail Records) | Cassandra `cdr_by_customer` table, GraphQL cursor pagination |
| BIL-07 | SMS log with delivery status | Cassandra, Bootstrap `Badge` for status |
| BIL-08 | Usage summary cards: total data (GB), total voice (min), total SMS (count) | GraphQL aggregation query, Bootstrap `Card` |

#### 5.3.3 Payment History

| ID | Requirement | Tech Highlight |
|----|-------------|----------------|
| BIL-09 | Payment history timeline with method (card, bank, wallet) and status | MongoDB `payments` collection, Bootstrap timeline layout |
| BIL-10 | Download payment receipt as XML | Server-side XML generation, `Content-Type: application/xml` |
| BIL-11 | Auto-pay configuration toggle | GraphQL mutation, MongoDB update |

---

## 6. Data Architecture

### 6.1 MongoDB Collections

#### `customers`
```typescript
interface Customer {
  _id: ObjectId;
  customerId: string;          // e.g., "CUST-0001"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  activePlanId: ObjectId;
  accountStatus: "ACTIVE" | "SUSPENDED" | "PENDING" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}
```

#### `plans`
```typescript
interface Plan {
  _id: ObjectId;
  planCode: string;            // e.g., "PLAN-UNLIMITED-5G"
  name: string;
  description: string;
  monthlyPrice: number;
  currency: string;
  features: {
    dataLimitGB: number | null; // null = unlimited
    voiceMinutes: number | null;
    smsCount: number | null;
    hotspotGB: number;
    internationalRoaming: boolean;
    fiveGAccess: boolean;
  };
  isActive: boolean;
  tier: "BASIC" | "STANDARD" | "PREMIUM" | "ENTERPRISE";
}
```

#### `tickets`
```typescript
interface Ticket {
  _id: ObjectId;
  ticketId: string;
  customerId: string;
  category: "BILLING" | "NETWORK" | "DEVICE" | "PLAN" | "OTHER";
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  messages: {
    sender: "CUSTOMER" | "AGENT";
    content: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### `invoices`
```typescript
interface Invoice {
  _id: ObjectId;
  invoiceNumber: string;
  customerId: string;
  billingPeriod: { start: Date; end: Date };
  lineItems: {
    description: string;
    category: "BASE_PLAN" | "ADDON" | "TAX" | "DISCOUNT" | "OVERAGE";
    amount: number;
  }[];
  totalAmount: number;
  status: "DRAFT" | "DUE" | "PAID" | "OVERDUE";
  dueDate: Date;
  paidAt?: Date;
}
```

#### `payments`
```typescript
interface Payment {
  _id: ObjectId;
  paymentId: string;
  customerId: string;
  invoiceId: ObjectId;
  amount: number;
  method: "CREDIT_CARD" | "BANK_TRANSFER" | "DIGITAL_WALLET";
  status: "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
  transactionRef: string;
  processedAt: Date;
}
```

#### `devices` (Network Equipment)
```typescript
interface NetworkDevice {
  _id: ObjectId;
  deviceId: string;            // e.g., "TWR-DFW-001"
  type: "TOWER" | "SWITCH" | "ROUTER" | "BASE_STATION" | "FIBER_NODE";
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
  };
  status: "OPERATIONAL" | "DEGRADED" | "DOWN" | "MAINTENANCE";
  connectedDeviceIds: string[];
  metadata: {
    manufacturer: string;
    model: string;
    firmwareVersion: string;
    installDate: Date;
  };
}
```

### 6.2 Cassandra Tables

#### Keyspace: `telecom_telemetry`

```cql
-- Telemetry readings from network devices
CREATE TABLE device_telemetry (
    device_id    TEXT,
    date         DATE,
    timestamp    TIMESTAMP,
    cpu_percent  FLOAT,
    memory_percent FLOAT,
    bandwidth_mbps FLOAT,
    packet_loss_percent FLOAT,
    temperature_celsius FLOAT,
    PRIMARY KEY ((device_id, date), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
  AND default_time_to_live = 7776000;  -- 90-day retention
```

```cql
-- Call Detail Records
CREATE TABLE cdr_by_customer (
    customer_id  TEXT,
    month        TEXT,          -- e.g., "2026-02"
    call_id      UUID,
    timestamp    TIMESTAMP,
    from_number  TEXT,
    to_number    TEXT,
    duration_sec INT,
    call_type    TEXT,          -- VOICE, VIDEO, VOIP
    status       TEXT,          -- COMPLETED, MISSED, DROPPED
    PRIMARY KEY ((customer_id, month), timestamp, call_id)
) WITH CLUSTERING ORDER BY (timestamp DESC, call_id ASC);
```

```cql
-- Daily usage aggregates
CREATE TABLE usage_by_day (
    customer_id  TEXT,
    month        TEXT,
    date         DATE,
    data_used_mb BIGINT,
    voice_used_sec BIGINT,
    sms_count    INT,
    PRIMARY KEY ((customer_id, month), date)
) WITH CLUSTERING ORDER BY (date ASC);
```

```cql
-- Network alerts/incidents
CREATE TABLE alerts_by_device (
    device_id    TEXT,
    month        TEXT,
    alert_id     UUID,
    timestamp    TIMESTAMP,
    severity     TEXT,          -- CRITICAL, MAJOR, MINOR, INFO
    title        TEXT,
    description  TEXT,
    status       TEXT,          -- ACTIVE, ACKNOWLEDGED, RESOLVED
    resolved_at  TIMESTAMP,
    PRIMARY KEY ((device_id, month), timestamp, alert_id)
) WITH CLUSTERING ORDER BY (timestamp DESC, alert_id ASC);
```

### 6.3 Data Modeling Rationale

| Decision | Reasoning |
|----------|-----------|
| **MongoDB for customers, plans, billing** | These are document-oriented entities with complex nested structures, flexible schemas, and moderate read/write volumes. MongoDB's aggregation pipeline supports billing calculations. |
| **Cassandra for telemetry & CDRs** | Telemetry data arrives at high velocity (thousands of writes/sec across devices). Cassandra's partition-based model with time-clustering is purpose-built for time-series. CDRs are append-heavy and queried by customer + time range. |
| **Partition key design in Cassandra** | Compound partition keys like `(device_id, date)` prevent unbounded partition growth while keeping queries efficient for the most common access pattern: "give me readings for device X on date Y." |
| **TTL on telemetry** | 90-day automatic expiration keeps storage bounded without manual cleanup. |

---

## 7. GraphQL Schema Design

### 7.1 Federation Approach

The API uses **Apollo Federation v2**. Each backend service owns its portion of the graph and contributes entity types.

### 7.2 Customer Subgraph (Port 4001)

```graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

type Query {
  customer(customerId: ID!): Customer
  plans(tier: PlanTier): [Plan!]!
  plan(planCode: String!): Plan
  tickets(customerId: ID!, status: TicketStatus): [Ticket!]!
  ticket(ticketId: ID!): Ticket
}

type Mutation {
  updateCustomerProfile(input: UpdateProfileInput!): Customer!
  changePlan(customerId: ID!, planCode: String!): PlanChangeResult!
  createTicket(input: CreateTicketInput!): Ticket!
  addTicketMessage(ticketId: ID!, content: String!): Ticket!
}

type Subscription {
  ticketUpdated(customerId: ID!): Ticket!
}

type Customer @key(fields: "customerId") {
  customerId: ID!
  firstName: String!
  lastName: String!
  email: String!
  phone: String!
  address: Address!
  activePlan: Plan!
  accountStatus: AccountStatus!
  createdAt: DateTime!
}

type Plan @key(fields: "planCode") {
  planCode: String!
  name: String!
  description: String!
  monthlyPrice: Float!
  currency: String!
  features: PlanFeatures!
  tier: PlanTier!
}

type Ticket {
  ticketId: ID!
  customer: Customer!
  category: TicketCategory!
  subject: String!
  status: TicketStatus!
  priority: TicketPriority!
  messages: [TicketMessage!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum AccountStatus { ACTIVE SUSPENDED PENDING CLOSED }
enum PlanTier { BASIC STANDARD PREMIUM ENTERPRISE }
enum TicketStatus { OPEN IN_PROGRESS RESOLVED CLOSED }
enum TicketCategory { BILLING NETWORK DEVICE PLAN OTHER }
enum TicketPriority { LOW MEDIUM HIGH CRITICAL }
```

### 7.3 Network Subgraph (Port 4002)

```graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

type Query {
  devices(region: String, status: DeviceStatus): [NetworkDevice!]!
  device(deviceId: ID!): NetworkDevice
  telemetry(deviceId: ID!, timeRange: TimeRange!): [TelemetryReading!]!
  alerts(deviceId: ID, severity: AlertSeverity, status: AlertStatus): [Alert!]!
}

type Mutation {
  acknowledgeAlert(alertId: ID!): Alert!
  resolveAlert(alertId: ID!, resolution: String!): Alert!
}

type Subscription {
  newAlert(region: String): Alert!
  telemetryUpdate(deviceId: ID!): TelemetryReading!
}

type NetworkDevice @key(fields: "deviceId") {
  deviceId: ID!
  type: DeviceType!
  name: String!
  location: GeoLocation!
  status: DeviceStatus!
  connectedDevices: [NetworkDevice!]!
  metadata: DeviceMetadata!
}

type TelemetryReading {
  deviceId: ID!
  timestamp: DateTime!
  cpuPercent: Float!
  memoryPercent: Float!
  bandwidthMbps: Float!
  packetLossPercent: Float!
  temperatureCelsius: Float!
}

type Alert {
  alertId: ID!
  device: NetworkDevice!
  severity: AlertSeverity!
  title: String!
  description: String!
  status: AlertStatus!
  timestamp: DateTime!
  resolvedAt: DateTime
}

input TimeRange {
  start: DateTime!
  end: DateTime!
  granularity: Granularity
}

enum DeviceType { TOWER SWITCH ROUTER BASE_STATION FIBER_NODE }
enum DeviceStatus { OPERATIONAL DEGRADED DOWN MAINTENANCE }
enum AlertSeverity { CRITICAL MAJOR MINOR INFO }
enum AlertStatus { ACTIVE ACKNOWLEDGED RESOLVED }
enum Granularity { MINUTE FIVE_MINUTES HOUR DAY }
```

### 7.4 Billing Subgraph (Port 4003)

```graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable", "@external", "@requires"])

type Customer @key(fields: "customerId") {
  customerId: ID! @external
  invoices(status: InvoiceStatus, limit: Int): [Invoice!]!
  payments(limit: Int): [Payment!]!
  currentUsage: UsageSummary!
  usageByDay(month: String!): [DailyUsage!]!
  callHistory(month: String!, first: Int, after: String): CDRConnection!
}

type Query {
  invoice(invoiceNumber: String!): Invoice
}

type Mutation {
  payInvoice(invoiceNumber: String!, method: PaymentMethod!, idempotencyKey: String!): PaymentResult!
  toggleAutoPay(customerId: ID!, enabled: Boolean!): Customer!
}

type Invoice {
  invoiceNumber: String!
  billingPeriod: BillingPeriod!
  lineItems: [LineItem!]!
  totalAmount: Float!
  currency: String!
  status: InvoiceStatus!
  dueDate: DateTime!
  paidAt: DateTime
}

type CDRConnection {
  edges: [CDREdge!]!
  pageInfo: PageInfo!
}

type CDREdge {
  node: CallDetailRecord!
  cursor: String!
}

type CallDetailRecord {
  callId: ID!
  timestamp: DateTime!
  fromNumber: String!
  toNumber: String!
  durationSeconds: Int!
  callType: CallType!
  status: CallStatus!
}

type DailyUsage {
  date: String!
  dataUsedMB: Int!
  voiceUsedSeconds: Int!
  smsCount: Int!
}

type UsageSummary {
  dataUsedGB: Float!
  voiceUsedMinutes: Int!
  smsCount: Int!
  billingCycleStart: DateTime!
  billingCycleEnd: DateTime!
}

enum InvoiceStatus { DRAFT DUE PAID OVERDUE }
enum PaymentMethod { CREDIT_CARD BANK_TRANSFER DIGITAL_WALLET }
enum CallType { VOICE VIDEO VOIP }
enum CallStatus { COMPLETED MISSED DROPPED }
```

---

## 8. XML Integration Points

XML is used in the following deliberate, realistic scenarios.

| # | Feature | Format | Details |
|---|---------|--------|---------|
| 1 | **Network Alerts RSS Feed** | RSS 2.0 (XML) | Endpoint `GET /api/alerts/rss` returns an XML RSS feed of recent network alerts, consumable by external monitoring tools or dashboard widgets. Generated server-side with `xmlbuilder2`. |
| 2 | **Payment Receipt Export** | Custom XML | Endpoint `GET /api/receipts/:paymentId.xml` returns a structured XML receipt for enterprise integrations. Follows a defined XSD schema in `packages/xml-utils/schemas/receipt.xsd`. |
| 3 | **Device Configuration Manifest** | XML | Each network device has an XML configuration manifest displayed in the NOC device detail panel. Parsed client-side from a GraphQL `configXml` field using `DOMParser`. |
| 4 | **SVG Network Icons** | SVG/XML | Custom SVG icons for device types (tower, router, switch, fiber node) stored as XML files in `packages/ui/assets/icons/` and rendered inline. |
| 5 | **Data Import/Export** | XML | Admin utility to import/export customer data in XML format for B2B partner integrations. |

---

## 9. HTML5 Feature Usage

| Feature | Usage |
|---------|-------|
| **Semantic Elements** | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` across all layouts |
| **Canvas API** | Network topology interactive rendering (fallback to SVG for accessibility) |
| **Form Validation** | Native constraint validation API (`required`, `pattern`, `min`, `max`) combined with React-Bootstrap form feedback |
| **LocalStorage / SessionStorage** | Persist user preferences (theme, sidebar state, dashboard layout) |
| **Web Workers** | Offload telemetry data aggregation to prevent UI blocking |
| **Responsive Images** | `<picture>` and `srcset` for marketing/plan images |
| **ARIA Attributes** | Full accessibility compliance: `aria-live` for alerts feed, `role` attributes on custom components |

---

## 10. TypeScript Patterns & Standards

### 10.1 Configuration

All projects share a base `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"]
  }
}
```

### 10.2 Key Patterns to Demonstrate

| Pattern | Where |
|---------|-------|
| **Discriminated unions** | `type TicketEvent = { type: "CREATED"; ... } \| { type: "ASSIGNED"; ... } \| { type: "RESOLVED"; ... }` |
| **Generic components** | `DataTable<T>` component that accepts typed column definitions and row data |
| **Zod validation** | Runtime validation of GraphQL inputs using Zod schemas inferred from TypeScript types |
| **Branded types** | `type CustomerId = string & { __brand: "CustomerId" }` to prevent mixing IDs |
| **Utility types** | `Partial`, `Pick`, `Omit`, `Record` used meaningfully across service layers |
| **Type-safe resolvers** | GraphQL resolvers fully typed with `graphql-codegen` output |
| **Exhaustive switch** | `assertNever` pattern on discriminated unions for exhaustive case handling |

---

## 11. UI/UX Specifications

### 11.1 Design System

Built on Bootstrap 5.3 with a custom telecom theme.

| Token | Value |
|-------|-------|
| Primary | `#0066CC` (Telecom Blue) |
| Secondary | `#6C63FF` (Digital Purple) |
| Success | `#28A745` (Operational Green) |
| Warning | `#FFC107` (Degraded Amber) |
| Danger | `#DC3545` (Critical Red) |
| Info | `#17A2B8` (Info Cyan) |
| Background | `#F8F9FA` (Light Gray) |
| Surface | `#FFFFFF` |
| Dark Mode BG | `#1A1D23` |
| Dark Mode Surface | `#2D3039` |

### 11.2 Layout

- **Shell** provides a persistent top navbar (72px height) and a collapsible sidebar (240px expanded / 60px collapsed).
- Content area uses Bootstrap's fluid container with responsive gutters.
- MFEs render within the content area and are unaware of the shell's chrome.

### 11.3 Responsive Breakpoints

| Breakpoint | Width | Layout Adaptation |
|------------|-------|-------------------|
| `xs` | < 576px | Single column, hamburger menu, stacked cards |
| `sm` | ≥ 576px | Single column with wider cards |
| `md` | ≥ 768px | Sidebar visible (collapsed), 2-column card grid |
| `lg` | ≥ 992px | Sidebar expanded, 3-column card grid |
| `xl` | ≥ 1200px | Full layout, charts side-by-side |
| `xxl` | ≥ 1400px | Extra spacing, larger chart containers |

### 11.4 Accessibility Requirements

- WCAG 2.1 Level AA compliance.
- All interactive elements keyboard navigable.
- Color is never the sole indicator of state (always paired with icon or text).
- Minimum contrast ratio of 4.5:1 for normal text.
- Screen reader announcements for live data updates (`aria-live="polite"`).

---

## 12. API Endpoints (Non-GraphQL)

In addition to the federated GraphQL API, the following REST/utility endpoints exist.

| Method | Path | Service | Purpose |
|--------|------|---------|---------|
| `GET` | `/health` | All services | Health check returning `{ status: "ok", uptime, version }` |
| `GET` | `/api/alerts/rss` | Network Service | RSS 2.0 XML feed of recent alerts |
| `GET` | `/api/receipts/:paymentId.xml` | Billing Service | XML payment receipt download |
| `POST` | `/api/import/customers` | Customer Service | XML bulk customer import |
| `GET` | `/api/export/customers` | Customer Service | XML bulk customer export |
| `GET` | `/api/devices/:deviceId/config.xml` | Network Service | Device configuration manifest (XML) |

---

## 13. Seed Data & Demo Script

### 13.1 Seed Data Specifications

| Entity | Count | Notes |
|--------|-------|-------|
| Customers | 50 | Diverse names, addresses, plan distribution across tiers |
| Plans | 8 | 2 per tier (BASIC, STANDARD, PREMIUM, ENTERPRISE) |
| Tickets | 200 | Distributed across customers, all statuses represented |
| Invoices | 300 | 6 months of history for each customer |
| Payments | 250 | Mixed methods and statuses |
| Network Devices | 30 | Mix of towers (10), routers (8), switches (7), base stations (3), fiber nodes (2) |
| Telemetry Readings | ~500,000 | 30 days of data, 1 reading per device per minute (downsampled for demo) |
| CDRs | ~10,000 | 3 months of call records across customers |
| Alerts | 500 | Mixed severity and status across devices and time |

### 13.2 Seed Scripts

- `scripts/seed-mongo.ts` — TypeScript script using Mongoose to populate MongoDB.
- `scripts/seed-cassandra.ts` — TypeScript script using `cassandra-driver` to populate Cassandra.
- `scripts/generate-telemetry.js` — **JavaScript** utility (intentionally JS, not TS) to continuously generate synthetic telemetry data for live demo scenarios. Demonstrates Node.js/JavaScript usage alongside TypeScript.

### 13.3 Demo Walkthrough (15 minutes)

| Time | Action | What It Demonstrates |
|------|--------|----------------------|
| 0:00 | Open shell app; navigate to Customer Portal | Micro frontend loading, Module Federation |
| 1:00 | View customer account dashboard | SSR, GraphQL query, MongoDB, React-Bootstrap layout |
| 2:30 | Compare plans and initiate plan change | Optimistic UI, GraphQL mutation, TypeScript form validation |
| 4:00 | Create a support ticket; observe real-time status update | GraphQL subscriptions, WebSocket, HTML5 form validation |
| 5:30 | Switch to NOC Dashboard | MFE navigation, independent loading |
| 6:00 | Explore network topology; click on a tower node | Canvas/SVG rendering, XML icon loading, GraphQL query |
| 7:30 | View live telemetry charts; change time range | Cassandra time-series query, chart rendering, auto-refresh |
| 9:00 | Observe incoming critical alert; acknowledge it | GraphQL subscription, mutation, Bootstrap alert styling |
| 10:00 | Export alerts as RSS feed (open XML in browser) | XML generation, REST endpoint |
| 10:30 | Switch to Billing Console | Third MFE loading |
| 11:00 | View invoices; drill into detail; pay an invoice | MongoDB queries, GraphQL mutations, idempotency |
| 12:00 | View usage analytics and CDR history | Cassandra queries, cursor pagination, charts |
| 13:00 | Download XML payment receipt | XML generation, file download |
| 13:30 | Toggle dark mode; resize browser to show responsiveness | Bootstrap theming, responsive breakpoints |
| 14:30 | Show monorepo structure, Docker Compose, TypeScript strict mode | Architecture and tooling |

---

## 14. Non-Functional Requirements

### 14.1 Performance

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s on simulated 4G |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| GraphQL query response (p95) | < 200ms |
| Cassandra read latency (p99) | < 50ms |
| MFE chunk load time | < 1s on broadband |

### 14.2 Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (components) | Vitest + React Testing Library | 80% of shared UI components |
| Unit (services) | Vitest | 80% of resolver logic |
| Integration (GraphQL) | Vitest + supertest | All queries and mutations |
| E2E | Playwright | Critical path: account view → plan change → ticket creation → billing payment |
| Visual Regression | Playwright screenshots | Key pages at 3 breakpoints |

### 14.3 Security (Demo-Level)

- Simulated JWT authentication (no real auth provider; token generated at login).
- GraphQL depth limiting (max depth: 7) and query complexity analysis.
- Rate limiting on REST endpoints (express-rate-limit).
- Input sanitization on all GraphQL string inputs.
- CORS configured to allow only the shell app's origin.

---

## 15. Development Workflow

### 15.1 Getting Started

```bash
# Clone and install
git clone https://github.com/your-org/telecom-nexus.git
cd telecom-nexus
npm install

# Start databases
docker compose -f docker/docker-compose.yml up -d

# Seed data
npx turbo run seed

# Start all services and apps
npx turbo run dev
```

### 15.2 Service Ports

| Service | Port |
|---------|------|
| Shell (Host) | 3000 |
| Customer Portal (Remote) | 3001 |
| NOC Dashboard (Remote) | 3002 |
| Billing Console (Remote) | 3003 |
| Apollo Gateway | 4000 |
| Customer Subgraph | 4001 |
| Network Subgraph | 4002 |
| Billing Subgraph | 4003 |
| MongoDB | 27017 |
| Cassandra | 9042 |

### 15.3 Key Commands

```bash
# Run a specific app in isolation
npx turbo run dev --filter=customer-portal

# Run all tests
npx turbo run test

# Type check entire monorepo
npx turbo run typecheck

# Lint
npx turbo run lint

# Build for production
npx turbo run build

# E2E tests
npx turbo run test:e2e
```

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Module Federation + Next.js App Router compatibility issues | High | Pin `@module-federation/nextjs-mf` to a stable release; maintain fallback iframe-based composition |
| Cassandra Docker image memory consumption | Medium | Configure JVM heap to 512MB for development; document system requirements (8GB RAM minimum) |
| Scope creep | High | Strict adherence to this PRD; any additions must replace an existing feature |
| GraphQL subscription complexity | Medium | Use `graphql-ws` over deprecated `subscriptions-transport-ws`; implement connection throttling |
| Bootstrap + React-Bootstrap version mismatch | Low | Lock both versions in `package.json`; test on each upgrade |

---

## 17. Future Enhancements (Out of Scope for v1)

These are explicitly not part of the initial build but are documented as potential extensions.

- Real authentication via Auth0 or Clerk.
- Kubernetes deployment manifests.
- Observability stack (OpenTelemetry + Grafana).
- Internationalization (i18n) with `next-intl`.
- Push notifications for alerts (Web Push API).
- AI-powered ticket routing using an LLM API.
- Load testing with k6.

---

## 18. Glossary

| Term | Definition |
|------|------------|
| **CDR** | Call Detail Record — a log entry for each voice/video/data call |
| **MFE** | Micro Frontend — an independently deployable frontend module |
| **NOC** | Network Operations Center — the team/interface monitoring network health |
| **SSR** | Server-Side Rendering — generating HTML on the server for faster initial load |
| **SSG** | Static Site Generation — pre-rendering pages at build time |
| **TTL** | Time To Live — automatic data expiration in databases |
| **XSD** | XML Schema Definition — formal specification for XML document structure |
| **LCP** | Largest Contentful Paint — Core Web Vital measuring load performance |
| **Federation** | Apollo Federation — architecture for composing multiple GraphQL services into one |

---

*End of Document*
