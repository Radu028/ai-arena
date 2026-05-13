import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { safeAuthRedirect, stringifyLocationSearch } from '#/lib/authRedirect'

const getAdminRouteAuth = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (process.env.VITE_ALLOW_DEMO_ADMIN === 'true') {
      return { isAuthenticated: true }
    }
    if (process.env.VITE_ENABLE_CLERK_SSR_AUTH !== 'true') {
      return { isAuthenticated: true }
    }

    const hasClerkServerConfig = Boolean(
      process.env.CLERK_SECRET_KEY &&
      (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        process.env.VITE_CLERK_PUBLISHABLE_KEY ||
        process.env.CLERK_PUBLISHABLE_KEY),
    )
    if (!hasClerkServerConfig) {
      return { isAuthenticated: false }
    }

    try {
      const { isAuthenticated } = await auth()
      return { isAuthenticated }
    } catch {
      return { isAuthenticated: false }
    }
  },
)

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated } = await getAdminRouteAuth()
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: safeAuthRedirect(
            `${location.pathname}${stringifyLocationSearch(location.search)}${
              location.hash ? `#${location.hash}` : ''
            }`,
          ),
        },
      })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return <Outlet />
}
