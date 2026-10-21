import { DEFAULT_COUNTRY_ISO } from '#/data/countries.data'
import type {
  ContactDraftDto,
  ContactErrorsDto,
} from '#/interfaces/contact.dto'
import { getCountry, isValidNumber, toInternational } from '#/libs/phone'
import utils from '#/libs/utils'

/** The API's own rules for a name, so a bad one is caught before the request. */
const FIRST_NAME = /^[A-Za-z]{2,50}$/
const LAST_NAME = /^(?=.{2,50}$)[A-Za-z]+( [A-Za-z]+)*$/

/**
 * What the API accepts as an email, tried against its own check: no dot at
 * either end of the part before the `@`, no two dots in a row, and a last part
 * of letters only. The API turns away an empty string, so an empty box is not
 * tested here — it is left out of the request instead.
 */
const EMAIL =
  /^[\p{L}\p{N}!#$%&'*+/=?^_`{|}~-]+(?:\.[\p{L}\p{N}!#$%&'*+/=?^_`{|}~-]+)*@[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?(?:\.[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?)*\.\p{L}{2,}$/u

export const emptyContact: ContactDraftDto = {
  firstName: '',
  lastName: '',
  gender: '',
  phone: '',
  phoneCountry: DEFAULT_COUNTRY_ISO,
  whatsapp: '',
  whatsappCountry: null,
  email: '',
  consent: false,
}

/** Splits a change into the part about who the visitor is and the rest. */
export function splitContactPatch<T extends Partial<ContactDraftDto>>(
  patch: T,
): { contact: Partial<ContactDraftDto>; rest: Omit<T, keyof ContactDraftDto> } {
  const contact: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch)) {
    if (key in emptyContact) contact[key] = value
    else rest[key] = value
  }
  return {
    contact,
    rest: rest as Omit<T, keyof ContactDraftDto>,
  }
}

/** Which of the contact fields are missing or wrong. */
export function validateContact(contact: ContactDraftDto): ContactErrorsDto {
  const errors: ContactErrorsDto = {}

  if (!FIRST_NAME.test(contact.firstName.trim())) errors.firstName = true
  if (!LAST_NAME.test(contact.lastName.trim())) errors.lastName = true
  if (!isValidNumber(getCountry(contact.phoneCountry), contact.phone)) {
    errors.phone = true
  }

  // Both are optional: empty is fine, half-filled is not.
  if (
    utils.digitsOnly(contact.whatsapp) &&
    !isValidNumber(whatsappCountryOf(contact), contact.whatsapp)
  ) {
    errors.whatsapp = true
  }
  const email = contact.email.trim()
  if (email && !EMAIL.test(email)) errors.email = true

  if (!contact.consent) errors.consent = true

  return errors
}

/** The WhatsApp number's country: the phone's own until the visitor picks one. */
export const whatsappCountryOf = (contact: ContactDraftDto) =>
  getCountry(contact.whatsappCountry ?? contact.phoneCountry)

/** The phone as the API takes it: `+` and the country code, then the digits. */
export const contactPhone = (contact: ContactDraftDto) =>
  toInternational(getCountry(contact.phoneCountry), contact.phone)
