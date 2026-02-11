# Phase 4 — Seed Data & Demo Data Generation

## Overview

Phase 4 populates both databases with realistic telecom data for the demo. MongoDB receives structured business data (customers, plans, tickets, invoices, payments, devices) while Cassandra receives high-volume time-series data (telemetry, CDRs, usage, alerts). A live telemetry generator provides real-time data during demos.

---

## Data Architecture

| Database | Table/Collection | Rows | Purpose |
|----------|-----------------|------|---------|
| **MongoDB** | plans | 8 | Service plan catalog (4 tiers × 2 plans) |
| | customers | 50 | Customer profiles with diverse statuses |
| | tickets | 200 | Support tickets with message threads |
| | invoices | 300 | 6 months of billing history per customer |
| | payments | 250 | Payment records linked to invoices |
| | devices | 30 | Network devices in topology graph |
| **Cassandra** | device_telemetry | ~259K | 30 days × 30 devices × 288 readings/day |
| | cdr_by_customer | ~10K | 3 months × 50 customers × ~66 calls |
| | usage_by_day | ~4,500 | 3 months × 50 customers × 30 days |
| | alerts_by_device | 500 | 3 months of device alerts |

---

## Stories Completed

### S-4.1 — MongoDB Seed Script

**Data generation details:**
- **Plans**: 8 real-world plans from $29.99 (Basic Talk) to $199.99 (Enterprise Ultra) with differentiated features
- **Customers**: 50 with realistic names, US addresses from 15 cities, diverse account statuses (80% Active, 10% Suspended, 6% Pending, 4% Closed)
- **Tickets**: 200 tickets with 2-5 message threads each, distributed by category (40% Network, 25% Billing, 20% Device, 10% Plan, 5% Other)
- **Invoices**: 6 months per customer with line items (base plan + add-ons + tax), mix of Paid/Due/Overdue statuses
- **Payments**: Linked to paid invoices with mixed methods (50% card, 30% bank, 20% wallet)
- **Devices**: 30 devices in connected network topology with XML configs

**Why this data distribution:**
- **Account statuses**: 80% Active mirrors real telcos where most accounts are in good standing
- **Ticket categories**: 40% Network reflects that connectivity issues dominate support
- **Plan tiers**: 2 plans per tier provides plan comparison functionality
- **Idempotent**: Script drops and recreates — safe to run repeatedly

### S-4.2 — Cassandra Seed Script

**Telemetry data patterns:**
- **CPU**: Follows daily cycle — peaks during business hours (8am-6pm), lower at night
- **Memory**: Gradual increase over time (simulates memory pressure), 40-70% range
- **Bandwidth**: Spikes during peak usage hours, 100-900 Mbps range
- **Packet loss**: Normally <0.1%, occasional spikes to 5% for degraded devices
- **Temperature**: Correlated with CPU usage (25-45°C)

**Why realistic patterns matter:**
- Demo telemetry charts show believable daily cycles, not random noise
- Degraded devices visibly differ from healthy ones on dashboards
- Business-hour patterns demonstrate the monitoring system's value

### S-4.3 — Live Telemetry Generator

**Design:**
- Plain JavaScript (`generate-telemetry.js`) — intentionally not TypeScript for easy demo startup
- Writes one reading per device (30 writes) every 10 seconds
- Generates alerts approximately every 2 minutes (every 12th batch)
- Graceful shutdown on SIGINT (Ctrl+C)
- Batch inserts for Cassandra performance

**Why JavaScript (not TypeScript):**
- No build step needed — `node scripts/generate-telemetry.js` works immediately
- Demo simplicity — presenter doesn't need to compile before running
- Single-file simplicity for a long-lived process

### S-4.4 — Seed Pipeline Integration

**Orchestrator (`seed.ts`):**
1. Runs MongoDB seed first (plans must exist before customers reference them)
2. Runs Cassandra seed second (devices must exist in MongoDB for telemetry context)
3. Uses `tsx` for TypeScript execution without pre-compilation

---

## Technology Choices

| Technology | Purpose | Why |
|-----------|---------|-----|
| Mongoose (scripts) | MongoDB seeding | Direct model creation with validation |
| cassandra-driver | Cassandra seeding | Batch inserts for 500K+ rows performance |
| tsx | TypeScript execution | Run .ts scripts directly without compilation |
| Batch inserts | Performance | Cassandra batch inserts are 10-50x faster than individual inserts |
| Deterministic IDs | `CUST-0001`, `TKT-00001` | Predictable IDs enable stable demo scenarios |
| Date-based patterns | Telemetry realism | CPU/bandwidth follow believable daily cycles |

---

## Device Network Topology

```
Towers (10) ──→ Switches (7) ──→ Routers (8) ──→ Base Stations (3)
                                            └──→ Fiber Nodes (2)
```

- **Towers** connect to switches (aggregation layer)
- **Switches** connect to routers (core layer)
- **Routers** connect to base stations and fiber nodes (edge layer)
- Each device has 1-3 connections forming a realistic network graph

---

## Files Created

| File | Purpose |
|------|---------|
| `scripts/data/plans.ts` | 8 plan definitions with feature differentiation |
| `scripts/data/names.ts` | Customer name/address generators (50 first, 50 last, 15 cities) |
| `scripts/data/device-graph.ts` | Device topology with XML config generation |
| `scripts/data/telemetry-patterns.ts` | Realistic CPU/memory/bandwidth/temp patterns |
| `scripts/data/cdr-generator.ts` | Call detail record generation |
| `scripts/data/alert-templates.ts` | 15 alert templates across severities |
| `scripts/seed-mongo.ts` | MongoDB seed (6 collections) |
| `scripts/seed-cassandra.ts` | Cassandra seed (4 tables, ~274K rows) |
| `scripts/seed.ts` | Orchestrator running both seeds |
| `scripts/generate-telemetry.js` | Live demo telemetry generator |
| `scripts/tsconfig.json` | TypeScript config for scripts |

**Total Phase 4 files:** 11 files

---

## Verification Checklist

- [x] MongoDB seed creates 8 plans, 50 customers, 200 tickets, 300 invoices, 250 payments, 30 devices
- [x] Cassandra seed creates ~259K telemetry, ~10K CDRs, ~4,500 usage, 500 alerts
- [x] Device topology forms realistic network graph with connections
- [x] Telemetry data shows daily patterns (not random noise)
- [x] CDR timestamps favor business hours
- [x] Live telemetry generator produces data every 10 seconds
- [x] Seed pipeline is idempotent (safe to run repeatedly)
