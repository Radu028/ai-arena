# Stack Audit

This is the short maintenance audit for framework usage. It exists so humans
and LLM agents can quickly see which official docs were checked and where the
repo intentionally follows or diverges from them.

## Official References Checked

- Convex AI guidance: `convex/_generated/ai/guidelines.md`
- Convex Clerk auth: https://docs.convex.dev/auth/clerk
- Convex React Clerk provider API: https://docs.convex.dev/api/modules/react_clerk
- Clerk TanStack Start quickstart:
  https://clerk.com/docs/quickstarts/tanstack-start
- Clerk TanStack Start SDK overview:
  https://clerk.com/docs/references/tanstack-react-start/overview
- Clerk TanStack Start `useSignIn` hook:
  https://clerk.com/docs/reference/hooks/use-sign-in
- Clerk `clerkMiddleware` reference:
  https://clerk.com/docs/reference/tanstack-react-start/clerk-middleware
- TanStack Router routing concepts:
  https://tanstack.com/router/latest/docs/routing/routing-concepts
- TanStack Router creation/type registration:
  https://tanstack.com/router/latest/docs/guide/creating-a-router
- TanStack Start middleware:
  https://tanstack.com/start/latest/docs/framework/react/guide/middleware
- TanStack Start server functions:
  https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- TanStack Start path aliases:
  https://tanstack.com/start/latest/docs/framework/react/guide/path-aliases
- TanStack Start Tailwind v4 integration:
  https://tanstack.com/start/latest/docs/framework/react/guide/tailwind-integration
- TanStack Start hosting with Nitro:
  https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- Vercel TanStack Start hosting:
  https://vercel.com/docs/frameworks/full-stack/tanstack-start
- TanStack Devtools Vite plugin:
  https://tanstack.com/devtools/latest/docs/vite-plugin
- TanStack ESLint config: https://tanstack.com/config/latest/docs/eslint

## Findings

- Convex functions use validators, generated `api`/`internal` references, and
  `internalQuery`/`internalMutation`/`internalAction` for private orchestration
  work. Auth-linked ownership uses `identity.tokenIdentifier`.
- `convex/auth.config.ts` exists and derives the Clerk issuer from explicit env
  or the publishable key, matching Convex's JWT-provider requirement.
- The React client wraps Convex with `ConvexProviderWithClerk` inside a
  configured Clerk provider, matching the Convex React Clerk docs.
- Admin route protection uses a TanStack Start `createServerFn` called from
  route `beforeLoad`, and redirects by throwing `redirect(...)`.
- Clerk middleware is wired in `src/start.ts`. It is intentionally gated by
  `VITE_ENABLE_CLERK_SSR_AUTH` so local mismatched Clerk keys do not break the
  demo shell; production should enable it with matching publishable/secret keys.
- Custom Google sign-in uses the current `@clerk/tanstack-react-start`
  `useSignIn` hook rather than the legacy hook namespace.
- TanStack Router uses generated file-based routes, a root route with
  `notFoundComponent`, and router type registration in `src/router.tsx`.
- Vite path aliases use Vite's native `resolve.tsconfigPaths` support. TanStack
  Start's latest path-alias guide documents this for Vite 8 and reserves
  `vite-tsconfig-paths` for Vite 7 and earlier.
- Tailwind v4 is configured through `@tailwindcss/vite`, and CSS is linked from
  the root route with a `?url` import.
- Vercel deployment uses the documented `tanstackStart()`, `nitro(...)`,
  `viteReact()` plugin chain.
- `@tanstack/devtools-vite` remains first in the Vite plugin array, matching
  its docs.
- ESLint uses the TanStack flat config export from `@tanstack/eslint-config`
  with repo-specific overrides only where the generated/UI files need them.
- `pnpm-workspace.yaml` pins `ws` to a patched 8.x release while Convex still
  requests an older compatible 8.x version.

## Maintenance Rules

- Keep route files thin. Put reusable UI under `src/components/**` and shared
  model/session constants under `shared/**`.
- Read `convex/_generated/ai/guidelines.md` before editing Convex code.
- Do not pass user IDs into Convex functions for authorization. Derive identity
  server-side and use `tokenIdentifier`.
- Keep `routeTree.gen.ts`, `convex/_generated/**`, `.agents/**`, and `dist/**`
  out of manual formatting/refactors.
- After React changes, run React Doctor:
  `npx -y react-doctor@latest . --verbose --diff`.
