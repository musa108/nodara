# Nodara

**Programmable On-Chain Automation.**

Nodara is a no-code automation platform for blockchain wallets. You define a
workflow — a trigger, a condition, and an action — and Nodara watches the
chain for you. The moment the trigger fires and the condition holds,
**KeeperHub simulates, gas-estimates, submits, and confirms the transaction**.
Every step is persisted and auditable. Think Zapier for Web3, or GitHub
Actions for your wallet.

AI is not part of this product. **Reliable execution is the product.**

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Deployment guide](#deployment-guide)
- [Testing](#testing)
- [Hackathon demo guide](#hackathon-demo-guide)
- [Future roadmap](#future-roadmap)

---

## Architecture

```
nodara/
├── apps/
│   ├── frontend/     Next.js 15 dashboard — workflow builder, executions, audit logs, analytics
│   └── backend/      Express API + background workers (monitoring, execution tracking)
├── packages/
│   ├── shared/       Zod schemas + types — the Trigger/Condition/Action contract, shared by both apps
│   ├── types/         Branded primitives (EvmAddress, TxHash) — zero-dependency
│   ├── utils/          Idempotency keys, decimal formatting — split browser-safe/node-only via subpath exports
│   ├── blockchain/    Read-only viem client — balances, allowances, event scanning. Never signs a tx.
│   └── keeperhub/     Typed HTTP client for the KeeperHub execution API. The only module allowed to submit a tx.
├── .github/workflows/ci.yml   Typecheck + test on every push
├── docker-compose.yml         Local Postgres for development
└── package.json                npm workspaces root
```

### Backend layers

```
apps/backend/src/
├── controllers/   Thin HTTP layer — parse request, call one service, shape response
├── services/       Business logic — the workflow engine's orchestration, KeeperHub business rules, execution state machine
├── repositories/  The only layer allowed to import `prisma` directly
├── middleware/     auth (JWT), error handling, rate limiting
├── validators/     Zod schemas specific to an HTTP endpoint
├── routes/          Route wiring, mounted explicitly in app.ts
├── workers/         Background jobs — the monitoring sweep and execution tracker, both built on @nodara/monitor's Poller
├── monitor/         Concrete trigger + condition handlers (implement @nodara/monitor's plugin contracts)
├── keeperhub/       KeeperHub service (persistence + business rules) and action handlers (build unsigned txs)
└── database/        Prisma client singleton
```

### Why execution reliability is structural, not a convention

- `@nodara/blockchain` is **read-only by construction** — it never holds a private key.
- `@nodara/keeperhub`'s client is the **only module in the entire codebase** that makes a network call resulting in an on-chain state change.
- `apps/backend/src/keeperhub/keeperhub.service.ts` wraps that client and is the only backend service allowed to call it.
- Every execution gets a deterministic **idempotency key** (`@nodara/utils/idempotency`) derived from the workflow + trigger evidence, so the same firing can never submit twice — even if the monitoring sweep re-evaluates the same block range after a crash and restart.

### Workflow Engine extensibility

A Workflow is `Trigger + Condition + Action`, each a first-class Prisma
row validated against a Zod discriminated union in `@nodara/shared`. The
monitoring and execution engines never branch on type internally — they
resolve a handler from `HandlerRegistry` (`@nodara/monitor`) at runtime.
**Adding a new trigger or action**:

1. Add an enum literal (`packages/shared/src/enums.ts`)
2. Add a Zod schema variant (`trigger.ts` or `action.ts`)
3. Write a handler implementing `TriggerHandler`/`ActionHandler`
4. Register it in `apps/backend/src/monitor/registerHandlers.ts`

The sweep loop, the execution pipeline, and the API never change.

### Execution pipeline

```
Workflow Triggered
      │
      ▼
   Validate
      │
      ▼
Generate Transaction  (action handler builds unsigned tx)
      │
      ▼
KeeperHub Simulation  ──fail──▶ SIMULATION_FAILED (not retried)
      │ success
      ▼
 Gas Estimation
      │
      ▼
Submit Transaction  (idempotency key attached)
      │
      ▼
  Track Confirmation  (execution-tracker worker polls every 15s)
      │
      ▼
  Persist Result
      │
      ▼
 Create Audit Log
      │
      ▼
  Notify User
```

### Monitoring engine

A `Poller` (from `@nodara/monitor`) sweeps every `MONITOR_INTERVAL_MS`
(default 30s): loads enabled, non-manual workflows, groups them by
wallet, and for each wallet evaluates every workflow's trigger against
the block range since the wallet's last scan. Errors are isolated per
workflow and per wallet — one bad RPC response never stops the rest of
the sweep. `MANUAL` workflows are filtered out of the sweep entirely and
fire only via `POST /api/executions/workflows/:id/trigger`.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, React Query, RainbowKit, Wagmi, Zustand, Zod |
| Backend | Node.js, Express, TypeScript, controller/service/repository architecture |
| Database | PostgreSQL (Neon in production), Prisma ORM |
| Blockchain reads | viem |
| Execution layer | KeeperHub |
| Testing | Vitest |
| Deployment | Frontend → Vercel · Backend → Railway · Database → Neon |

---

## Getting started

### Prerequisites
- Node.js ≥ 20, npm ≥ 10
- Docker (optional, for local Postgres) — or a Neon connection string
- A KeeperHub API key
- A [WalletConnect Cloud](https://cloud.walletconnect.com) project ID (free)

### 1. Install
```bash
npm install
```

### 2. Local database (optional)
```bash
docker compose up -d
```

### 3. Environment variables
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```
Fill in `DATABASE_URL`, `JWT_SECRET`, `KEEPERHUB_API_URL`, `KEEPERHUB_API_KEY`,
and at least one `RPC_URL_*` in `apps/backend/.env`, and
`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `apps/frontend/.env.local`.

### 4. Build shared packages
```bash
npm run build:packages
```

### 5. Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. Run
```bash
npm run dev:backend   # http://localhost:4000 — also starts the monitoring + execution-tracker workers
npm run dev:frontend  # http://localhost:3000
```

---

## Environment variables

### `apps/backend/.env`

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signs session JWTs issued after SIWE verification |
| `KEEPERHUB_API_URL` / `KEEPERHUB_API_KEY` | KeeperHub execution API credentials — required for any on-chain action |
| `RPC_URL_*` | Read-only RPC endpoints per chain, used only by the monitoring engine |
| `MONITOR_INTERVAL_MS` | Monitoring sweep interval (default 30s) |
| `MONITOR_ENABLED` | Set `false` to disable background workers (e.g. for a request-only replica) |
| `FRONTEND_ORIGIN` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | API rate limiting |

### `apps/frontend/.env.local`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Required by RainbowKit |

---

## API reference

All endpoints except `/health*` and `/api/auth/nonce`/`verify` require
`Authorization: Bearer <token>`. Responses use the envelope
`{ success: true, data }` or `{ success: false, error: { code, message } }`.

| Method | Path | Description |
|---|---|---|
| GET | `/health`, `/health/ready` | Liveness / readiness |
| GET | `/api/auth/nonce?address=` | Issue a SIWE nonce |
| POST | `/api/auth/verify` | Verify a signed SIWE message, returns a session token + wallet |
| GET | `/api/auth/me` | Current session |
| GET | `/api/wallets` | List the caller's wallets |
| PATCH | `/api/wallets/:id/cold-wallet` | Set a wallet's cold-storage destination |
| GET | `/api/workflows` | List workflows across the caller's wallets |
| POST | `/api/workflows` | Create a workflow (trigger + condition + action) |
| PATCH | `/api/workflows/:id` | Update a workflow |
| PATCH | `/api/workflows/:id/enabled` | Enable/pause a workflow |
| DELETE | `/api/workflows/:id` | Delete a workflow |
| GET | `/api/executions` | Paginated execution history |
| POST | `/api/executions/workflows/:workflowId/trigger` | Fire a MANUAL workflow immediately |
| GET | `/api/audit-logs` | Paginated, append-only system event log |
| GET | `/api/notifications` | Paginated in-app notifications |
| PATCH | `/api/notifications/:id/read` | Mark a notification read |
| GET | `/api/analytics/summary` | Dashboard metrics (totals, success/fail counts, 7-day timeline) |

---

## Deployment guide

### Database — Neon
Create a Neon Postgres project, copy the pooled connection string into
`DATABASE_URL`.

### Backend — Railway
`apps/backend/railway.json` is pre-configured: it builds from the
monorepo root, generates the Prisma client, runs `prisma migrate deploy`
on every deploy before starting the server, and health-checks `/health`.
Set the backend's environment variables (see above) in the Railway
project settings.

### Frontend — Vercel
`apps/frontend/vercel.json` builds the shared packages before building
the Next.js app. Set the frontend's environment variables in the Vercel
project settings, with `NEXT_PUBLIC_API_URL` pointing at the deployed
Railway backend.

### CI
`.github/workflows/ci.yml` installs, builds all packages, generates the
Prisma client, typechecks both apps, and runs the test suites on every
push and pull request against `main`.

---

## Testing

```bash
npm run test -w packages/utils      # idempotency key generation, amount formatting
npm run test -w packages/keeperhub  # retry/backoff logic
npm run test -w apps/backend        # trigger condition evaluators
```

---

## Hackathon demo guide

A five-minute walkthrough that shows execution reliability end-to-end:

1. **Connect & sign in** — connect a wallet on Sepolia/Base Sepolia, sign the SIWE message. Nodara creates the user + wallet on first sign-in.
2. **Create a MANUAL workflow** — Transfer Tokens, a small fixed amount, destination = your own address. Manual keeps the demo deterministic (no waiting on a real trigger).
3. **Hit "Run now"** — watch the Execution History page: `PENDING → SIMULATING → ESTIMATING_GAS → SUBMITTED → CONFIRMED`, all through KeeperHub, all visible within a few seconds.
4. **Open the Audit Log** — show `EXECUTION_STARTED` → `EXECUTION_SUCCEEDED`, timestamped, immutable.
5. **Create a WALLET_RECEIVES_FUNDS workflow** (condition: `> 0.01 ETH`, action: transfer excess to a cold wallet) and send a small amount from a second wallet — the monitoring sweep picks it up within `MONITOR_INTERVAL_MS` and fires automatically, no user action required.
6. **Show a deliberate failure** — a REVOKE_APPROVAL workflow against a token/spender pair with no existing approval will simulate-fail; show `SIMULATION_FAILED` in the execution detail and the corresponding audit entry, demonstrating that Nodara never broadcasts a transaction KeeperHub's simulation didn't first approve.

---

## Future roadmap

- Real quoter integration for `SWAP_TOKENS` (Uniswap QuoterV2 or an aggregator) so `amountOutMinimum` reflects live slippage tolerance instead of relying solely on simulation
- Native-asset (ETH) input support for swaps (WETH wrapping)
- Redis-backed nonce store and idempotency dedupe for multi-instance deployment
- Email / Telegram / Discord notifications alongside in-app toasts
- Per-workflow retry policy configuration (currently fixed at the KeeperHub client level)
- Workflow templates / duplication
- Multi-wallet workflows (one trigger, actions across several wallets)
