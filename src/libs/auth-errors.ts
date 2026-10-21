import { isAxiosError } from 'axios'
import type { ErrorResponseDto } from '#/interfaces/api-client.dto'

/** Which step of the sign-in a call belongs to. */
export type LoginStageDto = 'request' | 'verify'

export type LoginErrorKindDto =
  /** No account has this email or number. */
  | 'notFound'
  | 'inactive'
  | 'locked'
  /** Wrong or expired code. The API does not say which. */
  | 'codeWrong'
  /** Too many tries; `minutes` is how long to wait, when the API said. */
  | 'wait'
  | 'invalid'
  /** The request never got an answer. */
  | 'network'
  | 'generic'

export interface LoginErrorDto {
  kind: LoginErrorKindDto
  minutes?: number
}

/** "Please wait 5 minute(s) before trying." gives 5. */
export function minutesFrom(message: string | undefined): number | undefined {
  const match = message?.match(/(\d+)\s*minute/i)
  return match ? Number(match[1]) : undefined
}

/**
 * Turns whatever a sign-in call threw into a kind the screen has words for.
 *
 * The API's own text is not shown. Some of it is for staff, and it is not
 * always in the visitor's language; only the number of minutes is taken from
 * it. Matching is on the status and the machine code, which are stable.
 */
export function loginErrorFrom(
  error: unknown,
  stage: LoginStageDto,
): LoginErrorDto {
  if (!isAxiosError<ErrorResponseDto>(error)) return { kind: 'generic' }
  if (!error.response) return { kind: 'network' }

  // A gateway can answer with a page that is not our envelope at all.
  const { status } = error.response
  const data = error.response.data as ErrorResponseDto | undefined
  const code = (data as Partial<ErrorResponseDto> | undefined)?.error?.code

  if (status >= 500) return { kind: 'generic' }

  if (code === 'ACCOUNT_INACTIVE') return { kind: 'inactive' }

  if (status === 403) return { kind: 'locked' }

  if (status === 400 && code === 'VALIDATION_ERROR') return { kind: 'invalid' }

  // The cool-down after too many codes or too many wrong tries.
  if (status === 400 || status === 429) {
    return {
      kind: 'wait',
      minutes: minutesFrom(
        (data as Partial<ErrorResponseDto> | undefined)?.message,
      ),
    }
  }

  if (status === 401) {
    return stage === 'request' ? { kind: 'notFound' } : { kind: 'codeWrong' }
  }

  return { kind: 'generic' }
}

/** A 401 or 403 on `me`: nobody is signed in. Anything else is a real fault. */
export function isUnauthenticated(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  return status === 401 || status === 403
}
