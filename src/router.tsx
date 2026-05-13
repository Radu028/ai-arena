import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { Spinner } from '#/components/ui/spinner'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'render',
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 0,
    defaultPendingMinMs: 250,
    defaultPendingComponent: RoutePending,
  })

  return router
}

function RoutePending() {
  return (
    <div className="shell py-10">
      <div className="surface flex items-center gap-3 rounded-2xl p-6 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Loading page...
      </div>
    </div>
  )
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
