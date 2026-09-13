import { Link as ChakraLink } from '@chakra-ui/react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import type { FileRoutesByTo } from '#/routeTree.gen'
import type { ReactNode } from 'react'

interface NavLinkProps {
  /** Typed against the generated route tree, so a dead link cannot compile. */
  to: keyof FileRoutesByTo
  children: ReactNode
}

/**
 * Shared pill styling for the header's primary links.
 *
 * Returned unannotated so the literal types survive: the same object is spread
 * onto a `ChakraLink` and onto the Services disclosure `Button`, and any single
 * component's prop type would carry that component's own DOM events and
 * `variant` union into the other.
 */
export const navLinkStyles = (active?: boolean) =>
  ({
    px: 3.5,
    py: 2.5,
    rounded: 'full',
    fontSize: 'sm',
    lineHeight: '1.2',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    fontWeight: active ? 'semibold' : 'medium',
    color: active ? 'site.ink' : 'site.ink-muted',
    bg: active ? 'rgba(46, 207, 220, 0.13)' : 'transparent',
    transitionProperty: 'color, background',
    transitionDuration: 'fast',
    _hover: { color: 'site.ink', bg: 'rgba(0, 23, 31, 0.045)' },
  }) as const

function NavLink({ to, children }: NavLinkProps) {
  const matchRoute = useMatchRoute()

  // Read here rather than from Link's `isActive` render prop, because the
  // styled element has to be the anchor itself — see the `asChild` note below.
  // `fuzzy` mirrors Link's default, so a child page still lights up its parent.
  const isActive = Boolean(matchRoute({ to, fuzzy: true }))

  return (
    // `asChild` so the router's anchor is the styled element — a Chakra Link of
    // its own would nest <a> inside <a> and desync SSR markup from hydration.
    <ChakraLink asChild {...navLinkStyles(isActive)}>
      <Link to={to} aria-current={isActive ? 'page' : undefined}>
        {children}
      </Link>
    </ChakraLink>
  )
}

export default NavLink
