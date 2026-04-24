# AI Arena

[![CI](https://github.com/Radu028/ai-arena/actions/workflows/ci.yml/badge.svg)](https://github.com/Radu028/ai-arena/actions/workflows/ci.yml)

AI Arena is a live battle platform for major AI models, built with:

- TanStack Start
- TanStack Router file-based routing
- Convex for backend, realtime state, orchestration, and history
- Clerk for admin authentication
- shadcn/ui on Tailwind CSS v4
- Vite
- `@chenglou/pretext` for measured editorial text blocks

The current base includes:

- public guest join by share link or join code
- admin session creation, start, stop, and early vote close
- Host / MC agent artifacts
- Critic agent analysis
- realtime public session view via Convex subscriptions
- anonymous response cards and reveal after scoring
- human voting plus AI model judging
- session history, scoreboard, and event log

## Product structure

### Public flow

- `/` landing page
- `/join` join by code
- `/sessions/$slug` public lobby and live round page
- `/leaderboard` all-time model standings across every session
- `/history` browsable archive of finished sessions

### Admin flow

- `/admin` session list + cost tracking dashboard
- `/admin/sessions/new` create session
- `/admin/sessions/$sessionId` admin controls

### Backend

- `convex/sessions.ts` public/admin session API
- `convex/rounds.ts` topic lock and round controls
- `convex/votes.ts` human voting
- `convex/state.ts` internal state transitions
- `convex/orchestration.ts` provider calls, Host, Critic, AI judging

## Local setup

### 1. Install

```bash
pnpm install
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill the keys you have.

Important notes:

- `VITE_CONVEX_URL` must point at your Convex deployment.
- `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_JWT_ISSUER_DOMAIN` are required for real admin auth.
- If you do not have provider API keys yet, set `AI_ARENA_DEMO_MODE=true` to keep the arena usable without external model calls.

### 3. Convex

Run the Convex dev workflow when you need codegen and function deploys:

```bash
pnpm convex:dev
```

This repo already includes the official local Convex AI guidance files:

- `AGENTS.md`
- `CLAUDE.md`
- `convex/_generated/ai/guidelines.md`

When touching Convex code, read `convex/_generated/ai/guidelines.md` first.

### 4. Start the app

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm convex:dev
pnpm build
pnpm build:cloudflare
pnpm preview
pnpm typecheck
pnpm lint
pnpm test
pnpm format
pnpm check
```

## Testing

The repo includes:

- shared schema and validation unit tests
- Convex function tests with `convex-test`
- deterministic Host and Critic agent evals
- React Doctor verification for changed React code

Run the full verification set with:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Clerk note

To unblock local Convex codegen, the dev deployment currently has a placeholder
`CLERK_JWT_ISSUER_DOMAIN` set. Replace it in Convex and in your local env with
your real Clerk issuer before relying on admin auth.

## Architecture notes

### Session lifecycle

- `waiting`
- `active`
- `stopped` or `ended`

### Round lifecycle

- `pending`
- `collecting_topic`
- `generating`
- `voting`
- `scored`

### Scoring

- one human vote = one ballot
- one eligible AI judge vote = one ballot
- ties are explicit, not broken arbitrarily

## Deployment

Recommended production split:

- frontend/app shell: Cloudflare Pages, built with `pnpm build:cloudflare`
- backend/realtime: Convex Cloud
- auth: Clerk

GitHub Actions runs type-check, lint, tests, and build on every PR. On `main`,
the deploy job publishes Convex functions when `CONVEX_DEPLOY_KEY` is present
and uploads Cloudflare Pages when `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_PROJECT_NAME` are configured.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — component, data model,
  session/round lifecycles, sequence and agent workflow diagrams
- [`docs/AI_TOOLS_REPORT.md`](docs/AI_TOOLS_REPORT.md) — how AI tools were
  used across planning, architecture, implementation, testing, and reflection

## Official references used

- TanStack Start: https://tanstack.com/start/latest/docs/framework/react/
- Convex: https://docs.convex.dev/
- Clerk TanStack Start: https://clerk.com/docs/tanstack-react-start/overview
- shadcn/ui: https://ui.shadcn.com/docs/installation/tanstack
- Tailwind CSS v4: https://tailwindcss.com/docs/installation/using-vite
- Vite: https://vite.dev/guide/
