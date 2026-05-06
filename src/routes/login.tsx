import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { useRuntimeConfig } from '#/components/AppProviders'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '#/components/ui/empty'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const runtime = useRuntimeConfig()

  return (
    <div className="page-frame flex justify-center py-10">
      {runtime.hasClerk ? (
        <SignIn signUpUrl="/register" fallbackRedirectUrl="/admin" />
      ) : (
        <Empty className="surface w-full max-w-xl rounded-2xl p-10">
          <EmptyHeader>
            <EmptyTitle>Login is not configured</EmptyTitle>
            <EmptyDescription>
              Add Clerk environment variables before using real admin login.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
