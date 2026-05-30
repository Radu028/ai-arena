import { createFileRoute } from '@tanstack/react-router'
import { JoinPage } from '#/components/arena/JoinPage'

export const Route = createFileRoute('/join')({
  component: JoinPage,
})
