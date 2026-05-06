import { Navigate, createFileRoute, redirect } from '@tanstack/react-router'

/**
 * Sign-in and sign-up share the exact same Google OAuth flow, so we keep a
 * single canonical `/login` route and bounce `/register` to it. Existing links
 * (marketing pages, emails, etc.) keep working without separate UI to maintain.
 */
export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    throw redirect({ to: '/login' })
  },
  component: RegisterRedirect,
})

function RegisterRedirect() {
  return <Navigate to="/login" replace />
}
