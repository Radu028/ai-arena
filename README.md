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
- QR code sharing for live sessions
- admin session creation, start, stop, and early vote close
- email-based admin allowlist with `radupopa028@gmail.com` as bootstrap admin
- Host / MC agent artifacts
- Critic agent analysis
- Stats Analyst agent summaries after finalized rounds
- realtime public session view via Convex subscriptions
- anonymous response cards and reveal after scoring
- human voting plus AI model judging
- spectator-first voting: viewers only choose a username when they vote
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
- `convex/orchestration.ts` provider calls, Host, Critic, Stats Analyst, AI
  judging

### Fast navigation for maintainers and LLM agents

- `shared/arena.ts` is the source of truth for model roster, pricing,
  statuses, round constants, and theme copy.
- `shared/validation.ts` validates client-facing form payloads before Convex
  mutations run.
- `convex/lib.ts` centralizes auth/admin checks, session ownership, and model
  snapshot validation.
- `convex/state.ts` owns internal lifecycle transitions. Prefer adding state
  changes there instead of scattering patches across public mutations.
- `src/components/arena/` contains the public session/join UI. Route files
  should stay thin and delegate page sections into components.
- `src/components/ui/` contains reusable app primitives such as `StatusPill`.

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
- deterministic Host, Critic, and Stats Analyst quality evals with word and
  sentence ranges, topic coverage, model coverage, numeric fidelity, formatting
  checks, and explicit pass scores
- optional live provider evals with an LLM-as-judge scoring relevance, clarity,
  tone, and usefulness from 1 to 5
- React Doctor verification for changed React code

Run the full verification set with:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run only the deterministic agent evals with `pnpm test:agents`. To evaluate
fresh outputs from the real Host, Critic, and Stats Analyst models, provide
`OPENAI_API_KEY` and `GOOGLE_AI_API_KEY`, then run
`pnpm test:agents:live`. Live evals are opt-in because they use paid APIs.

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
- `generating`
- `voting`
- `scored`
- `aborted`

The admin starts each round explicitly, closes voting when the room is ready,
and reveals model identities manually after scoring.

### Scoring

- one human vote = one ballot
- one eligible AI judge vote = one ballot
- ties are explicit, not broken arbitrarily

## Deployment

Recommended production split:

- frontend/app shell: Vercel, built with `pnpm build`
- backend/realtime: Convex Cloud
- auth: Clerk

Production frontend:

- https://ai-arena-seven.vercel.app

Production backend:

- https://modest-wren-126.convex.cloud

GitHub Actions runs type-check, lint, tests, and build on every PR. Vercel is
connected to the GitHub repository and can publish the frontend from `main`.
Convex functions are published separately with `pnpm exec convex deploy` when a
production deploy key is available.

## Docs

- [`docs/MDS_CHECKLIST.md`](docs/MDS_CHECKLIST.md) — final grading checklist
  with repository evidence for each MDS requirement
- [`docs/DEMO_RUNBOOK.md`](docs/DEMO_RUNBOOK.md) — live demo and offline
  recording script with low-cost provider guardrails
- [`docs/SECRETS_AND_DEPLOYMENT.md`](docs/SECRETS_AND_DEPLOYMENT.md) — safe
  production secret setup and deployment checklist
- [`docs/STACK_AUDIT.md`](docs/STACK_AUDIT.md) — official-doc audit for Convex,
  Clerk, TanStack Start/Router, Tailwind, and deployment wiring
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — component, data model,
  session/round lifecycles, sequence and agent workflow diagrams
- [`docs/UML_DIAGRAMS.md`](docs/UML_DIAGRAMS.md) — dedicated GitHub-rendered UML
  diagrams for use case, class/domain model, activity, state, sequence, and
  deployment views
- [`docs/AI_TOOLS_REPORT.md`](docs/AI_TOOLS_REPORT.md) — how AI tools were
  used across planning, architecture, implementation, testing, and reflection

## Official references used

- TanStack Start: https://tanstack.com/start/latest/docs/framework/react/
- Convex: https://docs.convex.dev/
- Clerk TanStack Start: https://clerk.com/docs/tanstack-react-start/overview
- shadcn/ui: https://ui.shadcn.com/docs/installation/tanstack
- Tailwind CSS v4: https://tailwindcss.com/docs/installation/using-vite
- Vite: https://vite.dev/guide/
