import type { ContactDraftDto } from '#/interfaces/contact.dto'
import type { PlanBillingDto, PlanModeDto } from '#/interfaces/site.dto'
import type { SignupProfileDto, VerifyTargetDto } from '#/interfaces/signup.dto'
import { contactPhone, whatsappCountryOf } from '#/libs/contact'
import { getCountry, toInternational } from '#/libs/phone'
import utils from '#/libs/utils'

/**
 * The visitor's WhatsApp, as a place to send a code. It is the number they
 * gave for WhatsApp, or — when they left that empty — their phone, since the
 * form says an empty WhatsApp box means the phone is on WhatsApp too.
 */
export function whatsappTarget(contact: ContactDraftDto): VerifyTargetDto {
  const given = utils.digitsOnly(contact.whatsapp) !== ''
  const country = given
    ? whatsappCountryOf(contact)
    : getCountry(contact.phoneCountry)
  const national = given ? contact.whatsapp : contact.phone

  return {
    channel: 'whatsapp',
    identifier: toInternational(country, national),
    masked: `+${country.dialCode} ${utils.maskIdentifier(national)}`,
  }
}

/** WhatsApp on the phone number itself, even when another number was given. */
export function phoneTarget(contact: ContactDraftDto): VerifyTargetDto {
  const country = getCountry(contact.phoneCountry)

  return {
    channel: 'whatsapp',
    identifier: contactPhone(contact),
    masked: `+${country.dialCode} ${utils.maskIdentifier(contact.phone)}`,
  }
}

/**
 * Where a code can be sent for this visitor, best first: WhatsApp always, and
 * the email when a real one was typed. The visitor picks one; the first is what
 * is offered if they do nothing.
 */
export function verifyTargets(contact: ContactDraftDto): VerifyTargetDto[] {
  const targets = [whatsappTarget(contact)]
  const email = contact.email.trim()

  if (utils.isEmail(email)) {
    targets.push({
      channel: 'email',
      identifier: email,
      masked: utils.maskIdentifier(email),
    })
  }
  return targets
}

/**
 * The details the API takes with the code. Only who the visitor is: the phone
 * is the account's number, but the WhatsApp number and the email are not sent,
 * because the API saves only the contact the code was sent to.
 */
export function buildSignupProfile(contact: ContactDraftDto): SignupProfileDto {
  return {
    firstName: contact.firstName.trim(),
    lastName: contact.lastName.trim(),
    ...(contact.gender && { gender: contact.gender }),
    phone: contactPhone(contact),
  }
}

/**
 * The plan as the API knows it: `basic-pieces-monthly`, `standard-kg-quarterly`.
 * Built from the same three choices the plan cards make, so the website needs
 * no list of the API's plan ids.
 */
export const planCodeFor = (
  tier: string,
  mode: PlanModeDto,
  billing: PlanBillingDto,
) => `${tier}-${mode}-${billing}`
