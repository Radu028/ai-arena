import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router'
import { TerminalIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useReducedMotion } from 'motion/react'
import { useAnimate } from 'motion/react-mini'
import * as m from 'motion/react-m'
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
import { Button } from '#/components/ui/button'
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
  errorComponent: RootErrorBoundary,
  notFoundComponent: NotFoundPage,
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
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const root = scope.current
    const targets = Array.from(root.querySelectorAll('[data-reveal]'))
    const controls = targets.map((target, index) =>
      animate(
        target,
        shouldReduceMotion
          ? { opacity: 1, y: 0 }
          : { opacity: [0, 1], y: [18, 0] },
        {
          delay: shouldReduceMotion ? 0 : index * 0.045,
          duration: shouldReduceMotion ? 0 : 0.55,
          ease: [0.22, 1, 0.36, 1],
        },
      ),
    )

    return () => {
      controls.forEach((control) => control.stop())
    }
  }, [animate, pathname, scope, shouldReduceMotion])

  return (
    <div ref={scope} className="flex min-h-screen flex-col">
      <Header />
      <m.main
        key={pathname}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.36,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex-1 pt-6 pb-16 sm:pt-10"
      >
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
      </m.main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="shell">
      <Empty className="surface rounded-2xl p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TerminalIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            This link does not match an AI Arena page. Use the join screen if
            you have a code, or return to the home page.
          </EmptyDescription>
        </EmptyHeader>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/join">Join with code</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </Empty>
    </div>
  )
}

function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="shell">
      <Empty className="surface rounded-2xl p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TerminalIcon />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            The route failed while rendering. Try again, or return home and
            reopen the page.
          </EmptyDescription>
          <p className="max-w-2xl break-words rounded-lg bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
            {formatRootError(error)}
          </p>
        </EmptyHeader>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={() => reset()}>
            Retry
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </Empty>
    </div>
  )
}

function formatRootError(error: Error) {
  const message = error.message.trim()
  if (!message) {
    return 'Unknown route error'
  }
  if (message.startsWith('<!DOCTYPE html') || message.includes('<html')) {
    const status =
      message.match(/Error code\s*(\d{3})/i)?.[1] ??
      message.match(/<title>[^<]*?\b(\d{3})\b[^<]*<\/title>/i)?.[1] ??
      'upstream'
    return `Upstream service returned ${status}.`
  }
  return message
}
