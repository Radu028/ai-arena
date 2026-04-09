import { layout, prepare } from '@chenglou/pretext'
import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'

type LayoutMetrics = {
  height: number
  lineCount: number
}

const preparedCache = new Map<string, ReturnType<typeof prepare>>()

function getPrepared(text: string, font: string) {
  const cacheKey = `${font}::${text}`
  const cached = preparedCache.get(cacheKey)
  if (cached) {
    return cached
  }
  const preparedText = prepare(text, font)
  preparedCache.set(cacheKey, preparedText)
  return preparedText
}

export function usePretextBlock(
  text: string | null,
  font: string,
  lineHeight: number,
) {
  const ref = useRef<HTMLDivElement | null>(null)
  const deferredText = useDeferredValue(text)
  const [metrics, setMetrics] = useState<LayoutMetrics | null>(null)

  const measure = useEffectEvent(async () => {
    if (!ref.current || !deferredText) {
      setMetrics(null)
      return
    }
    await document.fonts.ready
    const width = ref.current.clientWidth
    if (!width) {
      return
    }
    const preparedText = getPrepared(deferredText, font)
    setMetrics(layout(preparedText, width, lineHeight))
  })

  useEffect(() => {
    void measure()
    if (!ref.current) {
      return
    }
    const observer = new ResizeObserver(() => {
      void measure()
    })
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
    }
  }, [deferredText, font, lineHeight, measure])

  return {
    ref,
    metrics,
  }
}
