import { useEffect, useState } from 'react'
import { useInView } from '#/hooks/use-in-view'
import { useReducedMotion } from '#/hooks/use-reduced-motion'

const DURATION = 1400

interface Options {
  /** Decimal places to hold while counting — `4.9` needs one. */
  decimals?: number
}

/**
 * Counts a figure up from zero the first time it scrolls into view.
 *
 * The final value is what renders on the server and before the element is
 * seen, so the number is correct with JavaScript disabled, correct for a
 * reader who asked for reduced motion, and correct to a crawler.
 */
export function useCountUp<T extends HTMLElement>(
  target: number,
  { decimals = 0 }: Options = {},
) {
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<T>({ threshold: 0.5 })
  const [value, setValue] = useState(target)

  useEffect(() => {
    if (!inView || reduced) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    // Reset before the first frame so the figure grows from zero rather than
    // dropping from its final value on the observer's first tick.
    setValue(0)

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1)
      // Cubic ease-out: fast off the mark, settling onto the real figure.
      const eased = 1 - Math.pow(1 - progress, 3)

      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduced, target])

  const text = decimals
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString('en-US')

  return { ref, text }
}
