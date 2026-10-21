import { useEffect, useState } from 'react'

/**
 * Whether the page has scrolled past `threshold` pixels.
 *
 * Passive listener, and the state only changes when the verdict flips, so the
 * header re-renders twice per page rather than on every scroll frame.
 */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > threshold)

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [threshold])

  return scrolled
}
