import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createMiddleware, createStart } from '@tanstack/react-start'

const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ??
  process.env.VITE_CLERK_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  ''

const secretKey = process.env.CLERK_SECRET_KEY ?? ''
const enableClerkSsrAuth = process.env.VITE_ENABLE_CLERK_SSR_AUTH === 'true'

const clearStaleClerkSession = createMiddleware().server(
  async ({ request, next }) => {
    try {
      return await next()
    } catch (error) {
      if (!isClerkJwksMismatch(error)) {
        throw error
      }

      const headers = new Headers({
        'Clear-Site-Data': '"cookies"',
      })
      const cleanUrl = new URL(request.url)
      cleanUrl.searchParams.delete('__clerk_handshake')
      cleanUrl.searchParams.delete('__clerk_ticket')
      headers.set('Location', cleanUrl.toString())
      for (const cookieName of [
        '__session',
        '__client',
        '__clerk_db_jwt',
        '__refresh',
      ]) {
        headers.append(
          'Set-Cookie',
          `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax`,
        )
      }

      throw new Response(null, { status: 307, headers })
    }
  },
)

function isClerkJwksMismatch(error: unknown) {
  return stringifyError(error).includes('jwk-kid-mismatch')
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return [
      error.message,
      stringifyError(error.cause),
      'data' in error ? stringifyError(error.data) : '',
      'body' in error ? stringifyError(error.body) : '',
    ].join('\n')
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }
  return ''
}

export const startInstance = createStart(() => ({
  requestMiddleware:
    enableClerkSsrAuth && publishableKey && secretKey
      ? [clearStaleClerkSession, clerkMiddleware({ publishableKey, secretKey })]
      : [],
}))
