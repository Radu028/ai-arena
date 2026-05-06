# Demo Runbook

Use this runbook for both the live lab presentation and the offline recording.
Keep the demo short, deterministic, and focused on the grading rubric.

## Before Recording

1. Confirm the production app opens: https://ai-arena-seven.vercel.app.
2. Confirm Convex has either real provider keys or `AI_ARENA_DEMO_MODE=true`.
3. Use a short topic to avoid unnecessary token spend.
4. Keep the selected model count at two or three for the paid demo.
5. Keep the voting window short if the admin UI allows it.
6. Open one normal browser window for the admin and one incognito/private window
   for the guest.

## Suggested Low-Cost Topic

> Explain why automated tests matter using a pizza delivery analogy.

This is short, easy to judge, and produces reliable answers across providers.

## Recording Script

1. Start on the landing page and introduce the product:
   "AI Arena is a live battle platform where multiple AI models answer the same
   prompt, humans vote, AI judges vote, and two AI agents host and critique the
   session."
2. Open the admin page and create a session.
3. Select at least two models.
4. Show the generated join link and join code.
5. Open the guest window and join through the public flow.
6. Start the session from the admin window.
7. Submit the suggested topic from the guest window.
8. Show the Host / MC intro artifact.
9. Wait for model responses and explain that model identity stays hidden during
   voting.
10. Cast a human vote.
11. Show the AI judge votes and final result.
12. Show the Critic analysis after the winner is revealed.
13. Open leaderboard and history to prove persistence.
14. Open admin cost tracking to show token/cost accounting.
15. Finish by opening `docs/MDS_CHECKLIST.md` and pointing to the repository
    evidence for backlog, diagrams, CI, tests, bug PR, and AI tools report.

## What To Say If Demo Mode Is Enabled

Use this exact wording:

> For the recording I am using demo mode to avoid wasting provider credits.
> The production orchestration is the same code path: provider adapters for
> OpenAI, Anthropic, Google, xAI, and Mistral run from `convex/orchestration.ts`
> when the deployment has API keys configured.

## Provider Cost Guardrails

- Use two models for the final recording unless the lab assistant asks for more.
- Use one short round.
- Do not use Anthropic Opus models.
- Use Gemini Flash instead of Gemini Pro for low-cost validation.
- Prefer cheaper models for Host and Critic copy.
- Keep prompts below a few sentences.
- Stop the session immediately after the required flow is shown.

## Final Recording Checklist

- [ ] App URL is visible.
- [ ] Admin creates or opens a session.
- [ ] Guest joins without login.
- [ ] At least two models participate.
- [ ] Host agent artifact is visible.
- [ ] Critic agent artifact is visible.
- [ ] Human vote is shown.
- [ ] AI judging or AI vote rationale is shown.
- [ ] Winner reveal is shown.
- [ ] Leaderboard/history persistence is shown.
- [ ] CI/tests/docs evidence is shown from the repo.
- [ ] Recording URL is added to `docs/MDS_CHECKLIST.md` and `README.md`.
