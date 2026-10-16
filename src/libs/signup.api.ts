import type {
  PlanRequestDataDto,
  PlanRequestedDto,
  SelfPickupDataDto,
  SelfPickupDto,
  SignupCodeSentDto,
  SignupCompleteDataDto,
  SignupCompletedDto,
} from '#/interfaces/signup.dto'
import type { LoginRequestDto } from '#/interfaces/auth.dto'
import APIClient, { withChangeReason } from '#/libs/api-client'
import { PORTAL } from '#/libs/api-client/api-instances'

/**
 * Sign-up for a customer, and what they ask for right after it. As with
 * sign-in, the session is an HttpOnly cookie the API sets, so nothing here
 * keeps or returns a token.
 *
 * The two sign-up routes need the platform key but not a change reason; the
 * two requests after them are changes, so the API wants a reason on each.
 */
const signupApi = {
  /**
   * Sends a code to a WhatsApp number or an email. Makes no account and tells
   * nothing about whether the contact has one.
   *
   * `portal` makes the API treat this as a customer sign-up. It never makes
   * or enters a staff account, whatever the header says.
   */
  requestCode: (data: LoginRequestDto) =>
    new APIClient<SignupCodeSentDto, LoginRequestDto & { portal: string }>(
      '/v1/auth/signup/request-code',
    ).post({ ...data, portal: PORTAL }),

  /** Checks the code, then makes or finds the account and starts the session. */
  complete: (data: SignupCompleteDataDto) =>
    new APIClient<
      SignupCompletedDto,
      SignupCompleteDataDto & { portal: string }
    >('/v1/auth/signup/complete').post({ ...data, portal: PORTAL }),

  /** Asks for a pickup as the signed-in customer. Starts as a request. */
  requestPickup: (data: SelfPickupDataDto) =>
    new APIClient<SelfPickupDto, SelfPickupDataDto>('/v1/pickups/mine').post(
      data,
      withChangeReason('Pickup requested on the Dress Doctor website'),
    ),

  /** Asks for a plan as the signed-in customer. Staff confirm it. */
  requestPlan: (data: PlanRequestDataDto) =>
    new APIClient<PlanRequestedDto, PlanRequestDataDto>(
      '/v1/subscriptions',
    ).post(
      data,
      withChangeReason('Plan requested on the Dress Doctor website'),
    ),
}

export default signupApi
