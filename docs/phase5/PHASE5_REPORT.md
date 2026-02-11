# Phase 5 — Shell Application & Micro Frontends

## Overview

Phase 5 builds all 4 frontend applications: a **Shell host** that provides the global layout, routing, auth, and theming, plus 3 **Micro Frontend (MFE) remotes** — Customer Portal, NOC Dashboard, and Billing Console. Each MFE also runs standalone on its own port for independent development.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Shell Host (port 3000)                                  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Navbar  │ │ Sidebar  │ │ Auth Ctx │ │ Theme Ctx   │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Apollo Client (HTTP + WebSocket)                  │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌───────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ Customer  │ │ NOC          │ │ Billing            │  │
│  │ Portal    │ │ Dashboard    │ │ Console            │  │
│  │ /customer │ │ /noc         │ │ /billing           │  │
│  └───────────┘ └──────────────┘ └────────────────────┘  │
└──────────────────────────────────────────────────────────┘

Customer Portal (port 3001)  — standalone development
NOC Dashboard   (port 3002)  — standalone development
Billing Console (port 3003)  — standalone development
```

---

## Stories Completed (15 stories)

### MF-5.1 — Shell: Next.js 16 Host with Module Federation

- Next.js 16 App Router application at `apps/shell`
- Module Federation host configuration with `transpilePackages` for monorepo
- Apollo Client 4 with HTTP link (`http://localhost:4000/graphql`) and WebSocket link (`ws://localhost:4000/graphql`)
- Split link that routes subscriptions to WebSocket, queries/mutations to HTTP
- Global layout: `AppNavbar` + `Sidebar` + main content area
- `Suspense` boundaries around MFE loading points with `SkeletonLoader` fallback
- `ErrorBoundary` wrapping for graceful degradation

### MF-5.2 — Shell: Auth & Theming

- **Login page** at `/login` with email form (maps to seeded customers)
- **Auth context**: 50 demo customers, `login`, `logout`, `switchCustomer` functions
- **Theme provider**: dark mode toggle via `data-bs-theme` attribute, persists to localStorage, respects `prefers-color-scheme`
- **Customer Switcher** dropdown in navbar for rapid demo switching

### MF-5.3 — Shell: Navigation & Routing

- 9 navigation items across 3 groups (Customer Portal, NOC Dashboard, Billing Console)
- Active item highlighting based on current route
- `BreadcrumbNav` component driven by URL segments
- Mobile: hamburger button opens sidebar as `Offcanvas` overlay
- Desktop: collapsible sidebar (240px expanded, 60px collapsed)

### MF-5.4 — Account Dashboard Page

- Customer profile card with status badge
- Active plan card with tier and pricing
- Quick stats card
- 3 `ProgressRing` components for Data/Voice/SMS usage vs quota
- GraphQL query: `GetCustomerDashboard` with nested `activePlan` and `currentUsage`

### MF-5.5 — Plan Management Page

- Tier-based tabs (Basic/Standard/Premium/Enterprise)
- `PlanCard` components with features, pricing, and CTA
- Plan comparison modal (side-by-side table, up to 3 plans)
- `ChangePlan` mutation with confirmation modal
- Current plan highlighted with "Your Plan" badge

### MF-5.6 — Support Tickets Page

- Create ticket form with category/priority/message fields
- Ticket list with status tab filters (All/Open/In Progress/Resolved/Closed)
- Chat-style message thread with sender differentiation
- `StatusStepper` visualization for ticket lifecycle
- Real-time updates via `OnTicketUpdated` subscription

### MF-5.7 — Customer Portal Remote Config

- `apps/customer-portal` runs standalone on port 3001
- 9 reusable components, 3 custom hooks, 3 page routes
- Uses default customer ID (`CUST-0001`) for standalone mode

### MF-5.8 — Network Topology Page

- Full-width SVG canvas with D3.js force-directed layout
- Device nodes as colored circles (type → color, status → stroke)
- Connection lines between devices
- Click → `Offcanvas` panel with device details, metadata, connected devices
- Region filter dropdown
- Zoom/pan via D3 zoom behavior

### MF-5.9 — Telemetry Charts Page

- 2×2 Recharts grid: CPU, Memory, Bandwidth, Packet Loss
- Current values as large numbers with color coding
- Time range pill buttons (1h/6h/24h/7d)
- Auto-refresh with 10s interval and SVG countdown ring
- Device selector dropdown
- Temperature gauge (semicircular SVG)

### MF-5.10 — Alerts Page

- Real-time feed via `OnNewAlert` subscription
- Split view: list (7 cols) + detail (5 cols)
- Severity badges with pulse animation on Critical
- Acknowledge/Resolve buttons → GraphQL mutations
- Summary banner with severity counts (Critical/Major/Minor/Info/Total)
- Filter by severity
- RSS export button

### MF-5.11 — NOC Dashboard Remote Config

- `apps/noc-dashboard` runs standalone on port 3002
- 10 components, 3 custom hooks, 1 utility module, 3 page routes

### MF-5.12 — Invoice Management Page

- Invoice list with amount and status badges
- Invoice detail: line items table with subtotals, tax, total
- `StatusStepper` for invoice lifecycle (Draft → Due → Paid)
- Pay Now modal with method selection → `PayInvoice` mutation with idempotency key
- Overdue warning banner

### MF-5.13 — Usage Analytics Page

- 3 `ProgressRing` summary cards: Data (GB), Voice (min), SMS (count)
- Recharts `AreaChart`: daily usage with plan limit reference line
- CDR table with cursor-based pagination and "Load More" button
- Month selector for historical data

### MF-5.14 — Payment History Page

- Vertical timeline with method icons and status badges
- XML receipt download button per payment
- `AutoPayCard` toggle with current status
- Payment amounts and transaction references

### MF-5.15 — Billing Console Remote Config

- `apps/billing-console` runs standalone on port 3003
- 9 components, 4 custom hooks, 3 page routes

---

## Technology Choices

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Next.js 16** | App framework | Latest App Router, React Server Components, streaming SSR |
| **Apollo Client 4** | GraphQL client | Industry-standard, built-in cache, subscriptions support |
| **graphql-ws** | WebSocket subscriptions | Modern spec-compliant WebSocket protocol for GraphQL |
| **React-Bootstrap** | UI components | Bootstrap 5 integration with React, matches shared `@telecom-nexus/ui` |
| **D3.js 7** | Network topology | Industry-standard for force-directed graph visualization |
| **Recharts 3** | Charts/graphs | Declarative React chart library, great for time-series data |
| **Sass** | CSS preprocessing | Bootstrap variable overrides, shared theme customization |
| **Module Federation** | Micro frontends | Independent deployment, shared dependencies, runtime composition |
| **React Context** | Auth/Theme state | Native React solution, no external state library needed for demo |

### Why Next.js App Router (not Pages Router)?

- **React Server Components**: Server-rendered layout, metadata, and static content
- **Streaming SSR**: Progressive loading with Suspense boundaries
- **File-based routing**: `/customer/plans` → `src/app/customer/plans/page.tsx`
- **Layout nesting**: Shell layout wraps all pages automatically
- **Future-proof**: App Router is the recommended architecture for Next.js

### Why Split Architecture (Shell + Standalone MFEs)?

- **Shell app** (`port 3000`): Complete app with all routes for demo deployment
- **MFE apps** (`ports 3001-3003`): Standalone for independent development
- **Monorepo sharing**: All apps share `@telecom-nexus/ui` components and `@telecom-nexus/types`
- **Same GraphQL queries**: Both shell and MFEs use identical GraphQL operations

### Why D3.js for Topology?

- **Force-directed layout**: Automatic positioning of 30+ network devices
- **SVG rendering**: Crisp at any zoom level, accessible, printable
- **Interaction**: Native drag, zoom, pan, click handlers
- **Custom rendering**: Device-type icons, status-colored strokes, connection lines

---

## Application Ports

| App | Port | Description |
|-----|------|-------------|
| Shell | 3000 | Main host application with all routes |
| Customer Portal | 3001 | Standalone customer-facing MFE |
| NOC Dashboard | 3002 | Standalone NOC operations MFE |
| Billing Console | 3003 | Standalone billing/analytics MFE |
| Apollo Gateway | 4000 | GraphQL Federation gateway |
| Customer Service | 4001 | Customer subgraph |
| Network Service | 4002 | Network subgraph |
| Billing Service | 4003 | Billing subgraph |

---

## GraphQL Operations Used

### Customer Portal
| Operation | Type | Description |
|-----------|------|-------------|
| `GetCustomerDashboard` | Query | Customer + plan + usage |
| `GetPlans` | Query | All available plans |
| `GetTickets` | Query | Customer's tickets |
| `ChangePlan` | Mutation | Switch customer plan |
| `CreateTicket` | Mutation | New support ticket |
| `AddTicketMessage` | Mutation | Reply to ticket |
| `OnTicketUpdated` | Subscription | Real-time ticket updates |

### NOC Dashboard
| Operation | Type | Description |
|-----------|------|-------------|
| `GetDevices` | Query | All network devices |
| `GetTelemetry` | Query | Device telemetry readings |
| `GetAlerts` | Query | Alert list with filters |
| `GetAlertsSummary` | Query | Severity counts |
| `AcknowledgeAlert` | Mutation | Mark alert acknowledged |
| `ResolveAlert` | Mutation | Mark alert resolved |
| `OnNewAlert` | Subscription | Real-time new alerts |
| `OnTelemetryUpdate` | Subscription | Live telemetry |

### Billing Console
| Operation | Type | Description |
|-----------|------|-------------|
| `GetInvoices` | Query | Customer invoices |
| `GetCurrentUsage` | Query | Usage vs limits |
| `GetUsageByDay` | Query | Daily breakdown |
| `GetCallHistory` | Query | CDR with pagination |
| `PayInvoice` | Mutation | Pay with idempotency |
| `ToggleAutoPay` | Mutation | Toggle auto-pay |

---

## Files Created

### Shell App (26 files)
| File | Purpose |
|------|---------|
| `apps/shell/next.config.ts` | Next.js config with Module Federation |
| `apps/shell/tsconfig.json` | TypeScript config with `@/*` paths |
| `apps/shell/src/app/globals.scss` | Global styles importing shared theme |
| `apps/shell/src/app/layout.tsx` | Root layout (Server Component) |
| `apps/shell/src/app/providers.tsx` | Client-side provider composition |
| `apps/shell/src/app/page.tsx` | Root redirect to `/customer` |
| `apps/shell/src/app/login/page.tsx` | Login page with demo email |
| `apps/shell/src/providers/ApolloProvider.tsx` | Apollo Client with HTTP + WS split |
| `apps/shell/src/contexts/auth-context.tsx` | Auth state with 50 demo customers |
| `apps/shell/src/contexts/theme-context.tsx` | Dark/light mode with localStorage |
| `apps/shell/src/config/navigation.ts` | 9 navigation items in 3 groups |
| `apps/shell/src/components/ShellLayout.tsx` | Main layout: navbar + sidebar + content |
| `apps/shell/src/components/CustomerSwitcher.tsx` | Demo customer dropdown |
| `apps/shell/src/components/BreadcrumbNav.tsx` | Route-based breadcrumbs |
| `apps/shell/src/components/NavIcon.tsx` | SVG icons for navigation |
| `apps/shell/src/app/customer/page.tsx` | Account dashboard with Suspense |
| `apps/shell/src/app/customer/AccountDashboard.tsx` | Profile + plan + usage |
| `apps/shell/src/app/customer/plans/page.tsx` | Plan browser with comparison |
| `apps/shell/src/app/customer/tickets/page.tsx` | Tickets with chat and subscription |
| `apps/shell/src/app/noc/page.tsx` | Topology with dynamic import |
| `apps/shell/src/app/noc/TopologyCanvas.tsx` | D3 force layout |
| `apps/shell/src/app/noc/telemetry/page.tsx` | 2×2 Recharts grid |
| `apps/shell/src/app/noc/alerts/page.tsx` | Alert feed with actions |
| `apps/shell/src/app/billing/page.tsx` | Invoice management |
| `apps/shell/src/app/billing/usage/page.tsx` | Usage analytics with charts |
| `apps/shell/src/app/billing/payments/page.tsx` | Payment timeline |

### Customer Portal MFE (21 files)
| File | Purpose |
|------|---------|
| Config: `next.config.ts`, `tsconfig.json` | App config |
| Layout: `layout.tsx`, `providers.tsx`, `globals.scss` | App shell |
| Hooks: `useCustomer.ts`, `usePlans.ts`, `useTickets.ts` | GraphQL hooks |
| Components (9): `CustomerProfile`, `PlanCard`, `PlanComparison`, `ChangePlanModal`, `TicketForm`, `TicketList`, `TicketChat`, `QuickStats`, `UsageProgressBars` | Reusable UI |
| Pages: `page.tsx`, `plans/page.tsx`, `tickets/page.tsx` | Route pages |

### NOC Dashboard MFE (23 files)
| File | Purpose |
|------|---------|
| Config: `next.config.ts`, `tsconfig.json` | App config |
| Layout: `layout.tsx`, `providers.tsx`, `globals.scss` | App shell |
| Hooks: `useDevices.ts`, `useTelemetry.ts`, `useAlerts.ts` | GraphQL hooks |
| Utils: `topology-layout.ts` | D3 force simulation helpers |
| Components (10): `TopologyCanvas`, `DeviceDetailPanel`, `TelemetryChart`, `TelemetryGrid`, `CountdownRing`, `TemperatureGauge`, `AlertsFeed`, `AlertDetail`, `AlertSummaryBanner`, `AlertFilters` | Reusable UI |
| Pages: `page.tsx`, `telemetry/page.tsx`, `alerts/page.tsx` | Route pages |

### Billing Console MFE (22 files)
| File | Purpose |
|------|---------|
| Config: `next.config.ts`, `tsconfig.json` | App config |
| Layout: `layout.tsx`, `providers.tsx`, `globals.scss` | App shell |
| Hooks: `useInvoices.ts`, `useUsage.ts`, `usePayments.ts`, `useCDR.ts` | GraphQL hooks |
| Components (9): `InvoiceTable`, `InvoiceDetail`, `PaymentModal`, `UsageSummaryCards`, `DailyUsageChart`, `CallLogTable`, `SmsLogTable`, `PaymentTimeline`, `AutoPayCard` | Reusable UI |
| Pages: `page.tsx`, `usage/page.tsx`, `payments/page.tsx` | Route pages |

**Total Phase 5 files:** 92+ files (84 source + 8 config files)

---

## Verification Checklist

- [x] Shell starts on port 3000 with `npm run dev -w @telecom-nexus/shell`
- [x] Customer Portal starts independently on port 3001
- [x] NOC Dashboard starts independently on port 3002
- [x] Billing Console starts independently on port 3003
- [x] Shell provides global navbar, sidebar, and breadcrumbs
- [x] Login page accepts demo customer emails
- [x] Auth context provides user, login, logout, switchCustomer
- [x] Dark mode toggle persists to localStorage
- [x] All 9 navigation items present in sidebar
- [x] Active item highlighted based on route
- [x] Account dashboard shows profile, plan, usage rings
- [x] Plan browser has tier tabs and comparison modal
- [x] Ticket page has create form, list, and chat thread
- [x] D3 topology renders devices with zoom/pan
- [x] Telemetry page shows 4 Recharts with auto-refresh
- [x] Alerts page shows summary banner and real-time feed
- [x] Invoice page has list, detail, and payment modal
- [x] Usage page has progress rings and area chart
- [x] Payment page has timeline and auto-pay toggle
- [x] Subscription hooks configured for real-time updates
- [x] Responsive layout works at mobile/tablet/desktop
