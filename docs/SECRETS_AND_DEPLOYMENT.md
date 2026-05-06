# Secrets and Deployment

This document explains how to configure production secrets without committing
them or leaking them through shell history. Use fresh keys only.

## Important Security Step

Any key pasted into chat, screenshots, issue comments, or documentation should
be considered compromised. Rotate the OpenAI, Anthropic, and Google keys before
using them in production.

Do not store provider keys in Vercel for this project unless a frontend/server
route starts using them. The provider calls run in Convex actions, so the keys
belong in Convex environment variables.

## Convex Provider Environment Variables

Set these on the production Convex deployment:

```bash
pnpm exec convex env set --prod OPENAI_API_KEY
pnpm exec convex env set --prod ANTHROPIC_API_KEY
pnpm exec convex env set --prod GOOGLE_AI_API_KEY
pnpm exec convex env set --prod AI_ARENA_DEMO_MODE false
pnpm exec convex env set --prod HOST_AGENT_MODEL gpt-5-mini
pnpm exec convex env set --prod CRITIC_AGENT_MODEL gpt-5-mini
pnpm exec convex env set --prod STATS_AGENT_MODEL gemini-3-flash-latest
```

For the first three commands, omit the value and paste it only into the
interactive prompt. That keeps the secret out of the terminal command itself.

For a zero-cost fallback demo, use:

```bash
pnpm exec convex env set --prod AI_ARENA_DEMO_MODE true
```

## Anthropic Cost Guardrail

Do not configure an Opus model for this project. The model list uses Sonnet:

- `anthropic-claude-sonnet-4`
- `claude-sonnet-4-20250514`

If this model is not available on the Anthropic account, replace it with the
cheapest available Sonnet model before running a live demo.

## GitHub Secret For Convex CD

The GitHub Actions workflow already deploys Convex functions on pushes to
`main` when the repository secret exists:

```bash
gh secret set CONVEX_DEPLOY_KEY
```

Paste the deploy key into the interactive prompt. Do not pass it as `--body`
because that can expose it in local process or command logs.

After adding the secret, push a documentation-only commit to `main` and verify
that the `Deploy Convex functions` step runs instead of the `Deployment skipped`
step.

## Vercel Frontend Deployment

Vercel is connected to the GitHub repository and deploys the frontend from
`main`. The current production URL is:

https://ai-arena-seven.vercel.app

The frontend needs these public/non-provider values in Vercel:

- `VITE_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` from the Clerk Vercel Marketplace
  integration, or `VITE_CLERK_PUBLISHABLE_KEY`
- Do not set `VITE_ALLOW_DEMO_ADMIN` in hosted environments unless demo admin
  access is intentionally enabled for a throwaway preview.

Use:

```bash
vercel env ls
```

to confirm they exist for Production before the final presentation.

## Low-Spend Validation Plan

1. Start with `AI_ARENA_DEMO_MODE=true` and verify the whole UI flow.
2. Rotate provider keys and set them in Convex.
3. Switch `AI_ARENA_DEMO_MODE=false`.
4. Run one session with exactly two models and one short topic.
5. Stop immediately after responses, voting, Stats Analyst, and winner reveal
   are visible.
6. Switch back to `AI_ARENA_DEMO_MODE=true` if you only need to record UI
   evidence and want to avoid more spend.

## Runtime Cost Controls

The code now enforces conservative output limits on every paid generation path:

- Round model answers: 280 output tokens.
- Host and Critic agents: 180 output tokens.
- Stats Analyst agent: 180 output tokens, using Gemini 3 Flash by default.
- AI judge decisions: 80 output tokens.

Input spend is also bounded: Critic and Judge prompts truncate model responses
before sending them to another provider, while Stats Analyst prompts use saved
vote/latency numbers instead of full response text.

The default competition roster is GPT 5.5, Claude Sonnet 4.5, Gemini 3 Flash,
and Gemini 3.1 Pro. The Stats Analyst uses the cheaper Gemini 3 Flash model by
default. Anthropic remains on Sonnet, not Opus.
