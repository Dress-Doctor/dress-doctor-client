import { describe, expect, it } from 'vitest'
import type { BookingDraftDto } from '#/interfaces/booking.dto'
import { pickupWindows } from '#/data/booking.data'
import {
  bookingSteps,
  buildSelfPickupPayload,
  emptyDraft,
  formatHeldPickup,
  validateStep,
} from './booking'

/** A pickup form filled in, ready to send. */
const done: BookingDraftDto = {
  ...emptyDraft,
  service: 'washFold',
  date: '2026-10-20',
  windowId: 'morning',
  area: ' Akwa ',
  street: ' Near Carrefour ',
  firstName: ' Ada ',
  lastName: ' Deo ',
  phone: '698 765 294',
  consent: true,
}

describe('bookingSteps', () => {
  it('takes a visitor who is not signed in all the way to the code', () => {
    expect(bookingSteps(false)).toEqual([
      'service',
      'time',
      'address',
      'contact',
      'verify',
    ])
  })

  it('stops a signed-in customer after the address', () => {
    // Their details are on the account and proved already, so the request goes
    // from the address step.
    expect(bookingSteps(true)).toEqual(['service', 'time', 'address'])
  })

  it('starts the same way for both, so a form begun signed out can carry on', () => {
    expect(bookingSteps(true).slice(0, 3)).toEqual(
      bookingSteps(false).slice(0, 3),
    )
  })
})

describe('validateStep', () => {
  it('asks for the service first, then the day and time, then the area', () => {
    expect(validateStep('service', emptyDraft)).toEqual({ service: true })
    expect(validateStep('time', emptyDraft)).toEqual({
      date: true,
      windowId: true,
    })
    expect(validateStep('address', emptyDraft)).toEqual({ area: true })
  })

  it('accepts a finished form at every step', () => {
    for (const step of bookingSteps(false)) {
      expect(validateStep(step, done)).toEqual({})
    }
  })

  it('checks who the visitor is on the details step, as the plan form does', () => {
    expect(Object.keys(validateStep('contact', emptyDraft)).sort()).toEqual([
      'consent',
      'firstName',
      'lastName',
      'phone',
    ])
  })

  it('does not ask for contact details on the earlier steps', () => {
    for (const step of ['service', 'time', 'address'] as const) {
      expect(validateStep(step, { ...done, firstName: '' })).toEqual({})
    }
  })

  it('has nothing to check on the code step: the code is checked by the API', () => {
    expect(validateStep('verify', emptyDraft)).toEqual({})
  })
})

describe('buildSelfPickupPayload', () => {
  it('is where and when, and nothing about who', () => {
    const payload = buildSelfPickupPayload({
      ...done,
      gender: 'Female',
      email: 'ada@example.com',
    })

    expect(Object.keys(payload).sort()).toEqual([
      'pickupAddress',
      'pickupDate',
      'pickupTime',
    ])
    expect(payload.pickupAddress).toBe('Near Carrefour, Akwa')
  })

  it('writes the time as the API takes it', () => {
    const morning = pickupWindows.find((window) => window.id === 'morning')!

    expect(buildSelfPickupPayload(done).pickupTime).toBe(morning.apiValue)
  })

  it('reads the day at midday, so a server in another zone keeps the date', () => {
    const date = new Date(buildSelfPickupPayload(done).pickupDate)

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(9)
    expect(date.getDate()).toBe(20)
    expect(date.getHours()).toBe(12)
  })

  it('tidies the address', () => {
    expect(
      buildSelfPickupPayload({ ...done, area: ' Akwa ', street: '' })
        .pickupAddress,
    ).toBe('Akwa')
  })
})

describe('formatHeldPickup', () => {
  const afternoon = pickupWindows.find((window) => window.id === 'afternoon')!

  it('names the day and the window the API holds', () => {
    const text = formatHeldPickup(
      '2026-10-20T11:00:00.000Z',
      afternoon.apiValue,
    )

    expect(text).toContain('20')
    expect(text).toContain('Oct')
    expect(text.endsWith(` · ${afternoon.label()}`)).toBe(true)
  })

  it('shows a time it does not know as it came, rather than hide it', () => {
    expect(
      formatHeldPickup('2026-10-20T11:00:00.000Z', 'LATE NIGHT'),
    ).toContain('LATE NIGHT')
  })
})
