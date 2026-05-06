import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { createContext, use } from 'react'
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
      afterSignOutUrl="/"
      signInUrl="/login"
      signUpUrl="/login"
    >
      <ConvexProviderWithClerk client={convexClient} useAuth={useConvexAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

function useConvexAuth() {
  const auth = useAuth()
  return {
    ...auth,
    // Convex needs the Clerk JWT template named "convex" so ctx.auth can see
    // mapped claims such as email. If the default session token has aud=convex,
    // ConvexProviderWithClerk would otherwise skip the template request.
    sessionClaims: null,
  }
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
  return use(RuntimeContext)
}
