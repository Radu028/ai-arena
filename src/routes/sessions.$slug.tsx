import { createFileRoute } from '@tanstack/react-router'
import { SessionPage } from '#/components/arena/SessionPage'

export const Route = createFileRoute('/sessions/$slug')({
  component: SessionPage,
})
