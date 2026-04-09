import { createFileRoute } from '@tanstack/react-router'
import { AdminGuard } from '#/components/AdminGuard'
import { CreateSessionForm } from '#/components/arena/CreateSessionForm'

export const Route = createFileRoute('/admin/sessions/new')({
  component: NewSessionPage,
})

function NewSessionPage() {
  return (
    <div className="page-frame space-y-6">
      <AdminGuard title="Create a new arena session">
        <section className="space-y-3">
          <p className="eyebrow">Session setup</p>
          <h1 className="font-serif text-5xl text-foreground">
            Configure the battle
          </h1>
        </section>
        <CreateSessionForm />
      </AdminGuard>
    </div>
  )
}
