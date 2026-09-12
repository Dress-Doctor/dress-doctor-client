/** Mirrors dress-doctor-api auth DTOs — verified against live Swagger. */

export type OtpChannelDto = 'Email' | 'WhatsApp'

export interface InitiateLoginDataDto {
  /**
   * 9-digit local phone number (no country code) when `otpChannel` is
   * `WhatsApp`, the email address when it is `Email`.
   */
  identifier: string
  password: string
}

export interface InitiateLoginResponseDto {
  otpRef: string
  expiresAt: string
}

export interface CompleteLoginDataDto {
  /** 6-digit OTP code. */
  code: string
  otpRef: string
  /** The phone (or email) the OTP was requested for. */
  identifier: string
}

export interface CompleteLoginResponseDto {
  accessToken: string
  refreshToken: string
}

/** CASL rule as serialised by the API (`ability.rules`). */
export interface AbilityRuleDto {
  action: string | string[]
  subject: string | string[]
  conditions?: Record<string, unknown>
  inverted?: boolean
}

export interface UserTypeDto {
  _id: string
  userTypeName: string
}

export interface MeUserDto {
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  whatsappPhone?: string
  preferredLanguage?: string
  isActive: boolean
  userTypeId: UserTypeDto | string
}

export interface MeResponseDto {
  user: MeUserDto
  abilities: AbilityRuleDto[]
}
