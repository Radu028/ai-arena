import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

/**
 * Walks the DOM looking for `[data-reveal]` elements and fades them in:
 *  - Anything currently within the viewport reveals immediately so we never
 *    leave above-the-fold content invisible because the IntersectionObserver
 *    decided it had nothing new to report.
 *  - Below-the-fold elements are observed and revealed when they enter view.
 *  - Newly-mounted nodes (e.g. async Convex queries that hydrate after the
 *    initial render) are picked up by a MutationObserver and treated the
 *    same way.
 *  - A 600ms hard cutoff guarantees nothing remains stuck at opacity:0 even
 *    if a future runtime bug breaks the observers.
 */
export function useGlobalReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    const reveal = (el: Element) => {
      if (el.getAttribute('data-revealed') === 'true') return
      el.setAttribute('data-revealed', 'true')
    }

    const isInViewport = (el: Element) => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const vw = window.innerWidth || document.documentElement.clientWidth
      return (
        rect.bottom >= 0 && rect.right >= 0 && rect.top <= vh && rect.left <= vw
      )
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -10% 0px' },
    )

    const seen = new WeakSet<Element>()

    const sweep = () => {
      const targets = document.querySelectorAll(
        '[data-reveal]:not([data-revealed])',
      )
      targets.forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        if (isInViewport(el)) {
          reveal(el)
        } else {
          observer.observe(el)
        }
      })
    }

    const initialFrame = requestAnimationFrame(() => sweep())
    const initialTimer = setTimeout(sweep, 80)

    const mutationObserver = new MutationObserver(() => sweep())
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    const fallbackTimer = setTimeout(() => {
      document
        .querySelectorAll('[data-reveal]:not([data-revealed])')
        .forEach(reveal)
    }, 600)

    return () => {
      cancelAnimationFrame(initialFrame)
      clearTimeout(initialTimer)
      clearTimeout(fallbackTimer)
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [pathname])
}
