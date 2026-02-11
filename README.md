# TelecomNexus

Unified Telecom Customer & Network Operations Platform — a full-stack demo showcasing micro frontends, GraphQL federation, and polyglot persistence (MongoDB + Cassandra).

## Prerequisites

- **Node.js** 22.x LTS (`nvm use` or check `.nvmrc`)
- **Docker Desktop** for MongoDB and Cassandra
- **npm** 10.x

## Quick Start

```bash
# Install dependencies
npm install

# Start databases
docker compose -f docker/docker-compose.yml up -d

# Build all workspaces
npx turbo run build

# Run development (shell + gateway + services)
npx turbo run dev
```

## Project Structure

```
telecom-nexus/
├── apps/
│   ├── shell/              # Host app (port 3000)
│   ├── customer-portal/     # MFE 1 (port 3001)
│   ├── noc-dashboard/      # MFE 2 (port 3002)
│   ├── billing-console/    # MFE 3 (port 3003)
│   ├── gateway/            # Apollo Gateway (port 4000)
│   └── services/
│       ├── customer-service/  # Port 4001
│       ├── network-service/  # Port 4002
│       └── billing-service/   # Port 4003
├── packages/
│   ├── ui/                 # Shared components
│   ├── graphql-schema/      # Schema & codegen
│   ├── config/             # ESLint, Prettier, TS configs
│   ├── xml-utils/          # XML utilities
│   └── types/              # Domain types
├── docker/                 # Database containers
└── scripts/                # Seed scripts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build all workspaces |
| `npm run dev` | Run development servers |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | Type-check all workspaces |
| `npm run test` | Run unit tests |
| `npm run seed` | Seed MongoDB and Cassandra |
| `npm run codegen` | Generate GraphQL types |

## License

See [LICENSE](./LICENSE).
