export const runtimeConfig = {
  convexUrl: import.meta.env.VITE_CONVEX_URL ?? '',
  clerkPublishableKey:
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
    import.meta.env.CLERK_PUBLISHABLE_KEY ??
    '',
  allowDemoAdmin: import.meta.env.VITE_ALLOW_DEMO_ADMIN === 'true',
}

export const runtimeFlags = {
  hasConvex: runtimeConfig.convexUrl.length > 0,
  hasClerk: runtimeConfig.clerkPublishableKey.length > 0,
  hasDemoAdmin: import.meta.env.DEV || runtimeConfig.allowDemoAdmin,
}
