import { createFileRoute } from '@tanstack/react-router'
import PagePlaceholder from '#/routes/_site/-components/page-placeholder'
import type {
  KgServiceIdDto,
  PlanBillingDto,
  PlanModeDto,
} from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'
import { noIndexHead } from '#/libs/seo'

/**
 * What the home page hands the booking form: which service the visitor priced,
 * and — when they arrived from a plan card — the plan and the allowance and
 * billing options they had selected.
 */
export interface BookingSearch {
  service?: KgServiceIdDto | 'perpiece' | 'plan'
  plan?: string
  mode?: PlanModeDto
  billing?: PlanBillingDto
}

const asOneOf = <T extends string>(value: unknown, allowed: readonly T[]) =>
  allowed.includes(value as T) ? (value as T) : undefined

export const Route = createFileRoute('/_site/booking')({
  // Hand-written rather than schema-validated: these are hints for a form that
  // does not exist yet, so an unknown value is dropped instead of throwing a
  // visitor out of a booking flow.
  validateSearch: (search: Record<string, unknown>): BookingSearch => ({
    service: asOneOf(search.service, [
      'washFold',
      'washIron',
      'perpiece',
      'plan',
    ] as const),
    plan: typeof search.plan === 'string' ? search.plan : undefined,
    mode: asOneOf(search.mode, ['pieces', 'kg'] as const),
    billing: asOneOf(search.billing, ['monthly', 'quarterly'] as const),
  }),
  head: noIndexHead,
  component: () => <PagePlaceholder title={m.site_nav_bookPickup()} />,
})
