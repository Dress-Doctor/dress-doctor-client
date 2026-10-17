import { describe, expect, it } from 'vitest'
import type {
  MyPlanDto,
  MyProfileDto,
  MySubscriptionDto,
} from '#/interfaces/account.dto'
import {
  allowanceText,
  cycleText,
  formatDate,
  formatPhone,
  formatPickupWhen,
  orderAdjustment,
  orderStep,
  planActions,
  planName,
  planPrice,
  planTier,
  profileChanges,
  quotaMeter,
  splitPlans,
  draftFromProfile,
} from './account'

const plan: MyPlanDto = {
  _id: 'p1',
  planName: 'Standard',
  code: 'standard-pieces-monthly',
  price: 40000,
  billingCycle: 'MONTHLY',
  quotaType: 'PIECES',
  quotaAmount: 100,
}

const subscription = (
  over: Partial<MySubscriptionDto> = {},
): MySubscriptionDto => ({
  _id: 's1',
  status: 'ACTIVE',
  planId: plan,
  billingCycle: 'MONTHLY',
  quotaType: 'PIECES',
  quotaAmount: 100,
  remainingQuota: 60,
  createdAt: '2026-10-01T09:00:00.000Z',
  ...over,
})

const profile: MyProfileDto = {
  customerCode: 'CU-AH7LCH',
  firstName: 'Ada',
  lastName: 'Deo',
  phone: '237698765294',
  whatsappPhone: '237698765294',
  email: 'ada@example.com',
  phoneUnverified: false,
  preferredLanguage: 'en',
  pickupAddress: 'Bonapriso, Douala',
  notificationsOptIn: true,
}

describe('planTier and planName', () => {
  it('reads the tier from the plan code', () => {
    expect(planTier('standard-kg-quarterly')).toBe('standard')
    expect(planTier('basic-pieces-monthly')).toBe('basic')
    expect(planTier('premium-kg-monthly')).toBe('premium')
  })

  it('does not guess a tier it does not know', () => {
    expect(planTier('gold-kg-monthly')).toBeUndefined()
    expect(planTier(undefined)).toBeUndefined()
  })

  it('names a known tier in the reader’s language', () => {
    expect(planName(plan)).toBe('Standard')
  })

  it('falls back to the API’s name for a plan the site does not know', () => {
    expect(
      planName({ ...plan, code: 'gold-kg-monthly', planName: 'Gold' }),
    ).toBe('Gold')
  })

  it('has a name even when the plan is gone', () => {
    expect(planName(null)).toBe('Your plan')
  })
})

describe('allowance and billing words', () => {
  it('counts pieces, with the singular', () => {
    expect(allowanceText('PIECES', 40)).toBe('40 pieces')
    expect(allowanceText('PIECES', 1)).toBe('1 piece')
  })

  it('counts kilograms', () => {
    expect(allowanceText('WEIGHT_KG', 23)).toBe('23 kg')
  })

  it('says how often it bills', () => {
    expect(cycleText('MONTHLY')).toBe('every month')
    expect(cycleText('QUARTERLY')).toBe('every 3 months')
  })
})

describe('planPrice', () => {
  it('uses the price the customer was quoted, not today’s', () => {
    expect(planPrice(subscription({ price: 35000 }))).toBe(35000)
  })

  it('falls back to the plan’s price for an older plan with none kept', () => {
    expect(planPrice(subscription())).toBe(40000)
  })

  it('has no price when there is nothing to read one from', () => {
    expect(planPrice(subscription({ planId: null }))).toBeUndefined()
  })
})

describe('quotaMeter', () => {
  it('works out how much is used', () => {
    expect(quotaMeter(subscription())).toEqual({
      total: 100,
      left: 60,
      used: 40,
      percentUsed: 40,
    })
  })

  it('reads as full, not past the end, when it is all gone', () => {
    expect(quotaMeter(subscription({ remainingQuota: 0 })).percentUsed).toBe(
      100,
    )
  })

  it('reads as unused when more is left than the plan gives (carried over)', () => {
    const meter = quotaMeter(subscription({ remainingQuota: 130 }))
    expect(meter.used).toBe(0)
    expect(meter.percentUsed).toBe(0)
    expect(meter.left).toBe(130)
  })

  it('does not divide by nothing', () => {
    expect(
      quotaMeter(subscription({ quotaAmount: 0, remainingQuota: 0 }))
        .percentUsed,
    ).toBe(0)
  })
})

describe('splitPlans', () => {
  it('puts the running plan first and the rest in the history', () => {
    const cancelled = subscription({ _id: 'old', status: 'CANCELLED' })
    const active = subscription({ _id: 'now' })
    const { current, earlier } = splitPlans([cancelled, active])

    expect(current?._id).toBe('now')
    expect(earlier.map((item) => item._id)).toEqual(['old'])
  })

  it('treats a paused plan as the current one', () => {
    expect(
      splitPlans([subscription({ status: 'PAUSED' })]).current?.status,
    ).toBe('PAUSED')
  })

  it('shows a request that is still waiting when nothing is running', () => {
    const { current } = splitPlans([
      subscription({ _id: 'a', status: 'CANCELLED' }),
      subscription({ _id: 'b', status: 'PENDING' }),
    ])
    expect(current?._id).toBe('b')
  })

  it('has no current plan when every plan has ended', () => {
    const { current, earlier } = splitPlans([
      subscription({ status: 'CANCELLED' }),
      subscription({ status: 'EXPIRED' }),
    ])
    expect(current).toBeUndefined()
    expect(earlier).toHaveLength(2)
  })

  it('handles a customer who never had a plan', () => {
    expect(splitPlans([])).toEqual({ current: undefined, earlier: [] })
  })
})

describe('planActions', () => {
  it('lets a running plan be paused or ended', () => {
    expect(planActions('ACTIVE')).toEqual({
      pause: true,
      resume: false,
      cancel: true,
    })
  })

  it('lets a paused plan be resumed or ended', () => {
    expect(planActions('PAUSED')).toEqual({
      pause: false,
      resume: true,
      cancel: true,
    })
  })

  it('lets a waiting request be withdrawn, and nothing else', () => {
    expect(planActions('PENDING')).toEqual({
      pause: false,
      resume: false,
      cancel: true,
    })
  })

  it('offers nothing on a plan that has ended', () => {
    expect(planActions('CANCELLED')).toEqual({
      pause: false,
      resume: false,
      cancel: false,
    })
    expect(planActions('EXPIRED')).toEqual({
      pause: false,
      resume: false,
      cancel: false,
    })
  })
})

describe('profileChanges', () => {
  it('has nothing to send when nothing changed', () => {
    expect(profileChanges(profile, draftFromProfile(profile))).toBeUndefined()
  })

  it('sends only what changed', () => {
    expect(
      profileChanges(profile, {
        ...draftFromProfile(profile),
        preferredLanguage: 'fr',
      }),
    ).toEqual({ preferredLanguage: 'fr' })
  })

  it('sends a switched-off notification choice', () => {
    expect(
      profileChanges(profile, {
        ...draftFromProfile(profile),
        notificationsOptIn: false,
      }),
    ).toEqual({ notificationsOptIn: false })
  })

  it('trims the address it sends', () => {
    expect(
      profileChanges(profile, {
        ...draftFromProfile(profile),
        pickupAddress: '  Akwa, near the market  ',
      }),
    ).toEqual({ pickupAddress: 'Akwa, near the market' })
  })

  it('does not call extra spaces a change', () => {
    expect(
      profileChanges(profile, {
        ...draftFromProfile(profile),
        pickupAddress: '  Bonapriso, Douala ',
      }),
    ).toBeUndefined()
  })

  it('never sends a contact', () => {
    const changes = profileChanges(profile, {
      preferredLanguage: 'fr',
      notificationsOptIn: false,
      pickupAddress: 'Somewhere else',
    })
    expect(Object.keys(changes ?? {}).sort()).toEqual([
      'notificationsOptIn',
      'pickupAddress',
      'preferredLanguage',
    ])
  })

  it('starts the form on the saved answers, with no address as empty text', () => {
    expect(
      draftFromProfile({ ...profile, pickupAddress: undefined }).pickupAddress,
    ).toBe('')
  })
})

describe('orders', () => {
  it('finds how far along an order is', () => {
    expect(orderStep('CONFIRMED')).toBe(0)
    expect(orderStep('WASHING')).toBe(2)
    expect(orderStep('DELIVERED')).toBe(4)
  })

  it('shows no progress for an order that is not on its way', () => {
    expect(orderStep('DRAFT')).toBe(-1)
    expect(orderStep('CANCELLED')).toBe(-1)
    expect(orderStep(null)).toBe(-1)
  })

  it('reads a discount as below zero and an addition as above', () => {
    expect(orderAdjustment({ orderAmount: 10000, totalAmount: 8000 })).toBe(
      -2000,
    )
    expect(orderAdjustment({ orderAmount: 10000, totalAmount: 11500 })).toBe(
      1500,
    )
    expect(orderAdjustment({ orderAmount: 10000, totalAmount: 10000 })).toBe(0)
  })
})

describe('writing numbers and days', () => {
  it('reads a stored number', () => {
    expect(formatPhone('237698765294')).toBe('+237 698 765 294')
  })

  it('shows a number it cannot place as plus and its digits', () => {
    expect(formatPhone('999999999999')).toBe('+999999999999')
  })

  it('has nothing for a missing number', () => {
    expect(formatPhone(undefined)).toBeUndefined()
    expect(formatPhone('')).toBeUndefined()
  })

  it('writes a date day first, in British order', () => {
    expect(formatDate('2026-10-17T09:00:00.000Z')).toBe('17 Oct 2026')
  })

  it('reads the day in the shop’s time zone, not the server’s', () => {
    // 23:30 in Douala on the 17th is 22:30 UTC on the 17th; 00:30 on the 18th
    // in Douala is 23:30 UTC on the 17th. The shop's day is what counts.
    expect(formatDate('2026-10-17T23:30:00.000Z')).toBe('18 Oct 2026')
  })

  it('has nothing for a missing or broken date', () => {
    expect(formatDate(undefined)).toBeUndefined()
    expect(formatDate('not a date')).toBeUndefined()
  })

  it('writes a pickup as the day and its time window', () => {
    expect(
      formatPickupWhen('2026-10-21T11:00:00.000Z', 'MORNING 8AM - 12PM'),
    ).toMatch(/^Wed,? 21 Oct · Morning \(8am – 12pm\)$/)
  })

  it('shows a window it does not know as the API wrote it', () => {
    expect(formatPickupWhen('2026-10-21T11:00:00.000Z', 'NIGHT')).toMatch(
      /· NIGHT$/,
    )
  })
})
