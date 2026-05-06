import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router'
import { TerminalIcon } from 'lucide-react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { AppProviders, useRuntimeConfig } from '#/components/AppProviders'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Toaster } from '#/components/ui/sonner'
import { useGlobalReveal } from '#/hooks/use-global-reveal'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AI Arena — Live model battles',
      },
      {
        name: 'description',
        content:
          'Run live battles between major AI models, with Host and Critic agents, public voting, and realtime results.',
      },
      {
        name: 'theme-color',
        content: '#16151f',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <AppProviders>
      <RootFrame />
    </AppProviders>
  )
}

function RootFrame() {
  const runtime = useRuntimeConfig()
  const { pathname } = useLocation()
  useGlobalReveal()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main key={pathname} className="page-enter flex-1 pt-6 pb-16 sm:pt-10">
        {runtime.hasConvex ? (
          <Outlet />
        ) : (
          <div className="shell">
            <Empty className="surface rounded-2xl p-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TerminalIcon />
                </EmptyMedia>
                <EmptyTitle>Convex is not configured yet</EmptyTitle>
                <EmptyDescription>
                  Add <code className="font-mono">VITE_CONVEX_URL</code> to your
                  environment, then restart the dev server.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  )
}
