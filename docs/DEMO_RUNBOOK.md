# Demo Runbook

Use this runbook for both the live lab presentation and the offline recording.
Keep the demo short, deterministic, and focused on the grading rubric.

## Before Recording

1. Confirm the production app opens: https://ai-arena-seven.vercel.app.
2. Confirm Convex has either real provider keys or `AI_ARENA_DEMO_MODE=true`.
3. Use a short arena prompt to avoid unnecessary token spend.
4. Keep the selected model count at two or three for the paid demo.
5. Close voting manually as soon as the required ballots are visible.
6. Open one normal browser window for the admin and one incognito/private window
   for the guest.

## Suggested Low-Cost Arena Prompt

> Explain why automated tests matter using a pizza delivery analogy.

This is short, easy to judge, and produces reliable answers across providers.

## Recording Script

1. Start on the landing page and introduce the product:
   "AI Arena is a live battle platform where multiple AI models answer the same
   prompt, humans vote, model agents judge, and a Stats Analyst agent summarizes
   the final numbers."
2. Open the admin page and create a session.
3. Select at least two models.
4. Show the generated join link and join code.
5. Open the guest window and join through the public flow.
6. Start the session from the admin window.
7. Show the model agents competing on the admin prompt.
8. Wait for model responses and explain that model identity stays hidden during
   voting.
9. Cast a human vote.
10. Close the round manually from the admin window.
11. Reveal the models manually and show the final result.
12. Show the Stats Analyst summary after the winner is revealed.
13. Open leaderboard and history to prove persistence.
14. Open admin cost tracking to show token/cost accounting.
15. Finish by opening `docs/MDS_CHECKLIST.md` and pointing to the repository
    evidence for backlog, diagrams, CI, tests, bug PR, and AI tools report.

## What To Say If Demo Mode Is Enabled

Use this exact wording:

> For the recording I am using demo mode to avoid wasting provider credits.
> The production orchestration is the same code path: provider adapters for
> OpenAI, Anthropic, and Google run from `convex/orchestration.ts` when the
> deployment has API keys configured.

## Provider Cost Guardrails

- Use two models for the final recording unless the lab assistant asks for more.
- Use one short round.
- Do not use Anthropic Opus models.
- Use Gemini 3 Flash for the Stats Analyst agent and low-cost validation.
- Keep prompts below a few sentences.
- Stop the session immediately after the required flow is shown.

## Final Recording Checklist

- [ ] App URL is visible.
- [ ] Admin creates or opens a session.
- [ ] Guest joins without login.
- [ ] At least two models participate.
- [ ] At least two model agents compete.
- [ ] Stats Analyst agent artifact is visible.
- [ ] Human vote is shown.
- [ ] AI judging or AI vote rationale is shown.
- [ ] Winner reveal is shown.
- [ ] Leaderboard/history persistence is shown.
- [ ] CI/tests/docs evidence is shown from the repo.
- [ ] Recording URL is added to `docs/MDS_CHECKLIST.md` and `README.md`.
