import { isAxiosError } from 'axios'
import type { ErrorResponseDto } from '#/interfaces/api-client.dto'

export type AccountErrorKindDto =
  /** The session ended: the customer has to log in again. */
  | 'sessionEnded'
  /** A pickup staff have already confirmed can no longer be cancelled here. */
  | 'pickupNotPending'
  /** The plan moved on while the customer was looking (staff paused it, say). */
  | 'planChanged'
  /** The details are not what the API accepts. */
  | 'invalid'
  /** The request never got an answer. */
  | 'network'
  | 'generic'

/**
 * Turns whatever an account call threw into a kind the screen has words for.
 *
 * The API's own text is never shown: some of it is meant for staff and it is
 * not always in the reader's language. Matching is on the status and the
 * machine code, which are stable.
 */
export function accountErrorFrom(error: unknown): AccountErrorKindDto {
  if (!isAxiosError<ErrorResponseDto>(error)) return 'generic'
  if (!error.response) return 'network'

  const { status } = error.response
  const body = error.response.data as Partial<ErrorResponseDto> | undefined

  switch (body?.error?.code) {
    case 'PICKUP_NOT_PENDING':
      return 'pickupNotPending'
    case 'INVALID_SUBSCRIPTION_STATUS':
      return 'planChanged'
    case 'VALIDATION_ERROR':
      return 'invalid'
    default:
      break
  }

  if (status >= 500) return 'generic'
  if (status === 401 || status === 403) return 'sessionEnded'
  if (status === 400) return 'invalid'
  if (status === 409) return 'planChanged'
  return 'generic'
}

/** A 404: the thing asked for is not there, or is not the customer's. */
export function isNotFound(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404
}
