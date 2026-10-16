import { describe, expect, it } from 'vitest'
import type { ContactDraftDto } from '#/interfaces/contact.dto'
import {
  contactPhone,
  emptyContact,
  splitContactPatch,
  validateContact,
} from './contact'

/** A visitor who has filled everything in correctly. */
const filled: ContactDraftDto = {
  ...emptyContact,
  firstName: 'Ada',
  lastName: 'Deo',
  phone: '698 765 294',
  consent: true,
}

const withChange = (patch: Partial<ContactDraftDto>): ContactDraftDto => ({
  ...filled,
  ...patch,
})

describe('validateContact', () => {
  it('accepts a visitor who has filled in what is needed', () => {
    expect(validateContact(filled)).toEqual({})
  })

  it('asks for everything that is needed from an empty form', () => {
    expect(Object.keys(validateContact(emptyContact)).sort()).toEqual([
      'consent',
      'firstName',
      'lastName',
      'phone',
    ])
  })

  it.each([
    ['one letter', 'A'],
    ['a digit', 'Ada1'],
    ['an accent the API refuses', 'Adé'],
    ['a space in the middle', 'Ada Deo'],
    ['only spaces', '   '],
  ])('refuses a first name with %s', (_name, firstName) => {
    expect(validateContact(withChange({ firstName })).firstName).toBe(true)
  })

  it('takes a last name of two words, as the API does', () => {
    expect(validateContact(withChange({ lastName: 'Ngo Bell' }))).toEqual({})
  })

  it.each([
    ['a digit', 'Deo2'],
    ['two spaces in a row', 'Ngo  Bell'],
    ['one letter', 'D'],
  ])('refuses a last name with %s', (_name, lastName) => {
    expect(validateContact(withChange({ lastName })).lastName).toBe(true)
  })

  it('refuses a phone that is too short for its country', () => {
    expect(validateContact(withChange({ phone: '6987' })).phone).toBe(true)
  })

  it('checks the phone against the country it was typed for', () => {
    // 10 digits is a good French number but too long for Cameroon.
    expect(
      validateContact(
        withChange({ phone: '6 12 34 56 78', phoneCountry: 'FR' }),
      ),
    ).toEqual({})
    expect(validateContact(withChange({ phone: '6123456789' })).phone).toBe(
      true,
    )
  })

  describe('the WhatsApp number', () => {
    it('may be left empty', () => {
      expect(validateContact(withChange({ whatsapp: '' }))).toEqual({})
    })

    it('is refused when half filled', () => {
      expect(validateContact(withChange({ whatsapp: '677' })).whatsapp).toBe(
        true,
      )
    })

    it('is checked against its own country, not the phone’s', () => {
      const french = withChange({
        whatsapp: '6 12 34 56 78',
        whatsappCountry: 'FR',
      })
      expect(validateContact(french)).toEqual({})
    })

    it('follows the phone’s country until another is picked', () => {
      expect(
        validateContact(withChange({ whatsapp: '6123456789' })).whatsapp,
      ).toBe(true)
    })
  })

  describe('the email', () => {
    it('may be left empty', () => {
      expect(validateContact(withChange({ email: '  ' }))).toEqual({})
    })

    it.each(['ada@example.com', ' ada.deo+shop@mail.example.cm '])(
      'takes %s',
      (email) => {
        expect(validateContact(withChange({ email }))).toEqual({})
      },
    )

    it.each([
      'ada',
      'ada@example',
      'ada@@example.com',
      '.ada@example.com',
      'ada..deo@example.com',
      'ada@example.c',
    ])('refuses %s', (email) => {
      expect(validateContact(withChange({ email })).email).toBe(true)
    })
  })

  it('wants the box ticked', () => {
    expect(validateContact(withChange({ consent: false })).consent).toBe(true)
  })
})

describe('how the phone goes to the API', () => {
  it('writes the phone as + and the country code, then the digits', () => {
    expect(contactPhone(filled)).toBe('+237698765294')
    expect(
      contactPhone(withChange({ phone: '6 12 34 56 78', phoneCountry: 'FR' })),
    ).toBe('+33612345678')
  })
})

describe('splitContactPatch', () => {
  it('separates what is about the visitor from the rest of a form', () => {
    const { contact, rest } = splitContactPatch({
      firstName: 'Ada',
      consent: true,
      area: 'Akwa',
      date: '2026-10-20',
    } as Partial<ContactDraftDto>)

    expect(contact).toEqual({ firstName: 'Ada', consent: true })
    expect(rest).toEqual({ area: 'Akwa', date: '2026-10-20' })
  })

  it('keeps a field that was cleared', () => {
    const { contact } = splitContactPatch({ gender: '', email: '' })
    expect(contact).toEqual({ gender: '', email: '' })
  })

  it('has nothing in either half for an empty change', () => {
    expect(splitContactPatch({})).toEqual({ contact: {}, rest: {} })
  })
})
