/**
 * Who the visitor is, as every form on the site asks it: the booking form and
 * the plan form share these fields, so a visitor is never asked for different
 * details depending on which button they pressed.
 */

/** The values the API accepts for `gender`. */
export type GenderDto = 'Male' | 'Female'

/** What the visitor has typed or picked about themselves so far. */
export interface ContactDraftDto {
  firstName: string
  lastName: string
  /** Optional: `''` until the visitor picks one. */
  gender: GenderDto | ''
  /** The national number, grouped (`689 688 248`) — the code is `phoneCountry`. */
  phone: string
  /** ISO code of the country `phone` belongs to. */
  phoneCountry: string
  /** Optional. Same grouping as `phone`; left empty when it is the same number. */
  whatsapp: string
  /** ISO code, or `null` while the WhatsApp number follows the phone's. */
  whatsappCountry: string | null
  /** Optional. */
  email: string
  consent: boolean
}

/** The contact fields that can show an error. */
export type ContactFieldDto =
  'firstName' | 'lastName' | 'phone' | 'whatsapp' | 'email' | 'consent'

export type ContactErrorsDto = Partial<Record<ContactFieldDto, true>>
