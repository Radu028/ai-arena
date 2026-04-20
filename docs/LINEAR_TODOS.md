# Linear Issues — AI Arena

Snapshot local al tuturor issue-urilor din proiectul **AI Arena** (team `AI Arena`, Linear workspace `radu-popa`).

- Generat: 2026-04-20
- Sursă: Linear MCP (`list_issues` + `get_issue`)
- Statusuri: `Done`, `In Progress`, `Backlog`, `Todo`, `Cancelled`

## Summary

| ID | Title | Status | Priority | Milestone | Labels |
| --- | --- | --- | --- | --- | --- |
| AIA-1 | Submit topic | Done | High | Prezentare intermediară | backend, frontend, Feature |
| AIA-2 | View responses side-by-side | Done | High | Prezentare intermediară | frontend, Feature |
| AIA-3 | Vote for the best response | Done | High | Prezentare intermediară | backend, frontend, Feature |
| AIA-4 | Real-time voting results | Done | High | Prezentare intermediară | real-time, frontend, Feature |
| AIA-5 | Model leaderboard | Done | Medium | Prezentare finală | backend, frontend, Feature |
| AIA-6 | Join session via link | Done | High | Prezentare intermediară | backend, frontend, Feature |
| AIA-7 | Create and configure session | Done | High | Prezentare intermediară | admin, backend, frontend, Feature |
| AIA-8 | Start and stop session | Done | High | Prezentare intermediară | admin, backend, frontend, Feature |
| AIA-9 | Cost tracking dashboard | Done | Medium | Prezentare finală | admin, backend, Feature |
| AIA-10 | Critic agent analysis | Done | High | Prezentare intermediară | ai-agent, backend, Feature |
| AIA-11 | Host / MC agent | Done | High | Prezentare intermediară | ai-agent, backend, Feature |
| AIA-12 | Session history | Done | Medium | Prezentare finală | backend, frontend, Feature |
| AIA-13 | Architecture & diagrams | Done | Medium | Prezentare intermediară | Improvement |
| AIA-14 | Automated tests & agent evals | Done | High | Prezentare finală | ai-agent, backend, Improvement |
| AIA-15 | CI/CD pipeline | In Progress | High | Prezentare finală | backend, Improvement |
| AIA-16 | Bug report & fix via pull request | Backlog | Medium | Prezentare finală | Bug |
| AIA-17 | AI tools usage report | Done | Medium | Prezentare finală | Improvement |
| AIA-18 | Epic: Session Flow | Done | Urgent | Prezentare intermediară | Feature |
| AIA-19 | Epic: AI Agents | Done | Urgent | Prezentare intermediară | ai-agent, Feature |
| AIA-20 | Epic: Discovery & Stats | Done | Medium | Prezentare finală | Feature |

---

## Milestone: Prezentare intermediară

### AIA-18 — Epic: Session Flow

- **Status:** Done · **Priority:** Urgent · **Labels:** Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-18/epic-session-flow

Core session experience — everything a user and admin need to run and participate in a live AI battle.

Covers: session creation & configuration, joining via link, starting/stopping, topic submission, viewing responses side-by-side, voting, and real-time results.

**Children:** AIA-1, AIA-2, AIA-3, AIA-4, AIA-6, AIA-7, AIA-8.

---

### AIA-1 — Submit topic

- **Status:** Done · **Priority:** High · **Parent:** AIA-18 · **Labels:** backend, frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-1/submit-topic

As a user, I want to submit a topic so that all selected AI models generate responses about it.

**Acceptance Criteria:**

- [x] The topic input field accepts plain text between 5 and 300 characters
- [x] Submitting an empty or whitespace-only topic shows a validation error
- [x] After submission, the topic is locked and visible to all session participants
- [x] All active AI models in the session begin generating responses immediately after submission
- [x] A loading indicator is shown while responses are being generated
- [x] If generation takes longer than 15 seconds, a timeout notice is displayed

---

### AIA-2 — View responses side-by-side

- **Status:** Done · **Priority:** High · **Parent:** AIA-18 · **Labels:** frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-2/view-responses-side-by-side

As a user, I want to see the generated responses from all models displayed simultaneously (anonymized) so I can judge them fairly.

**Acceptance Criteria:**

- [x] Responses are displayed in a randomized order, not grouped by model
- [x] Model identity is hidden during voting and revealed only after the round ends
- [x] If a model fails to generate (API error/timeout), the round still works with the remaining models and a notice is shown
- [x] Each response card has equal visual weight (same font size, layout) so there's no visual bias

---

### AIA-3 — Vote for the best response

- **Status:** Done · **Priority:** High · **Parent:** AIA-18 · **Labels:** backend, frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-3/vote-for-the-best-response

As a user, I want to vote for the response I find best in each round so that the winning model gets points.

**Acceptance Criteria:**

- [x] Each participant can cast exactly one vote per round
- [x] Voting is only available after all model responses have been generated
- [x] Model identity is hidden during voting and revealed only after the round ends
- [x] Attempting to vote a second time shows an error or is silently ignored
- [x] The vote is persisted even if the user refreshes the page
- [x] The round winner (model with most votes) is announced to all participants simultaneously after the voting period ends

---

### AIA-4 — Real-time voting results

- **Status:** Done · **Priority:** High · **Parent:** AIA-18 · **Labels:** real-time, frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-4/real-time-voting-results

As a user, I want to see votes updating in real time as other participants vote, so the experience feels live and engaging.

**Acceptance Criteria:**

- [x] Vote counts update within 1 second of another user voting (Convex real-time subscription)
- [x] A user can only vote once per round
- [x] After voting, I see a live bar chart / progress indicator showing the distribution of votes
- [x] The round result (winner) is shown to all users simultaneously when the admin ends the round or a timer expires

---

### AIA-6 — Join session via link

- **Status:** Done · **Priority:** High · **Parent:** AIA-18 · **Labels:** backend, frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-6/join-session-via-link

As a user, I want to join an active session using a shareable link or code, so I can participate without needing an account.

**Acceptance Criteria:**

- [x] Each session has a unique shareable link and a short join code
- [x] Visiting the link or entering the code lands the user directly in the session lobby
- [x] Joining does not require account registration or login
- [x] If the session is full or has already ended, the user sees an appropriate error message
- [x] The user's display name is either auto-generated or can be set before joining
- [x] Joining a session in progress drops the user into the current round without disrupting other participants

---

### AIA-7 — Create and configure session

- **Status:** Done · **Priority:** High · **Parent:** AIA-18 · **Labels:** admin, backend, frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-7/create-and-configure-session

As an admin, I want to create a session where I select which AI models participate, set the number of rounds, and optionally configure the theme (e.g. comedy, debate, ELI5).

**Acceptance Criteria:**

- [x] Admin can select/deselect individual models from the available provider list
- [x] Admin can set number of rounds (1–10)
- [x] Admin can choose a session theme (comedy, debate, ELI5, freeform)
- [x] Session is created in "waiting" state until admin explicitly starts it
- [x] A shareable join link/code is generated on session creation

---

### AIA-8 — Start and stop session

- **Status:** Done · **Priority:** High · **Parent:** AIA-18 · **Labels:** admin, backend, frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-8/start-and-stop-session

As an admin, I want to start and stop sessions manually so I can control when API calls are made and manage costs.

**Acceptance Criteria:**

- [x] Admin sees a "Start Session" button in the session dashboard; clicking it transitions the session from "waiting" to "active"
- [x] API calls to AI models only begin after the admin explicitly starts the session
- [x] Admin can stop the session at any time, ending the current round and preventing further API calls
- [x] Participants are notified in real time when the session starts or stops
- [x] Stopping a session mid-round saves all responses and votes collected up to that point
- [x] A stopped session cannot be restarted — admin must create a new session

---

### AIA-19 — Epic: AI Agents

- **Status:** Done · **Priority:** Urgent · **Labels:** ai-agent, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-19/epic-ai-agents

The two AI agents that make sessions entertaining and insightful — Host/MC and Critic.

Both agents are core to the project's MDS requirement of including at least 2 AI agents as part of the product functionality.

**Children:** AIA-10, AIA-11.

---

### AIA-10 — Critic agent analysis

- **Status:** Done · **Priority:** High · **Parent:** AIA-19 · **Labels:** ai-agent, backend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-10/critic-agent-analysis

As a user, I want an AI "Critic" agent to analyze responses after each round — explaining why the winner worked and what the others lacked, in the context of the current theme.

**Acceptance Criteria:**

- [x] The Critic agent's analysis is triggered automatically after each round's winner is determined
- [x] The analysis is shown to all participants simultaneously
- [x] The Critic references the session theme (e.g. comedy, debate, ELI5) in its reasoning
- [x] The analysis covers all participating models, not just the winner
- [x] If the Critic agent fails to generate a response, the round still completes and a fallback notice is shown
- [x] The analysis is stored and visible in the session history

---

### AIA-11 — Host / MC agent

- **Status:** Done · **Priority:** High · **Parent:** AIA-19 · **Labels:** ai-agent, backend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-11/host-mc-agent

As a user, I want an AI "Host" agent to introduce each round with context about the topic, provide entertaining transitions between rounds, and generate a recap summary at the end of the session.

**Acceptance Criteria:**

- [x] The Host agent generates an introduction at the start of each round, visible to all participants before responses are shown
- [x] Transitions between rounds include a brief Host commentary referencing the previous round's outcome
- [x] At the end of the session, the Host generates a recap summarizing the overall winner, highlights, and scores
- [x] The Host's tone adapts to the session theme (e.g. comedic for comedy, formal for debate)
- [x] If the Host agent fails, the session continues without the introduction and a fallback placeholder is shown
- [x] All Host-generated content is stored and visible in session history

---

### AIA-13 — Architecture & diagrams

- **Status:** Done · **Priority:** Medium · **Labels:** Improvement
- **URL:** https://linear.app/radu-popa/issue/AIA-13/architecture-and-diagrams

Document the system visually so any team member or evaluator can understand the structure and flows at a glance.

**Required diagrams**

- [x] Component architecture — frontend, Convex backend, AI providers, Clerk auth, Cloudflare Pages
- [x] Entity-Relationship — Sessions, Rounds, Responses, Votes, Models, Users
- [x] Sequence — core round flow: topic submit → model calls → vote → winner reveal → agent analysis
- [x] Agent workflow — Host and Critic trigger points within a round

**Notes**

- Diagrams live in `/docs/ARCHITECTURE.md` (Mermaid — rendează în GitHub)
- AI-assisted generation; notat în `/docs/AI_TOOLS_REPORT.md`

---

## Milestone: Prezentare finală

### AIA-20 — Epic: Discovery & Stats

- **Status:** Done · **Priority:** Medium · **Labels:** Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-20/epic-discovery-and-stats

Post-session features that add value over time — leaderboard, session history, and admin cost visibility.

**Children:** AIA-5, AIA-9, AIA-12.

---

### AIA-5 — Model leaderboard

- **Status:** Done · **Priority:** Medium · **Parent:** AIA-20 · **Labels:** backend, frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-5/model-leaderboard

As a user, I want to see an all-time leaderboard ranking AI models by total wins and vote percentage across all sessions.

**Acceptance Criteria:**

- [x] The leaderboard displays all models that have participated in at least one session
- [x] Each entry shows: model name, total wins, total rounds participated, and win rate (%)
- [x] The leaderboard is sorted by win rate descending by default
- [x] Data updates within 5 seconds of a session round concluding
- [x] The leaderboard is publicly accessible without requiring an account

**Implementation:** `convex/stats.ts::getModelLeaderboard` + `/leaderboard` route.

---

### AIA-9 — Cost tracking dashboard

- **Status:** Done · **Priority:** Medium · **Parent:** AIA-20 · **Labels:** admin, backend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-9/cost-tracking-dashboard

As an admin, I want to see how many tokens and estimated cost each session and each model used, so I can manage my API budget.

**Acceptance Criteria:**

- [x] The dashboard shows a per-session breakdown: total tokens used, estimated cost in USD, and participating models
- [x] Each model's token usage and cost contribution is shown separately within a session
- [x] Costs are calculated using the current pricing for each model's provider
- [x] Data is available immediately after a session ends
- [x] Admin can view historical cost data for all past sessions
- [x] The dashboard is only accessible to authenticated admins

**Implementation:** `convex/stats.ts::getAdminCostSummary` + secțiunea *Cost tracking* pe `/admin`. Pricing table în `shared/arena.ts` (`MODEL_PRICING`, `computeCostMicrosUsd`).

---

### AIA-12 — Session history

- **Status:** Done · **Priority:** Medium · **Parent:** AIA-20 · **Labels:** backend, frontend, Feature
- **URL:** https://linear.app/radu-popa/issue/AIA-12/session-history

As a user, I want to browse past sessions with all rounds, responses, votes, agent commentary, and results.

**Acceptance Criteria:**

- [x] A session history page lists all completed sessions, sorted by date descending
- [x] Each session entry shows: date, theme, number of rounds, participating models, and overall winner
- [x] Clicking into a session shows a full round-by-round breakdown including all model responses, vote counts, Critic analysis, and Host commentary
- [x] Session history is publicly accessible without login
- [x] Sessions are stored indefinitely and do not expire
- [ ] The page handles large numbers of sessions without performance degradation (pagination or infinite scroll)

**Notes:** lista + overall winner implementate în `/history` via `listCompletedSessions`. Pagination cu cursor se poate adăuga când volumul crește (≥100 sesiuni). Breakdown pe rundă reutilizează pagina publică `/sessions/$slug`.

---

### AIA-14 — Automated tests & agent evals

- **Status:** Done · **Priority:** High · **Labels:** ai-agent, backend, Improvement
- **URL:** https://linear.app/radu-popa/issue/AIA-14/automated-tests-and-agent-evals

Cover critical app logic with automated tests and validate both AI agents with lightweight evals.

**Unit & integration tests**

- [x] Voting — one vote per user, winner determination
- [x] Session state machine — valid/invalid transitions
- [x] Topic submission — validation edge cases
- [x] Core Convex mutations — `createSession`, `submitVote`, `submitTopic`

**Agent evals**

- [ ] **Host eval** — output is non-empty, references the topic, tone fits the session theme
- [ ] **Critic eval** — analysis mentions all models and provides a rationale for the winner

**Setup**

- [x] Vitest configured; tests run in CI (see AIA-15)
- [x] At least one test written with AI — documented în `docs/AI_TOOLS_REPORT.md`

**Files:** `convex/sessions.test.ts`, `convex/voting.test.ts`, `shared/validation.test.ts` · 23 tests pass.

---

### AIA-15 — CI/CD pipeline

- **Status:** In Progress · **Priority:** High · **Labels:** backend, Improvement
- **URL:** https://linear.app/radu-popa/issue/AIA-15/cicd-pipeline

Automate build, test, and deployment on every push so the project is always in a releasable state.

**CI — on every pull request**

- [x] Type-check (`tsc --noEmit`) + lint (`eslint`)
- [x] Run Vitest test suite — PR blocked if tests fail

**CD — on merge to** `main`

- [ ] Deploy frontend to Cloudflare Pages (*actualmente pe Vercel — de aliniat*)
- [ ] Push Convex functions to production

**Setup**

- [x] GitHub Actions workflow under `.github/workflows/`
- [ ] Required secrets configured (Cloudflare token, Convex deploy key)
- [ ] CI status badge in `README.md`
- [x] Initial workflow YAML scaffolded with AI — prompt documentat în `docs/AI_TOOLS_REPORT.md`

---

### AIA-16 — Bug report & fix via pull request

- **Status:** Backlog · **Priority:** Medium · **Labels:** Bug
- **URL:** https://linear.app/radu-popa/issue/AIA-16/bug-report-and-fix-via-pull-request

Demonstrate the full bug lifecycle: report → branch → fix → PR → review → merge.

- [ ] Open a GitHub Issue with steps to reproduce, expected vs actual behaviour
- [ ] Fix on a `fix/<name>` branch; commit message references the issue
- [ ] Open a PR, get at least one team review, merge with CI green
- [ ] Verify the fix is live in the deployed app

---

### AIA-17 — AI tools usage report

- **Status:** Done · **Priority:** Medium · **Labels:** Improvement
- **URL:** https://linear.app/radu-popa/issue/AIA-17/ai-tools-usage-report

Write `/docs/AI_TOOLS_REPORT.md` documenting how AI was used throughout the project. Required by the course barem (2 pts).

**Sections to cover**

- Planning — tools used for backlog, user stories, AC; example prompts
- Architecture — AI-assisted design decisions and diagram generation
- Implementation — AI-generated vs hand-written code breakdown per feature; tools used
- Testing — how tests and evals were scaffolded with AI
- Reflection — what worked, what didn't, where human judgment was still needed

**Done when**

- [x] Report committed to `/docs/AI_TOOLS_REPORT.md`
- [x] Linked from `README.md`
- [x] Each section has at least one concrete example (prompt, snippet, or screenshot)

---

## Status rollup

- **Done:** 18 / 20
- **In Progress:** 1 (AIA-15)
- **Backlog:** 1 (AIA-16)

Rămas de finalizat pentru barem complet: CD pipeline real (AIA-15) + bug report-to-PR ca exercițiu de proces (AIA-16).
