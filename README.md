# TelecomNexus

**Unified Telecom Customer & Network Operations Platform** -- a full-stack demo showcasing micro frontends, GraphQL federation, and polyglot persistence (MongoDB + Cassandra).

Built as an interview project demonstrating production-grade architecture patterns in a Turborepo monorepo.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Shell App (Next.js 16)                    │
│            Customer Portal │ NOC Dashboard │ Billing         │
│                      Port 3000                               │
└────────────────────────────┬────────────────────────────────┘
                             │ GraphQL
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                Apollo Gateway (Federation v2)                │
│                      Port 4000                               │
└──────┬──────────────────────┬──────────────────────┬────────┘
       ▼                      ▼                      ▼
┌──────────────┐  ┌───────────────────┐  ┌────────────────────┐
│   Customer   │  │     Network       │  │     Billing        │
│   Subgraph   │  │     Subgraph      │  │     Subgraph       │
│  Port 4001   │  │    Port 4002      │  │    Port 4003       │
└──────┬───────┘  └───┬──────────┬────┘  └───┬───────────┬────┘
       │              │          │            │           │
       ▼              ▼          ▼            ▼           ▼
┌────────────┐  ┌────────────┐  ┌─────────────────────────────┐
│  MongoDB 8 │  │  MongoDB 8 │  │       Cassandra 5           │
│ Customers, │  │  Devices   │  │  Telemetry, CDRs, Usage,    │
│ Plans,     │  │            │  │  Alerts (time-series)       │
│ Tickets,   │  │            │  │                             │
│ Invoices   │  │            │  │                             │
└────────────┘  └────────────┘  └─────────────────────────────┘
```

## Technology Stack

| Layer        | Technologies                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **Frontend** | React 19, Next.js 16 (App Router), TypeScript 5.9 strict, Bootstrap 5.3, React-Bootstrap 2.10, Recharts, D3.js |
| **API**      | Apollo Gateway (Federation v2), Apollo Server 5, GraphQL 16, graphql-ws 6                                      |
| **Backend**  | Node.js 22, Express 5, Zod 4 validation, graphql-codegen                                                       |
| **Data**     | MongoDB 8 (Mongoose 9) for documents, Cassandra 5 for time-series                                              |
| **Tooling**  | Turborepo 2.8, ESLint 10, Vitest 4, Playwright 1.58, Docker Compose                                            |

## Prerequisites

- **Node.js** 22.x LTS
- **Docker Desktop** (for MongoDB 8 and Cassandra 5)
- **npm** 10.x

## Quick Start

### One-command demo

```bash
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

### Step by step

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start databases
docker compose -f docker/docker-compose.yml up -d

# 3. Wait for Cassandra to initialize (~60-90s)
# Check: docker exec telecom-nexus-cassandra cqlsh -e "DESCRIBE KEYSPACES"

# 4. Seed both databases with demo data
npx turbo run seed

# 5. Start all services + apps in development mode
npx turbo run dev
```

Then open **http://localhost:3000** in your browser.

## Project Structure

```
telecom-nexus/
├── apps/
│   ├── shell/                 # Host Next.js app (port 3000)
│   ├── customer-portal/       # Standalone MFE (port 3001)
│   ├── noc-dashboard/         # Standalone MFE (port 3002)
│   ├── billing-console/       # Standalone MFE (port 3003)
│   ├── gateway/               # Apollo Gateway (port 4000)
│   └── services/
│       ├── customer-service/  # Customer subgraph (port 4001)
│       ├── network-service/   # Network subgraph (port 4002)
│       └── billing-service/   # Billing subgraph (port 4003)
├── packages/
│   ├── ui/                    # Shared React + Bootstrap component library
│   ├── graphql-schema/        # Shared types, fragments, operations
│   ├── config/                # Shared ESLint, TS, Prettier configs
│   ├── xml-utils/             # XML generation (RSS, receipts, import/export)
│   └── types/                 # Shared TypeScript interfaces & branded types
├── docker/                    # Docker Compose, Dockerfiles, DB init scripts
├── scripts/                   # Seed scripts, demo startup
├── tests/e2e/                 # Playwright E2E test specs
└── .github/workflows/         # CI/CD pipelines
```

## Commands

| Command             | Description                                |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start all services and apps in development |
| `npm run build`     | Production build of all workspaces         |
| `npm run test`      | Run Vitest unit + integration tests        |
| `npm run test:e2e`  | Run Playwright E2E tests                   |
| `npm run lint`      | ESLint all workspaces                      |
| `npm run typecheck` | TypeScript strict check across monorepo    |
| `npm run seed`      | Seed MongoDB + Cassandra with demo data    |
| `npm run codegen`   | Generate GraphQL types from schema         |

### Run a single app

```bash
npx turbo run dev --filter=shell           # Just the shell
npx turbo run dev --filter=customer-portal  # Just customer portal MFE
npx turbo run test --filter=@telecom-nexus/ui  # Test UI package only
```

## Demo Walkthrough (15 minutes)

| Time  | What to Show                                            | Technologies                                      |
| ----- | ------------------------------------------------------- | ------------------------------------------------- |
| 0:00  | Dashboard overview, customer selector                   | Next.js SSR, Apollo Client, React Context         |
| 1:00  | Customer account page loads                             | GraphQL query, MongoDB, skeleton loading          |
| 2:30  | Browse plans, change plan                               | Optimistic UI, GraphQL mutation, Zod validation   |
| 4:00  | Create support ticket                                   | GraphQL subscriptions, WebSocket, form validation |
| 5:30  | NOC topology map                                        | Canvas/D3.js rendering, SVG icons                 |
| 7:30  | Telemetry charts, time range                            | Cassandra time-series, Recharts, polling          |
| 9:00  | Acknowledge alert                                       | GraphQL subscription + mutation                   |
| 10:30 | Invoice list, pay invoice                               | Idempotent mutation, payment simulation           |
| 12:00 | Usage analytics, call history                           | Cassandra queries, cursor pagination              |
| 13:00 | Dark mode toggle, responsive resize                     | Bootstrap theming, CSS custom properties          |
| 14:00 | Code tour: monorepo, Docker, TypeScript strict, GraphQL | Architecture showcase                             |

**Demo customers:** `CUST-0001` through `CUST-0005`

## Testing

- **113 unit/integration tests** across Vitest test suites
  - UI components: 25 tests (DataTable, StatusBadge, SkeletonLoader, EmptyState)
  - Backend resolvers: 68 tests (all 3 services, mocked DB, Zod validation)
  - XML utilities: 20 tests (RSS feed, payment receipt, customer import/export)
- **23 Playwright E2E specs** for critical paths and visual regression
- **15/15 typecheck tasks** pass with zero errors
- **Zero `any`** in hand-written production code

```bash
npm run test        # Unit + integration tests
npm run test:e2e    # E2E tests (requires running dev server)
npm run typecheck   # TypeScript strict verification
```

## CI/CD

- **`.github/workflows/ci.yml`** -- On every PR: lint, typecheck, test
- **`.github/workflows/e2e.yml`** -- On merge to main: full build, seed, E2E with Playwright

## Docker

```bash
# Databases only (for local dev)
docker compose -f docker/docker-compose.yml up -d

# Full stack (databases + all services + gateway)
docker compose -f docker/docker-compose.full.yml up -d
```

## Key Design Decisions

- **MongoDB** for document entities (customers, plans, tickets, invoices) -- flexible schemas, aggregation
- **Cassandra** for time-series (telemetry, CDRs, usage, alerts) -- high-write throughput, TTL, time-clustering
- **Apollo Federation v2** -- each service owns its subgraph; gateway composes the supergraph
- **Turborepo** -- parallel builds, task caching, incremental compilation
- **TypeScript strict** -- `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, branded types
- **Bootstrap 5** -- responsive design, dark mode via `data-bs-theme`, WCAG 2.1 AA accessibility

## Security (Demo-Level)

- GraphQL depth limit (max 7) rejects deeply nested queries
- CORS restricted to shell and MFE origins
- Zod validation on all GraphQL mutation inputs
- Idempotency keys on payment mutations
- No secrets in codebase (`.gitignore` covers `.env`, credentials)
- `@typescript-eslint/no-explicit-any` enforced via ESLint

## License

See [LICENSE](./LICENSE).
