import { bookingServices } from '#/data/booking.data'
import { homePlans } from '#/data/home.data'
import type { SiteSearchDto } from '#/interfaces/booking.dto'

/**
 * Reads one query value, dropping it rather than throwing when it is not one
 * we know — a mistyped link opens the page, not an error.
 */
export const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined =>
  typeof value === 'string' && allowed.includes(value as T)
    ? (value as T)
    : undefined

/** Checks the query parameters shared by every page of the public site. */
export function validateSiteSearch(
  search: Record<string, unknown>,
): SiteSearchDto {
  return {
    modal: oneOf(search.modal, ['booking', 'subscribe'] as const),
    service: oneOf(
      search.service,
      bookingServices.map((service) => service.id),
    ),
    tier: oneOf(
      search.tier,
      homePlans.map((plan) => plan.id),
    ),
    plan: oneOf(search.plan, ['pieces', 'kg'] as const),
    billing: oneOf(search.billing, ['monthly', 'quarterly'] as const),
  }
}
