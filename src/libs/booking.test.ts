import { describe, expect, it } from 'vitest'
import type { BookingDraftDto } from '#/interfaces/booking.dto'
import { pickupWindows } from '#/data/booking.data'
import {
  buildPickupPayload,
  buildSelfPickupPayload,
  emptyDraft,
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

describe('validateStep', () => {
  it('asks for the service first, then the day and time, then the area', () => {
    expect(validateStep(0, emptyDraft)).toEqual({ service: true })
    expect(validateStep(1, emptyDraft)).toEqual({
      date: true,
      windowId: true,
    })
    expect(validateStep(2, emptyDraft)).toEqual({ area: true })
  })

  it('accepts a finished form at every step', () => {
    for (const step of [0, 1, 2, 3] as const) {
      expect(validateStep(step, done)).toEqual({})
    }
  })

  it('checks who the visitor is on the last step, as the plan form does', () => {
    expect(Object.keys(validateStep(3, emptyDraft)).sort()).toEqual([
      'consent',
      'firstName',
      'lastName',
      'phone',
    ])
  })

  it('does not ask for contact details on the earlier steps', () => {
    for (const step of [0, 1, 2] as const) {
      expect(validateStep(step, { ...done, firstName: '' })).toEqual({})
    }
  })
})

describe('buildPickupPayload', () => {
  it('sends only what the public form takes, tidied', () => {
    const morning = pickupWindows.find((window) => window.id === 'morning')!

    const payload = buildPickupPayload(done)

    expect(payload).toMatchObject({
      firstName: 'Ada',
      lastName: 'Deo',
      phone: '+237698765294',
      pickupAddress: 'Near Carrefour, Akwa',
      pickupTime: morning.apiValue,
    })
    expect(Object.keys(payload).sort()).toEqual([
      'firstName',
      'lastName',
      'phone',
      'pickupAddress',
      'pickupDate',
      'pickupTime',
    ])
  })

  it('adds the gender, the WhatsApp number and the email when given', () => {
    const payload = buildPickupPayload({
      ...done,
      gender: 'Female',
      whatsapp: '677 112 233',
      email: ' ada@example.com ',
    })

    expect(payload.gender).toBe('Female')
    expect(payload.whatsappPhone).toBe('+237677112233')
    expect(payload.email).toBe('ada@example.com')
  })

  it('reads the day at midday, so a server in another zone keeps the date', () => {
    const date = new Date(buildPickupPayload(done).pickupDate)

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(9)
    expect(date.getDate()).toBe(20)
    expect(date.getHours()).toBe(12)
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

  it('writes the day and time the way the public form does', () => {
    const own = buildSelfPickupPayload(done)
    const form = buildPickupPayload(done)

    expect(own.pickupTime).toBe(form.pickupTime)
    expect(own.pickupDate).toBe(form.pickupDate)
    expect(own.pickupAddress).toBe(form.pickupAddress)
  })
})
