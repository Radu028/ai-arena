# AI Arena — Architecture

This document describes the system structure, the core data model, and the
runtime flows of AI Arena. The diagrams use Mermaid, which renders natively on
GitHub.

## 1. Component architecture

```mermaid
flowchart LR
  subgraph Client["Browser (TanStack Start + React)"]
    Home[/"/"/]
    Join[/"/join"/]
    Session[/"/sessions/$slug"/]
    Admin[/"/admin"/]
    AdminNew[/"/admin/sessions/new"/]
    AdminCtrl[/"/admin/sessions/$sessionId"/]
    Leaderboard[/"/leaderboard"/]
    History[/"/history"/]
  end

  subgraph Edge["Cloudflare Pages / Nitro"]
    SSR[[TanStack Start SSR]]
  end

  subgraph Convex["Convex Cloud"]
    direction TB
    QM[Queries + Mutations<br/>sessions · rounds · votes · stats]
    IntMut[Internal Mutations<br/>state.ts]
    IntAct[Internal Actions<br/>orchestration.ts · use node]
    DB[(Tables<br/>sessions · participants · rounds<br/>responses · votes · aiVotes · artifacts · events)]
    Scheduler{{ctx.scheduler}}
  end

  subgraph Auth["Clerk"]
    ClerkIssuer[JWT issuer]
  end

  subgraph Providers["Model Providers"]
    OpenAI((OpenAI))
    Anthropic((Anthropic))
    Google((Google Gemini))
  end

  Client --> SSR
  SSR --> Convex
  Client <---> Convex
  Client -.->|admin auth| ClerkIssuer
  ClerkIssuer -.->|JWT| Convex
  Convex --- DB
  QM --> DB
  IntMut --> DB
  IntMut --> Scheduler
  Scheduler --> IntAct
  IntAct --> IntMut
  IntAct --> OpenAI
  IntAct --> Anthropic
  IntAct --> Google
```

### Layers

- **Frontend** — TanStack Router file-based routes in `src/routes/*`. Live
  session data is subscribed via `convex/react` for realtime updates.
- **SSR host** — Nitro with a provider preset selected through
  `NITRO_PRESET`; CI builds Cloudflare Pages with `cloudflare_pages`, while
  local/default builds keep the Vercel preset unless overridden.
- **Backend** — Convex functions split into **public** (`query` + `mutation`)
  and **internal** state machine / orchestration pieces.
- **Auth** — Clerk provides JWT identity for admin users. Guests authenticate
  against the session with a signed access token stored in localStorage.
- **Model providers** — Five SDKs called from the Node runtime action in
  `convex/orchestration.ts`, each with a fixed timeout and error fallback.

## 2. Entity-Relationship

```mermaid
erDiagram
  SESSIONS ||--o{ PARTICIPANTS : has
  SESSIONS ||--o{ ROUNDS : has
  ROUNDS ||--o{ RESPONSES : has
  RESPONSES ||--o{ HUMAN_VOTES : receives
  RESPONSES ||--o{ AI_VOTES : receives
  PARTICIPANTS ||--o{ HUMAN_VOTES : casts
  ROUNDS ||--o{ ARTIFACTS : "host/critic"
  SESSIONS ||--o{ EVENTS : logs

  SESSIONS {
    string slug PK
    string joinCode UK
    string title
    string theme "comedy · debate · eli5 · freeform"
    string status "waiting · active · stopped · ended"
    number roundCount
    number currentRoundNumber
    string createdByIdentity "clerk tokenIdentifier"
    array selectedModelsSnapshot
    number startedAt
    number endedAt
  }
  PARTICIPANTS {
    id sessionId FK
    string kind "guest · admin"
    string displayName
    string accessTokenHash
    number joinedAt
  }
  ROUNDS {
    id sessionId FK
    number roundNumber
    string status "pending · collecting_topic · generating · voting · scored · aborted"
    string topic
    number votingEndsAt
    string resultStatus "pending · winner · tie · aborted"
    array winnerResponseIds
  }
  RESPONSES {
    id sessionId FK
    id roundId FK
    string providerKey
    string modelKey
    string modelLabel
    string anonymizedSlot "A, B, C..."
    string responseText
    string status
    number latencyMs
    number tokenUsageInput
    number tokenUsageOutput
  }
  HUMAN_VOTES {
    id roundId FK
    id participantId FK
    id responseId FK
  }
  AI_VOTES {
    id roundId FK
    string voterModelKey
    id responseId FK
    string rationale
  }
  ARTIFACTS {
    id roundId FK
    string type "host_intro · host_transition · critic_analysis · host_recap · stats_summary"
    string status "pending · success · fallback"
    string content
  }
  EVENTS {
    id sessionId FK
    id roundId FK
    string type
    string title
    string description
  }
```

The canonical definition lives in `convex/schema.ts`. Every table gets the
system-managed `_id` and `_creationTime`, but the schema also records
domain-specific `createdAt`, `startedAt`, and similar timestamps for clarity and
query ergonomics.

## 3. Session lifecycle

```mermaid
stateDiagram-v2
  [*] --> waiting: sessions.create
  waiting --> active: sessions.start
  active --> active: round closes / admin reveals and advances
  active --> ended: final round finalized
  active --> stopped: sessions.stop
  waiting --> stopped: sessions.stop
  stopped --> [*]
  ended --> [*]
```

## 4. Round lifecycle

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> generating: admin starts session or next round
  generating --> voting: model responses and AI ballots saved
  generating --> aborted: all providers failed
  voting --> scored: admin closes voting
  voting --> aborted: session stopped mid-round
  scored --> pending: admin starts next round
  scored --> [*]
  aborted --> [*]
```

## 5. Core round sequence

```mermaid
sequenceDiagram
  autonumber
  actor Admin
  actor Guest
  participant UI as Frontend<br/>/sessions/$slug
  participant Convex as Convex Query/Mutation
  participant Scheduler as ctx.scheduler
  participant Orchestrate as orchestration.ts (action)
  participant Providers as model APIs

  Admin->>Convex: sessions.start or rounds.startNextRound
  Convex->>Convex: lock admin prompt + insert pending responses
  Convex->>Scheduler: runAfter(0, internal.orchestration.generateRound)
  Scheduler->>Orchestrate: generateRound(sessionId, roundId)
  Orchestrate->>Providers: Host intro (OpenAI)
  par Parallel model calls
    Orchestrate->>Providers: OpenAI
    Orchestrate->>Providers: Anthropic
    Orchestrate->>Providers: Google
  end
  Providers-->>Orchestrate: text + token usage (or timeout)
  Orchestrate->>Convex: saveModelResponse (per provider)
  Orchestrate->>Orchestrate: AI judging loop (no self-voting)
  Orchestrate->>Convex: save AI ballots, then openVoting
  Note over UI,Convex: Convex subscriptions push live updates
  Guest->>UI: vote
  UI->>Convex: votes.castHumanVote
  Admin->>Convex: rounds.endVotingEarly
  Convex->>Convex: tally votes, set winner(s)
  Convex->>Scheduler: runAfter(0, afterRoundFinalized)
  Scheduler->>Orchestrate: afterRoundFinalized
  Orchestrate->>Providers: Critic analysis + Stats summary + Host transition/recap
  Orchestrate->>Convex: saveArtifact (critic + stats + host)
```

## 6. Agent workflow

```mermaid
flowchart TD
  Start([Round topic locked]) --> Host[Host intro prompt<br/>theme tone + topic + models]
  Host --> Models[Parallel model calls<br/>per provider · 65s timeout]
  Models --> Judge{Eligible responses?}
  Judge -- none --> Abort([Round aborted])
  Judge -- some --> AIJudge[AI judge loop<br/>each model votes on others]
  AIJudge --> OpenVote[Open voting after AI ballots settle]
  OpenVote --> Humans[Humans vote in UI]
  Humans --> Finalize[Admin closes round<br/>human + AI ballots counted equally]
  Finalize --> Critic[Critic explains outcome<br/>theme-aware prompt]
  Critic --> Stats[Stats Analyst summarizes<br/>votes · winner · reliability]
  Stats --> Next{Last round?}
  Next -- no --> Transition[Host transition prepared]
  Transition --> Wait[Wait for admin to start next round]
  Wait --> Start
  Next -- yes --> Recap[Host recap of full scoreboard]
  Recap --> End([Session ended])
```

Prompt strings live alongside the orchestration action (`buildHostPrompt`,
`buildCriticPrompt`, `buildStatsPrompt`, `buildJudgePrompt`, `buildRoundPrompt`
in `convex/orchestration.ts`).

## 7. Scoring rules

- Each human vote counts as **one ballot**.
- Each eligible AI judge (a model that did not author the response) casts **one
  ballot** per round.
- Ties are recorded explicitly as `resultStatus: 'tie'` and multiple winner IDs
  are kept in `rounds.winnerResponseIds`.
- Failures are not silently dropped: a model that errors out simply receives no
  vote but the round still runs for the remaining responses.

## 8. Public vs admin surfaces

```mermaid
flowchart LR
  subgraph Public
    direction TB
    Home[/"/"/]
    Join[/"/join"/]
    Session[/"/sessions/$slug"/]
    Leaderboard[/"/leaderboard"/]
    History[/"/history"/]
  end
  subgraph AdminOnly
    direction TB
    AdminList[/"/admin"/]
    AdminNew[/"/admin/sessions/new"/]
    AdminCtrl[/"/admin/sessions/$sessionId"/]
  end
  AdminGuard{AdminGuard component<br/>checks Clerk useAuth}
  AdminOnly --> AdminGuard
```

Admin APIs (`sessions.create`, `sessions.start`, `sessions.stop`,
`rounds.endVotingEarly`, `stats.getAdminCostSummary`) always re-derive the
identity via `ctx.auth.getUserIdentity()` — no `userId` is ever accepted as an
argument.

## 9. Deployment topology

- **Frontend / SSR** — built with `pnpm build` → Nitro `vercel` preset → Vercel
  Edge + Serverless functions.
- **Backend / realtime** — Convex Cloud. Function code in `convex/*` is pushed
  with `convex dev` (development) or `convex deploy --cmd "pnpm build"` (CI).
- **Auth** — Clerk issues JWTs; Convex validates them via
  `convex/auth.config.ts`.

## 10. Testing surface

- `shared/validation.test.ts` — zod schemas, pricing helpers, theme copy
- `convex/sessions.test.ts` — create + start + topic locking
- `convex/voting.test.ts` — topic validation, state machine, stats queries

Run everything with:

```bash
pnpm check  # format + lint + typecheck + test
pnpm build
```
