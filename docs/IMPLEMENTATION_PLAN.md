# TelecomNexus — Implementation Plan

> Phase-by-phase, story-by-story guide for building the entire platform.
> Reference: `telecom-nexus-prd-v2.md` for full requirements.

---

## Table of Contents

1. [Phase 1 — Foundation & Monorepo Scaffold](#phase-1--foundation--monorepo-scaffold)
2. [Phase 2 — Shared Packages](#phase-2--shared-packages)
3. [Phase 3 — Backend Services](#phase-3--backend-services)
4. [Phase 4 — Seed Data & Demo Data Generation](#phase-4--seed-data--demo-data-generation)
5. [Phase 5 — Shell Application & Micro Frontends](#phase-5--shell-application--micro-frontends)
6. [Phase 6 — Integration, Polish & Accessibility](#phase-6--integration-polish--accessibility)
7. [Phase 7 — Testing](#phase-7--testing)
8. [Phase 8 — CI/CD & Demo Readiness](#phase-8--cicd--demo-readiness)

---

## Phase 1 — Foundation & Monorepo Scaffold

**Goal**: Establish the monorepo so every workspace can install, link, and type-check from day one.

**Prerequisites**: Node.js 22.x LTS, Docker Desktop, npm 10.x

---

### Story F-1.1 — Initialize Root Monorepo

**What to build:**
- Root `package.json` with npm workspaces pointing to `apps/*`, `apps/services/*`, `packages/*`
- `.nvmrc` pinning Node 22
- `.gitignore` covering node_modules, dist, .next, .turbo, docker volumes, .env files
- Root `README.md` with project overview and quick start

**Files to create:**
```
package.json
.nvmrc
.gitignore
README.md
```

**Acceptance criteria:**
- `npm install` succeeds (even with empty workspaces — they'll be scaffolded next)
- `.nvmrc` contains `22`
- `.gitignore` excludes: `node_modules/`, `dist/`, `.next/`, `.turbo/`, `docker/data/`, `*.env`, `.env.local`

---

### Story F-1.2 — Configure Turborepo

**What to build:**
- `turbo.json` defining the full task pipeline with dependency graph

**Pipeline tasks:**
| Task | dependsOn | outputs |
|------|-----------|---------|
| `build` | `^build` | `.next/**`, `dist/**` |
| `dev` | `^build` | — (persistent) |
| `lint` | `^build` | — |
| `typecheck` | `^build` | — |
| `test` | `^build` | `coverage/**` |
| `test:e2e` | `build` | `test-results/**` |
| `seed` | — | — |
| `codegen` | — | `src/__generated__/**` |

**Files to create:**
```
turbo.json
```

**Acceptance criteria:**
- `npx turbo run build` executes the pipeline (no-op for empty workspaces, but no errors)
- Task dependency graph is correct: packages build before apps, codegen is standalone

---

### Story F-1.3 — Shared TypeScript Configuration

**What to build:**
- Root `tsconfig.base.json` with strict settings per PRD §10.1
- Workspace-specific `tsconfig.json` files extending the base

**Configuration (tsconfig.base.json):**
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
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true
  }
}
```

**Files to create:**
```
tsconfig.base.json
```

**Acceptance criteria:**
- Every workspace `tsconfig.json` extends `../../tsconfig.base.json` (or appropriate relative path)
- `npx turbo run typecheck` passes with zero errors

---

### Story F-1.4 — Scaffold All Workspace Directories

**What to build:**
- Empty `package.json` + `tsconfig.json` for every workspace
- Each package.json has correct `name`, `private: true`, and placeholder `scripts`

**Directories and package names:**

| Workspace Path | Package Name |
|---|---|
| `apps/shell` | `@telecom-nexus/shell` |
| `apps/customer-portal` | `@telecom-nexus/customer-portal` |
| `apps/noc-dashboard` | `@telecom-nexus/noc-dashboard` |
| `apps/billing-console` | `@telecom-nexus/billing-console` |
| `apps/gateway` | `@telecom-nexus/gateway` |
| `apps/services/customer-service` | `@telecom-nexus/customer-service` |
| `apps/services/network-service` | `@telecom-nexus/network-service` |
| `apps/services/billing-service` | `@telecom-nexus/billing-service` |
| `packages/ui` | `@telecom-nexus/ui` |
| `packages/graphql-schema` | `@telecom-nexus/graphql-schema` |
| `packages/config` | `@telecom-nexus/config` |
| `packages/xml-utils` | `@telecom-nexus/xml-utils` |
| `packages/types` | `@telecom-nexus/types` |

**Also create:**
```
docker/
docker/mongo-init/
docker/cassandra-init/
scripts/
```

**Acceptance criteria:**
- `npm install` resolves all workspaces
- `npx turbo run build --dry-run` shows all 13 workspaces in the graph
- Directory structure matches PRD §4.3

---

### Story F-1.5 — Docker Compose for Databases

**What to build:**
- `docker/docker-compose.yml` with MongoDB 8 and Cassandra 5

**MongoDB container:**
- Image: `mongo:8`
- Port: `27017:27017`
- Volume: `./data/mongo:/data/db`
- Init script mount: `./mongo-init:/docker-entrypoint-initdb.d`
- Environment: `MONGO_INITDB_DATABASE=telecom_nexus`
- Health check: `mongosh --eval "db.runCommand('ping')"`

**Cassandra container:**
- Image: `cassandra:5`
- Port: `9042:9042`
- Volume: `./data/cassandra:/var/lib/cassandra`
- Environment: `MAX_HEAP_SIZE=512M`, `HEAP_NEWSIZE=128M`, `CASSANDRA_CLUSTER_NAME=TelecomCluster`
- Health check: `cqlsh -e "DESCRIBE KEYSPACES"` with retries (Cassandra takes 30-60s to start)

**Files to create:**
```
docker/docker-compose.yml
docker/.env                 # Default env vars for docker
```

**Acceptance criteria:**
- `docker compose -f docker/docker-compose.yml up -d` starts both containers
- MongoDB is connectable at `localhost:27017`
- Cassandra is connectable at `localhost:9042` (after health check passes)
- Containers use persistent volumes so data survives restarts

---

### Story F-1.6 — Database Initialization Scripts

**What to build:**

**MongoDB init** (`docker/mongo-init/01-init.js`):
- Create database `telecom_nexus`
- Create collections: `customers`, `plans`, `tickets`, `invoices`, `payments`, `devices`
- Create indexes: unique on `customerId`, `planCode`, `ticketId`, `invoiceNumber`, `paymentId`, `deviceId`
- TTL index on `invoices.createdAt` (365 days for archival demo)

**Cassandra init** (`docker/cassandra-init/01-schema.cql`):
- Create keyspace `telecom_telemetry` with `SimpleStrategy` replication factor 1
- Create all 4 tables from PRD §6.2:
  - `device_telemetry` — PK: `(device_id, date)`, cluster: `timestamp DESC`, TTL 90 days
  - `cdr_by_customer` — PK: `(customer_id, month)`, cluster: `timestamp DESC, call_id ASC`
  - `usage_by_day` — PK: `(customer_id, month)`, cluster: `date ASC`
  - `alerts_by_device` — PK: `(device_id, month)`, cluster: `timestamp DESC, alert_id ASC`

**Note:** Cassandra init scripts need a wrapper script that waits for the container to be ready before running CQL, since Cassandra's built-in init is less reliable than MongoDB's. Create `docker/cassandra-init/init.sh` that retries `cqlsh` until ready.

**Files to create:**
```
docker/mongo-init/01-init.js
docker/cassandra-init/01-schema.cql
docker/cassandra-init/init.sh
```

**Acceptance criteria:**
- After `docker compose up`, MongoDB has all 6 collections with indexes
- After running the Cassandra init script, keyspace `telecom_telemetry` exists with all 4 tables
- Tables match the exact CQL definitions in the PRD

---

### Story F-1.7 — Shared Linting & Formatting Configuration

**What to build:**

**`packages/config/eslint/base.js`** — ESLint 10 flat config:
- TypeScript parser + plugin
- React + React Hooks plugin
- Import plugin for sorting
- Rule: `no-explicit-any` set to `error` (enforce zero `any`)
- Rule: no unused variables (error)
- Integration with Prettier (eslint-config-prettier)

**`packages/config/prettier/index.js`** — Prettier 3.8 config:
- Semi: true, singleQuote: true, trailingComma: 'all', printWidth: 100, tabWidth: 2

**`packages/config/tsconfig/base.json`** — Re-export of root tsconfig.base for workspaces
**`packages/config/tsconfig/next.json`** — Next.js-specific TS config extensions
**`packages/config/tsconfig/node.json`** — Node.js service-specific TS config extensions

**Root config files:**
- `eslint.config.js` — imports from `@telecom-nexus/config`
- `.prettierrc.js` — imports from `@telecom-nexus/config`

**Files to create:**
```
packages/config/package.json
packages/config/eslint/base.js
packages/config/eslint/next.js
packages/config/eslint/node.js
packages/config/prettier/index.js
packages/config/tsconfig/base.json
packages/config/tsconfig/next.json
packages/config/tsconfig/node.json
eslint.config.js
.prettierrc.js
```

**Acceptance criteria:**
- `npx turbo run lint` runs ESLint across all workspaces with zero errors on empty projects
- Prettier formats consistently across all workspaces
- `any` usage in production code is flagged as an error by ESLint

---

### Phase 1 Definition of Done

- [ ] `npm install` succeeds from a clean clone
- [ ] `docker compose -f docker/docker-compose.yml up -d` starts MongoDB + Cassandra
- [ ] MongoDB has collections + indexes after init
- [ ] Cassandra has keyspace + tables after init script
- [ ] `npx turbo run typecheck` passes across all 13 workspaces
- [ ] `npx turbo run lint` passes across all workspaces
- [ ] Monorepo structure matches PRD §4.3

---

## Phase 2 — Shared Packages

**Goal**: Build the foundational shared code that all apps and services depend on.

**Prerequisites**: Phase 1 complete

---

### Story P-2.1 — `packages/types` — Core Domain Types

**What to build:**

**Branded types** (`src/branded.ts`):
```typescript
type CustomerId = string & { readonly __brand: 'CustomerId' };
type DeviceId = string & { readonly __brand: 'DeviceId' };
type TicketId = string & { readonly __brand: 'TicketId' };
type InvoiceNumber = string & { readonly __brand: 'InvoiceNumber' };
type PaymentId = string & { readonly __brand: 'PaymentId' };
type PlanCode = string & { readonly __brand: 'PlanCode' };
```

**Domain interfaces** (`src/models/`):
- `customer.ts` — `Customer`, `Address` interfaces matching PRD §6.1
- `plan.ts` — `Plan`, `PlanFeatures` interfaces
- `ticket.ts` — `Ticket`, `TicketMessage` interfaces
- `invoice.ts` — `Invoice`, `LineItem`, `BillingPeriod` interfaces
- `payment.ts` — `Payment` interface
- `device.ts` — `NetworkDevice`, `GeoLocation`, `DeviceMetadata` interfaces

**Enums** (`src/enums.ts`):
- `AccountStatus`, `PlanTier`, `TicketStatus`, `TicketCategory`, `TicketPriority`
- `InvoiceStatus`, `PaymentMethod`, `PaymentStatus`
- `DeviceType`, `DeviceStatus`, `AlertSeverity`, `AlertStatus`
- `CallType`, `CallStatus`, `Granularity`

**Discriminated unions** (`src/events.ts`):
```typescript
type TicketEvent =
  | { type: 'CREATED'; ticketId: TicketId; customerId: CustomerId; timestamp: Date }
  | { type: 'ASSIGNED'; ticketId: TicketId; agentId: string; timestamp: Date }
  | { type: 'MESSAGE_ADDED'; ticketId: TicketId; sender: 'CUSTOMER' | 'AGENT'; timestamp: Date }
  | { type: 'STATUS_CHANGED'; ticketId: TicketId; from: TicketStatus; to: TicketStatus; timestamp: Date }
  | { type: 'RESOLVED'; ticketId: TicketId; resolution: string; timestamp: Date };
```

**Utilities** (`src/utils.ts`):
- `assertNever(x: never): never` — exhaustive switch helper
- Brand creation helpers: `createCustomerId(s: string): CustomerId`, etc.
- Template literal types: `type InvoiceNumberFormat = \`INV-${string}\``

**Files to create:**
```
packages/types/package.json
packages/types/tsconfig.json
packages/types/src/index.ts           # barrel export
packages/types/src/branded.ts
packages/types/src/enums.ts
packages/types/src/events.ts
packages/types/src/utils.ts
packages/types/src/models/customer.ts
packages/types/src/models/plan.ts
packages/types/src/models/ticket.ts
packages/types/src/models/invoice.ts
packages/types/src/models/payment.ts
packages/types/src/models/device.ts
packages/types/src/models/index.ts
```

**Acceptance criteria:**
- Package builds with `tsc` producing declaration files
- Zero `any` types
- All PRD §6.1 interfaces and §6.2 enums are represented
- Branded types prevent `CustomerId` from being assigned to `DeviceId`

---

### Story P-2.2 — `packages/graphql-schema` — GraphQL Definitions & Codegen

**What to build:**

**Schema files** (`src/schemas/`):
- `customer.graphql` — Full customer subgraph schema from PRD §7.2
- `network.graphql` — Full network subgraph schema from PRD §7.3
- `billing.graphql` — Full billing subgraph schema from PRD §7.4
- `shared.graphql` — Shared scalars (`DateTime`), common types (`PageInfo`, `Address`)

**Fragments** (`src/fragments/`):
- `customerFields.graphql` — Common Customer fields
- `planFields.graphql` — Common Plan fields
- `ticketFields.graphql` — Ticket with messages
- `deviceFields.graphql` — Device with metadata
- `invoiceFields.graphql` — Invoice with line items
- `telemetryFields.graphql` — TelemetryReading fields
- `alertFields.graphql` — Alert fields

**Client operations** (`src/operations/`):
- `customer-queries.graphql` — `GetCustomer`, `GetPlans`, `GetTickets`, `GetTicket`
- `customer-mutations.graphql` — `ChangePlan`, `CreateTicket`, `AddTicketMessage`, `UpdateProfile`
- `network-queries.graphql` — `GetDevices`, `GetDevice`, `GetTelemetry`, `GetAlerts`, `GetAlertsSummary`
- `network-mutations.graphql` — `AcknowledgeAlert`, `ResolveAlert`
- `billing-queries.graphql` — `GetInvoices`, `GetInvoice`, `GetUsageByDay`, `GetCallHistory`, `GetCurrentUsage`
- `billing-mutations.graphql` — `PayInvoice`, `ToggleAutoPay`
- `subscriptions.graphql` — `OnTicketUpdated`, `OnNewAlert`, `OnTelemetryUpdate`

**Codegen config** (`codegen.ts`):
- Generate TypeScript types from schemas
- Generate typed document nodes for client operations
- Generate typed resolvers for each subgraph service
- Output to `src/__generated__/`

**Files to create:**
```
packages/graphql-schema/package.json
packages/graphql-schema/tsconfig.json
packages/graphql-schema/codegen.ts
packages/graphql-schema/src/index.ts
packages/graphql-schema/src/schemas/shared.graphql
packages/graphql-schema/src/schemas/customer.graphql
packages/graphql-schema/src/schemas/network.graphql
packages/graphql-schema/src/schemas/billing.graphql
packages/graphql-schema/src/fragments/*.graphql
packages/graphql-schema/src/operations/*.graphql
```

**Dependencies:** `graphql`, `@graphql-codegen/cli`, `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations`, `@graphql-codegen/typescript-resolvers`

**Acceptance criteria:**
- `npx turbo run codegen --filter=@telecom-nexus/graphql-schema` generates TypeScript types
- Generated resolver types are used by backend services
- Generated operation types are used by frontend Apollo Client hooks
- Schemas match PRD §7.2, §7.3, §7.4 exactly

---

### Story P-2.3 — `packages/ui` — Component Library Part 1: Primitives

**What to build:**

**Bootstrap theme** (`src/styles/theme.scss`):
- Sass variable overrides for all telecom brand colors from PRD §11.1
- Custom CSS properties for dark mode (`--tn-bg`, `--tn-surface`, etc.)
- Font: system font stack
- Border radius, shadow, spacing tokens

**Components** (`src/components/`):

| Component | Props | Description |
|-----------|-------|-------------|
| `DataTable<T>` | `columns: ColumnDef<T>[]`, `data: T[]`, `sortable`, `onRowClick` | Generic sortable table with sticky headers, alternating rows, hover, responsive (collapses to cards on mobile) |
| `StatusBadge` | `status: string`, `variant: 'account' \| 'ticket' \| 'alert' \| 'invoice' \| 'device'` | Color-coded badge with icon. Maps status enums to Bootstrap variants. Never color-only. |
| `SkeletonLoader` | `variant: 'text' \| 'card' \| 'table' \| 'chart'`, `lines?`, `count?` | Animated placeholder for loading states |
| `EmptyState` | `icon`, `title`, `description`, `actionLabel?`, `onAction?` | Illustrated empty state with optional CTA button |
| `ProgressRing` | `value: number`, `max: number`, `label`, `size` | Circular SVG progress indicator for usage stats |
| `StatusStepper` | `steps: string[]`, `currentStep: number` | Horizontal step indicator for workflows (ticket status, invoice lifecycle) |

**Files to create:**
```
packages/ui/package.json
packages/ui/tsconfig.json
packages/ui/src/index.ts
packages/ui/src/styles/theme.scss
packages/ui/src/styles/_variables.scss
packages/ui/src/styles/_dark-mode.scss
packages/ui/src/components/DataTable/DataTable.tsx
packages/ui/src/components/DataTable/index.ts
packages/ui/src/components/StatusBadge/StatusBadge.tsx
packages/ui/src/components/StatusBadge/index.ts
packages/ui/src/components/SkeletonLoader/SkeletonLoader.tsx
packages/ui/src/components/SkeletonLoader/index.ts
packages/ui/src/components/EmptyState/EmptyState.tsx
packages/ui/src/components/EmptyState/index.ts
packages/ui/src/components/ProgressRing/ProgressRing.tsx
packages/ui/src/components/ProgressRing/index.ts
packages/ui/src/components/StatusStepper/StatusStepper.tsx
packages/ui/src/components/StatusStepper/index.ts
```

**Dependencies:** `react`, `react-bootstrap`, `bootstrap` (peer deps), `@telecom-nexus/types`

**Acceptance criteria:**
- All components render correctly with React-Bootstrap
- `DataTable<T>` accepts typed column definitions and row data
- `StatusBadge` renders icon + color for every enum value in the system
- Components respect dark mode CSS properties
- Zero `any` types

---

### Story P-2.4 — `packages/ui` — Component Library Part 2: Layout

**What to build:**

| Component | Props | Description |
|-----------|-------|-------------|
| `AppNavbar` | `user`, `onToggleSidebar`, `onToggleTheme`, `darkMode` | 72px top navbar with logo, nav links, user dropdown, dark mode toggle, mobile hamburger |
| `Sidebar` | `expanded`, `items: NavItem[]`, `activeItem`, `onNavigate` | Collapsible sidebar: 240px expanded / 60px collapsed (icons only) / hidden on mobile. Smooth 200ms transition. |
| `PageContainer` | `title`, `breadcrumbs: Breadcrumb[]`, `children` | Content wrapper with breadcrumb, page title, responsive padding |
| `ToastStack` | `toasts: Toast[]`, `onDismiss` | Positioned top-right. Auto-dismiss 5s. Max 3 visible. Bootstrap Toast. |
| `ErrorBoundary` | `fallback?` | React error boundary with retry button and styled error message |
| `ConfirmModal` | `title`, `body`, `onConfirm`, `onCancel`, `confirmVariant` | Reusable confirmation dialog |

**Files to create:**
```
packages/ui/src/components/AppNavbar/AppNavbar.tsx
packages/ui/src/components/AppNavbar/index.ts
packages/ui/src/components/Sidebar/Sidebar.tsx
packages/ui/src/components/Sidebar/index.ts
packages/ui/src/components/PageContainer/PageContainer.tsx
packages/ui/src/components/PageContainer/index.ts
packages/ui/src/components/ToastStack/ToastStack.tsx
packages/ui/src/components/ToastStack/index.ts
packages/ui/src/components/ErrorBoundary/ErrorBoundary.tsx
packages/ui/src/components/ErrorBoundary/index.ts
packages/ui/src/components/ConfirmModal/ConfirmModal.tsx
packages/ui/src/components/ConfirmModal/index.ts
```

**Acceptance criteria:**
- `AppNavbar` renders at exactly 72px height with all elements
- `Sidebar` transitions smoothly between expanded/collapsed/hidden states
- `ToastStack` auto-dismisses and stacks correctly
- All components are keyboard navigable
- Layout components support dark mode

---

### Story P-2.5 — `packages/ui` — SVG Icon Set

**What to build:**
- SVG XML icon files for all 5 network device types + status indicators
- React wrapper components for inline SVG rendering

**Icons needed:**
| Icon | Description | Used In |
|------|-------------|---------|
| `TowerIcon` | Cell tower (triangular shape) | Network topology |
| `RouterIcon` | Router (box with arrows) | Network topology |
| `SwitchIcon` | Switch (stacked layers) | Network topology |
| `BaseStationIcon` | Base station (antenna dish) | Network topology |
| `FiberNodeIcon` | Fiber node (circle with lines) | Network topology |
| `StatusDot` | Colored circle for status | Topology node overlays |
| `TelecomLogo` | TelecomNexus brand logo | Navbar, login |

**Files to create:**
```
packages/ui/src/icons/TowerIcon.tsx
packages/ui/src/icons/RouterIcon.tsx
packages/ui/src/icons/SwitchIcon.tsx
packages/ui/src/icons/BaseStationIcon.tsx
packages/ui/src/icons/FiberNodeIcon.tsx
packages/ui/src/icons/StatusDot.tsx
packages/ui/src/icons/TelecomLogo.tsx
packages/ui/src/icons/index.ts
packages/ui/assets/icons/tower.svg    # Raw SVG XML files
packages/ui/assets/icons/router.svg
packages/ui/assets/icons/switch.svg
packages/ui/assets/icons/base-station.svg
packages/ui/assets/icons/fiber-node.svg
```

**Acceptance criteria:**
- SVG files are valid XML
- React components accept `size`, `color`, `className` props
- Icons render inline (no external image requests)
- Icons are accessible (`role="img"`, `aria-label`)

---

### Story P-2.6 — `packages/xml-utils` — XML Utilities

**What to build:**

**RSS Feed Generator** (`src/rss.ts`):
- `generateAlertRssFeed(alerts: Alert[]): string` — Produces valid RSS 2.0 XML
- Uses `xmlbuilder2` to construct: `<rss>` → `<channel>` → `<item>` per alert
- Each item: title, description, pubDate, severity as category, link to device

**Receipt XML Generator** (`src/receipt.ts`):
- `generatePaymentReceipt(payment, invoice, customer): string` — Produces structured XML receipt
- Fields: company info, customer, invoice number, line items, total, payment method, transaction ref, date
- Must validate against `schemas/receipt.xsd`

**Device Config Parser** (`src/config.ts`):
- `parseDeviceConfig(xml: string): DeviceConfig` — Parses device config XML to typed object
- `generateSampleDeviceConfig(device: NetworkDevice): string` — Generates config XML for seed data

**Customer XML Import/Export** (`src/customer-xml.ts`):
- `exportCustomersToXml(customers: Customer[]): string`
- `parseCustomersFromXml(xml: string): Customer[]`

**XSD Schema** (`schemas/receipt.xsd`):
- XML Schema Definition for payment receipt structure

**Files to create:**
```
packages/xml-utils/package.json
packages/xml-utils/tsconfig.json
packages/xml-utils/src/index.ts
packages/xml-utils/src/rss.ts
packages/xml-utils/src/receipt.ts
packages/xml-utils/src/config.ts
packages/xml-utils/src/customer-xml.ts
packages/xml-utils/schemas/receipt.xsd
```

**Dependencies:** `xmlbuilder2`, `@telecom-nexus/types`

**Acceptance criteria:**
- RSS output is valid RSS 2.0 (parseable by any RSS reader)
- Receipt XML validates against the XSD schema
- Device config round-trips: generate → parse → generate produces identical output
- Customer XML import/export round-trips correctly

---

### Story P-2.7 — `packages/config` — Final Polish

**What to build:**
- Verify ESLint 10 flat config works across all workspaces with the installed packages
- Verify Prettier formatting is consistent
- Add `lint-staged` configuration to root `package.json`
- Add Husky pre-commit hook that runs lint-staged

**Files to create/modify:**
```
.husky/pre-commit
package.json (add lint-staged config)
```

**Acceptance criteria:**
- `npx turbo run lint` passes on all packages created so far
- `npx turbo run typecheck` passes on all packages
- Pre-commit hook runs linting on staged files
- Prettier and ESLint don't conflict

---

### Phase 2 Definition of Done

- [ ] `packages/types` builds and exports all domain types, enums, branded types
- [ ] `packages/graphql-schema` codegen produces TypeScript types from all schemas
- [ ] `packages/ui` has 12+ shared components, all rendering with Bootstrap theme
- [ ] `packages/xml-utils` generates valid RSS, receipt XML, and parses config XML
- [ ] `packages/config` ESLint + Prettier + Husky work across all workspaces
- [ ] `npx turbo run build` succeeds for all packages

---

## Phase 3 — Backend Services

**Goal**: Stand up the full GraphQL API with real database connectivity.

**Prerequisites**: Phase 1 + Phase 2 complete, Docker databases running

---

### Story B-3.1 — Customer Service: Mongoose Models

**What to build:**
- Mongoose 9 schemas for `Customer`, `Plan`, `Ticket`
- Each schema matches the TypeScript interface from `@telecom-nexus/types`
- Indexes: unique on `customerId`, `planCode`, `ticketId`
- Mongoose middleware: auto-set `updatedAt` on save
- Zod validation schemas for all mutation inputs (`CreateTicketInput`, `UpdateProfileInput`, `ChangePlanInput`)

**Files to create:**
```
apps/services/customer-service/package.json
apps/services/customer-service/tsconfig.json
apps/services/customer-service/src/models/customer.model.ts
apps/services/customer-service/src/models/plan.model.ts
apps/services/customer-service/src/models/ticket.model.ts
apps/services/customer-service/src/models/index.ts
apps/services/customer-service/src/validation/schemas.ts
apps/services/customer-service/src/db/connection.ts
```

**Dependencies:** `mongoose@9`, `zod@4`, `@telecom-nexus/types`

**Acceptance criteria:**
- Models connect to MongoDB and can CRUD documents
- Zod schemas reject invalid input (missing fields, wrong types, empty strings)
- Indexes are created on first connection

---

### Story B-3.2 — Customer Service: Apollo Server + Resolvers

**What to build:**
- Apollo Server 5 on Express 5, port 4001
- Federation v2 schema loaded from `@telecom-nexus/graphql-schema`
- Type-safe resolvers (using codegen types) for:
  - **Queries**: `customer`, `plans`, `plan`, `tickets`, `ticket`
  - **Mutations**: `updateCustomerProfile`, `changePlan`, `createTicket`, `addTicketMessage`
  - **Entity resolvers**: `Customer.__resolveReference`, `Plan.__resolveReference`
- Health check: `GET /health` → `{ status: "ok", uptime, version }`
- Error handling: GraphQL errors with proper codes

**Files to create:**
```
apps/services/customer-service/src/index.ts         # Entry point
apps/services/customer-service/src/server.ts        # Express + Apollo setup
apps/services/customer-service/src/schema.ts        # Federation schema
apps/services/customer-service/src/resolvers/index.ts
apps/services/customer-service/src/resolvers/customer.resolver.ts
apps/services/customer-service/src/resolvers/plan.resolver.ts
apps/services/customer-service/src/resolvers/ticket.resolver.ts
```

**Acceptance criteria:**
- Service starts on port 4001
- All queries return correct data from MongoDB
- Mutations validate with Zod, then write to MongoDB
- Federation `__resolveReference` works for `Customer` and `Plan`
- `/health` returns 200 with uptime

---

### Story B-3.3 — Customer Service: Subscriptions & REST

**What to build:**
- **Subscription**: `ticketUpdated(customerId)` — publishes when a ticket's status changes or a message is added. Uses `graphql-ws` 6 over WebSocket.
- **REST**: `POST /api/import/customers` — accepts XML body, parses with `@telecom-nexus/xml-utils`, upserts customers to MongoDB
- **REST**: `GET /api/export/customers` — returns all customers as XML using `@telecom-nexus/xml-utils`

**Files to create:**
```
apps/services/customer-service/src/subscriptions/ticket.subscription.ts
apps/services/customer-service/src/routes/import-export.ts
```

**Acceptance criteria:**
- WebSocket subscription receives events when a ticket is mutated
- XML import endpoint accepts valid XML and creates/updates customers
- XML export endpoint returns valid XML with all customers

---

### Story B-3.4 — Network Service: Mongoose + Cassandra Models

**What to build:**
- Mongoose 9 schema for `NetworkDevice`
- Cassandra client connection using `cassandra-driver` 4.8
- Prepared statements for:
  - `device_telemetry`: insert, select by device+date range
  - `alerts_by_device`: insert, select by device+month, update status
- Connection pooling for Cassandra (contact point: `localhost:9042`)

**Files to create:**
```
apps/services/network-service/package.json
apps/services/network-service/tsconfig.json
apps/services/network-service/src/models/device.model.ts
apps/services/network-service/src/db/mongo-connection.ts
apps/services/network-service/src/db/cassandra-client.ts
apps/services/network-service/src/db/cassandra-queries.ts
```

**Dependencies:** `mongoose@9`, `cassandra-driver@4.8`, `@telecom-nexus/types`

**Acceptance criteria:**
- MongoDB connection for devices works
- Cassandra client connects and prepared statements execute
- Telemetry reads respect partition key `(device_id, date)` and time range

---

### Story B-3.5 — Network Service: Apollo Server + Resolvers

**What to build:**
- Apollo Server 5 on Express 5, port 4002
- Federation v2 schema
- Resolvers:
  - **Queries**: `devices` (with region/status filter), `device` (by ID, with Mongoose populate for connectedDevices), `telemetry` (Cassandra time-range read with granularity), `alerts` (Cassandra with filters), `alertsSummary` (count by severity)
  - **Mutations**: `acknowledgeAlert`, `resolveAlert` (update Cassandra + publish subscription)
  - **Entity**: `NetworkDevice.__resolveReference`

**Files to create:**
```
apps/services/network-service/src/index.ts
apps/services/network-service/src/server.ts
apps/services/network-service/src/schema.ts
apps/services/network-service/src/resolvers/index.ts
apps/services/network-service/src/resolvers/device.resolver.ts
apps/services/network-service/src/resolvers/telemetry.resolver.ts
apps/services/network-service/src/resolvers/alert.resolver.ts
```

**Acceptance criteria:**
- Telemetry queries return data from Cassandra within correct time ranges
- Granularity parameter controls data point density (MINUTE, FIVE_MINUTES, HOUR, DAY)
- `alertsSummary` returns accurate counts by severity
- Device query populates `connectedDevices` via Mongoose

---

### Story B-3.6 — Network Service: Subscriptions & REST

**What to build:**
- **Subscriptions**: `newAlert(region)`, `telemetryUpdate(deviceId)` via graphql-ws 6
- **REST**: `GET /api/alerts/rss` — generates RSS 2.0 XML feed of recent alerts using `@telecom-nexus/xml-utils`
- **REST**: `GET /api/devices/:deviceId/config.xml` — returns the device's `configXml` field with `Content-Type: application/xml`

**Files to create:**
```
apps/services/network-service/src/subscriptions/alert.subscription.ts
apps/services/network-service/src/subscriptions/telemetry.subscription.ts
apps/services/network-service/src/routes/rss.ts
apps/services/network-service/src/routes/device-config.ts
```

**Acceptance criteria:**
- Alert subscription fires when `acknowledgeAlert` or `resolveAlert` mutation runs
- RSS feed is valid RSS 2.0 XML
- Device config endpoint returns XML with correct Content-Type header

---

### Story B-3.7 — Billing Service: Mongoose + Cassandra Models

**What to build:**
- Mongoose 9 schemas for `Invoice` and `Payment`
- TTL index on `Invoice.createdAt` (365 days)
- Cassandra prepared statements for `cdr_by_customer` and `usage_by_day`
- Cursor pagination utilities for CDR queries (encode/decode cursor from timestamp+call_id)

**Files to create:**
```
apps/services/billing-service/package.json
apps/services/billing-service/tsconfig.json
apps/services/billing-service/src/models/invoice.model.ts
apps/services/billing-service/src/models/payment.model.ts
apps/services/billing-service/src/db/mongo-connection.ts
apps/services/billing-service/src/db/cassandra-client.ts
apps/services/billing-service/src/db/cassandra-queries.ts
apps/services/billing-service/src/utils/pagination.ts
```

**Acceptance criteria:**
- Invoice TTL index is created
- CDR cursor pagination correctly encodes/decodes position
- Usage aggregation queries return data grouped by day

---

### Story B-3.8 — Billing Service: Apollo Server + Resolvers

**What to build:**
- Apollo Server 5 on Express 5, port 4003
- Federation v2 schema — **extends** `Customer` type
- Resolvers:
  - **Query**: `invoice(invoiceNumber)`
  - **Customer fields**: `invoices` (MongoDB), `payments` (MongoDB), `currentUsage` (Cassandra aggregation), `usageByDay` (Cassandra), `callHistory` (Cassandra cursor pagination), `autoPayEnabled` (MongoDB)
  - **Mutations**: `payInvoice` (with idempotency key check — if same key exists, return existing payment instead of double-charge), `toggleAutoPay`

**Files to create:**
```
apps/services/billing-service/src/index.ts
apps/services/billing-service/src/server.ts
apps/services/billing-service/src/schema.ts
apps/services/billing-service/src/resolvers/index.ts
apps/services/billing-service/src/resolvers/invoice.resolver.ts
apps/services/billing-service/src/resolvers/payment.resolver.ts
apps/services/billing-service/src/resolvers/usage.resolver.ts
apps/services/billing-service/src/resolvers/cdr.resolver.ts
```

**Acceptance criteria:**
- `payInvoice` with same idempotency key returns the existing payment (no double-charge)
- Cursor pagination on CDRs returns correct `pageInfo` (`hasNextPage`, `endCursor`)
- `currentUsage` aggregates usage across the current billing cycle from Cassandra
- `usageByDay` returns daily data for a given month
- Auto-pay toggle persists to MongoDB

---

### Story B-3.9 — Billing Service: REST Endpoints

**What to build:**
- `GET /api/receipts/:paymentId.xml` — generates XML receipt using `@telecom-nexus/xml-utils`
  - Looks up payment + related invoice + customer from MongoDB
  - Generates XML with `Content-Type: application/xml`
  - Includes `Content-Disposition: attachment; filename="receipt-{paymentId}.xml"`

**Files to create:**
```
apps/services/billing-service/src/routes/receipt.ts
```

**Acceptance criteria:**
- Endpoint returns valid XML
- XML contains all required fields: company, customer, invoice, line items, payment details
- Returns 404 if paymentId not found
- Content-Type and Content-Disposition headers are correct

---

### Story B-3.10 — Apollo Gateway

**What to build:**
- Apollo Gateway 2.13 composing all 3 subgraphs
- Express 5 on port 4000
- Supergraph composed from subgraph URLs: `http://localhost:4001/graphql`, `:4002/graphql`, `:4003/graphql`
- GraphQL depth limiting middleware (max depth: 7)
- Query complexity analysis with cost limit
- CORS configuration (allow shell origin `http://localhost:3000`)
- Health check: `GET /health`
- WebSocket passthrough for subscriptions

**Files to create:**
```
apps/gateway/package.json
apps/gateway/tsconfig.json
apps/gateway/src/index.ts
apps/gateway/src/server.ts
apps/gateway/src/middleware/depth-limit.ts
apps/gateway/src/middleware/complexity.ts
```

**Dependencies:** `@apollo/gateway@2.13`, `express@5`, `cors`, `graphql-depth-limit`, `express-rate-limit`

**Acceptance criteria:**
- Gateway starts on port 4000
- Federated queries work: `query { customer(customerId: "CUST-0001") { firstName invoices { invoiceNumber } } }` fetches from both customer + billing subgraphs
- Queries deeper than 7 levels are rejected
- CORS allows only `localhost:3000`
- Health check returns 200

---

### Phase 3 Definition of Done

- [ ] All 4 services start without errors
- [ ] Gateway composes supergraph from all 3 subgraphs
- [ ] Every GraphQL query and mutation from PRD §7 works against live databases
- [ ] Federation entity resolution works cross-subgraph
- [ ] Subscriptions deliver events via WebSocket
- [ ] All REST/XML endpoints return valid responses
- [ ] Health checks pass on all services

---

## Phase 4 — Seed Data & Demo Data Generation

**Goal**: Populate databases with realistic telecom data for the demo.

**Prerequisites**: Phase 3 complete (services and databases running)

---

### Story S-4.1 — MongoDB Seed Script

**What to build:**
- `scripts/seed-mongo.ts` using Mongoose 9
- Idempotent: drops existing data and recreates
- Connects to `mongodb://localhost:27017/telecom_nexus`

**Data to generate:**

| Collection | Count | Details |
|---|---|---|
| `plans` | 8 | 2 per tier. Examples: "Basic Talk" ($29.99), "Basic Connect" ($39.99), "Standard Plus" ($59.99), etc. up to "Enterprise Ultra" ($199.99). Realistic feature differentiation. |
| `customers` | 50 | Diverse names (use faker-like patterns). Spread across all 4 plan tiers. Addresses in US cities. Mix of account statuses (40 Active, 5 Suspended, 3 Pending, 2 Closed). |
| `tickets` | 200 | 2-6 per customer. All statuses represented. Each ticket has 2-5 messages (conversation thread). Categories distributed realistically (40% Network, 25% Billing, 20% Device, 10% Plan, 5% Other). |
| `invoices` | 300 | 6 months of invoices per customer. Line items: base plan + random add-ons + tax. Status: older ones Paid, recent ones mix of Due/Overdue. |
| `payments` | 250 | Linked to Paid invoices. Mixed methods (50% card, 30% bank, 20% wallet). A few Failed/Pending for realism. |
| `devices` | 30 | 10 towers, 8 routers, 7 switches, 3 base stations, 2 fiber nodes. Realistic names (e.g., "TWR-DFW-001"). Connected in a network graph. 25 Operational, 3 Degraded, 1 Down, 1 Maintenance. Each has a generated XML config. |

**Files to create:**
```
scripts/seed-mongo.ts
scripts/data/plans.ts         # Plan definitions
scripts/data/names.ts         # Name/address generators
scripts/data/device-graph.ts  # Device topology and connections
```

**Acceptance criteria:**
- Script runs in under 30 seconds
- All counts match the table above
- Referential integrity: customer.activePlanId points to a real plan, invoice.customerId points to a real customer
- Device adjacency graph is realistic (towers connect to switches, switches to routers, etc.)

---

### Story S-4.2 — Cassandra Seed Script

**What to build:**
- `scripts/seed-cassandra.ts` using cassandra-driver 4.8
- Idempotent: truncates tables before inserting
- Batch inserts for performance

**Data to generate:**

| Table | Count | Details |
|---|---|---|
| `device_telemetry` | ~500K | 30 days × 30 devices × ~1 reading/min (downsampled to every 5 min = 8,640 per device). Realistic patterns: CPU 20-80% with daily cycles, memory 40-70%, bandwidth 100-900 Mbps with peaks, packet loss 0-2% with occasional spikes, temperature 25-45°C. |
| `cdr_by_customer` | ~10K | 3 months × 50 customers × ~66 calls each. Mix of VOICE (70%), VIDEO (20%), VOIP (10%). Durations: 30s-1800s. Status: 85% Completed, 10% Missed, 5% Dropped. Realistic phone numbers. |
| `usage_by_day` | ~4,500 | 3 months × 50 customers × 30 days. Data: 100MB-2GB/day. Voice: 5-60 min/day. SMS: 0-30/day. Correlates with plan tier (higher tier = more usage). |
| `alerts_by_device` | 500 | Spread across 30 devices and 3 months. Severity: 5% Critical, 15% Major, 40% Minor, 40% Info. Status: 70% Resolved, 20% Acknowledged, 10% Active. Realistic titles (e.g., "High CPU utilization on TWR-DFW-001"). |

**Files to create:**
```
scripts/seed-cassandra.ts
scripts/data/telemetry-patterns.ts   # Realistic data generation functions
scripts/data/cdr-generator.ts        # CDR generation utilities
scripts/data/alert-templates.ts      # Alert title/description templates
```

**Acceptance criteria:**
- Script runs in under 2 minutes (using batch inserts)
- Telemetry data shows realistic daily patterns (not random noise)
- CDR timestamps are realistic (more calls during business hours)
- Alert severity distribution matches spec

---

### Story S-4.3 — Live Telemetry Generator

**What to build:**
- `scripts/generate-telemetry.js` — **JavaScript** (intentionally not TypeScript)
- Runs as a long-lived process during demos
- Every 10 seconds: generates 1 telemetry reading per device (30 writes)
- Simulates realistic patterns:
  - Gradual CPU increases during "business hours"
  - Bandwidth spikes during peak usage
  - Occasional packet loss bursts on devices marked DEGRADED
  - Temperature correlating with CPU
- Periodically generates alerts (every ~2 min, random device, random severity)
- Writes to Cassandra `device_telemetry` and `alerts_by_device`

**Files to create:**
```
scripts/generate-telemetry.js
```

**Acceptance criteria:**
- Script runs with `node scripts/generate-telemetry.js`
- Outputs log of each batch write to console
- Generates data that shows up in real-time on the NOC dashboard
- Graceful shutdown on SIGINT

---

### Story S-4.4 — Seed Pipeline Integration

**What to build:**
- `seed` script in root `package.json` that orchestrates seeding
- Turborepo task definition in `turbo.json`
- Connection retry logic: waits for MongoDB and Cassandra to be ready (up to 60s)
- Order: MongoDB seed first (plans needed before customers), then Cassandra seed

**Files to modify:**
```
turbo.json          # Add seed task
package.json        # Add seed script
scripts/seed.ts     # Orchestrator that runs both seeds in order
```

**Acceptance criteria:**
- `npx turbo run seed` seeds both databases in correct order
- Handles cold start: retries connections if databases aren't ready yet
- Can be run repeatedly (idempotent)
- Exits with 0 on success, non-zero on failure

---

### Phase 4 Definition of Done

- [ ] `npx turbo run seed` completes successfully
- [ ] MongoDB has 50 customers, 8 plans, 200 tickets, 300 invoices, 250 payments, 30 devices
- [ ] Cassandra has ~500K telemetry, ~10K CDRs, ~4.5K daily usage, 500 alerts
- [ ] Querying via GraphQL gateway returns realistic data
- [ ] `generate-telemetry.js` runs and produces visible data in Cassandra

---

## Phase 5 — Shell Application & Micro Frontends

**Goal**: Build all 4 frontend apps with Module Federation.

**Prerequisites**: Phases 1-4 complete

---

### Story MF-5.1 — Shell: Next.js 16 Host with Module Federation

**What to build:**
- Next.js 16 App Router application at `apps/shell`
- Module Federation **host** config consuming 3 remotes:
  - `customer_portal` from `http://localhost:3001/_next/static/chunks/remoteEntry.js`
  - `noc_dashboard` from `http://localhost:3002/_next/static/chunks/remoteEntry.js`
  - `billing_console` from `http://localhost:3003/_next/static/chunks/remoteEntry.js`
- Shared dependencies: `react`, `react-dom`, `@apollo/client`, `react-bootstrap`
- Apollo Client 4 provider configured to connect to gateway at `http://localhost:4000/graphql`
- WebSocket link for subscriptions at `ws://localhost:4000/graphql`
- Global layout using `AppNavbar`, `Sidebar`, `PageContainer` from `@telecom-nexus/ui`
- React `Suspense` boundaries around each MFE loading point with `SkeletonLoader` fallback
- Error boundaries around MFE mounts

**Files to create:**
```
apps/shell/package.json
apps/shell/tsconfig.json
apps/shell/next.config.ts           # Module Federation host config
apps/shell/src/app/layout.tsx       # Root layout with navbar + sidebar
apps/shell/src/app/page.tsx         # Landing / redirect to customer portal
apps/shell/src/app/customer/page.tsx
apps/shell/src/app/noc/page.tsx
apps/shell/src/app/billing/page.tsx
apps/shell/src/providers/ApolloProvider.tsx
apps/shell/src/providers/AuthProvider.tsx
apps/shell/src/providers/ThemeProvider.tsx
```

**Acceptance criteria:**
- Shell starts on port 3000
- When MFE remotes are running, their components load in the shell
- When MFE remotes are not running, skeleton/error fallback shows (no crash)
- Apollo Client connects to gateway and can execute queries
- WebSocket subscription connection established

---

### Story MF-5.2 — Shell: Auth & Theming

**What to build:**
- **Login page** (`/login`): email + password form (simulated — maps email to a seeded customer)
- **Auth context**: generates a mock JWT on login, stores in React state (not localStorage). Provides `user`, `login`, `logout`, `switchCustomer` to all children.
- **Theme provider**: dark mode toggle using `data-bs-theme` attribute on `<html>`. Persists preference to localStorage. Respects `prefers-color-scheme` on first visit.
- **"Switch Customer" dropdown** in navbar for demo — lets presenter quickly switch between seeded customers without re-logging in.

**Files to create:**
```
apps/shell/src/app/login/page.tsx
apps/shell/src/contexts/auth-context.tsx
apps/shell/src/contexts/theme-context.tsx
apps/shell/src/utils/mock-jwt.ts
apps/shell/src/components/CustomerSwitcher.tsx
```

**Acceptance criteria:**
- Login form accepts any email that matches a seeded customer
- Auth context is accessible by all MFEs via Module Federation shared scope
- Dark mode toggle switches immediately with smooth CSS transition
- Customer switcher shows list of seeded customers with name and plan

---

### Story MF-5.3 — Shell: Navigation & Routing

**What to build:**
- Sidebar navigation items grouped by MFE:
  - **Customer Portal**: Account, Plans, Support Tickets
  - **NOC Dashboard**: Topology, Telemetry, Alerts
  - **Billing**: Invoices, Usage, Payments
- Active item highlighting based on current route
- Breadcrumb component driven by route segments
- Mobile: hamburger button in navbar opens sidebar as offcanvas overlay
- Keyboard accessible: Tab through items, Enter to navigate

**Files to create/modify:**
```
apps/shell/src/config/navigation.ts    # Nav item definitions
apps/shell/src/components/BreadcrumbNav.tsx
apps/shell/src/app/layout.tsx          # Wire up sidebar navigation
```

**Acceptance criteria:**
- Clicking a sidebar item navigates to the correct route and loads the correct MFE
- Active item is visually highlighted
- Breadcrumb updates on navigation
- Sidebar collapses/expands correctly at each breakpoint per PRD §11.3
- Mobile hamburger opens/closes sidebar overlay

---

### Stories MF-5.4, MF-5.5, MF-5.6, MF-5.7 — Customer Portal MFE

**MF-5.4 — Account Dashboard Page**
- Server-rendered page with customer profile, active plan, quick stats, quick actions
- Uses `useQuery` for `GetCustomer` operation
- Progress bars for data/voice/SMS usage vs quota
- Skeleton loading while data loads
- Responsive: 4-col → 2-col → 1-col

**MF-5.5 — Plan Management Page**
- Tier tabs (Basic/Standard/Premium/Enterprise)
- Plan cards with price, features, CTA
- Comparison modal for up to 3 plans
- Change plan: confirm modal → `ChangePlan` mutation → optimistic update → toast
- Current plan highlighted with "Your Plan" badge

**MF-5.6 — Support Tickets Page**
- Create ticket form with Zod validation
- Ticket list with status tab filters
- Ticket detail with chat-style message thread
- `useSubscription` for `OnTicketUpdated` — real-time status changes
- Status stepper visualization

**MF-5.7 — Module Federation Remote Config**
- `next.config.ts` with Module Federation remote config
- Exposes: `./CustomerApp`, `./AccountOverview`, `./PlanSelector`, `./SupportTickets`
- Shared dependencies matching the host
- Standalone development on port 3001

**Files to create:**
```
apps/customer-portal/package.json
apps/customer-portal/tsconfig.json
apps/customer-portal/next.config.ts
apps/customer-portal/src/app/layout.tsx
apps/customer-portal/src/app/page.tsx              # Account Dashboard
apps/customer-portal/src/app/plans/page.tsx
apps/customer-portal/src/app/tickets/page.tsx
apps/customer-portal/src/app/tickets/[ticketId]/page.tsx
apps/customer-portal/src/components/CustomerProfile.tsx
apps/customer-portal/src/components/PlanCard.tsx
apps/customer-portal/src/components/PlanComparison.tsx
apps/customer-portal/src/components/ChangePlanModal.tsx
apps/customer-portal/src/components/TicketForm.tsx
apps/customer-portal/src/components/TicketList.tsx
apps/customer-portal/src/components/TicketChat.tsx
apps/customer-portal/src/components/QuickStats.tsx
apps/customer-portal/src/components/UsageProgressBars.tsx
apps/customer-portal/src/hooks/useCustomer.ts
apps/customer-portal/src/hooks/usePlans.ts
apps/customer-portal/src/hooks/useTickets.ts
```

---

### Stories MF-5.8, MF-5.9, MF-5.10, MF-5.11 — NOC Dashboard MFE

**MF-5.8 — Network Topology Page**
- Full-width canvas with D3.js force-directed layout
- Device nodes as SVG icons, color-coded by status
- Connection lines: solid/dashed/red
- Click → Bootstrap Offcanvas with device details + mini telemetry sparklines
- Region filter dropdown
- Zoom/pan controls + mini-map

**MF-5.9 — Telemetry Charts Page**
- 2x2 Recharts grid: CPU, Memory, Bandwidth, Packet Loss
- Current value as large number + trend arrow
- Time range pill buttons (1h/6h/24h/7d)
- Auto-refresh 10s with SVG countdown ring + pause
- Device selector dropdown
- Temperature gauge (semi-circular)

**MF-5.10 — Alerts Page**
- Real-time feed via `OnNewAlert` subscription
- Split view: list (60%) + detail (40%)
- Severity badges with pulse animation on Critical
- Acknowledge/Resolve buttons → mutations
- Summary banner with severity counts
- Filter bar: severity, device, date range
- RSS export button → opens `/api/alerts/rss` in new tab

**MF-5.11 — Module Federation Remote Config**
- Exposes: `./NOCApp`, `./NetworkTopology`, `./AlertsFeed`, `./TelemetryCharts`
- Standalone on port 3002

**Files to create:**
```
apps/noc-dashboard/package.json
apps/noc-dashboard/tsconfig.json
apps/noc-dashboard/next.config.ts
apps/noc-dashboard/src/app/layout.tsx
apps/noc-dashboard/src/app/page.tsx                # Topology
apps/noc-dashboard/src/app/telemetry/page.tsx
apps/noc-dashboard/src/app/alerts/page.tsx
apps/noc-dashboard/src/components/TopologyCanvas.tsx
apps/noc-dashboard/src/components/DeviceDetailPanel.tsx
apps/noc-dashboard/src/components/TelemetryGrid.tsx
apps/noc-dashboard/src/components/TelemetryChart.tsx
apps/noc-dashboard/src/components/CountdownRing.tsx
apps/noc-dashboard/src/components/TemperatureGauge.tsx
apps/noc-dashboard/src/components/AlertsFeed.tsx
apps/noc-dashboard/src/components/AlertDetail.tsx
apps/noc-dashboard/src/components/AlertSummaryBanner.tsx
apps/noc-dashboard/src/components/AlertFilters.tsx
apps/noc-dashboard/src/hooks/useDevices.ts
apps/noc-dashboard/src/hooks/useTelemetry.ts
apps/noc-dashboard/src/hooks/useAlerts.ts
apps/noc-dashboard/src/utils/topology-layout.ts      # D3 force layout logic
```

**Dependencies:** `d3@7.9`, `recharts@3.7`

---

### Stories MF-5.12, MF-5.13, MF-5.14, MF-5.15 — Billing Console MFE

**MF-5.12 — Invoice Management Page**
- Invoice list: sortable `DataTable<Invoice>` with status badges
- Invoice detail: receipt-like layout with line items, subtotals, tax
- Pay Now: payment method radio → confirm → `PayInvoice` mutation → success animation
- Status stepper: Draft → Due → Paid / Overdue
- Overdue warning banner

**MF-5.13 — Usage Analytics Page**
- 3 summary cards with `ProgressRing`: Data (GB), Voice (min), SMS (count) — used vs limit
- Recharts `AreaChart`: daily usage with plan limit reference line
- CDR table with infinite scroll (cursor pagination)
- SMS log table
- Month selector for historical data
- Trend comparison: current vs previous month (multi-series chart)

**MF-5.14 — Payment History Page**
- Vertical timeline with method icons and status badges
- XML receipt download button per payment → opens `/api/receipts/:id.xml`
- Auto-pay toggle card with current method display
- Payment method list (masked card numbers)

**MF-5.15 — Module Federation Remote Config**
- Exposes: `./BillingApp`, `./InvoiceList`, `./UsageBreakdown`, `./PaymentHistory`
- Standalone on port 3003

**Files to create:**
```
apps/billing-console/package.json
apps/billing-console/tsconfig.json
apps/billing-console/next.config.ts
apps/billing-console/src/app/layout.tsx
apps/billing-console/src/app/page.tsx               # Invoices
apps/billing-console/src/app/usage/page.tsx
apps/billing-console/src/app/payments/page.tsx
apps/billing-console/src/components/InvoiceTable.tsx
apps/billing-console/src/components/InvoiceDetail.tsx
apps/billing-console/src/components/PaymentModal.tsx
apps/billing-console/src/components/UsageSummaryCards.tsx
apps/billing-console/src/components/DailyUsageChart.tsx
apps/billing-console/src/components/CallLogTable.tsx
apps/billing-console/src/components/SmsLogTable.tsx
apps/billing-console/src/components/PaymentTimeline.tsx
apps/billing-console/src/components/AutoPayCard.tsx
apps/billing-console/src/hooks/useInvoices.ts
apps/billing-console/src/hooks/useUsage.ts
apps/billing-console/src/hooks/usePayments.ts
apps/billing-console/src/hooks/useCDR.ts
```

---

### Phase 5 Definition of Done

- [ ] All 4 frontend apps start independently on their assigned ports
- [ ] Shell loads all 3 MFEs via Module Federation
- [ ] Full data flow works: UI action → GraphQL → service → database → UI update
- [ ] All pages render with real seeded data
- [ ] SSR works on the account dashboard page
- [ ] Subscriptions deliver real-time updates
- [ ] Dark mode works across all MFEs
- [ ] Responsive layout works at all breakpoints

---

## Phase 6 — Integration, Polish & Accessibility

**Goal**: End-to-end polish, responsiveness, accessibility, and all integration points.

**Prerequisites**: Phase 5 complete

---

### Story I-6.1 — Module Federation Integration Testing
- Verify shared dependencies (React, Apollo, Bootstrap) are not duplicated in bundle
- Test MFE switching is seamless (no full page reload)
- Verify error boundary shows fallback if a remote is unavailable
- Test Module Federation with production builds (not just dev)

### Story I-6.2 — GraphQL Subscriptions End-to-End
- Verify ticket updates propagate: create ticket in Customer Portal → status change visible in real-time
- Verify alert subscription: generate-telemetry.js produces alert → NOC dashboard shows it live
- Verify telemetry subscription: new readings appear on live charts
- Test WebSocket reconnection after disconnect

### Story I-6.3 — Responsive Design Pass
- Test every page at all 6 breakpoints: 375px, 576px, 768px, 992px, 1200px, 1440px
- Fix issues: tables → cards on mobile, charts resize, sidebar behavior, topology canvas scales
- Verify touch interactions on mobile (swipe-to-dismiss toasts)

### Story I-6.4 — Accessibility Audit
- Add skip navigation link to shell layout
- Verify tab order on all pages
- Add `aria-live="polite"` to alerts feed and toast stack
- Add `aria-label` to all icon-only buttons
- Verify focus trap in modals and offcanvas
- Test with keyboard-only navigation
- Verify contrast ratios (4.5:1 normal, 3:1 large text) in both light and dark mode

### Story I-6.5 — Loading, Empty, and Error States
- Every data-dependent component shows `SkeletonLoader` while loading
- Every list shows `EmptyState` when no data
- Error boundary catches render errors with retry
- Toast notifications for mutation success/failure
- Form fields show inline validation errors

### Story I-6.6 — Dark Mode Polish
- Verify every component in dark mode
- Charts: update grid lines, axis colors, tooltip backgrounds
- Topology canvas: dark background works with node colors
- Tables: alternating row colors work in dark mode
- No contrast violations in dark mode

### Story I-6.7 — XML Integration Verification
- RSS feed at `/api/alerts/rss` opens correctly in browser and RSS readers
- Payment receipt XML downloads with correct filename and Content-Type
- Device config XML displays correctly in NOC detail panel
- SVG icons render inline in topology and sidebar
- Customer XML import/export works end-to-end

### Story I-6.8 — Performance Optimization
- Verify SSR on account dashboard page (check page source for rendered HTML)
- Configure Apollo Client cache normalization (by entity ID fields)
- Verify code splitting: each MFE loads as separate chunks
- Implement Web Worker for telemetry data aggregation (offload from main thread)
- Measure LCP on account dashboard (target < 2.5s)
- Measure MFE chunk load time (target < 1s)

---

### Phase 6 Definition of Done

- [ ] Full 15-minute demo path works end-to-end without errors
- [ ] All 6 responsive breakpoints verified on all pages
- [ ] WCAG 2.1 AA accessibility audit passes
- [ ] Dark mode works correctly everywhere
- [ ] All 5 XML integration points functional
- [ ] LCP < 2.5s on account dashboard
- [ ] No console errors during normal operation

---

## Phase 7 — Testing

**Goal**: Comprehensive test coverage.

**Prerequisites**: Phase 6 complete

---

### Story T-7.1 — Unit Tests: Shared UI Components
- **Tool**: Vitest 4 + React Testing Library 16
- **Target**: 80% coverage on `packages/ui`
- **Components to test**: DataTable (sorting, row click, responsive), StatusBadge (all variants), SkeletonLoader, EmptyState, ProgressRing, StatusStepper, AppNavbar, Sidebar (expand/collapse), ToastStack (auto-dismiss), ConfirmModal, ErrorBoundary

### Story T-7.2 — Unit Tests: Backend Resolvers
- **Tool**: Vitest 4
- **Target**: 80% coverage on resolver logic
- **What to test**: Each resolver function with mocked database calls. Zod validation: valid input passes, invalid input throws. Idempotency key logic in `payInvoice`. Cursor pagination encoding/decoding. Alert status transitions (Active → Acknowledged → Resolved).

### Story T-7.3 — Integration Tests: GraphQL API
- **Tool**: Vitest 4 + supertest
- **Setup**: Spin up each service against test database containers (separate from dev databases)
- **What to test**: All queries return expected data shapes. All mutations modify data correctly. Federation entity resolution: query `Customer` with `invoices` (crosses subgraphs). Error cases: query non-existent entity, invalid input.

### Story T-7.4 — Integration Tests: XML Endpoints
- **What to test**: RSS feed is parseable XML with correct RSS 2.0 structure. Receipt XML validates against `receipt.xsd`. Customer export → import roundtrip produces identical data. Device config XML endpoint returns correct Content-Type.

### Story T-7.5 — E2E Tests: Critical Paths
- **Tool**: Playwright 1.58
- **Scenarios**:
  1. Login → View account → Navigate to plans → Compare → Change plan → Verify toast
  2. Navigate to tickets → Create ticket → Verify it appears in list
  3. Navigate to NOC → View topology → Click device → Verify detail panel
  4. Navigate to telemetry → Change time range → Verify chart updates
  5. Navigate to billing → View invoices → Pay invoice → Verify status change
  6. Navigate to payments → Download XML receipt → Verify file download
  7. Toggle dark mode → Verify theme changes

### Story T-7.6 — Visual Regression
- **Tool**: Playwright screenshots
- **Pages**: Account dashboard, plan management, ticket detail, topology, telemetry, alerts, invoice list, usage analytics, payment history
- **Breakpoints**: 375px, 768px, 1440px
- **Modes**: Light + dark
- **Total screenshots**: ~54 (9 pages × 3 breakpoints × 2 modes)

### Story T-7.7 — TypeScript Strict Verification
- `npx turbo run typecheck` passes with zero errors
- ESLint `no-explicit-any` rule set to error
- Run full lint: `npx turbo run lint` passes with zero errors

---

### Phase 7 Definition of Done

- [ ] Unit tests pass: 80%+ coverage on UI components and resolvers
- [ ] Integration tests pass: all GraphQL operations and XML endpoints
- [ ] E2E tests pass: all 7 critical path scenarios
- [ ] Visual regression baselines established (54 screenshots)
- [ ] TypeScript strict check: zero errors, zero `any`
- [ ] Total test count documented

---

## Phase 8 — CI/CD & Demo Readiness

**Goal**: Automate everything and finalize the demo.

**Prerequisites**: Phase 7 complete

---

### Story D-8.1 — GitHub Actions: CI Pipeline
- **Trigger**: On every PR to `main`
- **Steps**: Checkout → Setup Node 22 → Install deps → `turbo run lint` → `turbo run typecheck` → `turbo run test`
- **Cache**: Turborepo remote caching, npm cache

### Story D-8.2 — GitHub Actions: E2E Pipeline
- **Trigger**: On merge to `main`
- **Steps**: Checkout → Setup Node 22 → Install → Build all → Start Docker (MongoDB + Cassandra) → Wait for health → Seed → Start services → Run Playwright E2E
- **Artifacts**: Upload Playwright screenshots and test results

### Story D-8.3 — Docker Compose Full-Stack
- Extend `docker-compose.yml` (or create `docker-compose.full.yml`) to include:
  - All 3 backend services
  - Apollo Gateway
  - All 4 frontend apps
  - Seed step as an init container
- Single command to start everything: `docker compose -f docker/docker-compose.full.yml up`

### Story D-8.4 — Demo Script Finalization
- Walk through the 15-minute demo (PRD §13.3) end-to-end
- Document any manual steps needed
- Update `README.md` with:
  - Quick start instructions
  - Architecture diagram
  - Technology stack
  - Demo walkthrough guide
  - Screenshots

### Story D-8.5 — Security Hardening
- Verify GraphQL depth limit (max 7) rejects deep queries
- Verify rate limiting on REST endpoints (e.g., 100 req/min)
- Verify CORS rejects requests from non-shell origins
- Verify Zod validation rejects malformed input on every mutation
- Verify no secrets (.env, credentials) in codebase
- Verify no `any` types in production code

---

### Phase 8 Definition of Done

- [ ] CI pipeline passes on GitHub Actions
- [ ] E2E pipeline passes with screenshot artifacts
- [ ] `docker compose up` starts the entire platform
- [ ] 15-minute demo walkthrough completes without errors
- [ ] README is comprehensive with setup instructions and screenshots
- [ ] All security checks pass
- [ ] Project is interview-ready

---

## Summary: Story Count by Phase

| Phase | Stories | Key Deliverable |
|-------|---------|-----------------|
| 1 — Foundation | 7 (F-1.1 to F-1.7) | Monorepo scaffold, Docker, configs |
| 2 — Packages | 7 (P-2.1 to P-2.7) | Types, GraphQL schema, UI library, XML utils |
| 3 — Backend | 10 (B-3.1 to B-3.10) | 3 subgraphs + gateway, fully operational API |
| 4 — Seed Data | 4 (S-4.1 to S-4.4) | Realistic demo data in both databases |
| 5 — Frontend | 15 (MF-5.1 to MF-5.15) | Shell + 3 MFEs with Module Federation |
| 6 — Polish | 8 (I-6.1 to I-6.8) | Responsive, accessible, performant, integrated |
| 7 — Testing | 7 (T-7.1 to T-7.7) | Full test suite, visual regression |
| 8 — CI/CD | 5 (D-8.1 to D-8.5) | Automation, Docker, demo readiness |
| **Total** | **63 stories** | **Interview-ready platform** |

---

## Dependency Graph Between Phases

```
Phase 1 (Foundation)
    ↓
Phase 2 (Packages) ←── packages/types needed by everything
    ↓
Phase 3 (Backend) ←── graphql-schema codegen, xml-utils, types
    ↓
Phase 4 (Seed Data) ←── services must be running for validation
    ↓
Phase 5 (Frontend) ←── needs working API + seeded data
    ↓
Phase 6 (Polish) ←── needs all pieces integrated
    ↓
Phase 7 (Testing) ←── needs stable, polished app
    ↓
Phase 8 (CI/CD) ←── needs passing tests
```

**Phases are strictly sequential.** Within each phase, stories can be worked in parallel where there are no dependencies (e.g., all 3 subgraph services in Phase 3 can be developed in parallel after B-3.1 establishes the model pattern).

---

*End of Implementation Plan*
