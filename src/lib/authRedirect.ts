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

export function stringifyLocationSearch(
  search: unknown,
): string {
  if (typeof search === 'string') {
    return search.startsWith('?') || search.length === 0 ? search : `?${search}`
  }
  if (search && typeof search === 'object') {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(search as Record<string, unknown>)) {
      if (value === undefined || value === null) continue
      params.append(key, String(value))
    }
    const out = params.toString()
    return out.length > 0 ? `?${out}` : ''
  }
  return ''
}
