# Phase 2 — Shared Packages

## Overview

Phase 2 builds the foundational shared code that all apps and services depend on. This includes domain types with branded type safety, GraphQL schema definitions with code generation, a shared React+Bootstrap component library, XML utilities for RSS/receipts/config, and shared linting/formatting configuration polish.

---

## Stories Completed

### P-2.1 — `packages/types` — Core Domain Types

**What was done:**
- Created branded types (`CustomerId`, `DeviceId`, `TicketId`, `InvoiceNumber`, `PaymentId`, `PlanCode`, `AlertId`, `CallId`) with brand creation helpers
- Created 15 enums covering all domain statuses (Account, Ticket, Invoice, Payment, Device, Alert, Call, Granularity)
- Created 10+ domain interfaces across 6 model files (Customer, Plan, Ticket, Invoice, Payment, Device/Telemetry/Alert/CDR/Usage)
- Created discriminated union event types (`TicketEvent`, `AlertEvent`, `TelemetryEvent`)
- Created utility types (`PageInfo`, `Connection<T>`, `Edge<T>`, `Result<T, E>`, `DateRange`)
- Created utility functions (`assertNever`, `isDefined`)
- Created template literal types for format enforcement

**Why branded types:**
- TypeScript's structural typing would allow `CustomerId` to be assigned to `DeviceId` if both are plain `string`. Branded types add a phantom brand field that prevents cross-assignment at compile time.
- Zero runtime cost — brands are removed during compilation
- Prevents entire categories of bugs (e.g., passing a customer ID where a device ID is expected)
- Brand creation helpers provide a single controlled entry point for ID creation

**Why discriminated unions for events:**
- Enables exhaustive pattern matching with `assertNever`
- TypeScript narrows the type in each `case` branch — no type assertions needed
- Adding a new event type causes compile errors everywhere the union is not fully handled
- Perfect for GraphQL subscription payloads and audit trails

**File count:** 12 files | **Build:** Passes with zero errors

---

### P-2.2 — `packages/graphql-schema` — GraphQL Definitions & Codegen

**What was done:**
- Created 4 schema files: `shared.graphql`, `customer.graphql`, `network.graphql`, `billing.graphql`
- Created 7 fragment files for reusable field selections
- Created 7 operation files (queries, mutations, subscriptions) for all 3 subgraphs
- Configured `@graphql-codegen/cli` with 5 output targets:
  - `types.ts` — Shared schema types
  - `operations.ts` — Typed operation documents for frontend
  - `customer-resolvers.ts` — Typed resolvers for customer-service
  - `network-resolvers.ts` — Typed resolvers for network-service
  - `billing-resolvers.ts` — Typed resolvers for billing-service
- Schemas use Apollo Federation v2 (`@key`, `@extends`, `@external` directives)

**Why GraphQL with Apollo Federation:**
- **Schema-first development**: The schema serves as the contract between frontend and backend — no version drift
- **Federation v2**: Each service owns its portion of the graph. The gateway composes them into a single supergraph.
- **Subgraph autonomy**: Customer, Network, and Billing services can be developed and deployed independently
- **Entity resolution**: The Billing subgraph can extend `Customer` with invoice/payment fields without coupling to the customer service codebase
- **Type-safe resolvers**: Codegen produces TypeScript types for every resolver, eliminating runtime type mismatches

**Why code generation:**
- **Single source of truth**: `.graphql` files define the schema once; TypeScript types are generated automatically
- **Frontend typed hooks**: Generated operation types ensure query variables and response data are type-safe
- **Backend typed resolvers**: Generated resolver types enforce that every resolver matches the schema exactly
- **Drift detection**: If schema and code diverge, codegen or typecheck will catch it immediately

**Generated output:**
- 5 TypeScript files in `src/__generated__/`
- All 3 subgraph resolver types include federation-specific types (`_FieldSet`, `__resolveReference`)

**File count:** 19 files (4 schemas + 7 fragments + 7 operations + codegen.ts) | **Codegen:** Succeeds

---

### P-2.3 & P-2.4 — `packages/ui` — Component Library (Primitives + Layout)

**What was done:**

**12 React components:**

| Component | Category | Key Features |
|-----------|----------|-------------|
| `DataTable<T>` | Primitive | Generic typed columns, sortable headers, sticky header, keyboard accessible rows |
| `StatusBadge` | Primitive | Maps status enums to colored badges with icons. Covers account, ticket, alert, invoice, device, payment variants |
| `SkeletonLoader` | Primitive | Animated placeholders for text, card, table, chart loading states |
| `EmptyState` | Primitive | Illustrated empty state with optional CTA button |
| `ProgressRing` | Primitive | SVG circular progress with percentage, color changes at thresholds (70%, 90%) |
| `StatusStepper` | Primitive | Horizontal step indicator for workflows with completed/current/pending states |
| `AppNavbar` | Layout | 72px fixed navbar with logo, hamburger toggle, dark mode, user dropdown |
| `Sidebar` | Layout | 240px/60px collapsible sidebar with smooth 200ms transition; Offcanvas on mobile |
| `PageContainer` | Layout | Content wrapper with breadcrumb navigation and page title |
| `ToastStack` | Layout | Auto-dismissing toast stack (5s), max 3 visible, positioned top-right |
| `ErrorBoundary` | Layout | Class-based error boundary with retry button |
| `ConfirmModal` | Layout | Reusable confirmation dialog with loading state |

**Styles:**
- `_variables.scss` — Brand colors, status/severity/device colors, spacing/radius/shadow tokens
- `_dark-mode.scss` — CSS custom properties (`--tn-bg`, `--tn-surface`, etc.) with light/dark values
- `theme.scss` — Bootstrap 5 variable overrides and import

**Why React-Bootstrap:**
- **Mature ecosystem**: Bootstrap is the most widely-used CSS framework with proven responsive grid and components
- **React integration**: `react-bootstrap` provides proper React components (not jQuery-dependent)
- **Dark mode**: Bootstrap 5.3 has native `data-bs-theme` dark mode support
- **Accessibility**: Built-in ARIA attributes, focus management, and keyboard navigation
- **Consistent theming**: Sass variable overrides apply globally without ejecting or complex config

**Why generic `DataTable<T>`:**
- Type-safe column definitions ensure accessor functions match the data type
- Sorting logic is centralized — no need to re-implement per table instance
- Responsive design collapses to cards on mobile
- Click and keyboard handlers enable interactive rows

**File count:** 28 files (12 components × 2 + 3 styles + index) | **Build:** Passes with zero errors

---

### P-2.5 — `packages/ui` — SVG Icon Set

**What was done:**
- Created 7 React SVG icon components: `TowerIcon`, `RouterIcon`, `SwitchIcon`, `BaseStationIcon`, `FiberNodeIcon`, `StatusDot`, `TelecomLogo`
- Created 5 raw SVG files in `assets/icons/` for each network device type
- All icons accept `size`, `color`, `className` props
- All icons include `role="img"` and `aria-label` for accessibility
- `StatusDot` supports pulse animation for active/critical states

**Why inline SVG components:**
- **No external requests**: SVGs render inline — no HTTP requests, no FOUT (flash of unstyled text)
- **CSS styling**: `currentColor` inherits from parent, enabling theme-aware coloring
- **Dynamic props**: Size and color can be controlled per-instance
- **Tree-shakeable**: Only used icons are included in the bundle
- **Accessible**: `role="img"` + `aria-label` on every icon

---

### P-2.6 — `packages/xml-utils` — XML Utilities

**What was done:**
- `generateAlertRssFeed()` — Generates valid RSS 2.0 XML from alert items
- `generatePaymentReceipt()` — Generates structured XML payment receipts
- `parseDeviceConfig()` / `generateSampleDeviceConfig()` — Device config XML round-trip
- `exportCustomersToXml()` / `parseCustomersFromXml()` — Customer XML import/export
- `schemas/receipt.xsd` — XML Schema Definition for receipt validation

**Why xmlbuilder2:**
- **Builder pattern**: Fluent API (`ele().txt().up()`) is more readable and less error-prone than string concatenation
- **Standards compliant**: Produces valid XML 1.0 with proper encoding declarations
- **Parse and build**: Can both generate and parse XML — used for device config round-trips
- **TypeScript support**: Full type definitions included
- **Namespace support**: Handles XML namespaces for XSD-validated receipts

**Why XML in a modern stack:**
- **RSS 2.0**: Industry-standard syndication format for alert feeds — compatible with any RSS reader
- **Payment receipts**: XML receipts can be validated against XSD schemas for formal correctness
- **Device configs**: Network devices commonly use XML configuration files
- **Import/Export**: XML is a standard interchange format for customer data between systems
- **PRD requirement**: The PRD specifically mandates 5 XML integration points

**File count:** 7 files | **Build:** Passes with zero errors

---

### P-2.7 — `packages/config` — Final Polish

**What was done:**
- ESLint 9 flat config verified working across all workspaces
- Prettier configuration consistent across monorepo
- Three ESLint configs: `base.js` (all), `next.js` (React), `node.js` (backend)
- Three TypeScript configs: `base.json`, `next.json`, `node.json`

---

## Verification Checklist

- [x] `packages/types` builds and exports all domain types, enums, branded types
- [x] `packages/graphql-schema` codegen produces TypeScript types from all schemas
- [x] `packages/ui` has 12 shared components + 7 icons, all TypeScript-clean
- [x] `packages/xml-utils` generates valid RSS, receipt XML, and parses config XML
- [x] `packages/config` ESLint + Prettier configs available for all workspace types
- [x] `npx turbo run build` succeeds for all packages (types, ui, xml-utils)
- [x] Codegen generates 5 TypeScript output files from GraphQL schemas

---

## Technology Choices Summary

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|------------|
| TypeScript Branded Types | — | Nominal ID safety | Zero-cost compile-time safety for domain IDs |
| GraphQL Code Generator | Latest | Schema → TypeScript | Single source of truth, no type drift |
| Apollo Federation v2 | — | Subgraph composition | Independent service development + unified graph |
| React-Bootstrap | 2.10+ | UI components | Mature, accessible, dark-mode-native |
| Bootstrap 5.3 | 5.3+ | CSS framework | Responsive grid, `data-bs-theme` dark mode |
| xmlbuilder2 | 3.1+ | XML generation/parsing | Fluent API, standards-compliant, TypeScript |
| ESLint 9 Flat Config | 9.x | Linting | Modern, composable, no plugin resolution issues |
| Prettier 3 | 3.x | Formatting | Consistent code style, ESLint-compatible |

---

## Files Created in Phase 2

**packages/types/** (12 files):
- `src/branded.ts`, `src/enums.ts`, `src/events.ts`, `src/utils.ts`
- `src/models/customer.ts`, `plan.ts`, `ticket.ts`, `invoice.ts`, `payment.ts`, `device.ts`, `index.ts`
- `src/index.ts`

**packages/graphql-schema/** (19+ files):
- `src/schemas/shared.graphql`, `customer.graphql`, `network.graphql`, `billing.graphql`
- `src/fragments/` (7 files)
- `src/operations/` (7 files)
- `codegen.ts`, `src/index.ts`
- `src/__generated__/` (5 generated files)

**packages/ui/** (36+ files):
- `src/styles/_variables.scss`, `_dark-mode.scss`, `theme.scss`
- `src/components/` (12 components × 2 files each)
- `src/icons/` (7 icon components + index + 5 raw SVGs)
- `src/index.ts`

**packages/xml-utils/** (7 files):
- `src/rss.ts`, `receipt.ts`, `config.ts`, `customer-xml.ts`, `index.ts`
- `schemas/receipt.xsd`

**Total Phase 2 files:** ~75 files
