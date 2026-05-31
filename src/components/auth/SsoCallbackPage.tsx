import { Loader2Icon } from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { OAuthCallback } from '#/components/auth/OAuthCallback'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'

export function SsoCallbackPage() {
  const runtime = useRuntimeConfig()

  return (
    <div className="shell flex min-h-[60vh] items-center justify-center py-10">
      <div className="surface w-full max-w-md rounded-2xl border border-border/60 p-10 text-center">
        <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--arena-violet),transparent_85%)] text-(--arena-violet)">
          <Loader2Icon className="size-6 animate-spin" aria-hidden />
        </div>
        <h1 className="display mt-6 text-2xl">Finishing sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verifying your Google account and opening your session.
        </p>
        {runtime.hasClerk ? (
          <OAuthCallback />
        ) : (
          <Empty className="mt-6 border-none p-0 text-left">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Loader2Icon />
              </EmptyMedia>
              <EmptyTitle>Authentication is not configured</EmptyTitle>
              <EmptyDescription>
                Add Clerk environment variables before using Google sign-in.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}
