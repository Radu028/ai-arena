import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useRuntimeConfig } from '#/components/AppProviders'

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const runtime = useRuntimeConfig()

  if (!runtime.hasConvex) {
    return runtime.hasDemoAdmin ? <>{children}</> : null
  }

  if (!runtime.hasClerk) {
    return runtime.hasDemoAdmin ? <>{children}</> : null
  }

  return <ClerkAdminOnly>{children}</ClerkAdminOnly>
}

function ClerkAdminOnly({ children }: { children: React.ReactNode }) {
  const adminState = useQuery(api.admins.list, {})
  return adminState?.isAuthenticated ? <>{children}</> : null
}
