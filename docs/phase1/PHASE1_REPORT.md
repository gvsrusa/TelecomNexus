# Phase 1 — Foundation & Monorepo Scaffold

## Overview

Phase 1 establishes the monorepo foundation so every workspace can install, link, and type-check from day one. It includes the root project configuration, Turborepo pipeline, TypeScript strict configuration, all workspace scaffolding, Docker database containers, database initialization scripts, and shared linting/formatting configuration.

---

## Stories Completed

### F-1.1 — Initialize Root Monorepo

**What was done:**
- Created root `package.json` with npm workspaces pointing to `apps/*`, `apps/services/*`, `packages/*`
- Created `.nvmrc` pinning Node.js 22
- Created `.gitignore` covering node_modules, dist, .next, .turbo, docker volumes, .env files, IDE, OS, test, and generated files
- Created `README.md` with project overview, architecture, quick start, service ports, project structure, and key commands

**Why npm workspaces:**
- **Native to Node.js**: npm workspaces are built into npm (v7+), requiring no additional tooling or configuration
- **Zero-config dependency hoisting**: Shared dependencies are automatically hoisted to the root `node_modules`, reducing disk usage and install time
- **Symlink-based linking**: Internal packages (`@telecom-nexus/types`, `@telecom-nexus/ui`, etc.) are linked automatically via symlinks, enabling live development without publish cycles
- **Industry standard**: npm workspaces is the most widely adopted monorepo workspace protocol, ensuring compatibility with the entire Node.js ecosystem

**Why Node.js 22 LTS:**
- **Long-term support**: Node.js 22 is the current LTS release, receiving security updates and bug fixes through 2027
- **ES2024 features**: Native support for `Array.groupBy`, `Promise.withResolvers`, and other modern JavaScript features
- **Performance**: V8 engine improvements provide faster startup times and better memory management
- **Compatibility**: All chosen dependencies (Next.js 16, Apollo Server 5, Express 5) are tested against Node.js 22

---

### F-1.2 — Configure Turborepo

**What was done:**
- Created `turbo.json` with full task pipeline: build, dev, lint, typecheck, test, test:e2e, seed, codegen
- Configured dependency graph: packages build before apps (`^build`)
- Set appropriate outputs for caching: `.next/**`, `dist/**`, `coverage/**`, `test-results/**`
- Marked `dev` as persistent and uncacheable, `seed` and `codegen` as uncacheable

**Why Turborepo:**
- **Incremental builds**: Only rebuilds packages that have changed, dramatically reducing build times in a 13-workspace monorepo
- **Task orchestration**: Understands the dependency graph (e.g., `@telecom-nexus/types` must build before `@telecom-nexus/ui`) and parallelizes where possible
- **Remote caching**: Supports shared build caches across CI and developer machines
- **Zero-config with npm workspaces**: Integrates natively with npm workspaces — no migration or adapter needed
- **Lightweight**: Unlike Nx, Turborepo adds minimal overhead — just a single `turbo.json` configuration file

**Pipeline Design Decisions:**

| Task | `dependsOn` | Rationale |
|------|------------|-----------|
| `build` | `^build` | Packages must build before dependents (types → ui → app) |
| `dev` | `^build` | Packages need to be built for live dev; dev itself is persistent |
| `lint` | `^build` | Linting needs generated types/declarations from built packages |
| `typecheck` | `^build` | Type-checking requires declaration files from dependencies |
| `test` | `^build` | Tests import from built packages |
| `test:e2e` | `build` | E2E tests need full production builds |
| `seed` | (none) | Standalone script, no workspace dependencies |
| `codegen` | (none) | GraphQL codegen is self-contained |

---

### F-1.3 — Shared TypeScript Configuration

**What was done:**
- Created `tsconfig.base.json` with strict compiler options as specified in the PRD

**Why these TypeScript settings:**

| Setting | Value | Benefit |
|---------|-------|---------|
| `strict: true` | Enables all strict checks | Catches type errors at compile time, reduces runtime bugs |
| `noUncheckedIndexedAccess: true` | Index signatures return `T \| undefined` | Prevents undefined access on objects/arrays without explicit checks |
| `exactOptionalPropertyTypes: true` | Distinguishes `undefined` from optional | More precise types for optional properties |
| `noImplicitReturns: true` | All code paths must return | Prevents accidental missing return statements |
| `noFallthroughCasesInSwitch: true` | Switch cases must break/return | Prevents unintentional fallthrough bugs |
| `moduleResolution: "bundler"` | Modern bundler resolution | Optimized for Next.js/webpack/esbuild module resolution |
| `target: "ES2024"` | Latest stable ECMAScript | Access to latest language features, Node.js 22 compatible |
| `isolatedModules: true` | Each file is a module | Required for SWC/esbuild transpilation (Next.js, tsx) |
| `skipLibCheck: true` | Skip .d.ts checking | Faster type-checking; library types are assumed correct |

---

### F-1.4 — Scaffold All Workspace Directories

**What was done:**
- Created all 13 workspaces with correct `package.json` (name, description, scripts) and `tsconfig.json` (extending base)
- Each package has placeholder `src/index.ts` with appropriate exports

**Workspace Architecture:**

| Workspace | Type | Purpose |
|-----------|------|---------|
| `apps/shell` | Next.js App | Module Federation host, global layout |
| `apps/customer-portal` | Next.js MFE | Customer self-service portal |
| `apps/noc-dashboard` | Next.js MFE | Network operations center dashboard |
| `apps/billing-console` | Next.js MFE | Billing & analytics console |
| `apps/gateway` | Node.js Service | Apollo Federation gateway |
| `apps/services/customer-service` | Node.js Service | Customer subgraph (port 4001) |
| `apps/services/network-service` | Node.js Service | Network subgraph (port 4002) |
| `apps/services/billing-service` | Node.js Service | Billing subgraph (port 4003) |
| `packages/ui` | React Library | Shared component library |
| `packages/graphql-schema` | Library | GraphQL schema definitions & codegen |
| `packages/config` | Config | ESLint, Prettier, TypeScript configs |
| `packages/xml-utils` | Library | XML parsing and generation utilities |
| `packages/types` | Library | Shared TypeScript interfaces & enums |

**Why this workspace structure:**
- **Separation of concerns**: Frontend apps, backend services, and shared packages are clearly separated
- **Independent deployment**: Each MFE and service can be built and deployed independently
- **Code sharing**: Common types, components, and utilities are shared via `packages/*` without duplication
- **Domain-driven**: Services align with business domains (customer, network, billing)

---

### F-1.5 — Docker Compose for Databases

**What was done:**
- Created `docker/docker-compose.yml` with MongoDB 8 and Cassandra 5
- Created `docker/.env` with default environment variables
- Configured persistent volumes for data survival across restarts
- Added health checks for both containers
- Created a shared Docker network

**Why MongoDB 8:**
- **Document model**: Perfect for customer profiles, plans, tickets, invoices — data with varying schemas and nested documents
- **Rich querying**: Supports complex queries, aggregation pipelines, and text search
- **Mongoose ODM**: Excellent TypeScript integration with Mongoose 9 for schema validation and type-safe queries
- **TTL indexes**: Native support for auto-expiring documents (invoice archival)
- **Idempotency key indexes**: Unique sparse indexes for payment deduplication

**Why Cassandra 5:**
- **Time-series optimized**: Wide-column store with clustering keys is ideal for telemetry data (device metrics over time)
- **Partition key design**: `(device_id, date)` partition key ensures efficient reads for single-device time ranges
- **Write throughput**: Cassandra excels at high-volume writes — crucial for continuous telemetry ingestion
- **TTL support**: Built-in per-row TTL for automatic data expiration (90-day telemetry retention)
- **Linear scalability**: Can scale horizontally for production telemetry workloads

**Health Check Configuration:**
- MongoDB: Uses `mongosh --eval "db.runCommand('ping').ok"` — lightweight ping check
- Cassandra: Uses `cqlsh -e "DESCRIBE KEYSPACES"` with longer retries (Cassandra takes 30-60s to start)

---

### F-1.6 — Database Initialization Scripts

**What was done:**
- Created `docker/mongo-init/01-init.js` — MongoDB initialization with 6 collections and comprehensive indexes
- Created `docker/cassandra-init/01-schema.cql` — Cassandra keyspace and 4 tables matching PRD §6.2
- Created `docker/cassandra-init/init.sh` — Bash wrapper that waits for Cassandra readiness before applying schema

**MongoDB Collections & Indexes:**

| Collection | Key Indexes | Purpose |
|-----------|-------------|---------|
| `customers` | unique `customerId`, unique `email`, `accountStatus`, `activePlanId` | Customer profiles with fast lookup |
| `plans` | unique `planCode`, `tier` | Service plans with tier filtering |
| `tickets` | unique `ticketId`, compound `customerId+status`, `createdAt` | Support tickets with customer-scoped queries |
| `invoices` | unique `invoiceNumber`, `customerId`, `status`, TTL on `createdAt` | Billing invoices with auto-archival |
| `payments` | unique `paymentId`, `customerId`, `invoiceNumber`, unique sparse `idempotencyKey` | Payment records with deduplication |
| `devices` | unique `deviceId`, `type`, `status`, `region` | Network devices with multi-dimension filtering |

**Cassandra Table Design:**

| Table | Partition Key | Clustering | Use Case |
|-------|--------------|------------|----------|
| `device_telemetry` | `(device_id, date)` | `timestamp DESC` | Time-series device metrics; 90-day TTL |
| `cdr_by_customer` | `(customer_id, month)` | `timestamp DESC, call_id ASC` | Call detail records per customer per month |
| `usage_by_day` | `(customer_id, month)` | `date ASC` | Daily aggregated usage for charts |
| `alerts_by_device` | `(device_id, month)` | `timestamp DESC, alert_id ASC` | Device alert history for NOC |

**Why this partition key design:**
- Partitions are bounded by time (day or month) — preventing unbounded partition growth
- Clustering order matches typical read patterns (most recent first for telemetry/alerts, chronological for usage)
- Queries always include partition key columns — ensuring fast, partition-local reads

---

### F-1.7 — Shared Linting & Formatting Configuration

**What was done:**
- Created `packages/config/eslint/base.js` — ESLint 9 flat config with TypeScript strict rules and zero-any policy
- Created `packages/config/eslint/next.js` — Extends base with React and React Hooks rules
- Created `packages/config/eslint/node.js` — Extends base with Node.js-specific rules
- Created `packages/config/prettier/index.js` — Shared Prettier configuration
- Created `packages/config/tsconfig/base.json` — Re-export of root tsconfig
- Created `packages/config/tsconfig/next.json` — Next.js-specific TypeScript config
- Created `packages/config/tsconfig/node.json` — Node.js service TypeScript config
- Created root `eslint.config.js` and `.prettierrc.js`

**Why ESLint 9 Flat Config:**
- **Modern configuration**: Flat config is the official ESLint 9+ standard, replacing legacy `.eslintrc`
- **Composable**: Config arrays are easy to merge, extend, and override
- **Type-safe**: Better TypeScript integration with `typescript-eslint`
- **No plugin resolution issues**: Plugins are imported directly, avoiding the legacy string-based resolution

**Why zero-any policy:**
- `@typescript-eslint/no-explicit-any: error` ensures all types are explicitly defined
- Prevents type-safety holes that cascade through the codebase
- Forces developers to think about proper types for every value
- Combined with branded types (Phase 2), provides maximum compile-time safety

**Prettier Configuration Rationale:**

| Setting | Value | Why |
|---------|-------|-----|
| `semi: true` | Semicolons required | Avoids ASI (Automatic Semicolon Insertion) edge cases |
| `singleQuote: true` | Single quotes | Cleaner, consistent with most React/Node.js codebases |
| `trailingComma: 'all'` | Trailing commas everywhere | Cleaner git diffs (adding items doesn't modify previous line) |
| `printWidth: 100` | 100 characters | Balance between readability and fitting on modern screens |
| `tabWidth: 2` | 2 spaces | Standard for JavaScript/TypeScript projects |

---

## Verification Checklist

- [x] `npm install` succeeds from a clean clone
- [x] `.nvmrc` contains `22`
- [x] `.gitignore` excludes: `node_modules/`, `dist/`, `.next/`, `.turbo/`, `docker/data/`, `*.env`, `.env.local`
- [x] `npx turbo run build --dry-run` shows all 13 workspaces in the graph (14 including root)
- [x] Monorepo structure matches PRD §4.3
- [x] Docker Compose file defines MongoDB 8 and Cassandra 5 with health checks
- [x] MongoDB init script creates 6 collections with proper indexes
- [x] Cassandra schema defines 4 tables with correct partition and clustering keys
- [x] ESLint 9 flat config with zero-any policy is in place
- [x] Prettier config ensures consistent formatting across all workspaces
- [x] TypeScript configs for base, Next.js, and Node.js are shared via config package

---

## Files Created/Modified in Phase 1

```
docker/docker-compose.yml              # Docker Compose for MongoDB 8 + Cassandra 5
docker/.env                            # Default Docker environment variables
docker/mongo-init/01-init.js           # MongoDB collection & index initialization
docker/cassandra-init/01-schema.cql    # Cassandra keyspace & table schema
docker/cassandra-init/init.sh          # Cassandra readiness wrapper script
packages/config/eslint/base.js         # ESLint 9 base flat config
packages/config/eslint/next.js         # ESLint for Next.js/React workspaces
packages/config/eslint/node.js         # ESLint for Node.js services
packages/config/prettier/index.js      # Shared Prettier configuration
packages/config/tsconfig/base.json     # Base TypeScript config re-export
packages/config/tsconfig/next.json     # Next.js TypeScript config
packages/config/tsconfig/node.json     # Node.js TypeScript config
packages/config/package.json           # Updated with dependencies and type: module
eslint.config.js                       # Root ESLint config
.prettierrc.js                         # Root Prettier config
package.json                           # Added type: module
```

---

## Technology Stack Summary (Phase 1)

| Technology | Version | Role |
|-----------|---------|------|
| Node.js | 22 LTS | Runtime |
| npm | 10+ | Package manager & workspaces |
| Turborepo | 2.8+ | Build orchestration |
| TypeScript | 5.9+ | Type system |
| ESLint | 9.x | Linting (flat config) |
| Prettier | 3.x | Code formatting |
| MongoDB | 8 | Document database |
| Cassandra | 5 | Time-series database |
| Docker Compose | 3.8 | Container orchestration |
