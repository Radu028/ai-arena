import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { AdminGuard } from '#/components/AdminGuard'
import { CreateSessionForm } from '#/components/arena/CreateSessionForm'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/admin/sessions/new')({
  component: NewSessionPage,
})

function NewSessionPage() {
  return (
    <div className="shell space-y-10">
      <AdminGuard title="Create a new arena session">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link to="/admin">
              <ArrowLeftIcon className="size-4" />
              Back to console
            </Link>
          </Button>
        </div>

        <header data-reveal>
          <p className="eyebrow">Session setup</p>
          <h1 className="display mt-2 text-balance text-4xl sm:text-5xl">
            Configure the battle
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
            Pick a theme, choose the lineup, and we&rsquo;ll mint a join code
            and share link the moment it&rsquo;s created.
          </p>
        </header>

        <section data-reveal>
          <CreateSessionForm />
        </section>
      </AdminGuard>
    </div>
  )
}
