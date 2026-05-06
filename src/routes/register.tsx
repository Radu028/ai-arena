import { SignUp } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { useRuntimeConfig } from '#/components/AppProviders'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '#/components/ui/empty'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const runtime = useRuntimeConfig()

  return (
    <div className="page-frame flex justify-center py-10">
      {runtime.hasClerk ? (
        <SignUp signInUrl="/login" fallbackRedirectUrl="/admin" />
      ) : (
        <Empty className="surface w-full max-w-xl rounded-2xl p-10">
          <EmptyHeader>
            <EmptyTitle>Registration is not configured</EmptyTitle>
            <EmptyDescription>
              Add Clerk environment variables before creating real admin
              accounts.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
