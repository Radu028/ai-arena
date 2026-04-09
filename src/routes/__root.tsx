import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { AppProviders, useRuntimeConfig } from '#/components/AppProviders'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Toaster } from '#/components/ui/sonner'
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
        title: 'AI Arena',
      },
      {
        name: 'description',
        content:
          'Run live battles between major AI models, with Host and Critic agents, public voting, and realtime results.',
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        {runtime.hasConvex ? (
          <Outlet />
        ) : (
          <div className="page-frame">
            <Card className="arena-panel">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">
                  Convex is not configured yet
                </CardTitle>
                <CardDescription>
                  Add `VITE_CONVEX_URL` to the environment before rendering the
                  live app.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  )
}
