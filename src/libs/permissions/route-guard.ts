import { meQueryOptions } from '#/hooks/useMe'
import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { buildAbility } from './ability'
import type { RequiredPermission } from './ability'

/**
 * The least a route's `beforeLoad` gives us: the router context carrying the
 * query client, and where the person was trying to go. Every route hands over
 * more than this — search params, path params — and the guard passes all of it
 * through untouched to whatever runs next.
 */
type GuardArgs = {
  context: { queryClient: QueryClient }
  /*
   * Structural on purpose, rather than TanStack's `ParsedLocation`: that type
   * is generic over the route's own search shape, so naming it here would make
   * this guard assignable to some routes' `beforeLoad` and not others. The
   * href is the only part the guard reads.
   */
  location: { href: string }
}

/**
 * The permission gate every admin route goes through.
 *
 * `_authed` above has already proven a session exists and primed the `me`
 * query, so this reads that same cache rather than fetching again — on the
 * server during SSR and on the client after hydration alike. A route reached
 * by typing its URL gets the same verdict as one reached by clicking a link,
 * which is the whole point: the sidebar hides what you cannot use, and this
 * stops you walking around the sidebar.
 *
 * This is a UX boundary, not a security one. It decides which screen you are
 * shown; the API decides what you may actually read or write, and refuses
 * every request on its own authority whatever this says. Never move a check
 * here from there.
 *
 * Bind it to a `const` above the route and hand that to `beforeLoad`:
 *
 * ```ts
 * const beforeLoad = requirePermission(PERMISSIONS.orders)
 *
 * export const Route = createFileRoute('/_authed/admin/orders/')({
 *   beforeLoad,
 *   // …
 * })
 * ```
 *
 * or wrap what the route already did — a list route settling its search
 * defaults, say — so the two run in order rather than fighting over the hook:
 *
 * ```ts
 * const beforeLoad = requirePermission(
 *   PERMISSIONS.orders,
 *   listSearchDefaults<OrderSearchDto>(SEARCH_DEFAULTS),
 * )
 * ```
 *
 * The `const` is not a style preference. Calling this inline inside the route
 * options object puts the call in the path of TanStack's own inference for the
 * route — it contextually types the call against the `beforeLoad` slot before
 * this function's own types settle, and the generic resolves against that
 * instead of against the arguments. Binding it first gives TypeScript a
 * finished type to check, and the assignment then passes on shape alone.
 *
 * The argument type is an intersection rather than one generic: what the guard
 * itself needs (`GuardArgs`) plus whatever `next` needs on top. That way
 * composing with a function that only reads `search` widens the accepted
 * argument instead of narrowing it, and the route still passes its own richer
 * context through unchanged.
 */
export function requirePermission<TNext extends object = object>(
  permission: RequiredPermission,
  next?: (args: TNext) => void,
): (args: GuardArgs & TNext) => Promise<void> {
  return async (args) => {
    const { queryClient } = args.context
    const session = await queryClient.ensureQueryData(meQueryOptions())

    // `ensureQueryData` returns the raw response — `select` only runs for
    // observers — so the rules sit under `data`, the same place `useMe` reads
    // them from before building its own copy of this ability.
    const ability = buildAbility(session.data?.abilities ?? [])

    if (!ability.can(...permission)) {
      throw redirect({
        to: '/admin/forbidden',
        // Carried so the page can name what was out of reach. `href` rather
        // than `pathname`: a filtered list is a different destination from the
        // bare one, and saying so is more use than a truncated path.
        search: { from: args.location.href },
      })
    }

    next?.(args)
  }
}
