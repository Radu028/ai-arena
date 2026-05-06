import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

export function useGlobalReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', 'true')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.07 },
    )

    const observeAll = () => {
      const targets = document.querySelectorAll(
        '[data-reveal]:not([data-revealed])',
      )
      targets.forEach((el) => observer.observe(el))
    }

    const timer = setTimeout(observeAll, 60)

    const mutationObserver = new MutationObserver(() => {
      observeAll()
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-reveal'],
    })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [pathname])
}
