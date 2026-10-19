import type { LoginChannelDto, LoginCodeSentDto } from './auth.dto'
import type { GenderDto } from './contact.dto'

/**
 * What the sign-up and the requests that follow it send and receive. It
 * mirrors `/v1/auth/signup/*`, `/v1/pickups/mine` and `/v1/subscriptions` in
 * dress-doctor-api.
 *
 * A visitor proves one contact with a code, and only then is an account made
 * or entered. The calls after it need no identity in the body: the session the
 * code started says who is asking.
 */

/** One contact a code can be sent to, and how to show it. */
export interface VerifyTargetDto {
  /** `whatsapp` for a number, `email` for an address — the API reads it from the identifier. */
  channel: LoginChannelDto
  /** The email as typed, or a number as `+` and the country code, then the digits. */
  identifier: string
  /** The same contact with its middle hidden, to say where the code went. */
  masked: string
}

/**
 * Who the visitor says they are. The names and the gender are kept as given;
 * the phone is the account's number. The WhatsApp number and the email are not
 * here on purpose: the API saves only the contact the code was sent to.
 */
export interface SignupProfileDto {
  firstName: string
  lastName: string
  /** Only sent when the visitor picked one. */
  gender?: GenderDto
  /** `+` and the country code, then the number: `+237689688248`. */
  phone: string
}

export type SignupCodeSentDto = LoginCodeSentDto

export interface SignupCompleteDataDto {
  identifier: string
  otpRef: string
  /** The 6 digits. */
  code: string
  profile: SignupProfileDto
}

/** A new account was made, or the contact already had one. */
export type SignupOutcomeDto = 'CREATED' | 'SIGNED_IN'

export interface SignupCompletedDto {
  outcome: SignupOutcomeDto
}

/** The two ways a customer can ask to be priced. Staff set the others on the order. */
export type SelfPricingModelDto = 'PER_PIECE' | 'PER_KG'

/** The body of `POST /v1/pickups/mine` — who is asking comes from the session. */
export interface SelfPickupDataDto {
  pickupAddress: string
  pickupTime: string
  pickupDate: string
  /** Per piece or per kg, from the service the visitor chose. */
  pricingModel?: SelfPricingModelDto
  /** What the visitor wrote under "Notes". Left out when empty. */
  note?: string
}

export interface SelfPickupDto {
  /** `false` when the customer already had a pickup open and this is it. */
  created: boolean
  pickupRequest: {
    _id: string
    reference: string
    pickupDate: string
    pickupTime: string
    /** `PENDING`, or `CONFIRMED` / `ASSIGNED` for one already in hand. */
    status: string
  }
}

/** The body of `POST /v1/subscriptions` for a customer asking for themselves. */
export interface PlanRequestDataDto {
  /** `basic-pieces-monthly`, `standard-kg-quarterly` and so on. */
  planCode: string
}

export interface PlanRequestedDto {
  _id: string
  /** `PENDING` for a customer's request: staff confirm it. */
  status: string
}
