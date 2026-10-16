import { describe, expect, it } from 'vitest'
import { homePlans } from '#/data/home.data'
import type { ContactDraftDto } from '#/interfaces/contact.dto'
import { emptyContact } from '#/libs/contact'
import { monthlyPlanPrice } from '#/libs/booking'
import {
  buildSignupProfile,
  phoneTarget,
  planCodeFor,
  verifyTargets,
  whatsappTarget,
} from './signup'

const visitor = (patch: Partial<ContactDraftDto> = {}): ContactDraftDto => ({
  ...emptyContact,
  firstName: ' Ada ',
  lastName: ' Deo ',
  phone: '698 765 294',
  consent: true,
  ...patch,
})

describe('where a code can be sent', () => {
  it('offers WhatsApp on the phone when nothing else was typed', () => {
    expect(verifyTargets(visitor())).toEqual([
      {
        channel: 'whatsapp',
        identifier: '+237698765294',
        masked: '+237 698 ••• 294',
      },
    ])
  })

  it('offers the WhatsApp number that was typed, not the phone', () => {
    const [first] = verifyTargets(visitor({ whatsapp: '677 112 233' }))

    expect(first.identifier).toBe('+237677112233')
    expect(first.masked).toBe('+237 677 ••• 233')
  })

  it('writes a WhatsApp number from another country with its own code', () => {
    const target = whatsappTarget(
      visitor({ whatsapp: '6 12 34 56 78', whatsappCountry: 'FR' }),
    )

    expect(target.identifier).toBe('+33612345678')
    expect(target.masked.startsWith('+33 ')).toBe(true)
  })

  it('adds the email, second, when a real one was typed', () => {
    const targets = verifyTargets(visitor({ email: ' ada@example.com ' }))

    expect(targets.map((target) => target.channel)).toEqual([
      'whatsapp',
      'email',
    ])
    expect(targets[1]).toEqual({
      channel: 'email',
      identifier: 'ada@example.com',
      masked: 'a•a@example.com',
    })
  })

  it.each(['', '   ', 'ada', 'ada@example'])(
    'offers no email for %j',
    (email) => {
      expect(verifyTargets(visitor({ email }))).toHaveLength(1)
    },
  )

  it('can fall back to the phone’s own WhatsApp when another number was given', () => {
    // The API asks for this when the phone already has an account: only its
    // owner can prove it, and that means a code on the phone itself.
    const contact = visitor({ whatsapp: '677 112 233' })

    expect(phoneTarget(contact).identifier).toBe('+237698765294')
    expect(whatsappTarget(contact).identifier).toBe('+237677112233')
  })

  it('never puts a whole number in the line that says where the code went', () => {
    const [target] = verifyTargets(visitor())

    expect(target.masked).not.toContain('698 765 294')
    expect(target.masked).not.toContain('698765294')
  })
})

describe('the details sent with the code', () => {
  it('is the name and the phone, tidied', () => {
    expect(buildSignupProfile(visitor())).toEqual({
      firstName: 'Ada',
      lastName: 'Deo',
      phone: '+237698765294',
    })
  })

  it('carries the gender only when one was picked', () => {
    expect(buildSignupProfile(visitor({ gender: 'Female' })).gender).toBe(
      'Female',
    )
    expect(buildSignupProfile(visitor())).not.toHaveProperty('gender')
  })

  it('leaves the WhatsApp number and the email out', () => {
    // The API saves only the contact the code was sent to. Sending the others
    // would suggest they are kept.
    const profile = buildSignupProfile(
      visitor({ whatsapp: '677 112 233', email: 'ada@example.com' }),
    )

    expect(profile).not.toHaveProperty('whatsappPhone')
    expect(profile).not.toHaveProperty('email')
    expect(Object.keys(profile).sort()).toEqual([
      'firstName',
      'lastName',
      'phone',
    ])
  })

  it('does not send the consent box', () => {
    expect(buildSignupProfile(visitor())).not.toHaveProperty('consent')
  })
})

describe('planCodeFor', () => {
  it.each([
    ['basic', 'pieces', 'monthly', 'basic-pieces-monthly'],
    ['standard', 'kg', 'monthly', 'standard-kg-monthly'],
    ['premium', 'pieces', 'quarterly', 'premium-pieces-quarterly'],
    ['basic', 'kg', 'quarterly', 'basic-kg-quarterly'],
  ] as const)('%s, %s, %s is %s', (tier, mode, billing, code) => {
    expect(planCodeFor(tier, mode, billing)).toBe(code)
  })

  it('names a plan the API seeds, for every card on the site', () => {
    // The API seeds one plan per tier, count and billing. If the site gains a
    // tier, the API needs its plan before this passes.
    const seeded = new Set(
      ['basic', 'standard', 'premium'].flatMap((tier) =>
        (['pieces', 'kg'] as const).flatMap((mode) =>
          (['monthly', 'quarterly'] as const).map(
            (billing) => `${tier}-${mode}-${billing}`,
          ),
        ),
      ),
    )

    for (const plan of homePlans) {
      for (const mode of ['pieces', 'kg'] as const) {
        for (const billing of ['monthly', 'quarterly'] as const) {
          expect(seeded).toContain(planCodeFor(plan.id, mode, billing))
        }
      }
    }
  })

  it('charges what the API charges for a quarter', () => {
    // dress-doctor-api seeds a quarterly plan at three months of the monthly
    // price, 10% off and rounded per month: 54 000, 108 000 and 175 500.
    const quarter = (id: string) => {
      const plan = homePlans.find((candidate) => candidate.id === id)!
      return monthlyPlanPrice(plan.price, 'quarterly') * 3
    }

    expect(quarter('basic')).toBe(54000)
    expect(quarter('standard')).toBe(108000)
    expect(quarter('premium')).toBe(175500)
  })
})
