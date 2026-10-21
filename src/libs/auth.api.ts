import type {
  LoginCodeSentDto,
  LoginRequestDto,
  LoginVerifyDto,
  MeDto,
} from '#/interfaces/auth.dto'
import APIClient from '#/libs/api-client'
import { PORTAL } from '#/libs/api-client/api-instances'

/**
 * Customer sign-in calls. The session is an HttpOnly cookie the API sets on
 * `complete-login`, so nothing here keeps or returns a token.
 *
 * These routes need the platform key but not a change reason, so there is
 * no `withChangeReason` here.
 */
const authApi = {
  /**
   * Asks for a code. Also how the API tells us the account does not exist.
   *
   * `portal` makes the API look for a customer account only. A person who is
   * also staff holds a separate staff account under the same number, and this
   * site must never find it, whatever the header says.
   */
  requestCode: (data: LoginRequestDto) =>
    new APIClient<LoginCodeSentDto, LoginRequestDto & { portal: string }>(
      '/v1/auth/initiate-login',
    ).post({ ...data, portal: PORTAL }),

  resendCode: (data: LoginRequestDto) =>
    new APIClient<LoginCodeSentDto, LoginRequestDto & { portal: string }>(
      '/v1/auth/resend-otp',
    ).post({ ...data, portal: PORTAL }),

  verifyCode: (data: LoginVerifyDto) =>
    new APIClient<unknown, LoginVerifyDto & { portal: string }>(
      '/v1/auth/complete-login',
    ).post({ ...data, portal: PORTAL }),

  /** The refresh token comes from the cookie, so the body is empty. */
  logout: () =>
    new APIClient<unknown, Record<string, never>>('/v1/auth/logout').post({}),

  me: () => new APIClient<MeDto>('/v1/auth/me').getWithoutId(),
}

export default authApi
