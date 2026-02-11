# Product Requirements Document (PRD) — v2.0 (Refined)

## TelecomNexus — Unified Telecom Customer & Network Operations Platform

---

| Field              | Detail                                       |
|--------------------|----------------------------------------------|
| **Document Version** | 2.0 (Refined)                               |
| **Date**             | February 11, 2026                           |
| **Author**           | Venkata                                     |
| **Status**           | Final Draft                                 |
| **Project Codename** | TelecomNexus                                |
| **Purpose**          | Interview demo — full-stack telecom platform |

---

## 1. Executive Summary

TelecomNexus is a full-stack, production-grade demo platform simulating a modern telecommunications company's digital ecosystem. It consists of three independently deployable micro frontends — a **Customer Self-Service Portal**, a **Network Operations Center (NOC) Dashboard**, and a **Billing & Analytics Console** — unified under a single shell application. The backend is powered by a GraphQL API federation layer atop Node.js microservices, with MongoDB for transactional data and Apache Cassandra for high-volume time-series network telemetry.

**Interview Demo Focus**: This project demonstrates end-to-end mastery of modern web development, distributed data architecture, micro frontend composition, and enterprise-grade patterns — all within a realistic telecom domain. It is designed to support a compelling 15-minute live walkthrough.

---

## 2. Goals & Objectives

### 2.1 Primary Goals

- Demonstrate proficiency across the entire technology stack in a single, cohesive, real-world telecom application.
- Showcase micro frontend architecture with independently developed, tested, and deployed modules.
- Illustrate polyglot NoSQL persistence — MongoDB for document-oriented data, Cassandra for high-write time-series telemetry.
- Present a clean, responsive, accessible UI built with Bootstrap 5 and React, rendered via Next.js with SSR/SSG.
- Produce a demo-ready platform that can be spun up with `docker compose up` and walked through in 15 minutes.

### 2.2 Success Criteria

| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | All listed technologies are meaningfully integrated | Each technology serves a clear, justified architectural role |
| 2 | Micro frontends operate independently | Each MFE can be started, built, and tested in isolation |
| 3 | End-to-end data flow works | User action in UI → GraphQL mutation → service → database → reflected in UI |
| 4 | Responsive design | All views render correctly at mobile (375px), tablet (768px), and desktop (1440px) |
| 5 | Type safety | Zero `any` types in production code; full TypeScript strict mode |
| 6 | Demo-ready | Seeded database and scripted walkthrough support a 15-minute live demo |
| 7 | Interview-presentable | Clean code, clear architecture, well-documented decisions |

---

## 3. Technology Stack & Version Matrix (Updated Feb 2026)

### 3.1 Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | 19.2.x | UI component library across all micro frontends |
| **Next.js** | 16.1.x (App Router) | Framework for each micro frontend; SSR, SSG, API routes, routing |
| **TypeScript** | 5.9.x | Language for all frontend and backend code; strict mode enforced |
| **Bootstrap** | 5.3.x | Responsive grid, utility classes, base component styling |
| **React-Bootstrap** | 2.10.x | Bootstrap components as React components |
| **Module Federation** | via `@module-federation/nextjs-mf` 8.x | Micro frontend composition; runtime module sharing |
| **Apollo Client** | 4.1.x | GraphQL client for data fetching, caching, state management |
| **Recharts** | 3.7.x | Charting library for telemetry dashboards and usage analytics |
| **D3.js** | 7.9.x | Network topology canvas rendering |
| **HTML5** | — | Semantic markup, `<canvas>` for topology, `<video>` for help center |
| **XML** | — | Config manifests, RSS alert feeds, SVG icons |

### 3.2 Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js** | 22.x LTS | Runtime for all backend services |
| **JavaScript (ESM)** | ES2024 | Utility scripts, seed scripts, build tooling |
| **TypeScript** | 5.9.x | Primary language for all service code |
| **Apollo Server** | 5.4.x | GraphQL server for each domain subgraph |
| **Apollo Gateway** | 2.13.x | GraphQL federation gateway composing subgraphs |
| **Express.js** | 5.2.x | HTTP server underpinning Apollo Server and REST endpoints |
| **GraphQL** | 16.12.x | API query language; schema-first design with federation directives |
| **graphql-ws** | 6.0.x | WebSocket transport for GraphQL subscriptions |
| **graphql-codegen** | 6.1.x | Type-safe resolver and client code generation |
| **Zod** | 4.3.x | Runtime validation of GraphQL inputs |

### 3.3 Data Layer

| Technology | Version | Role |
|---|---|---|
| **MongoDB** | 8.x (via Docker) | Document store for customers, plans, billing, tickets, devices |
| **Mongoose** | 9.2.x | ODM for MongoDB; schema validation and middleware |
| **Apache Cassandra** | 5.x (via Docker) | Wide-column store for telemetry, CDRs, event logs |
| **cassandra-driver** | 4.8.x | Node.js driver for Cassandra |

### 3.4 DevOps & Tooling

| Technology | Version | Role |
|---|---|---|
| **Docker & Docker Compose** | Latest | Containerization of all services and databases |
| **Turborepo** | 2.8.x | Monorepo build orchestration |
| **ESLint** | 10.x (flat config) | Linting |
| **Prettier** | 3.8.x | Code formatting |
| **Vitest** | 4.x | Unit and integration testing |
| **Playwright** | 1.58.x | End-to-end testing |
| **React Testing Library** | 16.3.x | Component testing |
| **GitHub Actions** | — | CI/CD pipeline |

---

## 4. Architecture Overview

### 4.1 High-Level Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Client)                             │
│                                                                       │
│  ┌───────────────┐  ┌──────────────────┐  ┌────────────────────────┐ │
│  │  MFE 1:       │  │  MFE 2:          │  │  MFE 3:                │ │
│  │  Customer      │  │  NOC Dashboard   │  │  Billing & Analytics   │ │
│  │  Portal        │  │                  │  │  Console               │ │
│  │  (Next.js 16)  │  │  (Next.js 16)    │  │  (Next.js 16)         │ │
│  └──────┬────────┘  └────────┬─────────┘  └──────────┬─────────────┘ │
│         │                    │                        │               │
│  ┌──────┴────────────────────┴────────────────────────┴────────────┐  │
│  │               Shell Application (Next.js 16 Host)               │  │
│  │          Module Federation Runtime · Shared Layout               │  │
│  │     Apollo Client 4 · Bootstrap 5 Theme · Auth Context           │  │
│  └──────────────────────────┬──────────────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────────────┘
                              │ GraphQL over HTTPS + WebSocket (subscriptions)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Apollo Gateway (Federation v2)                       │
│                     Port 4000 · Node.js 22 / TypeScript 5.9             │
└────────┬──────────────────────┬──────────────────────┬──────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Customer       │   │ Network          │   │ Billing          │
│ Subgraph       │   │ Subgraph         │   │ Subgraph         │
│ Port 4001      │   │ Port 4002        │   │ Port 4003        │
│ Apollo 5       │   │ Apollo 5         │   │ Apollo 5         │
│ Express 5      │   │ Express 5        │   │ Express 5        │
└────────┬───────┘   └────────┬─────────┘   └────────┬─────────┘
         │                    │                       │
         ▼                    ▼                       ▼
┌────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  MongoDB 8     │   │   Cassandra 5    │   │   MongoDB 8      │
│  (customers,   │   │   (telemetry,    │   │   (invoices,     │
│   plans,       │   │    CDRs,         │   │    payments,     │
│   tickets,     │   │    alerts,       │   │    usage)        │
│   devices)     │   │    events)       │   │                  │
└────────────────┘   └──────────────────┘   └──────────────────┘
```

### 4.2 Micro Frontend Architecture

**Host-Remote Module Federation** pattern:

**Shell (Host) Application** — `apps/shell` (port 3000)
- Owns the global layout: top navigation bar, sidebar, footer
- Handles authentication context (simulated JWT)
- Dynamically loads remote MFE modules at runtime via Module Federation
- Provides shared dependencies (React, React-DOM, Apollo Client, Bootstrap CSS)
- Dark mode / light mode toggle
- Responsive sidebar (240px expanded / 60px collapsed / hidden on mobile)

**Remote MFE 1 — Customer Portal** — `apps/customer-portal` (port 3001)
- Exposes: `./CustomerApp`, `./AccountOverview`, `./PlanSelector`, `./SupportTickets`
- Can run standalone for independent development

**Remote MFE 2 — NOC Dashboard** — `apps/noc-dashboard` (port 3002)
- Exposes: `./NOCApp`, `./NetworkTopology`, `./AlertsFeed`, `./TelemetryCharts`
- Can run standalone for independent development

**Remote MFE 3 — Billing Console** — `apps/billing-console` (port 3003)
- Exposes: `./BillingApp`, `./InvoiceList`, `./UsageBreakdown`, `./PaymentHistory`
- Can run standalone for independent development

### 4.3 Monorepo Structure

```
telecom-nexus/
├── apps/
│   ├── shell/                    # Host Next.js app (port 3000)
│   ├── customer-portal/          # Remote MFE 1 (port 3001)
│   ├── noc-dashboard/            # Remote MFE 2 (port 3002)
│   ├── billing-console/          # Remote MFE 3 (port 3003)
│   ├── gateway/                  # Apollo Gateway (port 4000)
│   └── services/
│       ├── customer-service/     # Customer subgraph (port 4001)
│       ├── network-service/      # Network subgraph (port 4002)
│       └── billing-service/      # Billing subgraph (port 4003)
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
│   └── generate-telemetry.js     # JavaScript utility (intentionally JS)
├── turbo.json
├── package.json
├── tsconfig.base.json
└── CLAUDE.md
```

---

## 5. Feature Requirements — Organized by Epic & Story

### Epic 1: Customer Self-Service Portal (MFE 1)

#### Story 1.1 — Account Dashboard
**As a** telecom customer, **I want to** see my account overview, **so that** I can quickly check my profile, plan, and usage at a glance.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| CP-01 | Display customer profile (name, phone, email, address) fetched via GraphQL | Apollo Client 4 `useQuery`, MongoDB |
| CP-02 | Show active plan with data/voice/SMS quotas as animated progress bars | React-Bootstrap `ProgressBar`, GraphQL fragment composition |
| CP-03 | Render account status badge (Active, Suspended, Pending) with color + icon (never color alone) | Bootstrap badges, TypeScript discriminated unions |
| CP-04 | SSR the initial account page for fast LCP (<2.5s) | Next.js 16 server components, `generateMetadata` |
| CP-04a | Show a "Quick Actions" card row: Pay Bill, Change Plan, Open Ticket, View Usage | React-Bootstrap `Card` grid, responsive layout |

**UI Specification:**
- Hero section with customer name greeting and account status
- 4-column card grid (stacks to 2-col on tablet, 1-col on mobile) for quick stats: Current Plan, Data Used, Next Bill Date, Open Tickets
- Progress bars with gradient fill showing data/voice/SMS consumption against quota
- Skeleton loading states while GraphQL data loads

#### Story 1.2 — Plan Management
**As a** customer, **I want to** browse, compare, and change my plan, **so that** I can find the best value for my needs.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| CP-05 | List all available plans in responsive card grid grouped by tier | `Row`, `Col`, `Card` from React-Bootstrap |
| CP-06 | Plan comparison: select up to 3 plans → side-by-side feature table with highlighting of differences | HTML5 `<table>`, TypeScript generics for comparison logic |
| CP-07 | "Change Plan" flow: select → confirm modal → GraphQL mutation → optimistic UI update → success toast | Apollo Client `useMutation` with `optimisticResponse` |
| CP-08 | Plan data sourced from MongoDB `plans` collection; cached in Apollo InMemoryCache | Cache normalization by `planCode` |
| CP-08a | Current plan highlighted with "Your Plan" badge; upgrade/downgrade indicators on other plans | Conditional styling, TypeScript tier comparison |

**UI Specification:**
- Tier tabs at top: Basic / Standard / Premium / Enterprise
- Cards show: plan name, price/month, key features (data, voice, SMS, 5G, roaming), and a CTA button
- Comparison view: sticky table header, checkmark/X for boolean features, color-coded pricing column
- Confirmation modal with plan change summary (current vs new) and estimated prorated charge

#### Story 1.3 — Support Ticket System
**As a** customer, **I want to** create and track support tickets, **so that** I can get help with issues.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| CP-09 | Create ticket with category dropdown, priority, subject, description textarea, file upload placeholder | React-Bootstrap `Form`, HTML5 constraint validation |
| CP-10 | List tickets with status filters (Open, In Progress, Resolved, Closed) and search | GraphQL query with `where` filter, Bootstrap `Tabs` |
| CP-11 | Ticket detail with conversation thread (customer + agent messages) in chat-like layout | Nested GraphQL types, MongoDB embedded documents |
| CP-12 | Real-time ticket status updates via GraphQL subscriptions | `graphql-ws` 6.x, Apollo Client `useSubscription` |
| CP-12a | New message notification toast when ticket is updated while user is on another page | Apollo subscription with cross-MFE event |

**UI Specification:**
- Ticket list as a table on desktop, cards on mobile
- Chat-style conversation thread: customer messages right-aligned (blue), agent messages left-aligned (gray)
- Status stepper visualization: Open → In Progress → Resolved → Closed
- Form with real-time validation feedback and character count on description

---

### Epic 2: Network Operations Center Dashboard (MFE 2)

#### Story 2.1 — Network Topology Viewer
**As a** NOC operator, **I want to** see an interactive network topology map, **so that** I can understand infrastructure layout and health at a glance.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| NOC-01 | Render interactive network topology with towers, switches, routers, base stations, fiber nodes as nodes with connection lines | HTML5 `<canvas>` with D3.js force layout, SVG fallback |
| NOC-02 | Nodes color-coded by health: green (Operational), yellow (Degraded), red (Down), blue (Maintenance) — with icon overlays | TypeScript enum `DeviceStatus`, XML-based SVG icons |
| NOC-03 | Click a node → slide-out detail panel with device metadata, recent telemetry, and config XML | GraphQL query by `deviceId`, Bootstrap `Offcanvas` |
| NOC-04 | Topology data from MongoDB `devices` collection with adjacency graph traversal | Mongoose population for connected devices |
| NOC-04a | Mini-map in corner showing full topology when zoomed in; zoom and pan controls | Canvas viewport management |

**UI Specification:**
- Full-width canvas/SVG area with dark background for the topology visualization
- Device nodes: tower icon (triangular), router (box with arrows), switch (stacked layers), base station (antenna), fiber node (circle with lines)
- Connection lines: solid for active, dashed for degraded, red for down
- Offcanvas panel (right slide-out): device name, type, location, firmware, uptime, mini telemetry sparklines
- Region filter dropdown above the topology

#### Story 2.2 — Live Telemetry Dashboard
**As a** NOC operator, **I want to** monitor real-time device metrics, **so that** I can detect performance issues before they impact customers.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| NOC-05 | Display real-time charts: CPU load, memory utilization, bandwidth throughput, packet loss, temperature | Recharts `LineChart`/`AreaChart`, data from Cassandra |
| NOC-06 | Time-range selector: Last 1h, 6h, 24h, 7d with granularity auto-adjustment | GraphQL `timeRange` argument, Cassandra time-range partition scan |
| NOC-07 | Auto-refresh every 10s with visual countdown ring and pause button | `setInterval` + Apollo `pollInterval`, SVG countdown ring |
| NOC-08 | Telemetry modeled in Cassandra with partition key `(device_id, date)` clustered by `timestamp DESC` | Cassandra time-series best practice, 90-day TTL |
| NOC-08a | Device selector dropdown to switch between devices; "Compare Devices" mode to overlay 2 devices | Multi-series Recharts, GraphQL batch queries |

**UI Specification:**
- 2x2 grid of charts on desktop (CPU, Memory, Bandwidth, Packet Loss), stacked on mobile
- Each chart: title, current value as large number, trend arrow (up/down), sparkline area chart
- Time range as pill buttons above charts
- Countdown ring in top-right corner (10s circular SVG animation)
- Temperature as a gauge chart (semi-circular)

#### Story 2.3 — Alerts & Incidents
**As a** NOC operator, **I want to** see, acknowledge, and resolve network alerts, **so that** I can respond to incidents quickly.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| NOC-09 | Real-time alerts feed with severity badges: Critical (red pulse), Major (orange), Minor (yellow), Info (blue) | GraphQL subscriptions, Bootstrap `Alert` variants |
| NOC-10 | Alert workflow: Active → Acknowledged → Resolved, with timestamp and operator notes | GraphQL mutations updating alert status |
| NOC-11 | Alerts exportable as RSS 2.0 XML feed | `GET /api/alerts/rss`, `xmlbuilder2` |
| NOC-12 | Alert history searchable by device, severity, date range | Cassandra `alerts_by_device`, GraphQL filtering |
| NOC-12a | Alert summary banner at top of NOC showing counts by severity with live updates | Subscription-driven counter badges |

**UI Specification:**
- Split view: alert list (left 60%) + detail panel (right 40%) on desktop; full-width with drill-in on mobile
- Critical alerts: red left-border + pulse animation + sound icon (muted by default)
- Timeline visualization for alert lifecycle (created → acknowledged → resolved)
- RSS export button with XML icon in top-right of alerts panel
- Filter bar: severity checkboxes, device dropdown, date range picker

---

### Epic 3: Billing & Analytics Console (MFE 3)

#### Story 3.1 — Invoice Management
**As a** customer, **I want to** view and pay my invoices, **so that** I can manage my billing.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| BIL-01 | List invoices with month, amount, status (Paid/Due/Overdue) in sortable table | React-Bootstrap `Table`, TypeScript sort utilities |
| BIL-02 | Invoice detail: line items (base plan, add-ons, taxes, discounts) with subtotals | Nested GraphQL `Invoice → LineItem[]` |
| BIL-03 | "Pay Now" button → payment method selector → confirm → simulated payment mutation | Mutation with idempotency key |
| BIL-04 | Invoice data in MongoDB with TTL index for archival demo | Mongoose TTL index |
| BIL-04a | Invoice status timeline: Draft → Due → Paid (or Overdue) | Horizontal stepper component |

**UI Specification:**
- Invoice table with sortable columns, status badges (green=Paid, yellow=Due, red=Overdue)
- Invoice detail as a clean receipt-like layout: company header, billing period, itemized table, total with tax breakdown
- Payment modal: card/bank/wallet radio buttons, confirmation step, success animation
- Overdue invoices highlighted with warning banner

#### Story 3.2 — Usage Analytics
**As a** customer, **I want to** understand my usage patterns, **so that** I can optimize my plan.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| BIL-05 | Daily data consumption chart for current billing cycle | Recharts `AreaChart`, Cassandra `usage_by_day` |
| BIL-06 | Voice call log: searchable, paginated CDR list | Cassandra `cdr_by_customer`, GraphQL cursor pagination |
| BIL-07 | SMS log with delivery status badges | Cassandra, Bootstrap `Badge` |
| BIL-08 | Usage summary cards: Total Data (GB), Voice (min), SMS (count) with plan limit comparison | GraphQL aggregation, Bootstrap `Card` with `ProgressBar` |
| BIL-08a | Usage trend chart: compare current month vs previous month | Recharts multi-series, Cassandra historical query |

**UI Specification:**
- Summary cards row: 3 cards showing used/limit for Data, Voice, SMS with circular progress indicators
- Area chart: daily usage with plan limit shown as a horizontal reference line
- Call log table: timestamp, from/to, duration, type, status — with infinite scroll pagination
- Month selector dropdown for historical comparison
- Export button (CSV) for usage data

#### Story 3.3 — Payment History & Settings
**As a** customer, **I want to** review my payment history and manage auto-pay, **so that** I can control my finances.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| BIL-09 | Payment history timeline with method (card, bank, wallet) icons and status | MongoDB `payments`, Bootstrap timeline layout |
| BIL-10 | Download payment receipt as XML document | Server-side XML generation, `Content-Type: application/xml` |
| BIL-11 | Auto-pay configuration toggle with payment method selection | GraphQL mutation, MongoDB update |
| BIL-11a | Payment method management: view saved methods (masked), set default | MongoDB embedded documents |

**UI Specification:**
- Vertical timeline with payment entries: date, amount, method icon, status badge, download button
- Receipt download triggers browser download of XML file
- Auto-pay card: toggle switch, current method display, "Change Method" link
- Settings grouped in a clean card layout

---

### Epic 4: Shell Application & Cross-Cutting Concerns

#### Story 4.1 — Shell Layout & Navigation
**As a** user, **I want** a consistent navigation experience, **so that** I can easily move between portal sections.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| SH-01 | Top navbar (72px) with logo, navigation links, user dropdown, dark mode toggle | React-Bootstrap `Navbar`, Module Federation host |
| SH-02 | Collapsible sidebar: expanded (240px) / collapsed (60px icons) / hidden (mobile hamburger) | Bootstrap `Offcanvas` + custom state management |
| SH-03 | MFE loading with skeleton fallback while remote chunks download | React `Suspense`, Module Federation async loading |
| SH-04 | Breadcrumb navigation reflecting current MFE and page | Next.js 16 parallel routes, Bootstrap `Breadcrumb` |
| SH-05 | Global notification toast system for cross-MFE events | React context, Bootstrap `Toast` stack |

#### Story 4.2 — Authentication (Simulated)
**As a** user, **I want** to log in and see my personalized data, **so that** the demo feels realistic.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| SH-06 | Login page with email/password form (simulated — any credentials work with seeded customers) | HTML5 form validation, Bootstrap form |
| SH-07 | JWT token generated client-side, stored in memory (not localStorage for security demo) | TypeScript JWT utility, React context |
| SH-08 | Auth context shared with all MFEs via Module Federation shared scope | Module Federation shared dependencies |
| SH-09 | User dropdown in navbar showing customer name, with "Switch Customer" for demo purposes | Seeded customer selector for demo |

#### Story 4.3 — Theming & Responsiveness
**As a** user, **I want** the app to look great on any device and support dark mode, **so that** I have a comfortable experience.

| ID | Acceptance Criteria | Tech Highlight |
|----|---------------------|----------------|
| SH-10 | Custom Bootstrap theme with telecom brand colors | Bootstrap Sass variable overrides |
| SH-11 | Dark mode toggle: switches CSS custom properties, persisted to localStorage | `data-bs-theme` attribute, `prefers-color-scheme` |
| SH-12 | Responsive at all breakpoints: xs, sm, md, lg, xl, xxl | Bootstrap grid, responsive utilities |
| SH-13 | Smooth transitions when switching between MFEs | CSS transitions, skeleton loading states |

---

## 6. Data Architecture

### 6.1 MongoDB Collections

#### `customers`
```typescript
interface Customer {
  _id: ObjectId;
  customerId: string;          // e.g., "CUST-0001" (branded type)
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
  autoPayEnabled: boolean;
  defaultPaymentMethod?: "CREDIT_CARD" | "BANK_TRANSFER" | "DIGITAL_WALLET";
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
    senderName: string;
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
  configXml: string;           // XML configuration manifest
  metadata: {
    manufacturer: string;
    model: string;
    firmwareVersion: string;
    installDate: Date;
  };
}
```

### 6.2 Cassandra Tables (Keyspace: `telecom_telemetry`)

```cql
-- Telemetry readings from network devices
CREATE TABLE device_telemetry (
    device_id        TEXT,
    date             DATE,
    timestamp        TIMESTAMP,
    cpu_percent      FLOAT,
    memory_percent   FLOAT,
    bandwidth_mbps   FLOAT,
    packet_loss_percent FLOAT,
    temperature_celsius FLOAT,
    PRIMARY KEY ((device_id, date), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
  AND default_time_to_live = 7776000;  -- 90-day TTL

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
| MongoDB for customers, plans, billing | Document-oriented with complex nested structures, flexible schemas, moderate read/write. MongoDB aggregation pipeline supports billing calculations. |
| Cassandra for telemetry & CDRs | High-velocity writes (thousands/sec). Partition-based model with time-clustering is purpose-built for time-series. CDRs are append-heavy and queried by customer + time. |
| Partition key `(device_id, date)` | Prevents unbounded partition growth while keeping queries efficient for "readings for device X on date Y." |
| TTL on telemetry (90 days) | Automatic expiration keeps storage bounded without manual cleanup. |
| MongoDB for devices (not Cassandra) | Device metadata is document-oriented, has graph relationships (connectedDeviceIds), and is read-heavy with infrequent updates. |

---

## 7. GraphQL Schema Design

### 7.1 Federation Approach

Apollo Federation v2 with schema-first design. Each service owns its subgraph. Types are generated via `graphql-codegen` 6.x for full type safety.

### 7.2 Customer Subgraph (Port 4001)

```graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0",
  import: ["@key", "@shareable"])

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

type PlanChangeResult {
  success: Boolean!
  customer: Customer!
  previousPlan: Plan!
  newPlan: Plan!
  effectiveDate: DateTime!
}

enum AccountStatus { ACTIVE SUSPENDED PENDING CLOSED }
enum PlanTier { BASIC STANDARD PREMIUM ENTERPRISE }
enum TicketStatus { OPEN IN_PROGRESS RESOLVED CLOSED }
enum TicketCategory { BILLING NETWORK DEVICE PLAN OTHER }
enum TicketPriority { LOW MEDIUM HIGH CRITICAL }
```

### 7.3 Network Subgraph (Port 4002)

```graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0",
  import: ["@key", "@shareable"])

type Query {
  devices(region: String, status: DeviceStatus): [NetworkDevice!]!
  device(deviceId: ID!): NetworkDevice
  telemetry(deviceId: ID!, timeRange: TimeRange!): [TelemetryReading!]!
  alerts(deviceId: ID, severity: AlertSeverity, status: AlertStatus): [Alert!]!
  alertsSummary: AlertsSummary!
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
  configXml: String
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

type AlertsSummary {
  critical: Int!
  major: Int!
  minor: Int!
  info: Int!
  total: Int!
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
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0",
  import: ["@key", "@shareable", "@external", "@requires"])

type Customer @key(fields: "customerId") {
  customerId: ID! @external
  invoices(status: InvoiceStatus, limit: Int): [Invoice!]!
  payments(limit: Int): [Payment!]!
  currentUsage: UsageSummary!
  usageByDay(month: String!): [DailyUsage!]!
  callHistory(month: String!, first: Int, after: String): CDRConnection!
  autoPayEnabled: Boolean!
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
  totalCount: Int!
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
  dataLimitGB: Float
  voiceUsedMinutes: Int!
  voiceLimitMinutes: Int
  smsCount: Int!
  smsLimit: Int
  billingCycleStart: DateTime!
  billingCycleEnd: DateTime!
}

type PaymentResult {
  success: Boolean!
  payment: Payment
  errorMessage: String
}

enum InvoiceStatus { DRAFT DUE PAID OVERDUE }
enum PaymentMethod { CREDIT_CARD BANK_TRANSFER DIGITAL_WALLET }
enum CallType { VOICE VIDEO VOIP }
enum CallStatus { COMPLETED MISSED DROPPED }
```

---

## 8. XML Integration Points

| # | Feature | Format | Endpoint / Location | Details |
|---|---------|--------|---------------------|---------|
| 1 | Network Alerts RSS Feed | RSS 2.0 (XML) | `GET /api/alerts/rss` | XML RSS feed of recent alerts for external monitoring tools. Generated with `xmlbuilder2`. |
| 2 | Payment Receipt Export | Custom XML | `GET /api/receipts/:paymentId.xml` | Structured XML receipt for enterprise integrations. Follows `receipt.xsd` schema. |
| 3 | Device Config Manifest | XML | GraphQL `configXml` field | Network device config displayed in NOC detail panel. Parsed client-side with `DOMParser`. |
| 4 | SVG Network Icons | SVG/XML | `packages/ui/assets/icons/` | Custom SVG icons for device types rendered inline. |
| 5 | Customer Data Import/Export | XML | `POST /api/import/customers`, `GET /api/export/customers` | XML bulk customer import/export for B2B partner integrations. |

---

## 9. HTML5 Feature Usage

| Feature | Usage |
|---------|-------|
| **Semantic Elements** | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` in all layouts |
| **Canvas API** | Network topology interactive rendering with D3.js |
| **SVG** | Fallback for topology; inline SVG icons for device types |
| **Form Validation** | Native constraint validation (`required`, `pattern`, `min`, `max`) + React-Bootstrap feedback |
| **LocalStorage** | Persist theme preference, sidebar state, dashboard layout |
| **SessionStorage** | Temporary state for multi-step flows (plan change, payment) |
| **Web Workers** | Offload telemetry data aggregation to prevent UI thread blocking |
| **Responsive Images** | `<picture>` and `srcset` for plan marketing images |
| **ARIA Attributes** | `aria-live` for alerts feed, `role` attributes, screen reader announcements |

---

## 10. TypeScript Patterns & Standards

### 10.1 Configuration

All projects share `tsconfig.base.json`:

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

| Pattern | Where | Example |
|---------|-------|---------|
| **Discriminated unions** | Ticket events, alert severity handling | `type TicketEvent = { type: "CREATED"; ... } \| { type: "RESOLVED"; ... }` |
| **Generic components** | `DataTable<T>` with typed columns and rows | Shared `packages/ui` component |
| **Zod validation** | Runtime validation of all GraphQL inputs | Zod 4 schemas inferred from TS types |
| **Branded types** | Prevent ID mixing | `type CustomerId = string & { __brand: "CustomerId" }` |
| **Utility types** | Service layers | `Partial`, `Pick`, `Omit`, `Record` used meaningfully |
| **Type-safe resolvers** | All subgraph resolvers | Generated by `graphql-codegen` 6.x |
| **Exhaustive switch** | Enum handling | `assertNever` pattern on discriminated unions |
| **Const assertions** | Configuration objects | `as const` for plan tiers, device types |
| **Template literal types** | ID formats | `type InvoiceNumber = \`INV-${string}\`` |

---

## 11. UI/UX Specifications

### 11.1 Design System

Built on Bootstrap 5.3 with custom Sass variable overrides.

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0066CC` | Telecom Blue — nav, buttons, links |
| Secondary | `#6C63FF` | Digital Purple — accents, charts |
| Success | `#28A745` | Operational Green — status, confirmations |
| Warning | `#FFC107` | Degraded Amber — warnings, pending states |
| Danger | `#DC3545` | Critical Red — errors, critical alerts |
| Info | `#17A2B8` | Info Cyan — informational badges |
| Background | `#F8F9FA` | Light Gray — page background |
| Surface | `#FFFFFF` | Cards, panels |
| Dark Mode BG | `#1A1D23` | Dark theme background |
| Dark Mode Surface | `#2D3039` | Dark theme cards |

### 11.2 Layout

- **Shell** provides a persistent top navbar (72px height) and collapsible sidebar (240px expanded / 60px collapsed / hidden on mobile with hamburger).
- Content area uses Bootstrap fluid container with responsive gutters.
- MFEs render within the content area and are unaware of shell chrome.
- Toast notifications stack in top-right corner.

### 11.3 Responsive Breakpoints

| Breakpoint | Width | Layout Adaptation |
|------------|-------|-------------------|
| `xs` | < 576px | Single column, hamburger menu, stacked cards, bottom nav |
| `sm` | ≥ 576px | Single column with wider cards |
| `md` | ≥ 768px | Sidebar visible (collapsed 60px), 2-column card grid |
| `lg` | ≥ 992px | Sidebar expanded (240px), 3-column card grid |
| `xl` | ≥ 1200px | Full layout, charts side-by-side, split views |
| `xxl` | ≥ 1400px | Extra spacing, larger chart containers |

### 11.4 Accessibility Requirements

- WCAG 2.1 Level AA compliance
- All interactive elements keyboard navigable (tab order, focus visible)
- Color is never the sole indicator of state (always paired with icon or text)
- Minimum contrast ratio 4.5:1 for normal text, 3:1 for large text
- Screen reader announcements for live data updates (`aria-live="polite"`)
- Skip navigation link
- Focus trap in modals and offcanvas panels

### 11.5 UI Polish Details

| Area | Detail |
|------|--------|
| Loading states | Skeleton screens for all data-dependent components (not spinners) |
| Empty states | Illustrated empty states with call-to-action (e.g., "No tickets yet — Create one") |
| Error states | Error boundary with retry button, inline error messages for form fields |
| Transitions | 200ms ease-in-out for sidebar collapse, 150ms for hover effects |
| Toasts | Auto-dismiss after 5s, stack up to 3 visible, swipe-to-dismiss on mobile |
| Tables | Sticky headers on scroll, alternating row colors, hover highlight |

---

## 12. REST API Endpoints (Non-GraphQL)

| Method | Path | Service | Purpose |
|--------|------|---------|---------|
| `GET` | `/health` | All services | Health check: `{ status: "ok", uptime, version }` |
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
| Customers | 50 | Diverse names, addresses, plan distribution across all 4 tiers |
| Plans | 8 | 2 per tier (Basic, Standard, Premium, Enterprise) |
| Tickets | 200 | Distributed across customers, all statuses, realistic conversations |
| Invoices | 300 | 6 months of history per customer |
| Payments | 250 | Mixed methods and statuses |
| Network Devices | 30 | Towers (10), routers (8), switches (7), base stations (3), fiber nodes (2) |
| Telemetry Readings | ~500,000 | 30 days of data, 1 reading per device per minute (downsampled) |
| CDRs | ~10,000 | 3 months of call records across customers |
| Daily Usage | ~4,500 | 3 months × 50 customers × 30 days |
| Alerts | 500 | Mixed severity and status across devices and time |

### 13.2 Seed Scripts

- `scripts/seed-mongo.ts` — TypeScript script using Mongoose 9 to populate MongoDB
- `scripts/seed-cassandra.ts` — TypeScript script using cassandra-driver 4.8 to populate Cassandra
- `scripts/generate-telemetry.js` — **JavaScript** utility (intentionally JS, not TS) for continuous synthetic telemetry generation during live demos

### 13.3 Demo Walkthrough (15 minutes)

| Time | Action | Technologies Demonstrated |
|------|--------|---------------------------|
| 0:00 | Launch app → Login page → Select demo customer | Shell MFE loading, Module Federation, simulated JWT auth |
| 1:00 | Customer Portal: Account dashboard loads | SSR (Next.js 16), GraphQL query (Apollo 4), MongoDB, React-Bootstrap layout, skeleton loading |
| 2:30 | Browse plans → Compare 3 plans → Change plan | Optimistic UI, GraphQL mutation, TypeScript form validation, Zod, Apollo cache update |
| 4:00 | Create support ticket → See real-time status update | GraphQL subscriptions (graphql-ws 6), WebSocket, HTML5 form validation, chat UI |
| 5:30 | Navigate to NOC Dashboard (MFE 2) | MFE switching, Module Federation remote loading, Suspense fallback |
| 6:00 | Explore network topology → Click tower node | Canvas/D3.js rendering, SVG icons (XML), GraphQL device query, Offcanvas panel |
| 7:30 | View telemetry charts → Switch time range → Watch auto-refresh | Cassandra time-series queries, Recharts, polling, countdown indicator |
| 9:00 | See incoming critical alert → Acknowledge it | GraphQL subscription, mutation, Bootstrap alert with pulse animation |
| 10:00 | Export alerts as RSS feed (view XML in browser) | XML generation (xmlbuilder2), REST endpoint |
| 10:30 | Navigate to Billing Console (MFE 3) | Third MFE loading |
| 11:00 | View invoices → Drill into detail → Pay invoice | MongoDB queries, GraphQL mutations, idempotency key, payment simulation |
| 12:00 | View usage analytics → Browse call history (paginated) | Cassandra queries, cursor pagination, Recharts area chart |
| 13:00 | Download XML payment receipt | XML generation, file download |
| 13:30 | Toggle dark mode → Resize browser (responsive) | Bootstrap theming, CSS custom properties, responsive breakpoints |
| 14:00 | Show code: monorepo structure, Docker Compose, TypeScript strict mode, GraphQL schema | Architecture and tooling tour |
| 14:30 | Q&A | |

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
| Unit (components) | Vitest 4 + React Testing Library 16 | 80% of shared UI components |
| Unit (services) | Vitest 4 | 80% of resolver logic |
| Integration (GraphQL) | Vitest 4 + supertest | All queries and mutations |
| E2E | Playwright 1.58 | Critical path flows |
| Visual Regression | Playwright screenshots | Key pages at 3 breakpoints |

### 14.3 Security (Demo-Level)

- Simulated JWT authentication (no real auth provider)
- GraphQL depth limiting (max depth: 7) and query complexity analysis
- Rate limiting on REST endpoints (express-rate-limit)
- Input sanitization on all GraphQL string inputs (Zod validation)
- CORS configured to allow only the shell app's origin

---

## 15. Development Workflow

### 15.1 Getting Started

```bash
git clone <repo-url>
cd telecom-nexus
npm install                                          # Install all workspace deps
docker compose -f docker/docker-compose.yml up -d    # Start MongoDB + Cassandra
npx turbo run seed                                   # Seed both databases
npx turbo run dev                                    # Start everything
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
npx turbo run dev --filter=customer-portal   # Run single MFE
npx turbo run test                           # All tests
npx turbo run typecheck                      # Type check monorepo
npx turbo run lint                           # Lint all packages
npx turbo run build                          # Production build
npx turbo run test:e2e                       # E2E tests
```

---

## 16. Implementation Plan — Phase by Phase with Stories

### Phase 1: Foundation & Monorepo Scaffold

**Goal**: Establish the monorepo structure so all workspaces can link, build, and type-check from day one.

| Story ID | Story | Acceptance Criteria |
|----------|-------|---------------------|
| F-1.1 | Initialize root monorepo | Root `package.json` with npm workspaces config, `.nvmrc` set to Node 22, `.gitignore` for node_modules/dist/docker volumes |
| F-1.2 | Configure Turborepo | `turbo.json` with pipeline: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `seed`. Correct dependency graph between packages and apps. |
| F-1.3 | Set up shared TypeScript config | `tsconfig.base.json` with strict settings from §10.1. Each workspace extends it. |
| F-1.4 | Scaffold all workspace directories | Create empty `package.json` + `tsconfig.json` for every workspace in `apps/` and `packages/`. Verify `npx turbo run build` runs (even if no-op). |
| F-1.5 | Create Docker Compose file | `docker/docker-compose.yml` with MongoDB 8 + Cassandra 5 containers, persistent volumes, health checks, port mappings (27017, 9042). |
| F-1.6 | Create database init scripts | `docker/mongo-init/` with JS init script (create DB, user). `docker/cassandra-init/` with CQL schema for keyspace + all 4 tables from §6.2. |
| F-1.7 | Set up shared linting/formatting | `packages/config` with ESLint 10 flat config (TypeScript + React rules), Prettier 3.8 config, shared tsconfig. Root workspace references these. |

**Definition of Done**: `npm install` succeeds, `docker compose up -d` starts both databases, `npx turbo run typecheck` passes across all workspaces.

---

### Phase 2: Shared Packages

**Goal**: Build the foundational shared code that apps and services depend on.

| Story ID | Story | Acceptance Criteria |
|----------|-------|---------------------|
| P-2.1 | Create `packages/types` — Core domain types | All TypeScript interfaces from §6.1 (Customer, Plan, Ticket, Invoice, Payment, NetworkDevice). All enums. Branded types for IDs (`CustomerId`, `DeviceId`, etc.). Discriminated union for `TicketEvent`. `assertNever` utility. |
| P-2.2 | Create `packages/graphql-schema` — GraphQL definitions | All `.graphql` schema files from §7 (customer, network, billing subgraphs). Shared fragments for common fields. `graphql-codegen` 6.x config to generate TypeScript types from schemas. Verify codegen runs. |
| P-2.3 | Create `packages/ui` — Shared component library (Part 1: Primitives) | Bootstrap 5 custom theme Sass file with telecom brand colors (§11.1). `DataTable<T>` generic component. `StatusBadge` for account/ticket/alert/invoice statuses. `SkeletonLoader` component. `EmptyState` component. All with React-Bootstrap. |
| P-2.4 | Create `packages/ui` — Shared component library (Part 2: Layout) | `AppNavbar` component (72px). `Sidebar` component (expandable/collapsible/hidden). `PageContainer` with breadcrumb support. `ToastStack` for notifications. Dark mode CSS custom property setup. |
| P-2.5 | Create `packages/ui` — SVG Icon set | SVG XML icons for: tower, router, switch, base station, fiber node, plus status indicators. Inline SVG React components. |
| P-2.6 | Create `packages/xml-utils` | `xmlbuilder2` utilities for: RSS feed generation, payment receipt XML generation, device config XML parsing. XSD schema for receipt (`receipt.xsd`). XML import/export helpers for customer data. |
| P-2.7 | Create `packages/config` — Final polish | Verify ESLint 10 config works across all workspaces. Prettier formatting consistent. Add lint-staged + husky for pre-commit hooks. |

**Definition of Done**: All packages build, types generate from GraphQL schemas, shared UI components render in isolation, XML utilities pass unit tests.

---

### Phase 3: Backend Services

**Goal**: Stand up the full API layer with real database connectivity.

| Story ID | Story | Acceptance Criteria |
|----------|-------|---------------------|
| B-3.1 | Customer Service — Mongoose models | Mongoose 9 schemas for `Customer`, `Plan`, `Ticket` matching §6.1 interfaces. Indexes: unique on `customerId`, `planCode`, `ticketId`. TTL index not needed here. Zod validation schemas for mutation inputs. |
| B-3.2 | Customer Service — Apollo Server + resolvers | Apollo Server 5 on Express 5 (port 4001). Federation v2 directives. All queries from §7.2 implemented. All mutations with Zod input validation. Health check endpoint (`/health`). Type-safe resolvers via codegen. |
| B-3.3 | Customer Service — Subscriptions & REST | GraphQL subscription `ticketUpdated` via graphql-ws 6. REST endpoints: `POST /api/import/customers` (XML), `GET /api/export/customers` (XML). |
| B-3.4 | Network Service — Mongoose + Cassandra models | Mongoose schema for `NetworkDevice` (§6.1). Cassandra client connection and prepared statements for `device_telemetry` and `alerts_by_device` tables. |
| B-3.5 | Network Service — Apollo Server + resolvers | Apollo Server 5 on Express 5 (port 4002). All queries from §7.3: devices, telemetry (Cassandra time-range reads), alerts. Mutations: acknowledgeAlert, resolveAlert. AlertsSummary query. |
| B-3.6 | Network Service — Subscriptions & REST | Subscriptions: `newAlert`, `telemetryUpdate`. REST: `GET /api/alerts/rss` (RSS XML), `GET /api/devices/:deviceId/config.xml`. |
| B-3.7 | Billing Service — Mongoose + Cassandra models | Mongoose schemas for `Invoice`, `Payment`. Cassandra prepared statements for `cdr_by_customer`, `usage_by_day`. |
| B-3.8 | Billing Service — Apollo Server + resolvers | Apollo Server 5 on Express 5 (port 4003). Extends `Customer` type with invoices, payments, usage. Invoice query. Pay mutation with idempotency. Auto-pay toggle. Cursor pagination for CDRs. |
| B-3.9 | Billing Service — REST endpoints | `GET /api/receipts/:paymentId.xml` — XML receipt generation. |
| B-3.10 | Apollo Gateway | Apollo Gateway 2.13 on port 4000. Composes all 3 subgraphs. Health check. CORS configuration. GraphQL depth limiting (max 7). Query complexity analysis. |

**Definition of Done**: All 4 services start, gateway composes the supergraph, every GraphQL query/mutation works against live MongoDB + Cassandra (with test data inserted manually).

---

### Phase 4: Seed Data & Demo Data Generation

**Goal**: Populate databases with realistic telecom data for the demo.

| Story ID | Story | Acceptance Criteria |
|----------|-------|---------------------|
| S-4.1 | MongoDB seed script | `scripts/seed-mongo.ts` using Mongoose 9. Creates: 50 customers (diverse names, addresses, plan distribution), 8 plans (2 per tier), 200 tickets (all statuses, realistic multi-message conversations), 300 invoices (6 months), 250 payments (mixed methods/statuses), 30 network devices (with adjacency graph and config XML). Idempotent (drops and recreates). |
| S-4.2 | Cassandra seed script | `scripts/seed-cassandra.ts` using cassandra-driver 4.8. Creates: ~500K telemetry readings (30 days, realistic patterns — CPU spikes, bandwidth cycles), ~10K CDRs (3 months, diverse call types), ~4.5K daily usage records, 500 alerts (mixed severity, some resolved, some active). Idempotent. |
| S-4.3 | Live telemetry generator | `scripts/generate-telemetry.js` (JavaScript). Continuously generates synthetic telemetry for all 30 devices every 10 seconds. Simulates realistic patterns: gradual CPU increases, bandwidth spikes during peak hours, occasional packet loss bursts. Writes to Cassandra. For live demo use. |
| S-4.4 | Seed pipeline integration | `npx turbo run seed` runs both seed scripts in correct order (Mongo first, then Cassandra). Handles connection retries for database startup. |

**Definition of Done**: `npx turbo run seed` populates both databases. Query any customer, device, or invoice via the gateway and get realistic data.

---

### Phase 5: Shell Application & Micro Frontends

**Goal**: Build all 4 frontend applications with Module Federation composition.

| Story ID | Story | Acceptance Criteria |
|----------|-------|---------------------|
| MF-5.1 | Shell — Next.js 16 host with Module Federation | Next.js 16 App Router. Module Federation host config consuming 3 remotes. Apollo Client 4 provider with gateway URL. Global layout: navbar (72px), sidebar (collapsible), content area, footer. `Suspense` boundaries for MFE loading with skeleton fallbacks. |
| MF-5.2 | Shell — Auth & theming | Simulated JWT auth: login page, auth context shared via Module Federation. Dark mode toggle with `data-bs-theme`. Theme persisted to localStorage. "Switch Customer" dropdown for demo. |
| MF-5.3 | Shell — Navigation & routing | Sidebar links to: Customer Portal (Account, Plans, Tickets), NOC (Topology, Telemetry, Alerts), Billing (Invoices, Usage, Payments). Breadcrumb component. Active state highlighting. Mobile hamburger menu. |
| MF-5.4 | Customer Portal — Account Dashboard page | SSR-rendered account page. Customer profile card. Active plan with progress bars. Quick action cards. Quick stats row. Skeleton loading. All data from GraphQL via Apollo Client 4. |
| MF-5.5 | Customer Portal — Plan Management page | Plan cards grid grouped by tier tabs. Comparison modal (select up to 3). Change plan flow: select → confirm → mutation → optimistic update → success toast. Current plan highlighted. |
| MF-5.6 | Customer Portal — Support Tickets page | Create ticket form with validation. Ticket list with status tab filters. Ticket detail with chat-like message thread. Real-time updates via subscription. Status stepper visualization. |
| MF-5.7 | Customer Portal — Module Federation remote config | Exposes: `./CustomerApp`, `./AccountOverview`, `./PlanSelector`, `./SupportTickets`. Can run standalone on port 3001. Shares React, Apollo Client, Bootstrap with host. |
| MF-5.8 | NOC Dashboard — Network Topology page | Canvas/D3.js interactive topology. Nodes: device icons (SVG/XML) color-coded by status. Connection lines (solid/dashed/red by status). Click node → Offcanvas detail panel. Region filter. Zoom/pan. Mini-map. |
| MF-5.9 | NOC Dashboard — Telemetry Charts page | 2x2 chart grid (CPU, Memory, Bandwidth, Packet Loss). Recharts area charts. Time range pill buttons (1h, 6h, 24h, 7d). Auto-refresh 10s with countdown ring. Device selector. Compare devices mode. Temperature gauge. |
| MF-5.10 | NOC Dashboard — Alerts page | Real-time alerts feed (subscription). Split view: list + detail. Severity badges with pulse on Critical. Acknowledge/Resolve workflow with mutations. Alert history search. RSS export button. Summary banner with severity counts. |
| MF-5.11 | NOC Dashboard — Module Federation remote config | Exposes: `./NOCApp`, `./NetworkTopology`, `./AlertsFeed`, `./TelemetryCharts`. Standalone on port 3002. |
| MF-5.12 | Billing Console — Invoice Management page | Invoice table (sortable, status badges). Invoice detail (receipt layout with line items). Pay Now modal with method selection and idempotency. Status timeline stepper. Overdue warning banner. |
| MF-5.13 | Billing Console — Usage Analytics page | Usage summary cards with circular progress (used vs limit). Daily usage area chart with plan limit reference line. Call log table with cursor pagination (infinite scroll). SMS log. Month selector. |
| MF-5.14 | Billing Console — Payment History page | Payment timeline (vertical). Method icons. Status badges. XML receipt download button. Auto-pay toggle card. Payment method management. |
| MF-5.15 | Billing Console — Module Federation remote config | Exposes: `./BillingApp`, `./InvoiceList`, `./UsageBreakdown`, `./PaymentHistory`. Standalone on port 3003. |

**Definition of Done**: All 4 apps run independently. Shell loads all 3 MFEs via Module Federation. Full data flow: UI → GraphQL → service → database → reflected in UI.

---

### Phase 6: Integration, Polish & Accessibility

**Goal**: End-to-end integration, responsive design, accessibility compliance, and UI polish.

| Story ID | Story | Acceptance Criteria |
|----------|-------|---------------------|
| I-6.1 | Module Federation integration testing | All 3 MFEs load correctly in shell. Shared dependencies (React, Apollo, Bootstrap) not duplicated. MFE switching is seamless with transition. Error boundary fallback if a remote fails. |
| I-6.2 | GraphQL subscriptions end-to-end | Ticket updates, new alerts, telemetry updates all work through the gateway via WebSocket. Reconnection logic on disconnect. |
| I-6.3 | Responsive design pass | Verify all views at: 375px (mobile), 576px, 768px (tablet), 992px, 1200px, 1440px (desktop). Sidebar behavior correct at each breakpoint. Tables become cards on mobile. Charts resize properly. |
| I-6.4 | Accessibility audit | WCAG 2.1 AA: keyboard navigation on all interactive elements, focus visible, skip navigation link, ARIA labels on charts, `aria-live` on alerts feed, contrast ratios verified, no color-only indicators. |
| I-6.5 | Loading, empty, and error states | Skeleton loading on all data-dependent pages. Empty states with illustrations. Error boundary with retry button. Toast notifications for mutations. Form validation feedback. |
| I-6.6 | Dark mode polish | All components render correctly in dark mode. Charts update colors. Topology background adjusts. No contrast issues. Smooth transition on toggle. |
| I-6.7 | XML integration verification | RSS feed renders valid XML in browser. Payment receipt downloads correctly. Device config XML displays in NOC panel. SVG icons render inline. Customer import/export works. |
| I-6.8 | Performance optimization | SSR where specified (account dashboard). Apollo cache normalization. Code splitting per MFE. Web Worker for telemetry aggregation. Verify LCP < 2.5s. |

**Definition of Done**: Full end-to-end demo path works. All 6 breakpoints pass. Accessibility audit passes. Dark mode works throughout. All XML integration points functional.

---

### Phase 7: Testing

**Goal**: Comprehensive test coverage across all layers.

| Story ID | Story | Acceptance Criteria |
|----------|-------|---------------------|
| T-7.1 | Unit tests — Shared UI components | Vitest 4 + React Testing Library 16. Test: DataTable, StatusBadge, SkeletonLoader, Sidebar, Navbar, ToastStack. Target: 80% coverage on `packages/ui`. |
| T-7.2 | Unit tests — Backend resolvers | Vitest 4. Test all resolver logic for Customer, Network, Billing services. Mock database calls. Test Zod validation rejects invalid inputs. Target: 80% coverage. |
| T-7.3 | Integration tests — GraphQL API | Vitest 4 + supertest. Spin up each service against test database containers. Test all queries, mutations. Verify federation entity resolution. |
| T-7.4 | Integration tests — XML endpoints | Test RSS feed is valid XML. Test receipt XML matches XSD. Test customer import/export roundtrip. |
| T-7.5 | E2E tests — Critical path | Playwright 1.58. Scenario 1: Login → View account → Change plan. Scenario 2: Create ticket → See real-time update. Scenario 3: View topology → Click device. Scenario 4: Pay invoice → Download receipt. |
| T-7.6 | Visual regression | Playwright screenshots at 375px, 768px, 1440px. Key pages: account dashboard, topology, telemetry, invoice list. Light + dark mode. |
| T-7.7 | TypeScript strict verification | `npx turbo run typecheck` passes with zero errors. Zero `any` types in production code (verified by ESLint rule). |

**Definition of Done**: All tests pass. Coverage meets targets. Visual regression baselines established.

---

### Phase 8: CI/CD & Demo Readiness

**Goal**: Automation, containerization, and a polished demo experience.

| Story ID | Story | Acceptance Criteria |
|----------|-------|---------------------|
| D-8.1 | GitHub Actions — CI pipeline | On every PR: install, lint, typecheck, test (unit + integration). Turborepo remote caching. Matrix: Node 22. |
| D-8.2 | GitHub Actions — E2E pipeline | On merge to main: build all, start docker, seed, run Playwright E2E. Upload screenshots as artifacts. |
| D-8.3 | Docker Compose full-stack | `docker compose up` starts: MongoDB, Cassandra, all 3 services, gateway, all 4 frontend apps. Health check waits for databases. Auto-seed on first run. |
| D-8.4 | Demo script finalization | Verify 15-minute walkthrough (§13.3) works end-to-end. Document any manual steps. Create a README with demo instructions. |
| D-8.5 | Security hardening | GraphQL depth limit enforced. Rate limiting on REST endpoints. CORS locked down. Zod validation on all inputs. No secrets in code. |

**Definition of Done**: CI passes on GitHub. `docker compose up` brings up the entire platform. Demo walkthrough completes in 15 minutes with no errors.

---

## 17. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Module Federation + Next.js 16 App Router compatibility | High | Pin `@module-federation/nextjs-mf` to a stable release; test early in Phase 1; maintain fallback iframe composition |
| Cassandra Docker image memory consumption | Medium | Configure JVM heap to 512MB for dev; document 8GB RAM minimum |
| Scope creep | High | Strict adherence to this PRD; any additions must replace an existing feature |
| GraphQL subscription through federation gateway | Medium | Use `graphql-ws` 6.x; implement connection throttling; test early in Phase 3 |
| Apollo Client 4 + Apollo Server 5 compatibility | Low | Both are latest stable; follow migration guides if any issues |
| Bootstrap + React-Bootstrap version mismatch | Low | Lock both versions; test on each upgrade |

---

## 18. Version Change Log (v1 → v2)

| Change | Rationale |
|--------|-----------|
| Next.js 15.x → **16.1.x** | Next.js 16 is current stable with improved App Router, better server components |
| TypeScript 5.7.x → **5.9.x** | Latest stable with improved type inference |
| Apollo Client 3.12.x → **4.1.x** | Major upgrade with improved caching, React 19 hooks |
| Apollo Server 4.x → **5.4.x** | Major upgrade with improved performance, Express 5 integration |
| Mongoose 8.x → **9.2.x** | Major upgrade with improved TypeScript support |
| ESLint 9.x → **10.0.x** | Latest with improved flat config support |
| Vitest 2.x → **4.0.x** | Major upgrade with improved performance, better module mocking |
| Playwright 1.49.x → **1.58.x** | Latest with improved browser support |
| Zod (unspecified) → **4.3.x** | Pinned to latest stable v4 |
| graphql-ws (unspecified) → **6.0.x** | Pinned to latest stable |
| graphql-codegen (unspecified) → **6.1.x** | Pinned to latest stable |
| Recharts (unspecified) → **3.7.x** | Pinned to latest stable |
| D3.js (optional) → **7.9.x** | Pinned for topology canvas rendering |
| Added `AlertsSummary` query | Better NOC dashboard summary banner |
| Added `UsageSummary` with limits | Show usage against plan limits in billing |
| Added `PlanChangeResult` type | Richer feedback on plan change mutation |
| Added `PaymentResult` type | Structured payment response |
| Added `totalCount` to CDRConnection | Better pagination UX |
| Added `autoPayEnabled` to Customer | Support auto-pay feature in billing |
| Added skeleton loading spec | Better UX than spinners |
| Added empty state spec | Better UX for zero-data scenarios |
| Added `configXml` to NetworkDevice | Device config XML stored on device model |
| Restructured features as Epics/Stories | Better interview discussion and traceability |
| Added UI specification per story | Clearer design intent for implementation |

---

## 19. Future Enhancements (Out of Scope for v1)

- Real authentication via Auth0 or Clerk
- Kubernetes deployment manifests
- Observability stack (OpenTelemetry + Grafana)
- Internationalization (i18n)
- Push notifications for alerts (Web Push API)
- AI-powered ticket routing
- Load testing with k6

---

## 20. Glossary

| Term | Definition |
|------|------------|
| **CDR** | Call Detail Record — a log entry for each voice/video/data call |
| **MFE** | Micro Frontend — an independently deployable frontend module |
| **NOC** | Network Operations Center — team/interface monitoring network health |
| **SSR** | Server-Side Rendering — generating HTML on the server for fast initial load |
| **SSG** | Static Site Generation — pre-rendering pages at build time |
| **TTL** | Time To Live — automatic data expiration in databases |
| **XSD** | XML Schema Definition — formal specification for XML document structure |
| **LCP** | Largest Contentful Paint — Core Web Vital measuring load performance |
| **Federation** | Apollo Federation — architecture for composing multiple GraphQL services |
| **Branded Type** | TypeScript pattern using intersection types to prevent mixing different ID types |

---

*End of Document — v2.0*
