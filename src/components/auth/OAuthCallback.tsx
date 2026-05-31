import { useClerk, useSignIn, useSignUp } from '@clerk/tanstack-react-start'
import { useEffect, useRef, useState } from 'react'
import { safeAuthRedirect } from '#/lib/authRedirect'

export function OAuthCallback() {
  const clerk = useClerk()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const hasRun = useRef(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const redirectTo = getSsoRedirect()

  useEffect(() => {
    if (!clerk.loaded || hasRun.current) return
    hasRun.current = true

    const navigateAfterFinalize = async ({
      decorateUrl,
    }: {
      decorateUrl: (url: string) => string
    }) => {
      window.location.assign(decorateUrl(redirectTo))
    }

    const completeOAuth = async () => {
      if (signIn.status === 'complete') {
        const { error } = await signIn.finalize({
          navigate: navigateAfterFinalize,
        })
        if (error) throw error
        return
      }

      if (signUp.status === 'complete') {
        const { error } = await signUp.finalize({
          navigate: navigateAfterFinalize,
        })
        if (error) throw error
        return
      }

      if (signUp.isTransferable) {
        const { error } = await signIn.create({ transfer: true })
        if (error) throw error
        const finalizeResult = await signIn.finalize({
          navigate: navigateAfterFinalize,
        })
        if (finalizeResult.error) throw finalizeResult.error
        return
      }

      if (signIn.isTransferable) {
        const { error } = await signUp.create({ transfer: true })
        if (error) throw error
        const finalizeResult = await signUp.finalize({
          navigate: navigateAfterFinalize,
        })
        if (finalizeResult.error) throw finalizeResult.error
        return
      }

      throw new Error('Could not complete the Google sign-in flow.')
    }

    void completeOAuth().catch((error: unknown) => {
      setErrorMessage(
        getClerkErrorMessage(error, 'Could not complete Google sign-in.'),
      )
    })
  }, [clerk.loaded, redirectTo, signIn, signUp])

  return (
    <>
      <div id="clerk-captcha" />
      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </>
  )
}

function getSsoRedirect() {
  if (typeof window === 'undefined') {
    return safeAuthRedirect(null)
  }
  return safeAuthRedirect(
    new URLSearchParams(window.location.search).get('redirect'),
  )
}

function getClerkErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message
  ) {
    return error.message
  }
  if (
    error &&
    typeof error === 'object' &&
    'longMessage' in error &&
    typeof error.longMessage === 'string' &&
    error.longMessage
  ) {
    return error.longMessage
  }
  return fallback
}
