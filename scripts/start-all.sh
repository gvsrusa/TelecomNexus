#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# TelecomNexus — One-command demo startup
# ═══════════════════════════════════════════════════════════════

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[TelecomNexus]${NC} $*"; }
warn() { echo -e "${YELLOW}[TelecomNexus]${NC} $*"; }
info() { echo -e "${CYAN}[TelecomNexus]${NC} $*"; }

cleanup() {
  log "Shutting down services..."
  kill $(jobs -p) 2>/dev/null || true
  wait 2>/dev/null || true
  log "All services stopped."
}
trap cleanup EXIT

# ── Step 1: Start databases ────────────────────────────────────
log "Starting databases via Docker Compose..."
docker compose -f docker/docker-compose.yml up -d

# ── Step 2: Wait for databases ─────────────────────────────────
log "Waiting for MongoDB..."
until docker exec telecom-nexus-mongo mongosh --eval "db.runCommand('ping')" &>/dev/null; do
  sleep 2
done
log "MongoDB is ready."

log "Waiting for Cassandra (this may take 60-90 seconds)..."
until docker exec telecom-nexus-cassandra cqlsh -e "DESCRIBE KEYSPACES" &>/dev/null; do
  sleep 5
done
log "Cassandra is ready."

# ── Step 3: Install dependencies ───────────────────────────────
if [ ! -d "node_modules" ]; then
  log "Installing dependencies..."
  npm install
fi

# ── Step 4: Build shared packages ──────────────────────────────
log "Building shared packages..."
npx turbo run build --filter='./packages/*'

# ── Step 5: Seed databases ─────────────────────────────────────
log "Seeding databases with demo data..."
npx turbo run seed

# ── Step 6: Start backend services ─────────────────────────────
log "Starting Customer Service (port 4001)..."
(cd apps/services/customer-service && npx tsx src/index.ts) &
sleep 2

log "Starting Network Service (port 4002)..."
(cd apps/services/network-service && npx tsx src/index.ts) &
sleep 2

log "Starting Billing Service (port 4003)..."
(cd apps/services/billing-service && npx tsx src/index.ts) &
sleep 2

log "Starting Apollo Gateway (port 4000)..."
(cd apps/gateway && npx tsx src/index.ts) &
sleep 3

# ── Step 7: Start frontend ────────────────────────────────────
log "Starting Shell app (port 3000)..."
(cd apps/shell && npx next dev -p 3000) &
sleep 5

# ── Done ───────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  TelecomNexus is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
info "  Shell App:        http://localhost:3000"
info "  Customer Portal:  http://localhost:3001  (run separately)"
info "  NOC Dashboard:    http://localhost:3002  (run separately)"
info "  Billing Console:  http://localhost:3003  (run separately)"
echo ""
info "  Apollo Gateway:   http://localhost:4000/graphql"
info "  GraphQL Sandbox:  http://localhost:4000/graphql"
echo ""
info "  Demo customers:   CUST-0001 through CUST-0005"
echo ""
log "Press Ctrl+C to stop all services."
echo ""

# Keep the script running
wait
