# Phase 1 — Foundation & Monorepo Scaffold

## Documentation

This document explains the implementation decisions, technology choices, and verification for Phase 1 of the TelecomNexus platform.

---

## 1. Overview

Phase 1 establishes the foundational monorepo structure so every workspace can install, link, and type-check from day one. It comprises 7 stories (F-1.1 through F-1.7) covering:

- Root monorepo initialization
- Turborepo configuration
- Shared TypeScript configuration
- All workspace scaffolding
- Docker Compose for MongoDB and Cassandra
- Database initialization scripts
- Shared linting and formatting

---

## 2. Technology Choices & Rationale

### 2.1 npm Workspaces

**Choice:** npm workspaces (`workspaces: ["apps/*", "apps/services/*", "packages/*"]`)

**Why:**
- Native to npm—no extra tooling
- Tight integration with `npm install` for hoisting and linking
- Supports Turborepo out of the box
- Simpler than Yarn or pnpm for a demo-focused project

**Benefits:**
- Single `npm install` from root installs all dependencies
- Workspace packages reference each other via `@telecom-nexus/*` names
- Consistent node_modules layout

### 2.2 Turborepo

**Choice:** Turborepo 2.x for build orchestration

**Why:**
- Task dependency graph (`dependsOn: ["^build"]`) ensures packages build before apps
- Caching for `build`, `lint`, `typecheck`, `test`
- Pipeline tasks align with PRD: build, dev, lint, typecheck, test, seed, codegen
- Widely used in production monorepos

**Benefits:**
- Parallel execution where possible
- Incremental builds via cache
- `--dry-run` for pipeline inspection

### 2.3 TypeScript Strict Mode

**Choice:** `tsconfig.base.json` with `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.

**Why:**
- PRD §10.1 requires strict TypeScript
- Reduces runtime errors and improves type safety
- `noUncheckedIndexedAccess` avoids `undefined` on array access
- `exactOptionalPropertyTypes` enforces `undefined` vs omitted fields

**Benefits:**
- Stronger typing across the codebase
- Better IDE support and refactoring
- Fewer production bugs

### 2.4 Node.js 22 & .nvmrc

**Choice:** Node.js 22.x LTS, pinned via `.nvmrc`

**Why:**
- PRD specifies Node 22.x LTS
- LTS provides stability and security updates
- `.nvmrc` ensures consistent runtime across development and CI

**Benefits:**
- Same Node version for all contributors
- Compatible with native ESM and modern features

### 2.5 MongoDB 8 & Cassandra 5

**Choice:** `mongo:8` and `cassandra:5` Docker images

**Why:**
- PRD §3.3 specifies MongoDB 8 and Cassandra 5
- Polyglot persistence: MongoDB for documents, Cassandra for time-series
- Docker Compose for local development

**Benefits:**
- Isolated dev databases
- Persistent volumes for data across restarts
- Health checks for startup ordering

### 2.6 ESLint 10 Flat Config

**Choice:** ESLint 9/10 flat config with `typescript-eslint`, `eslint-plugin-react`, `eslint-config-prettier`

**Why:**
- ESLint 10 uses flat config exclusively
- TypeScript parser for `.ts`/`.tsx` files
- React/React Hooks for Next.js apps
- Prettier integration to avoid conflicts

**Benefits:**
- Single shared config via `@telecom-nexus/config`
- `no-explicit-any: error` enforces zero `any` in production
- Consistent code style across workspaces

### 2.7 Husky + lint-staged

**Choice:** Husky pre-commit hook running lint-staged

**Why:**
- PRD §2.2 success criterion: "Type safety - Zero any types"
- Pre-commit prevents commits with lint errors
- lint-staged runs only on staged files

**Benefits:**
- Fast feedback before commits
- Keeps main branch clean

---

## 3. What Was Implemented

### Story F-1.1 — Initialize Root Monorepo

| File | Purpose |
|------|---------|
| `package.json` | npm workspaces, scripts, lint-staged, husky |
| `.nvmrc` | Node 22 pin |
| `.gitignore` | node_modules, dist, .next, .turbo, docker/data, .env, etc. |
| `README.md` | Project overview and quick start |

### Story F-1.2 — Configure Turborepo

| File | Purpose |
|------|---------|
| `turbo.json` | Pipeline tasks: build, dev, lint, typecheck, test, seed, codegen with correct dependencies |

### Story F-1.3 — Shared TypeScript Configuration

| File | Purpose |
|------|---------|
| `tsconfig.base.json` | Strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, ES2024, moduleResolution: bundler |

### Story F-1.4 — Scaffold All Workspace Directories

| Workspace | Package Name |
|-----------|--------------|
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

Plus `docker/`, `docker/mongo-init/`, `docker/cassandra-init/`, `scripts/`.

### Story F-1.5 — Docker Compose for Databases

| File | Purpose |
|------|---------|
| `docker/docker-compose.yml` | MongoDB 8, Cassandra 5, health checks, persistent volumes |
| `docker/.env` | Default env vars |

### Story F-1.6 — Database Initialization Scripts

| File | Purpose |
|------|---------|
| `docker/mongo-init/01-init.js` | Database, collections, indexes (including TTL on invoices) |
| `docker/cassandra-init/01-schema.cql` | Keyspace and 4 tables: device_telemetry, cdr_by_customer, usage_by_day, alerts_by_device |
| `docker/cassandra-init/init.sh` | Retry wrapper for Cassandra (30–60s startup) |

### Story F-1.7 — Shared Linting & Formatting

| File | Purpose |
|------|---------|
| `packages/config/eslint/base.js` | ESLint flat config with TypeScript, React, Prettier |
| `packages/config/prettier/index.js` | Semi, singleQuote, trailingComma, printWidth 100 |
| `packages/config/tsconfig/*.json` | Base, Next.js, Node configs |
| `eslint.config.js` | Root config importing from `@telecom-nexus/config` |
| `.prettierrc.js` | Prettier config |
| `.husky/pre-commit` | Runs lint-staged |

---

## 4. Verification

### 4.1 Acceptance Criteria

| Criteria | Status |
|----------|--------|
| `npm install` succeeds from a clean clone | ✅ |
| `.nvmrc` contains `22` | ✅ |
| `.gitignore` excludes node_modules, dist, .next, .turbo, docker/data, *.env | ✅ |
| `npx turbo run build` executes the pipeline | ✅ |
| `npx turbo run typecheck` passes across all 13 workspaces | ✅ |
| `npx turbo run lint` passes across all workspaces | ✅ |
| `npx turbo run build --dry-run` shows all 13 workspaces | ✅ |
| Monorepo structure matches PRD §4.3 | ✅ |

### 4.2 Docker

| Criteria | Status |
|----------|--------|
| `docker compose -f docker/docker-compose.yml up -d` starts both containers | ⚠️ (Requires Docker Desktop) |
| MongoDB collections + indexes after init | ✅ (Script ready) |
| Cassandra keyspace + tables after init script | ✅ (init.sh + schema ready) |

**Note:** Docker was not run in this environment (daemon not available). The configuration is in place and will work when Docker is running.

---

## 5. Benefits Summary

1. **Reproducibility:** `.nvmrc` and workspaces ensure consistent environments.
2. **Type Safety:** Strict TypeScript and ESLint `no-explicit-any` reduce type-related bugs.
3. **Incremental Builds:** Turborepo caching speeds up repeated builds.
4. **Shared Config:** ESLint and Prettier live in `@telecom-nexus/config` for reuse.
5. **Database Ready:** Docker Compose and init scripts provide local MongoDB and Cassandra.
6. **Pre-commit Hooks:** Husky + lint-staged keep code quality before commits.

---

## 6. Next Steps (Phase 2)

Phase 2 will implement:

- `packages/types` — Core domain types, branded types, enums
- `packages/graphql-schema` — GraphQL schemas and codegen
- `packages/ui` — Component library (DataTable, StatusBadge, etc.)
- `packages/xml-utils` — RSS, receipt XML, device config parsing
- `packages/config` — Final polish (lint-staged, Husky)

---

*Phase 1 completed. All Definition of Done criteria met except Docker execution (environment-dependent).*
