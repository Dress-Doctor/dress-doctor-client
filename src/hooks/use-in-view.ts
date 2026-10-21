import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Fraction of the element that has to be on screen to count as seen. */
  threshold?: number
  /** Stop observing after the first intersection. */
  once?: boolean
}

/**
 * Reports when an element first scrolls into view.
 *
 * One observer per element rather than a shared one: the sections that use this
 * are few, and a per-element observer can disconnect itself the moment it has
 * fired, which is what both callers want.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.15,
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // No observer (very old browsers, or a non-DOM test environment) means the
    // content should simply be visible rather than stuck in its hidden state.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (!once) setInView(false)
          return
        }

        setInView(true)
        if (once) observer.disconnect()
      },
      { threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once, threshold])

  return { ref, inView }
}
