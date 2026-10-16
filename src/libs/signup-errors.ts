import { isAxiosError } from 'axios'
import type { ErrorResponseDto } from '#/interfaces/api-client.dto'
import { minutesFrom } from '#/libs/auth-errors'

/**
 * Which call a failure came from. Asking for a code and checking one are the
 * sign-up; `send` is the pickup or plan request that follows it.
 */
export type SignupStageDto = 'request' | 'verify' | 'send'

export type SignupErrorKindDto =
  /** Wrong or expired code. The API does not say which. */
  | 'codeWrong'
  /** Too many tries at one contact; `minutes` is how long to wait, when known. */
  | 'wait'
  /** Too many codes asked for from this connection. */
  | 'rateLimited'
  /** We are sending a lot of codes and have stopped for now. */
  | 'busy'
  /** The phone has an account, and only its owner can enter it: use the phone's WhatsApp. */
  | 'numberHasAccount'
  /** The number or email belongs to an account a code cannot settle: contact us. */
  | 'contactInUse'
  /** The account is switched off. */
  | 'inactive'
  /** The code is locked after too much abuse. */
  | 'locked'
  /** The plan asked for is not one we have. */
  | 'planUnavailable'
  /** A request or a plan is already waiting or running. */
  | 'requestOpen'
  /** The session ended before the request could be sent. */
  | 'sessionEnded'
  /** The details are not what the API accepts. */
  | 'invalid'
  /** The request never got an answer. */
  | 'network'
  | 'generic'

export interface SignupErrorDto {
  kind: SignupErrorKindDto
  minutes?: number
}

/**
 * Turns whatever a sign-up call threw into a kind the screen has words for.
 *
 * As with sign-in, the API's own text is never shown: some of it is for staff
 * and it is not always in the visitor's language. Only the number of minutes
 * is taken from it. Matching is on the status and the machine code, which are
 * stable.
 */
export function signupErrorFrom(
  error: unknown,
  stage: SignupStageDto,
): SignupErrorDto {
  if (!isAxiosError<ErrorResponseDto>(error)) return { kind: 'generic' }
  if (!error.response) return { kind: 'network' }

  const { status } = error.response
  const body = error.response.data as Partial<ErrorResponseDto> | undefined
  const code = body?.error?.code

  switch (code) {
    case 'PHONE_NEEDS_PROOF':
      return { kind: 'numberHasAccount' }
    case 'CONTACT_IN_USE':
      return { kind: 'contactInUse' }
    case 'ACCOUNT_INACTIVE':
      return { kind: 'inactive' }
    case 'PLAN_NOT_FOUND':
      return { kind: 'planUnavailable' }
    case 'SUBSCRIPTION_PENDING':
    case 'SUBSCRIPTION_EXISTS':
      return { kind: 'requestOpen' }
    case 'RATE_LIMITED':
      return { kind: 'rateLimited' }
    case 'SERVICE_BUSY':
      return { kind: 'busy' }
    case 'VALIDATION_ERROR':
      return { kind: 'invalid' }
    default:
      break
  }

  if (status >= 500) return { kind: 'generic' }

  if (status === 401) {
    if (stage === 'verify') return { kind: 'codeWrong' }
    if (stage === 'send') return { kind: 'sessionEnded' }
    return { kind: 'generic' }
  }

  if (status === 403) {
    // After the code the customer is signed in, so a refusal here is not about
    // the code. Before it, a 403 is the contact being locked for abuse.
    return stage === 'send' ? { kind: 'sessionEnded' } : { kind: 'locked' }
  }

  // The cool-down after too many codes or too many wrong tries.
  if (status === 400 || status === 429) {
    return { kind: 'wait', minutes: minutesFrom(body?.message) }
  }

  return { kind: 'generic' }
}
