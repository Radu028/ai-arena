import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, LayersIcon } from 'lucide-react'
import { AdminOnly } from '#/components/AdminOnly'
import { Button } from '#/components/ui/button'

export function CallToAction() {
  return (
    <section
      data-reveal
      className="relative isolate overflow-hidden border-t border-border/60 pt-16 sm:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-80 max-w-4xl bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,color-mix(in_oklab,var(--arena-violet),transparent_82%),transparent_70%)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black,transparent_75%)]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="eyebrow">Run a session</p>
        <h2 className="display mt-3 text-balance text-3xl sm:text-5xl">
          Spin up a live arena{' '}
          <span className="gradient-text">in under a minute.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          Pick a theme, lock the lineup, share the code. The room opens
          instantly.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <AdminOnly>
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <Link to="/admin">
                <LayersIcon className="size-4" />
                Open admin console
              </Link>
            </Button>
          </AdminOnly>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full px-6"
          >
            <Link to="/history">
              Browse past sessions
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
