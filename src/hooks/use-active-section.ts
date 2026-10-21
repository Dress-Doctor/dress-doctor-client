import { useEffect, useState } from 'react'

/**
 * Which of a page's sections the reader is currently in.
 *
 * Drives the highlighted entry in the "on this page" list. A section counts as
 * current while it crosses a band that starts just under the sticky header and
 * ends at about the middle of the screen, and the first such section in
 * reading order wins. Between two sections nothing crosses the band, so the
 * last answer stands instead of the highlight flickering off.
 */
export function useActiveSection(ids: readonly string[], offset = 120) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const crossing = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id)
          else crossing.delete(entry.target.id)
        }

        const current = ids.find((id) => crossing.has(id))
        if (current) setActive(current)
      },
      { rootMargin: `-${offset}px 0px -55% 0px` },
    )

    for (const id of ids) {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    }

    return () => observer.disconnect()
  }, [ids, offset])

  return active
}
