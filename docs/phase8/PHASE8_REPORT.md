# Phase 8 — CI/CD & Demo Readiness

## Overview

Phase 8 is the final phase — automating the build, test, and deployment pipeline with GitHub Actions, creating a one-command Docker Compose stack, and finalizing the demo experience. This phase ensures the project is interview-ready and fully operational.

---

## Stories Completed

### D-8.1 — GitHub Actions: CI Pipeline

**File**: `.github/workflows/ci.yml`

**Trigger**: On every pull request to `main`

**Pipeline steps:**
1. Checkout code
2. Setup Node.js 22 with npm cache
3. `npm ci` — deterministic install
4. `npx turbo run lint` — ESLint across all workspaces
5. `npx turbo run typecheck` — TypeScript strict check
6. `npx turbo run test` — Vitest unit tests
7. Upload coverage artifacts

**Features:**
- Concurrency group prevents parallel runs for the same PR
- `cancel-in-progress: true` cancels stale runs
- Coverage artifacts uploaded for review

### D-8.2 — GitHub Actions: E2E Pipeline

**File**: `.github/workflows/e2e.yml`

**Trigger**: On push to `main` (post-merge)

**Pipeline steps:**
1. Checkout + Node.js 22
2. Service containers: MongoDB 8, Cassandra 5 with health checks
3. Install deps + Playwright browsers
4. `turbo run build` — build all packages and apps
5. `npx tsx scripts/seed.ts` — seed both databases
6. Start all 4 backend services + shell in background
7. `npx playwright test` — run all E2E scenarios
8. Upload Playwright HTML report and screenshots as artifacts

**Key design decisions:**
- Service containers run as GitHub Actions services (not Docker Compose) for faster startup
- Cassandra has a 30s `start_period` to account for slow initialization
- Backend services are started with `&` background operator, with a 15s sleep for readiness

### D-8.3 — Docker Compose Full-Stack

**File**: `docker/docker-compose.full.yml`

| Service | Image/Build | Port | Dependencies |
|---------|------------|------|-------------|
| MongoDB | `mongo:8` | 27017 | — |
| Cassandra | `cassandra:5` | 9042 | — |
| Customer Service | `Dockerfile.service` | 4001 | MongoDB |
| Network Service | `Dockerfile.service` | 4002 | MongoDB, Cassandra |
| Billing Service | `Dockerfile.service` | 4003 | MongoDB, Cassandra |
| Apollo Gateway | `Dockerfile.gateway` | 4000 | All 3 services |
| Shell | `Dockerfile.frontend` | 3000 | Gateway |

**Dockerfiles created:**
- `docker/Dockerfile.service` — Parameterized via `SERVICE` build arg (reused for all 3 services)
- `docker/Dockerfile.gateway` — Apollo Gateway with tsx runner
- `docker/Dockerfile.frontend` — Next.js build + production serve

**Network**: All services on `telecom-network` bridge network for DNS-based service discovery.

### D-8.4 — Demo Script Finalization

**File**: `scripts/start-all.sh`

One-command startup for the entire platform:

```bash
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

**Steps:**
1. Start databases via Docker Compose
2. Wait for MongoDB and Cassandra health checks
3. Seed both databases with demo data
4. Start 3 backend services (ports 4001-4003)
5. Start Apollo Gateway (port 4000)
6. Start Shell app (port 3000)
7. Print access URLs and login instructions

### D-8.5 — Security Hardening

Security measures implemented across the codebase:

| Check | Implementation | Location |
|-------|---------------|----------|
| GraphQL depth limit | `graphql-depth-limit` middleware (max 7) | `apps/gateway/src/middleware/depth-limit.ts` |
| Rate limiting | `express-rate-limit` (200 req/min) | `apps/gateway/src/server.ts` |
| CORS | Restricted to `http://localhost:3000` | `apps/gateway/src/server.ts` |
| Input validation | Zod schemas on all mutations | `apps/services/customer-service/src/validation/schemas.ts` |
| Idempotency keys | Required on `payInvoice` mutation | `apps/services/billing-service/src/resolvers/payment.resolver.ts` |
| No secrets in repo | `.gitignore` covers `.env`, credentials | `.gitignore` |
| Strict TypeScript | `strict: true`, `exactOptionalPropertyTypes: true` | `tsconfig.base.json` |
| No `any` types | ESLint `@typescript-eslint/no-explicit-any` rule | `packages/config/eslint/base.js` |

---

## Technology Choices

| Technology | Purpose | Why |
|-----------|---------|-----|
| **GitHub Actions** | CI/CD | Free for public repos, native GitHub integration, YAML-based |
| **Turborepo** | Build orchestration | Incremental builds, task caching, parallel execution |
| **Docker Compose** | Full-stack orchestration | One-command startup, health checks, network isolation |
| **Playwright** | E2E in CI | Headless browser, cross-platform, fast |
| **Service containers** | CI databases | GitHub Actions native, no Docker-in-Docker needed |

### Why GitHub Actions (not Jenkins/CircleCI)?

- **Zero infrastructure**: No servers to manage
- **Native caching**: `actions/cache` and `actions/setup-node` with built-in npm cache
- **Concurrency control**: `concurrency` groups prevent resource waste
- **Artifact storage**: Test results, coverage, and screenshots stored automatically
- **Service containers**: MongoDB and Cassandra run as sidecar services

### Why Docker Compose for Full-Stack?

- **Single command**: `docker compose -f docker/docker-compose.full.yml up` starts everything
- **Health checks**: Services wait for database readiness before starting
- **Network isolation**: Internal DNS resolution (`mongodb:27017`, `cassandra:9042`)
- **Reproducible**: Same environment in development, CI, and production

---

## Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | CI pipeline: lint, typecheck, test on every PR |
| `.github/workflows/e2e.yml` | E2E pipeline: full integration test on merge to main |
| `docker/docker-compose.full.yml` | Full-stack Docker Compose (7 services) |
| `docker/Dockerfile.service` | Parameterized Dockerfile for backend services |
| `docker/Dockerfile.gateway` | Apollo Gateway Dockerfile |
| `docker/Dockerfile.frontend` | Next.js frontend Dockerfile |
| `scripts/start-all.sh` | One-command demo startup script |

**Total Phase 8 files:** 7

---

## Quick Start Guide

### Development (individual services)

```bash
# Start databases
cd docker && docker compose up -d && cd ..

# Seed data
npx tsx scripts/seed.ts

# Start backend (in separate terminals)
npx tsx apps/services/customer-service/src/index.ts
npx tsx apps/services/network-service/src/index.ts
npx tsx apps/services/billing-service/src/index.ts
npx tsx apps/gateway/src/index.ts

# Start frontend
npm run dev -w @telecom-nexus/shell
```

### One-Command Startup

```bash
./scripts/start-all.sh
```

### Full Docker Stack

```bash
docker compose -f docker/docker-compose.full.yml up --build
```

### Running Tests

```bash
# Unit tests
npx turbo run test

# E2E tests (requires running app)
npx playwright test

# Type checking
npx turbo run typecheck

# Linting
npx turbo run lint
```

---

## Demo Walkthrough (15 minutes)

| Time | Section | Actions |
|------|---------|---------|
| 0:00 | Login | Open http://localhost:3000, login as customer1@example.com |
| 0:30 | Account | View profile, plan, usage rings on dashboard |
| 2:00 | Plans | Browse tiers, compare plans, switch plan |
| 4:00 | Tickets | Create ticket, view message thread, see status stepper |
| 6:00 | NOC Topology | View D3 force graph, click devices, filter by region |
| 8:00 | Telemetry | View charts, change time range, toggle auto-refresh |
| 10:00 | Alerts | View feed, acknowledge alert, resolve alert, open RSS |
| 12:00 | Invoices | View invoice detail, pay invoice |
| 13:00 | Usage | View usage charts, scroll call history |
| 14:00 | Payments | Toggle auto-pay, download XML receipt |
| 14:30 | Dark Mode | Toggle dark mode, verify all sections |

---

## Verification Checklist

- [x] CI pipeline YAML validates
- [x] E2E pipeline YAML validates
- [x] Docker Compose file defines all 7 services
- [x] Dockerfiles build successfully
- [x] Start-all script is executable
- [x] GraphQL depth limit configured (max 7)
- [x] Rate limiting configured (200 req/min)
- [x] CORS restricted to localhost:3000
- [x] Zod validation on all mutations
- [x] Idempotency keys on payment mutation
- [x] No secrets in codebase
- [x] TypeScript strict mode enabled
