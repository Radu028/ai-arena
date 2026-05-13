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

type PretextOptions = Parameters<typeof prepare>[2]

const preparedCache = new Map<string, ReturnType<typeof prepare>>()

function getPrepared(text: string, font: string, options?: PretextOptions) {
  const cacheKey = `${font}::${JSON.stringify(options ?? {})}::${text}`
  const cached = preparedCache.get(cacheKey)
  if (cached) {
    return cached
  }
  const preparedText = prepare(text, font, options)
  preparedCache.set(cacheKey, preparedText)
  return preparedText
}

export function usePretextBlock<TElement extends HTMLElement = HTMLDivElement>(
  text: string | null,
  font: string,
  lineHeight: number,
  options?: PretextOptions,
) {
  const ref = useRef<TElement | null>(null)
  const deferredText = useDeferredValue(text)
  const [metrics, setMetrics] = useState<LayoutMetrics | null>(null)

  const measure = useEffectEvent(async () => {
    const node = ref.current
    if (!node || !deferredText) {
      setMetrics(null)
      return
    }
    await document.fonts.ready
    if (!node.isConnected) {
      return
    }
    const width = node.clientWidth
    if (!width) {
      return
    }
    const preparedText = getPrepared(deferredText, font, options)
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
  }, [deferredText, font, lineHeight, measure, options])

  return {
    ref,
    metrics,
  }
}
