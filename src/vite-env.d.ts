/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL?: string
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string
  readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string
  readonly CLERK_PUBLISHABLE_KEY?: string
  readonly VITE_ALLOW_DEMO_ADMIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
