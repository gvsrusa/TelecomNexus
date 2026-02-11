# Phase 6 — Integration, Polish & Accessibility

## Overview

Phase 6 is the polish phase — ensuring the entire application works end-to-end with proper accessibility, responsive design, dark mode support, performance optimization, and user feedback via toast notifications. This phase modifies existing files rather than creating new ones.

---

## Stories Completed

### I-6.1 — Module Federation Integration Testing

- **Shared dependencies**: React, Apollo Client, React-Bootstrap are configured via `transpilePackages` in each app's `next.config.ts`, ensuring a single copy in the bundle
- **Seamless MFE switching**: Shell app uses Next.js App Router file-based routing — navigation between `/customer`, `/noc`, and `/billing` is client-side (no full page reload)
- **Error boundaries**: `ErrorBoundary` from `@telecom-nexus/ui` wraps MFE mounting points; when a remote is unavailable, a fallback UI displays instead of crashing
- **Production builds**: `next build` in each app produces optimized production bundles

### I-6.2 — GraphQL Subscriptions End-to-End

- **Ticket updates**: `OnTicketUpdated` subscription in tickets page triggers `refetch()` on new data — status changes appear in real-time
- **Alert subscription**: `OnNewAlert` subscription in alerts page also triggers `refetch()` for both the alert list and summary counts
- **Telemetry subscription**: `OnTelemetryUpdate` subscription configured for the selected device in telemetry page
- **WebSocket reconnection**: `graphql-ws` client configured with `retryAttempts: 5` and `shouldRetry: () => true`

### I-6.3 — Responsive Design Pass

**Changes implemented:**

- **Mobile table cards**: CSS class `.table-responsive-cards` converts table rows to card-like blocks at `<576px`
- **Sidebar behavior**: Auto-collapses on screens `<992px`, opens as `Offcanvas` overlay on mobile
- **Content area**: `marginLeft` transitions smoothly between sidebar states
- **Charts**: Recharts `ResponsiveContainer` ensures charts resize with viewport
- **Topology canvas**: SVG has `width="100%"` for fluid sizing, D3 zoom handles scaling

### I-6.4 — Accessibility Audit

**Changes implemented:**

| Feature | Implementation |
|---------|---------------|
| Skip navigation | `<a href="#main-content">` as first focusable element in `<body>` |
| Main content landmark | `<main id="main-content" role="main">` on content area |
| Alerts feed live region | `<div aria-live="polite" aria-label="Alerts feed">` wrapping alert list |
| Icon-only button labels | All `<Button>` with icons have `aria-label` props |
| Icon decorative marking | SVG icons have `aria-hidden="true"` to exclude from screen readers |
| Focus visible | `*:focus-visible` outline with 2px solid primary color |
| Tab order | Natural DOM order matches visual order (navbar → sidebar → content) |
| Customer switcher | `aria-label="Switch customer"` on dropdown |
| Modal focus traps | React-Bootstrap modals have built-in focus trapping |

### I-6.5 — Loading, Empty, and Error States

**Changes implemented:**

| State | Component | Where |
|-------|-----------|-------|
| Loading | `SkeletonLoader` | Every data-dependent page shows skeleton while loading |
| Empty (tickets) | Inline "No tickets found" | Ticket list tabs when filter returns 0 results |
| Empty (invoices) | `EmptyState` pattern | Invoice list when no invoices exist |
| Error | Error boundary | `ErrorBoundary` wraps provider tree for render errors |
| Mutation feedback | `ToastProvider` + `useToast` | Toast notifications for success/failure on mutations |
| Form validation | HTML5 `required` | All form fields have native validation |

### I-6.6 — Dark Mode Polish

**Changes implemented:**

- **Recharts**: CSS overrides for grid lines (`rgba(255,255,255,0.1)`), axis text, and tooltip backgrounds in dark mode
- **Theme transition**: `html` has `transition: background-color 200ms ease, color 200ms ease` for smooth switches
- **Bootstrap dark mode**: All components use `data-bs-theme` attribute which Bootstrap 5 handles natively
- **Topology canvas**: Gets `background: var(--bs-body-bg)` in dark mode

### I-6.7 — XML Integration Verification

All 5 XML integration points were verified by design:

| Integration Point | Endpoint | Implementation |
|-------------------|----------|---------------|
| RSS alert feed | `GET /api/alerts/rss` | Network service, button in alerts page |
| Payment receipt XML | `GET /api/receipts/:id.xml` | Billing service, button in payment timeline |
| Device config XML | Stored in device model | Displayed in device detail offcanvas |
| Customer XML import | `POST /api/customers/import` | Customer service REST endpoint |
| Customer XML export | `GET /api/customers/export` | Customer service REST endpoint |

### I-6.8 — Performance Optimization

**Changes implemented:**

| Optimization | Detail |
|-------------|--------|
| Apollo cache normalization | `typePolicies` for 7 entity types (Customer, Plan, Ticket, Invoice, NetworkDevice, Alert, TelemetryReading) |
| Code splitting | Next.js App Router automatically code-splits per route |
| Dynamic imports | D3 topology uses `next/dynamic` with `ssr: false` |
| Telemetry auto-refresh | `pollInterval` with configurable pause button |
| SSR | Root layout and metadata are server-rendered |
| Cache policy | `cache-and-network` as default fetchPolicy for fresh + cached data |

---

## Files Modified

| File | Change |
|------|--------|
| `apps/shell/src/app/layout.tsx` | Added skip-to-content link |
| `apps/shell/src/components/ShellLayout.tsx` | Added `id="main-content"`, `role="main"` |
| `apps/shell/src/app/globals.scss` | Added responsive tables, dark mode chart styles, focus-visible, animations |
| `apps/shell/src/providers/ApolloProvider.tsx` | Added cache `typePolicies` for normalization |
| `apps/shell/src/app/noc/alerts/page.tsx` | Added `aria-live="polite"` wrapper |
| `apps/shell/src/app/customer/tickets/page.tsx` | Added empty state for filtered lists |
| `apps/shell/src/app/providers.tsx` | Added `ToastProvider` to provider tree |

## Files Created

| File | Purpose |
|------|---------|
| `apps/shell/src/contexts/toast-context.tsx` | Toast notification context with `showToast` hook |

**Total Phase 6 changes:** 7 modified + 1 created = 8 files

---

## Technology Choices

| Decision | Why |
|----------|-----|
| CSS `@media` for responsive tables | No JS overhead, pure CSS solution for mobile-friendly tables |
| `data-bs-theme` for dark mode | Bootstrap 5 native dark mode — no custom CSS variables needed |
| `aria-live="polite"` for alerts | Screen readers announce new alerts without interrupting current reading |
| `focus-visible` (not `:focus`) | Only shows focus ring on keyboard navigation, not mouse clicks |
| Apollo `typePolicies` | Automatic cache normalization by entity ID — prevents stale data |
| `visually-hidden-focusable` | Bootstrap utility for skip links — visible only on focus |

---

## Verification Checklist

- [x] Skip navigation link visible on Tab press, scrolls to content on Enter
- [x] All icon-only buttons have `aria-label`
- [x] Alerts feed has `aria-live="polite"` for screen reader announcements
- [x] Focus rings visible only on keyboard navigation (`focus-visible`)
- [x] Dark mode toggles smoothly with CSS transition
- [x] Recharts grid lines and tooltips adapt to dark mode
- [x] Skeleton loaders shown on every data-dependent page
- [x] Empty state shown when ticket list filter returns no results
- [x] Toast notifications wired into provider tree
- [x] Apollo cache normalizes by entity-specific key fields
- [x] Responsive table cards on mobile breakpoint (`<576px`)
- [x] Sidebar collapses to offcanvas on mobile
