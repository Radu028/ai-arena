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

    const timer = setTimeout(() => {
      const targets = document.querySelectorAll('[data-reveal]')
      targets.forEach((el) => {
        el.removeAttribute('data-revealed')
        observer.observe(el)
      })
    }, 60)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname])
}
