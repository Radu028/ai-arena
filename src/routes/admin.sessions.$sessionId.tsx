import { createFileRoute } from '@tanstack/react-router'
import { AdminSessionDetailPage } from '#/components/admin/AdminSessionDetailPage'

export const Route = createFileRoute('/admin/sessions/$sessionId')({
  component: AdminSessionDetailPage,
})
