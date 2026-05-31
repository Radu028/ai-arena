import { Link } from '@tanstack/react-router'
import { ShieldCheckIcon } from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { AuthEditorial } from '#/components/auth/AuthEditorial'
import { AuthPanel } from '#/components/auth/AuthPanel'
import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'

export function LoginPage() {
  const runtime = useRuntimeConfig()

  return (
    <div className="shell py-10 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <AuthEditorial />
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
          {runtime.hasClerk ? (
            <AuthPanel />
          ) : (
            <Empty className="rounded-2xl border border-dashed border-border/50 p-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldCheckIcon />
                </EmptyMedia>
                <EmptyTitle>Sign-in isn&rsquo;t configured</EmptyTitle>
                <EmptyDescription>
                  Add the Clerk environment variables to enable Google sign-in.
                </EmptyDescription>
              </EmptyHeader>
              <Button asChild variant="outline">
                <Link to="/">Back home</Link>
              </Button>
            </Empty>
          )}
        </div>
      </div>
    </div>
  )
}
