import { orderSteps } from '#/data/account.data'
import { pickupWindows } from '#/data/booking.data'
import type {
  BillingCycleDto,
  MyPlanDto,
  MyProfileDto,
  MySubscriptionDto,
  OrderStatusDto,
  PlanStatusDto,
  UpdateProfileDataDto,
} from '#/interfaces/account.dto'
import { getLocale } from '#/paraglide/runtime'
import { m } from '#/paraglide/messages'
import utils from '#/libs/utils'
import { formatInternational, readInternational } from '#/libs/phone'

/**
 * Dates are written in the shop's own time zone, not the reader's or the
 * server's. A page is drawn once on the server and again in the browser; if
 * each used its own zone, a time near midnight would read as two different
 * days and the page would flash when it woke up.
 */
const SHOP_TIME_ZONE = 'Africa/Douala'

/**
 * British day-first order for English ("21 Oct 2026"), since the site is written
 * in British English and the bare `en` locale would give the American order.
 */
const dateLocale = () => (getLocale() === 'en' ? 'en-GB' : getLocale())

const dateIn = (
  value: string | undefined,
  options: Intl.DateTimeFormatOptions,
) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat(dateLocale(), {
    timeZone: SHOP_TIME_ZONE,
    ...options,
  }).format(date)
}

/** "17 Oct 2026". */
export const formatDate = (value: string | undefined) =>
  dateIn(value, { day: 'numeric', month: 'short', year: 'numeric' })

/** "Wed, 21 Oct". The year is left off: a pickup is always soon. */
export const formatDay = (value: string | undefined) =>
  dateIn(value, { weekday: 'short', day: 'numeric', month: 'short' })

/** "Wed, 21 Oct · Morning (8am – 12pm)". */
export function formatPickupWhen(pickupDate: string, pickupTime: string) {
  const day = formatDay(pickupDate) ?? pickupDate
  const window = pickupWindows.find((item) => item.apiValue === pickupTime)
  return `${day} · ${window ? `${window.label()} (${window.hours()})` : pickupTime}`
}

/** "40 000 XAF". Whole francs: the shop has no coins smaller than that. */
export const formatMoney = (amount: number) => utils.toXaf(amount)

/**
 * A number the API holds as digits with the country code, written to be read:
 * `237699000111` becomes `+237 699 000 111`. A number the list of countries
 * cannot place is shown as `+` and its digits, never dropped.
 */
export function formatPhone(digits: string | undefined): string | undefined {
  if (!digits) return undefined
  const only = utils.digitsOnly(digits)
  if (!only) return undefined
  const parsed = readInternational(`+${only}`)
  return parsed
    ? formatInternational(parsed.country, parsed.national)
    : `+${only}`
}

/** The language the receipt is asked for in: the one the reader is using. */
export const receiptLanguage = (): 'en' | 'fr' =>
  getLocale() === 'fr' ? 'fr' : 'en'

/* -------------------------------------------------------------------------- */
/*                                   Orders                                   */
/* -------------------------------------------------------------------------- */

/**
 * How far along an order is, as a position in `orderSteps`. `-1` for an order
 * that is not on the way at all (not yet confirmed, or cancelled), so a screen
 * shows no progress rather than a wrong one.
 */
export function orderStep(status: OrderStatusDto | null | undefined): number {
  if (!status) return -1
  return (orderSteps as readonly OrderStatusDto[]).indexOf(status)
}

/**
 * The difference between what the items add up to and what the customer owes:
 * below zero is a discount, above zero is something added. It is worked out
 * from the two totals, so the lines on screen always add up to the total
 * whatever the shop's own discount rules were.
 */
export const orderAdjustment = (order: {
  orderAmount: number
  totalAmount: number
}) => order.totalAmount - order.orderAmount

/** A cancelled order has nothing left to follow, pay or collect. */
export const isOrderCancelled = (status: OrderStatusDto | null | undefined) =>
  status === 'CANCELLED'

/* -------------------------------------------------------------------------- */
/*                                    Plans                                   */
/* -------------------------------------------------------------------------- */

export type PlanTierDto = 'basic' | 'standard' | 'premium'

/**
 * The tier a plan code names: `standard-kg-quarterly` is `standard`. Anything
 * the website does not know is `undefined`, and the plan's own name is used.
 */
export function planTier(code: string | undefined): PlanTierDto | undefined {
  const tier = code?.split('-')[0]
  return tier === 'basic' || tier === 'standard' || tier === 'premium'
    ? tier
    : undefined
}

const tierNames: Record<PlanTierDto, () => string> = {
  basic: m.home_plan_basic_name,
  standard: m.home_plan_standard_name,
  premium: m.home_plan_premium_name,
}

/** The plan's name in the reader's language, or the API's when it is a new one. */
export function planName(plan: MyPlanDto | null | undefined): string {
  if (!plan) return m.account_plan_unknown()
  const tier = planTier(plan.code)
  return tier ? tierNames[tier]() : plan.planName
}

/** "40 pieces" or "23 kg". */
export function allowanceText(
  quotaType: MySubscriptionDto['quotaType'],
  amount: number,
): string {
  return quotaType === 'PIECES'
    ? m.account_plan_pieces({ count: amount })
    : m.account_plan_kg({ count: amount })
}

/** "every month" or "every 3 months". */
export const cycleText = (cycle: BillingCycleDto) =>
  cycle === 'QUARTERLY'
    ? m.account_plan_everyQuarter()
    : m.account_plan_everyMonth()

/** What the customer pays each cycle: the price they were quoted, or today's. */
export const planPrice = (
  subscription: MySubscriptionDto,
): number | undefined => subscription.price ?? subscription.planId?.price

export interface QuotaMeterDto {
  /** The allowance for the period. */
  total: number
  /** What is left, never below nothing. */
  left: number
  used: number
  /** 0 to 100: how much of the allowance has been used. */
  percentUsed: number
}

/**
 * How much of the period's allowance is gone. What is carried over from last
 * period can leave more than the plan's own allowance; the meter then reads as
 * full rather than going past the end.
 */
export function quotaMeter(subscription: MySubscriptionDto): QuotaMeterDto {
  const total = Math.max(subscription.quotaAmount, 0)
  const left = Math.max(subscription.remainingQuota, 0)
  const used = Math.max(total - left, 0)
  const percentUsed =
    total === 0 ? 0 : Math.min(Math.round((used / total) * 100), 100)
  return { total, left, used, percentUsed }
}

/** The statuses a plan is still alive in. */
const LIVE: readonly PlanStatusDto[] = ['ACTIVE', 'PAUSED']

/**
 * Which of the customer's plans to put first: the one running (or on hold),
 * else a request still waiting for us, else the plan that ended last, so the
 * customer can see why it ended and renew it. The rest, newest first, are
 * history.
 */
export function splitPlans(subscriptions: readonly MySubscriptionDto[]): {
  current: MySubscriptionDto | undefined
  earlier: MySubscriptionDto[]
} {
  const current =
    subscriptions.find((item) => LIVE.includes(item.status)) ??
    subscriptions.find((item) => item.status === 'PENDING') ??
    subscriptions.find((item) => item.status === 'EXPIRED')

  return {
    current,
    earlier: subscriptions.filter((item) => item !== current),
  }
}

export interface PlanActionsDto {
  pause: boolean
  resume: boolean
  /** Ends a live plan, or takes back a request. */
  cancel: boolean
  /** Says yes to another period. */
  renew: boolean
}

/**
 * Which buttons a plan in this status offers. The API checks again.
 *
 * Renewing is offered on a plan that has ended, whichever way, and on a running
 * one only once it is due to answer and has not answered already.
 */
export function planActions(
  status: PlanStatusDto,
  plan: Pick<MySubscriptionDto, 'awaitingRenewal' | 'renewalConfirmed'> = {},
): PlanActionsDto {
  return {
    pause: status === 'ACTIVE',
    resume: status === 'PAUSED',
    cancel: status === 'ACTIVE' || status === 'PAUSED' || status === 'PENDING',
    renew:
      status === 'EXPIRED' ||
      (status === 'ACTIVE' && !!plan.awaitingRenewal && !plan.renewalConfirmed),
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Details                                  */
/* -------------------------------------------------------------------------- */

/** The saved address as it is sent: trimmed, so spaces alone are not an address. */
const tidy = (value: string | undefined) => (value ?? '').trim()

/** The part of the profile a customer can edit, as the form holds it. */
export interface ProfileDraftDto {
  preferredLanguage: 'en' | 'fr'
  notificationsOptIn: boolean
  pickupAddress: string
}

export const draftFromProfile = (profile: MyProfileDto): ProfileDraftDto => ({
  preferredLanguage: profile.preferredLanguage === 'fr' ? 'fr' : 'en',
  notificationsOptIn: profile.notificationsOptIn,
  pickupAddress: profile.pickupAddress ?? '',
})

/**
 * Only what the customer changed, or `undefined` when nothing changed. Sending
 * the fields they left alone would write an audit row for each of them.
 */
export function profileChanges(
  profile: MyProfileDto,
  draft: ProfileDraftDto,
): UpdateProfileDataDto | undefined {
  const before = draftFromProfile(profile)
  const changes: UpdateProfileDataDto = {}

  if (draft.preferredLanguage !== before.preferredLanguage) {
    changes.preferredLanguage = draft.preferredLanguage
  }
  if (draft.notificationsOptIn !== before.notificationsOptIn) {
    changes.notificationsOptIn = draft.notificationsOptIn
  }
  if (tidy(draft.pickupAddress) !== tidy(before.pickupAddress)) {
    changes.pickupAddress = tidy(draft.pickupAddress)
  }

  return Object.keys(changes).length > 0 ? changes : undefined
}

/** The longest saved address the API takes. */
export const ADDRESS_MAX = 500
