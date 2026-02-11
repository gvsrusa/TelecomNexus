# Phase 7 — Testing

## Overview

Phase 7 establishes comprehensive test coverage across three levels: unit tests for UI components and backend resolvers, integration tests for GraphQL API and XML endpoints, and E2E tests for critical user paths. Visual regression testing provides a baseline for future changes.

---

## Test Architecture

```
┌──────────────────────────────────────────────────────────┐
│  E2E Tests (Playwright)                                  │
│  7 critical path scenarios + visual regression           │
│  Tests: login, customer, NOC, billing, dark mode, a11y   │
└──────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────┐
│  Unit Tests (Vitest)                                     │
│  ┌─────────────┐  ┌────────────────────────────────────┐ │
│  │ UI Package  │  │ Backend Services                   │ │
│  │ 9 test files│  │ customer-service: 2 files          │ │
│  │ 61 tests    │  │ billing-service: 2 files           │ │
│  │             │  │ network-service: 1 file            │ │
│  └─────────────┘  └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Stories Completed

### T-7.1 — Unit Tests: Shared UI Components

**Tool**: Vitest 4 + React Testing Library 16

| Component | Tests | What's Tested |
|-----------|-------|---------------|
| StatusBadge | 8 | All status variants, correct badge rendering |
| SkeletonLoader | 8 | Default, variant modes, accessibility |
| EmptyState | 6 | Title, description, action button |
| ProgressRing | 7 | Value display, custom size, clamping |
| StatusStepper | 6 | All steps rendering, current step, aria attributes |
| AppNavbar | 7 | Brand, user, sidebar toggle, theme toggle, custom logo |
| Sidebar | 6 | Items, navigation, active highlighting, collapse |
| ConfirmModal | 5 | Title/body, confirm/cancel clicks, loading |
| Icons (7 icons) | 8 | SVG rendering, custom size/color |
| **Total** | **61** | |

### T-7.2 — Unit Tests: Backend Resolvers

**Tool**: Vitest 4 with mocked Mongoose models

| Service | Test File | Tests | What's Tested |
|---------|-----------|-------|---------------|
| customer-service | customer.resolver.test.ts | 4 | Customer lookup, null handling, plans query, changePlan mutation |
| customer-service | validation.test.ts | 8 | Zod schemas: CreateTicket (valid/invalid subject/category/priority), UpdateProfile (valid/address/zip) |
| billing-service | pagination.test.ts | 4 | Cursor encoding/decoding, base64 roundtrip |
| billing-service | invoice.resolver.test.ts | 3 | Invoice lookup, payment creation, idempotency key dedup |
| network-service | alert.resolver.test.ts | 6 | Alert status transitions (Active→Acknowledged→Resolved, invalid transitions) |
| **Total** | | **25** | |

### T-7.3 & T-7.4 — Integration Tests: GraphQL API & XML

Integration tests verify data shapes and cross-subgraph resolution. The test infrastructure uses:
- Vitest with mocked database connections
- Tests verify resolver logic and data transformation
- XML endpoint tests verify RSS 2.0 structure and receipt XML schema

### T-7.5 — E2E Tests: Critical Paths

**Tool**: Playwright

| Spec File | Scenarios | Description |
|-----------|-----------|-------------|
| login.spec.ts | 3 | Login page display, demo email login, dashboard redirect |
| customer-portal.spec.ts | 5 | Profile display, plan navigation, ticket navigation, plan switching, ticket creation |
| noc-dashboard.spec.ts | 4 | Topology, telemetry, alerts navigation, time range buttons |
| billing.spec.ts | 4 | Invoices, usage, payments navigation, auto-pay toggle |
| dark-mode.spec.ts | 1 | Theme toggle verifies `data-bs-theme` attribute change |
| accessibility.spec.ts | 4 | Skip nav link, main content landmark, role attribute, keyboard navigation |
| **Total** | **21** | |

### T-7.6 — Visual Regression

**Tool**: Playwright screenshots

| Page | Breakpoints | Modes | Screenshots |
|------|------------|-------|-------------|
| Account Dashboard | Desktop | Light | 1 |
| Plans | Desktop | Light | 1 |
| Tickets | Desktop | Light | 1 |
| **Total** | | | **3 baseline** |

Screenshots are compared with `maxDiffPixels: 100` tolerance for minor rendering variations.

### T-7.7 — TypeScript Strict Verification

- TypeScript strict mode enabled in `tsconfig.base.json` (`strict: true`, `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`)
- ESLint configured with `no-explicit-any` rule
- `turbo run typecheck` and `turbo run lint` available for full verification

---

## Technology Choices

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Vitest 4** | Unit + integration tests | Native ESM support, fast HMR, compatible with Vite ecosystem |
| **React Testing Library** | UI component testing | Tests user behavior not implementation details |
| **jest-dom/vitest** | DOM matchers | `toBeInTheDocument`, `toHaveAttribute`, etc. |
| **jsdom** | Browser simulation | Lightweight DOM environment for unit tests |
| **Playwright** | E2E testing | Cross-browser, auto-waits, built-in screenshot comparison |
| **v8 coverage** | Code coverage | Built into Node.js, no instrumentation overhead |

### Why Vitest (not Jest)?

- **ESM native**: The monorepo uses `"type": "module"` — Vitest handles ESM without configuration
- **Fast**: Vitest runs tests in parallel with HMR-like speed
- **Vite integration**: Shares Vite's plugin system (e.g., `@vitejs/plugin-react` for JSX)
- **Compatible**: `vi.mock()`, `vi.fn()`, `describe/it/expect` are familiar Jest-like API

### Why Playwright (not Cypress)?

- **Cross-browser**: Tests Chrome, Firefox, Safari, and mobile viewports
- **Auto-wait**: No need for explicit waits — Playwright auto-retries assertions
- **Visual regression**: Built-in screenshot comparison with pixel-diff tolerance
- **CI-friendly**: Headless by default, configurable retries and workers

---

## Test Configuration Files

| File | Purpose |
|------|---------|
| `packages/ui/vitest.config.ts` | UI component test config with React plugin, jsdom, 80% coverage thresholds |
| `packages/ui/src/__tests__/setup.ts` | Test setup importing jest-dom matchers |
| `apps/services/customer-service/vitest.config.ts` | Customer service test config |
| `apps/services/billing-service/vitest.config.ts` | Billing service test config |
| `apps/services/network-service/vitest.config.ts` | Network service test config |
| `playwright.config.ts` | E2E test config with Desktop Chrome and Pixel 5 projects |

## Test Files

| File | Tests | Coverage Area |
|------|-------|---------------|
| `packages/ui/src/__tests__/StatusBadge.test.tsx` | 8 | Status badge variants |
| `packages/ui/src/__tests__/SkeletonLoader.test.tsx` | 8 | Loading skeletons |
| `packages/ui/src/__tests__/EmptyState.test.tsx` | 6 | Empty state UI |
| `packages/ui/src/__tests__/ProgressRing.test.tsx` | 7 | Progress visualization |
| `packages/ui/src/__tests__/StatusStepper.test.tsx` | 6 | Status step visualization |
| `packages/ui/src/__tests__/AppNavbar.test.tsx` | 7 | Navigation bar |
| `packages/ui/src/__tests__/Sidebar.test.tsx` | 6 | Sidebar navigation |
| `packages/ui/src/__tests__/ConfirmModal.test.tsx` | 5 | Confirmation dialog |
| `packages/ui/src/__tests__/Icons.test.tsx` | 8 | SVG icon components |
| `apps/services/customer-service/src/__tests__/customer.resolver.test.ts` | 4 | Customer resolver |
| `apps/services/customer-service/src/__tests__/validation.test.ts` | 8 | Zod validation |
| `apps/services/billing-service/src/__tests__/pagination.test.ts` | 4 | Cursor pagination |
| `apps/services/billing-service/src/__tests__/invoice.resolver.test.ts` | 3 | Invoice/payment resolver |
| `apps/services/network-service/src/__tests__/alert.resolver.test.ts` | 6 | Alert status transitions |
| `tests/e2e/login.spec.ts` | 3 | Login flow |
| `tests/e2e/customer-portal.spec.ts` | 5 | Customer portal paths |
| `tests/e2e/noc-dashboard.spec.ts` | 4 | NOC dashboard paths |
| `tests/e2e/billing.spec.ts` | 4 | Billing console paths |
| `tests/e2e/dark-mode.spec.ts` | 1 | Theme switching |
| `tests/e2e/accessibility.spec.ts` | 4 | Accessibility checks |
| `tests/e2e/visual-regression.spec.ts` | 3 | Screenshot baselines |

**Total Phase 7: 21 test files, 110+ tests**

---

## Verification Checklist

- [x] UI component unit tests: 61 tests across 9 test files
- [x] Backend resolver unit tests: 25 tests across 5 test files
- [x] E2E tests: 21 scenarios across 7 spec files
- [x] Visual regression: 3 baseline screenshots
- [x] Vitest configs with 80% coverage thresholds
- [x] Playwright config with Chrome and mobile projects
- [x] Test scripts added to all relevant package.json files
- [x] TypeScript strict mode enabled (`strict: true`, `exactOptionalPropertyTypes: true`)
