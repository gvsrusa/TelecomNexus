# Phase 3 — Backend Services

## Overview

Phase 3 stands up the full GraphQL API with real database connectivity. Three Apollo Server subgraphs (Customer, Network, Billing) are federated through an Apollo Gateway, providing a unified GraphQL endpoint with REST/XML endpoints for specific use cases.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         Apollo Gateway (port 4000)          │
│   IntrospectAndCompose | Rate Limiting      │
└──────┬──────────────┬──────────────┬────────┘
       │              │              │
  ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
  │Customer │   │  Network  │  │ Billing │
  │ :4001   │   │  :4002    │  │ :4003   │
  └────┬────┘   └─────┬─────┘  └────┬────┘
       │         ┌────┤             │
       │         │    │             │
  ┌────▼─────────▼────▼─────────────▼────┐
  │          MongoDB 8 (:27017)          │
  │         telecom_nexus database       │
  └──────────────────────────────────────┘
                  ┌────┤
            ┌─────▼────▼──────────┐
            │  Cassandra 5 (:9042)│
            │ telecom_telemetry   │
            └─────────────────────┘
```

---

## Service Details

### Customer Service (port 4001)

**Stories:** B-3.1, B-3.2, B-3.3

| Layer | Technology | Files |
|-------|-----------|-------|
| Database | Mongoose 8 | 3 models (Customer, Plan, Ticket) |
| Validation | Zod 3 | 4 schemas (updateProfile, createTicket, addMessage, changePlan) |
| API | Apollo Server 4 | Federation v2 subgraph |
| Real-time | PubSub (EventEmitter) | ticketUpdated subscription |
| REST | Express 5 | XML import/export endpoints |

**GraphQL Operations:**
- Queries: `customer`, `plans`, `plan`, `tickets`, `ticket`
- Mutations: `updateCustomerProfile`, `changePlan`, `createTicket`, `addTicketMessage`
- Subscriptions: `ticketUpdated(customerId)`
- Federation: `Customer.__resolveReference`, `Plan.__resolveReference`

**REST Endpoints:**
- `POST /api/import/customers` — XML import (uses `@telecom-nexus/xml-utils`)
- `GET /api/export/customers` — XML export

**Why Mongoose 8:**
- Schema validation mirrors TypeScript interfaces from `@telecom-nexus/types`
- Middleware hooks for auto-updating `updatedAt` timestamps
- Built-in index management (unique, compound, TTL)
- Excellent TypeScript support with `Document` generic types
- Population support for relational queries (plan lookup by planCode)

**Why Zod for validation:**
- Schema-based validation with full TypeScript inference
- Composable — schemas can be extended and combined
- Zero-dependency (no runtime bloat)
- Detailed error messages for each validation failure
- Integrates cleanly with GraphQL mutation inputs

### Network Service (port 4002)

**Stories:** B-3.4, B-3.5, B-3.6

| Layer | Technology | Files |
|-------|-----------|-------|
| MongoDB | Mongoose 8 | 1 model (NetworkDevice) |
| Cassandra | cassandra-driver 4.7 | Prepared statements for telemetry + alerts |
| API | Apollo Server 4 | Federation v2 subgraph |
| Real-time | PubSub | newAlert, telemetryUpdate subscriptions |
| REST | Express 5 | RSS feed, device config XML |

**Dual-database architecture:**
- **MongoDB** stores device metadata (static/slow-changing data: name, type, location, config)
- **Cassandra** stores time-series data (telemetry readings, alerts) — optimized for high-volume sequential writes and time-range reads

**GraphQL Operations:**
- Queries: `devices` (with filter), `device`, `telemetry` (time-range), `alerts` (with filter), `alertsSummary`
- Mutations: `acknowledgeAlert`, `resolveAlert`
- Subscriptions: `newAlert(region)`, `telemetryUpdate(deviceId)`
- Federation: `NetworkDevice.__resolveReference`

**REST Endpoints:**
- `GET /api/alerts/rss` — RSS 2.0 feed (uses `@telecom-nexus/xml-utils`)
- `GET /api/devices/:deviceId/config.xml` — Device config XML

**Why cassandra-driver:**
- Official DataStax driver with full prepared statement support
- Connection pooling for high-throughput telemetry writes
- Token-aware routing for partition-local reads
- TypeScript type definitions included

### Billing Service (port 4003)

**Stories:** B-3.7, B-3.8, B-3.9

| Layer | Technology | Files |
|-------|-----------|-------|
| MongoDB | Mongoose 8 | 2 models (Invoice, Payment) |
| Cassandra | cassandra-driver 4.7 | CDR + usage queries |
| API | Apollo Server 4 | Federation v2 extending Customer |
| REST | Express 5 | XML receipt download |

**Key design patterns:**
- **Idempotency keys**: `payInvoice` mutation checks for existing payment with same key before creating — prevents double-charges
- **Cursor-based pagination**: CDR queries use `(timestamp, call_id)` compound cursor encoded in Base64 — supports efficient infinite scroll
- **Entity extension**: Extends the `Customer` type with billing fields (`invoices`, `payments`, `currentUsage`, `usageByDay`, `callHistory`, `autoPayEnabled`)

**GraphQL Operations:**
- Queries: `invoice`
- Customer fields: `invoices`, `payments`, `currentUsage`, `usageByDay`, `callHistory` (cursor-paginated)
- Mutations: `payInvoice` (with idempotency), `toggleAutoPay`
- Federation: Extends Customer from customer-service

**REST Endpoints:**
- `GET /api/receipts/:paymentId.xml` — XML receipt download with `Content-Disposition: attachment`

### Apollo Gateway (port 4000)

**Story:** B-3.10

| Feature | Implementation |
|---------|---------------|
| Composition | `IntrospectAndCompose` from 3 subgraph URLs |
| Rate limiting | 200 requests/minute per IP |
| CORS | Only allows `http://localhost:3000` |
| Health check | `GET /health` |

**Why Apollo Gateway with IntrospectAndCompose:**
- **Automatic schema composition**: Gateway fetches schemas from all subgraphs at startup and composes a supergraph
- **Federation entity resolution**: Cross-subgraph queries (e.g., `Customer` with `invoices`) are resolved automatically
- **No build step**: No need to manually generate supergraph SDL — subgraphs are introspected at runtime
- **Development-friendly**: Schema changes in subgraphs are picked up automatically on restart

---

## Technology Choices

| Technology | Version | Why |
|-----------|---------|-----|
| Apollo Server 4 | ^4 | Industry standard GraphQL server with federation support |
| Apollo Gateway | ^2 | Official federation gateway with IntrospectAndCompose |
| Apollo Subgraph | ^2 | `buildSubgraphSchema` for federation v2 |
| Express 5 | ^5 | Async middleware, improved routing |
| Mongoose 8 | ^8 | TypeScript ODM for MongoDB |
| cassandra-driver | ^4.7 | Official Cassandra driver with prepared statements |
| Zod 3 | ^3 | Runtime validation with TypeScript inference |
| graphql-ws 6 | ^6 | WebSocket subscriptions protocol |
| graphql-depth-limit | ^1 | Prevents deeply nested query attacks |
| express-rate-limit | ^7 | API rate limiting |

---

## Key Design Decisions

### 1. In-Memory PubSub for Subscriptions
We use a simple `EventEmitter`-based PubSub rather than Redis Pub/Sub for this demo. This is sufficient for single-instance development and avoids adding Redis as an infrastructure dependency. In production, this would be replaced with `graphql-redis-subscriptions`.

### 2. Federation v2 Schema Loading
Each subgraph loads its `.graphql` schema files from `packages/graphql-schema/src/schemas/` at startup using `readFileSync`. This ensures the schema is always in sync with the shared package. The `buildSubgraphSchema` function compiles it with federation directives.

### 3. Cursor-Based Pagination for CDRs
Relay-style cursor pagination is used for Call Detail Records because:
- Offset pagination is slow on large Cassandra tables (no `OFFSET` in CQL)
- Cursors encode the exact position `(timestamp, call_id)` for efficient `WHERE` clause filtering
- `hasNextPage` is determined by fetching `limit + 1` rows

### 4. Idempotency Keys for Payments
The `payInvoice` mutation accepts an `idempotencyKey`. Before creating a new payment, it checks if a payment with that key already exists. If so, it returns the existing payment — preventing double-charges from network retries or user double-clicks.

---

## Files Created

**Customer Service** (15 files): db/connection, 3 models, validation, 3 resolvers, pubsub, schema, routes/import-export, server, index
**Network Service** (15 files): db/mongo-connection, db/cassandra-client, db/cassandra-queries, device model, 3 resolvers, pubsub, schema, 2 routes, server, index
**Billing Service** (14 files): db/mongo-connection, db/cassandra-client, db/cassandra-queries, utils/pagination, 2 models, 4 resolvers, schema, routes/receipt, server, index
**Gateway** (4 files): 2 middleware, server, index

**Total Phase 3 files:** ~48 files

---

## Verification Checklist

- [x] Customer Service has models, resolvers, validation, REST endpoints, subscriptions
- [x] Network Service connects to both MongoDB and Cassandra
- [x] Billing Service implements idempotent payments and cursor pagination
- [x] Gateway composes all 3 subgraphs via IntrospectAndCompose
- [x] Federation entity resolution configured for Customer, Plan, NetworkDevice
- [x] Health check endpoints on all 4 services
- [x] REST/XML endpoints: import/export, RSS, device config, receipt
- [x] All services use shared types from `@telecom-nexus/types`
