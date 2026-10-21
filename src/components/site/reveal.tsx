import { Box } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useInView } from '#/hooks/use-in-view'
import { useReducedMotion } from '#/hooks/use-reduced-motion'

interface RevealProps extends BoxProps {
  /** Stagger, in milliseconds, for siblings that should arrive in sequence. */
  delay?: number
}

/**
 * Lifts a block into place the first time it is scrolled to.
 *
 * Nothing is hidden until the browser has confirmed it can animate: the markup
 * renders at full opacity on the server and stays that way for a reader with
 * JavaScript off or reduced motion on, so the page is never a blank column
 * waiting on a script.
 */
function Reveal({ delay = 0, children, ...props }: RevealProps) {
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 })
  const [armed, setArmed] = useState(false)

  useEffect(() => setArmed(true), [])

  const animate = armed && !reduced
  const hidden = animate && !inView

  return (
    <Box
      ref={ref}
      opacity={hidden ? 0 : 1}
      transform={hidden ? 'translateY(26px)' : 'translateY(0)'}
      transitionProperty={animate ? 'opacity, transform' : undefined}
      transitionDuration={animate ? '750ms' : undefined}
      transitionTimingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
      transitionDelay={animate ? `${delay}ms` : undefined}
      {...props}
    >
      {children}
    </Box>
  )
}

export default Reveal
