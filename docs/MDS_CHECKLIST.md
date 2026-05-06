# MDS Final Checklist

This page maps the MDS grading rubric to concrete repository evidence for
AI Arena. It is intended as the single checklist to send to the lab assistant
together with the repository link.

## Project Links

- Repository: https://github.com/Radu028/ai-arena
- Production frontend: https://ai-arena-seven.vercel.app
- Production backend: https://modest-wren-126.convex.cloud
- CI workflow: https://github.com/Radu028/ai-arena/actions/workflows/ci.yml
- Bug report: https://github.com/Radu028/ai-arena/issues/1
- Bug fix PR: https://github.com/Radu028/ai-arena/pull/2
- Deployment evidence PR: https://github.com/Radu028/ai-arena/pull/3

## A. Implementation

| Requirement                                     | Status      | Evidence                                                                                                                                                                                                                                                                |
| ----------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live demo for the application                   | Ready       | Production app at https://ai-arena-seven.vercel.app. Core flows are listed in `README.md`: public join, live session, voting, leaderboard, history, and admin controls.                                                                                                 |
| At least two AI agents in product functionality | Ready       | Model agents compete on each prompt and the Stats Analyst agent summarizes vote/statistical outcomes after finalized rounds. Host and Critic artifacts are also available as supporting agents. See `convex/orchestration.ts`, `README.md`, and `docs/ARCHITECTURE.md`. |
| Offline demo recording                          | Manual step | Record the flow from `docs/DEMO_RUNBOOK.md`, upload it to YouTube or Drive, then add the link in this row before submission.                                                                                                                                            |
| Original topic, not from Web Development course | Ready       | AI Arena is a live multi-model battle platform with AI agents, judging, realtime voting, and session history.                                                                                                                                                           |

## B. AI-Assisted Software Development Process

| Requirement                                | Points | Status       | Evidence                                                                                                                                                                                                                 |
| ------------------------------------------ | -----: | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User stories and backlog, minimum 10       |      2 | Ready        | `docs/LINEAR_TODOS.md` contains AIA-1 through AIA-17 plus epics, statuses, priorities, milestones, labels, and acceptance criteria.                                                                                      |
| Diagrams                                   |      1 | Ready        | `docs/ARCHITECTURE.md` contains Mermaid diagrams for component architecture, ER model, session lifecycle, round lifecycle, sequence flow, agent workflow, and public/admin surfaces.                                     |
| Git source control, branches, PRs, commits |      1 | Ready        | GitHub PRs #2 and #3 are merged; CI runs are green; `git log` contains the project history. Each student should verify they have at least 5 commits authored under their own Git identity.                               |
| Automated tests, including agent evals     |      2 | Ready        | `convex/sessions.test.ts`, `convex/voting.test.ts`, `shared/validation.test.ts`, and `shared/agent-evals.test.ts`; CI runs `pnpm test`.                                                                                  |
| Bug report and fix through pull request    |      1 | Ready        | GitHub issue #1 documents the bug; PR #2 fixes it; PR #3 records deployment evidence.                                                                                                                                    |
| CI/CD pipeline                             |      1 | Mostly ready | `.github/workflows/ci.yml` runs typecheck, lint, test, and build on PR/push. Frontend deploy is handled by Vercel Git integration. Convex deploy is automated when `CONVEX_DEPLOY_KEY` is configured as a GitHub secret. |
| AI tools usage report                      |      2 | Ready        | `docs/AI_TOOLS_REPORT.md` documents AI usage in planning, architecture, implementation, testing, and reflection.                                                                                                         |

## Remaining Manual Submission Steps

1. Rotate the API keys that were shared in chat, then configure the fresh keys
   in Convex using the commands in `docs/SECRETS_AND_DEPLOYMENT.md`.
2. Add `CONVEX_DEPLOY_KEY` as a GitHub Actions secret so backend deploys run
   automatically on pushes to `main`.
3. Record the offline demo using `docs/DEMO_RUNBOOK.md`, upload it, and add the
   public link to this file and to the README before sending the repository.
4. Confirm each team member has at least 5 commits authored with their GitHub
   identity.

## Recommended Demo Path

Use a short, reliable demo that shows the grading criteria directly:

1. Open the production app.
2. Create or open an admin session.
3. Select at least two AI models.
4. Start the session and copy the join link.
5. Join as a guest in another browser or incognito window.
6. Submit one short topic.
7. Show the competing model agents, human voting, AI judging, Stats Analyst
   summary, winner reveal, leaderboard/history, and cost tracking.

If provider keys are not configured, enable demo mode for the recording and say
explicitly that the same orchestration uses real provider adapters in production
when keys are present.
