import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  process.env.VITE_CLERK_PUBLISHABLE_KEY ??
  ''

const secretKey = process.env.CLERK_SECRET_KEY ?? ''

export const startInstance = createStart(() => ({
  requestMiddleware:
    publishableKey && secretKey
      ? [clerkMiddleware({ publishableKey, secretKey })]
      : [],
}))
