import type { ReactNode } from 'react'
import * as m from 'motion/react-m'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  as?: 'div' | 'section' | 'header'
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  as = 'div',
}: RevealProps) {
  const offset = getOffset(direction)
  const motionProps = {
    initial: { opacity: 0, ...offset },
    whileInView: { opacity: 1, x: 0, y: 0 },
    viewport: { once: true, amount: 0.16, margin: '0px 0px -10% 0px' },
    transition: {
      delay: delay / 1000,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
    className,
    children,
  } as const

  if (as === 'section') return <m.section {...motionProps} />
  if (as === 'header') return <m.header {...motionProps} />
  return <m.div {...motionProps} />
}

function getOffset(direction: RevealProps['direction']) {
  switch (direction) {
    case 'down':
      return { y: -18 }
    case 'left':
      return { x: 18 }
    case 'right':
      return { x: -18 }
    case 'up':
    default:
      return { y: 18 }
  }
}
