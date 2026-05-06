export const DEFAULT_AUTH_REDIRECT = '/admin'

export function safeAuthRedirect(value: string | null | undefined) {
  if (!value) {
    return DEFAULT_AUTH_REDIRECT
  }

  const trimmed = value.trim()
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/login') ||
    trimmed.startsWith('/register') ||
    trimmed.startsWith('/sso-callback')
  ) {
    return DEFAULT_AUTH_REDIRECT
  }

  return trimmed
}

export function currentAuthRedirect() {
  if (typeof window === 'undefined') {
    return DEFAULT_AUTH_REDIRECT
  }

  return safeAuthRedirect(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  )
}
