import { SignInButton, useAuth } from '@clerk/tanstack-react-start'
import { LockKeyholeIcon, ShieldAlertIcon } from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'

export function AdminGuard({
  children,
  title = 'Admin access required',
}: {
  children: React.ReactNode
  title?: string
}) {
  const runtime = useRuntimeConfig()

  if (!runtime.hasClerk) {
    if (!runtime.hasDemoAdmin) {
      return (
        <Empty className="surface rounded-2xl p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldAlertIcon />
            </EmptyMedia>
            <EmptyTitle>Clerk is not configured</EmptyTitle>
            <EmptyDescription>
              Add the Clerk environment variables, or enable demo admin mode for
              non-production demos.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }
    return <>{children}</>
  }

  return <ConfiguredAdminGuard title={title}>{children}</ConfiguredAdminGuard>
}

function ConfiguredAdminGuard({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <Empty className="surface rounded-2xl p-10">
        <EmptyHeader>
          <EmptyTitle>Checking admin session...</EmptyTitle>
          <EmptyDescription>Loading authentication state.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!isSignedIn) {
    return (
      <Empty className="surface rounded-2xl p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LockKeyholeIcon />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>
            Sign in with Clerk to create sessions, start rounds, and control
            costs.
          </EmptyDescription>
        </EmptyHeader>
        <SignInButton mode="modal">
          <Button size="lg">Sign in as admin</Button>
        </SignInButton>
      </Empty>
    )
  }

  return <>{children}</>
}
