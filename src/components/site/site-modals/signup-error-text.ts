import type { SignupErrorDto } from '#/libs/signup-errors'
import { m } from '#/paraglide/messages'

/**
 * The words for each kind of sign-up failure, in the simple words the site
 * uses. The API's own text is never shown.
 *
 * `planUnavailable` and `requestOpen` belong to the plan form, which says them
 * itself; if one of them reaches here it reads as a general fault.
 */
export function signupErrorText(error: SignupErrorDto): string {
  switch (error.kind) {
    case 'codeWrong':
      return m.auth_error_codeWrong()
    case 'wait':
      return error.minutes
        ? m.auth_error_wait({ minutes: error.minutes })
        : m.auth_error_waitShort()
    case 'rateLimited':
      return m.auth_signup_error_rateLimited()
    case 'busy':
      return m.auth_signup_error_busy()
    case 'numberHasAccount':
      return m.auth_signup_error_numberHasAccount()
    case 'contactInUse':
      return m.auth_signup_error_contactInUse()
    case 'inactive':
      return m.auth_error_inactive()
    case 'locked':
      return m.auth_error_locked()
    case 'sessionEnded':
      return m.auth_signup_error_sessionEnded()
    case 'invalid':
      return m.auth_error_invalid()
    case 'network':
      return m.auth_error_network()
    case 'planUnavailable':
    case 'requestOpen':
    case 'generic':
      return m.auth_error_generic()
  }
}
