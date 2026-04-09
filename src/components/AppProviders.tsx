import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { createContext, useContext } from 'react'
import { ThemeProvider } from 'next-themes'
import { runtimeConfig, runtimeFlags } from '#/lib/runtime'

const convexClient = runtimeFlags.hasConvex
  ? new ConvexReactClient(runtimeConfig.convexUrl)
  : null

type RuntimeContextValue = typeof runtimeConfig & typeof runtimeFlags

const RuntimeContext = createContext<RuntimeContextValue>({
  ...runtimeConfig,
  ...runtimeFlags,
})

const clerkAppearance = {
  elements: {
    card: 'border border-border/70 bg-card shadow-[0_18px_40px_rgba(20,28,44,0.08)]',
    headerTitle: 'font-serif text-2xl text-foreground',
    headerSubtitle: 'text-muted-foreground',
    formButtonPrimary:
      'bg-[var(--arena-signal)] text-white hover:bg-[color-mix(in_oklab,var(--arena-signal),black_10%)] shadow-none',
    socialButtonsBlockButton:
      'border-border bg-background text-foreground hover:bg-muted',
    formFieldInput:
      'border-border bg-background text-foreground shadow-none focus:border-ring focus:ring-2 focus:ring-ring/20',
    footerActionLink:
      'text-[var(--arena-cobalt)] hover:text-[color-mix(in_oklab,var(--arena-cobalt),black_14%)]',
    formFieldLabel: 'text-foreground',
    dividerLine: 'bg-border',
    dividerText: 'text-muted-foreground',
  },
}

function ConvexLayer({ children }: { children: React.ReactNode }) {
  if (!convexClient) {
    return <>{children}</>
  }

  if (!runtimeFlags.hasClerk) {
    return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
  }

  return (
    <ClerkProvider
      publishableKey={runtimeConfig.clerkPublishableKey}
      appearance={clerkAppearance}
      afterSignOutUrl="/"
    >
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RuntimeContext.Provider value={{ ...runtimeConfig, ...runtimeFlags }}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ConvexLayer>{children}</ConvexLayer>
      </ThemeProvider>
    </RuntimeContext.Provider>
  )
}

export function useRuntimeConfig() {
  return useContext(RuntimeContext)
}
