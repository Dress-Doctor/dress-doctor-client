import type { AbilityRuleDto } from '#/interfaces/login.dto'
import type { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSIONS } from './ability'
import { requirePermission } from './route-guard'

/**
 * These cover the thing the guard exists for: someone typing a URL for a page
 * their role does not cover gets turned away, and someone whose role does
 * cover it is let through untouched.
 *
 * The session is stubbed rather than fetched. `requirePermission` reads it
 * through `queryClient.ensureQueryData`, so a fake client with canned rules
 * exercises the real decision — `buildAbility` and the CASL check both run for
 * real — without a network or a router in the way.
 */

/** A query client that answers `/me` with exactly these CASL rules. */
const clientWith = (abilities: AbilityRuleDto[]) =>
  ({
    ensureQueryData: vi.fn().mockResolvedValue({ data: { abilities } }),
  }) as unknown as QueryClient

const argsFor = (
  abilities: AbilityRuleDto[],
  href = '/admin/orders?page=1',
) => ({
  context: { queryClient: clientWith(abilities) },
  location: { href },
})

/** What a MANAGER carries: one wildcard rule over everything. */
const MANAGES_EVERYTHING: AbilityRuleDto[] = [
  { action: 'manage', subject: 'all' },
]

/** A cashier: payments only, nothing else. */
const CASHIER: AbilityRuleDto[] = [
  { action: 'CREATE', subject: 'Payment' },
  { action: 'READ', subject: 'Payment' },
  { action: 'UPDATE', subject: 'Payment' },
]

/**
 * The shape `redirect()` throws, as much of it as these tests care about.
 * Everything sits under `options` — the thrown value is the redirect wrapper,
 * not the arguments it was built from.
 */
type ThrownRedirect = { options?: { to?: string; search?: { from?: string } } }

const runGuard = async (
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS],
  abilities: AbilityRuleDto[],
  href?: string,
) => {
  const guard = requirePermission(permission)
  return guard(argsFor(abilities, href))
}

describe('requirePermission — letting the right people through', () => {
  it('resolves for a role that holds the permission', async () => {
    await expect(
      runGuard(PERMISSIONS.orders, MANAGES_EVERYTHING),
    ).resolves.toBeUndefined()
  })

  it('resolves on a specific grant, not just the manage-all wildcard', async () => {
    await expect(
      runGuard(PERMISSIONS.payments, CASHIER),
    ).resolves.toBeUndefined()
  })

  it('runs whatever the route already did in its beforeLoad', async () => {
    const next = vi.fn()
    const guard = requirePermission(PERMISSIONS.payments, next)
    const args = argsFor(CASHIER)

    await guard(args)

    expect(next).toHaveBeenCalledOnce()
    // Passed through untouched, so a list route still settles its own search.
    expect(next).toHaveBeenCalledWith(args)
  })
})

describe('requirePermission — turning the wrong people away', () => {
  it('redirects to the forbidden page when the role lacks the permission', async () => {
    // A cashier reaching for the reference screen: no UserType grant at all.
    const thrown = (await runGuard(PERMISSIONS.reference, CASHIER).catch(
      (error: unknown) => error,
    )) as ThrownRedirect

    expect(thrown.options?.to).toBe('/admin/forbidden')
  })

  it('carries where they were headed, so the page can say so', async () => {
    const href = '/admin/settings/reference?tab=payment-types'
    const thrown = (await runGuard(PERMISSIONS.reference, CASHIER, href).catch(
      (error: unknown) => error,
    )) as ThrownRedirect

    expect(thrown.options?.search?.from).toBe(href)
  })

  it('does not run the route’s own beforeLoad when it turns someone away', async () => {
    const next = vi.fn()
    const guard = requirePermission(PERMISSIONS.reference, next)

    await guard(argsFor(CASHIER)).catch(() => undefined)

    expect(next).not.toHaveBeenCalled()
  })

  it('turns away a role with no rules at all', async () => {
    const thrown = (await runGuard(PERMISSIONS.orders, []).catch(
      (error: unknown) => error,
    )) as ThrownRedirect

    expect(thrown.options?.to).toBe('/admin/forbidden')
  })

  it('reads the right subject — holding one permission is not holding another', async () => {
    // The cashier holds Payment, so this proves the guard checks the subject
    // it was given rather than "has any rule at all".
    await expect(
      runGuard(PERMISSIONS.payments, CASHIER),
    ).resolves.toBeUndefined()

    const thrown = (await runGuard(PERMISSIONS.customers, CASHIER).catch(
      (error: unknown) => error,
    )) as ThrownRedirect
    expect(thrown.options?.to).toBe('/admin/forbidden')
  })
})

describe('requirePermission — leaving authentication alone', () => {
  it('lets a session failure through rather than calling it forbidden', async () => {
    // An expired session rejects here. `_authed` above already turns that into
    // a redirect to sign-in; the guard must not swallow it and send the person
    // to a page telling them they lack a permission they may well hold.
    const unauthenticated = {
      ensureQueryData: vi.fn().mockRejectedValue({ response: { status: 401 } }),
    } as unknown as QueryClient

    const guard = requirePermission(PERMISSIONS.orders)

    await expect(
      guard({
        context: { queryClient: unauthenticated },
        location: { href: '/admin/orders' },
      }),
    ).rejects.toMatchObject({ response: { status: 401 } })
  })
})
