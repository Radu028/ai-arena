import { SignInButton, useAuth } from '@clerk/tanstack-react-start'
import { ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

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
        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-2xl">
              <ShieldAlertIcon className="size-5 text-[var(--arena-signal)]" />
              Clerk is not configured
            </CardTitle>
            <CardDescription>
              Add Clerk environment variables, or set demo admin mode explicitly
              for non-production demos.
            </CardDescription>
          </CardHeader>
        </Card>
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
      <Card className="arena-panel">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">
            Checking admin session
          </CardTitle>
          <CardDescription>Loading Clerk authentication state.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isSignedIn) {
    return (
      <Card className="arena-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-2xl">
            <ShieldCheckIcon className="size-5 text-[var(--arena-cobalt)]" />
            {title}
          </CardTitle>
          <CardDescription>
            Sign in with Clerk to create sessions, start rounds, and control
            costs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton mode="modal">
            <Button size="lg">Sign In As Admin</Button>
          </SignInButton>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
