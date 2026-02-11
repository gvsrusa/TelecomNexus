# Phase 2 — Shared Packages

## Documentation

This document explains the implementation decisions, technology choices, and verification for Phase 2 of the TelecomNexus platform.

---

## 1. Overview

Phase 2 builds the foundational shared code that all apps and services depend on. It comprises 7 stories (P-2.1 through P-2.7):

- **packages/types** — Core domain types, branded types, enums, events
- **packages/graphql-schema** — GraphQL schemas, fragments, operations, codegen
- **packages/ui** — Component library (primitives, layout, icons)
- **packages/xml-utils** — RSS, receipt XML, device config, customer import/export
- **packages/config** — Final polish (lint-staged, Husky)

---

## 2. Technology Choices & Rationale

### 2.1 packages/types — Branded Types

**Choice:** TypeScript branded types for domain IDs (`CustomerId`, `DeviceId`, etc.)

**Why:**
- Prevents accidental assignment of `CustomerId` to `DeviceId`
- Compile-time safety without runtime cost
- Matches PRD §10.1 “Zero any types”

**Benefits:**
- Refactoring safety
- Self-documenting APIs
- Creator helpers (`createCustomerId(s)`) for conversion

### 2.2 packages/graphql-schema — GraphQL Codegen

**Choice:** `@graphql-codegen/cli` with `typescript` and `client-preset` plugins

**Why:**
- Schema-first design per PRD §7
- Federated schema from customer, network, billing subgraphs
- Typed operations and fragments for Apollo Client

**Benefits:**
- Type-safe GraphQL operations
- Generated types for resolvers
- Single source of truth for schema

### 2.3 packages/ui — React-Bootstrap

**Choice:** React-Bootstrap 2.x + Bootstrap 5

**Why:**
- PRD §3.1 specifies Bootstrap 5.3.x and React-Bootstrap 2.10.x
- Consistent design system across MFEs
- Accessible components out of the box

**Benefits:**
- Rapid UI development
- Responsive grid and utilities
- Dark mode via CSS custom properties

### 2.4 packages/xml-utils — xmlbuilder2 + @xmldom/xmldom

**Choice:** `xmlbuilder2` for generation, `@xmldom/xmldom` for parsing

**Why:**
- PRD §8 requires RSS 2.0, receipt XML, device config, customer XML
- xmlbuilder2 provides fluent API for XML construction
- @xmldom/xmldom provides Node.js-compatible DOM parsing

**Benefits:**
- Valid RSS 2.0 output
- XSD-validatable receipt structure
- Round-trip for device config and customer data

---

## 3. What Was Implemented

### Story P-2.1 — packages/types

| File | Purpose |
|------|---------|
| `src/branded.ts` | CustomerId, DeviceId, TicketId, InvoiceNumber, PaymentId, PlanCode, AlertId |
| `src/enums.ts` | AccountStatus, PlanTier, TicketStatus, InvoiceStatus, PaymentMethod, DeviceType, AlertSeverity, etc. |
| `src/events.ts` | TicketEvent discriminated union |
| `src/utils.ts` | assertNever, createCustomerId, createDeviceId, etc. |
| `src/models/*.ts` | Customer, Plan, Ticket, Invoice, Payment, NetworkDevice interfaces |

### Story P-2.2 — packages/graphql-schema

| File | Purpose |
|------|---------|
| `src/schemas/shared.graphql` | DateTime, PageInfo, Address |
| `src/schemas/customer.graphql` | Customer subgraph schema |
| `src/schemas/network.graphql` | Network subgraph schema |
| `src/schemas/billing.graphql` | Billing subgraph schema (extends Customer) |
| `src/fragments/*.graphql` | customerFields, planFields, ticketFields, deviceFields, invoiceFields, telemetryFields, alertFields |
| `src/operations/*.graphql` | Queries, mutations, subscriptions |
| `codegen.ts` | GraphQL Codegen config |
| `src/__generated__/` | Generated types and gql |

### Story P-2.3 & P-2.4 — packages/ui (Primitives + Layout)

| Component | Purpose |
|-----------|----------|
| DataTable | Generic sortable table, responsive (cards on mobile) |
| StatusBadge | Color-coded badges for account, ticket, alert, invoice, device status |
| SkeletonLoader | Loading placeholders (text, card, table, chart) |
| EmptyState | Illustrated empty state with optional CTA |
| ProgressRing | Circular SVG progress indicator |
| StatusStepper | Horizontal step indicator |
| AppNavbar | 72px navbar with logo, theme toggle |
| Sidebar | Collapsible 240px/60px, mobile Offcanvas |
| PageContainer | Breadcrumb, title, content wrapper |
| ToastStack | Top-right toasts, auto-dismiss 5s |
| ErrorBoundary | React error boundary with retry |
| ConfirmModal | Reusable confirmation dialog |

### Story P-2.5 — packages/ui (Icons)

| Icon | Purpose |
|------|---------|
| TowerIcon | Cell tower SVG for network topology |

### Story P-2.6 — packages/xml-utils

| File | Purpose |
|------|---------|
| `src/rss.ts` | generateAlertRssFeed(alerts) → RSS 2.0 XML |
| `src/receipt.ts` | generatePaymentReceipt(payment, invoice, customer) → XML |
| `src/config.ts` | parseDeviceConfig, generateSampleDeviceConfig |
| `src/customer-xml.ts` | exportCustomersToXml, parseCustomersFromXml |
| `schemas/receipt.xsd` | XSD schema for receipt validation |

### Story P-2.7 — packages/config

- lint-staged and Husky pre-commit already in Phase 1
- ESLint ignore for generated code (`__generated__/**`)

---

## 4. Verification

### 4.1 Acceptance Criteria

| Criteria | Status |
|----------|--------|
| packages/types builds with tsc, zero any | ✅ |
| packages/graphql-schema codegen produces types | ✅ |
| packages/ui has 12+ shared components | ✅ |
| packages/xml-utils generates valid RSS, receipt, config | ✅ |
| npx turbo run build succeeds for all packages | ✅ |
| npx turbo run typecheck passes | ✅ |
| npx turbo run lint passes | ✅ |

### 4.2 Build Order

Dependency graph: `types` → `graphql-schema` (no deps on types), `xml-utils`, `ui` → `types`

---

## 5. Benefits Summary

1. **Type Safety:** Branded types and generated GraphQL types reduce runtime errors.
2. **Reusability:** UI components shared across shell and 3 MFEs.
3. **Consistency:** Single design system via Bootstrap + custom theme.
4. **XML Integration:** Ready for RSS, receipts, device config, customer import/export.
5. **Codegen:** Schema-first GraphQL with typed operations.

---

## 6. Next Steps (Phase 3)

Phase 3 will implement:

- Customer Service: Mongoose models, Apollo Server, resolvers, subscriptions
- Network Service: MongoDB + Cassandra, device/telemetry/alert resolvers
- Billing Service: Invoice, Payment, CDR, usage resolvers
- Apollo Gateway: Federation composition

---

*Phase 2 completed. All Definition of Done criteria met.*
