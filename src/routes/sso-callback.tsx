import { createFileRoute } from '@tanstack/react-router'
import { SsoCallbackPage } from '#/components/auth/SsoCallbackPage'

export const Route = createFileRoute('/sso-callback')({
  component: SsoCallbackPage,
})
