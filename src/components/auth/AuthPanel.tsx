import { useAuth } from '@clerk/tanstack-react-start'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { GoogleSignInButton } from '#/components/GoogleSignInButton'
import { safeAuthRedirect } from '#/lib/authRedirect'

export function AuthPanel() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const redirectTo = getLoginRedirect()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void navigate({ to: redirectTo })
    }
  }, [isLoaded, isSignedIn, navigate, redirectTo])

  return (
    <div
      data-reveal
      className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-9"
    >
      <p className="eyebrow">Sign in</p>
      <h2 className="font-display mt-2 text-balance text-3xl leading-tight sm:text-4xl">
        Step into the arena.
      </h2>

      <div className="mt-6">
        <GoogleSignInButton
          redirectTo={redirectTo}
          label="Continue with Google"
        />
      </div>
    </div>
  )
}

function getLoginRedirect() {
  if (typeof window === 'undefined') {
    return safeAuthRedirect(null)
  }
  return safeAuthRedirect(
    new URLSearchParams(window.location.search).get('redirect'),
  )
}
