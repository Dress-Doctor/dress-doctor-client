/**
 * What the customer sign-in sends and receives. It mirrors `/v1/auth/*` in
 * dress-doctor-api, which is shared with staff; a customer never sends a
 * password, so none of these have one.
 */

/** How the customer gets their code. The API reads it from the identifier. */
export type LoginChannelDto = 'whatsapp' | 'email'

/** A trimmed email, or a phone as `+` and the country code, then the digits. */
export interface LoginRequestDto {
  identifier: string
}

/** The answer to asking for a code, and to asking for another. */
export interface LoginCodeSentDto {
  otpRef: string
  /** ISO time after which the code no longer works. */
  expiresAt: string
}

export interface LoginVerifyDto {
  identifier: string
  otpRef: string
  /** The 6 digits. */
  code: string
}

export interface MeUserTypeDto {
  _id: string
  userTypeName: string
}

export interface MeUserDto {
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  whatsappPhone?: string
  preferredLanguage?: 'en' | 'fr'
  isActive: boolean
  userTypeId: MeUserTypeDto | string
}

export interface MeDto {
  user: MeUserDto
}
