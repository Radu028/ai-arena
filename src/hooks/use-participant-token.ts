import { useEffect, useState } from 'react'

const STORAGE_PREFIX = 'ai-arena.participant'

function readToken(slug: string) {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(`${STORAGE_PREFIX}.${slug}`)
}

export function useParticipantToken(slug: string) {
  const [token, setTokenState] = useState<string | null>(null)

  useEffect(() => {
    setTokenState(readToken(slug))
  }, [slug])

  function setToken(nextToken: string | null) {
    setTokenState(nextToken)
    if (typeof window === 'undefined') {
      return
    }
    const key = `${STORAGE_PREFIX}.${slug}`
    if (nextToken) {
      window.localStorage.setItem(key, nextToken)
      return
    }
    window.localStorage.removeItem(key)
  }

  return [token, setToken] as const
}
