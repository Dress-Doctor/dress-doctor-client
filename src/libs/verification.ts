import type {
  SignupCodeSentDto,
  VerifyTargetDto,
} from '#/interfaces/signup.dto'
import type { SignupErrorDto } from '#/libs/signup-errors'
import { CODE_LENGTH, RESEND_WAIT_SECONDS, emptyCode } from '#/libs/otp'

/** The code that was sent: where, which, and until when it works. */
export interface SentCodeDto {
  target: VerifyTargetDto
  otpRef: string
  /** Time the code stops working, in milliseconds. */
  expiresAt: number
}

/**
 * What a visitor proving a contact has in front of them: the code that was
 * sent, the digits typed so far, and the last thing that went wrong.
 *
 * Kept as plain data with a reducer, apart from React and the network, so the
 * rules — a new code empties the boxes, a wrong one does too, a resend waits a
 * minute — can be tested without a screen.
 */
export interface VerificationState {
  sent: SentCodeDto | null
  /** When another code may be asked for, in milliseconds. */
  resendAt: number | null
  digits: string[]
  /** Bumped to empty the code boxes, which keep their own digits otherwise. */
  resetKey: number
  /** The visitor tried to send before all the digits were in. */
  touched: boolean
  error: SignupErrorDto | null
  /** The last code was asked for again, not for the first time. */
  resent: boolean
}

export const initialVerification: VerificationState = {
  sent: null,
  resendAt: null,
  digits: emptyCode(),
  resetKey: 0,
  touched: false,
  error: null,
  resent: false,
}

export type VerificationAction =
  /** A code was sent. `now` is passed in so the reducer stays pure. */
  | {
      type: 'sent'
      target: VerifyTargetDto
      data: SignupCodeSentDto
      now: number
      resent: boolean
    }
  | { type: 'digits'; digits: string[] }
  /** The visitor tried to send before all the digits were in. */
  | { type: 'tooShort' }
  /**
   * A call failed. `clearCode` is for a failed check: the digits were wrong
   * (or were used up), so the boxes start again.
   */
  | { type: 'failed'; error: SignupErrorDto; clearCode: boolean }
  /** Back to choosing where the code goes. */
  | { type: 'reset' }

export function verificationReducer(
  state: VerificationState,
  action: VerificationAction,
): VerificationState {
  switch (action.type) {
    case 'sent':
      return {
        sent: {
          target: action.target,
          otpRef: action.data.otpRef,
          expiresAt: new Date(action.data.expiresAt).getTime(),
        },
        resendAt: action.now + RESEND_WAIT_SECONDS * 1000,
        digits: emptyCode(),
        resetKey: state.resetKey + 1,
        touched: false,
        error: null,
        resent: action.resent,
      }

    case 'digits':
      return { ...state, digits: action.digits, error: null }

    case 'tooShort':
      return { ...state, touched: true }

    case 'failed':
      return {
        ...state,
        error: action.error,
        // A code that failed to send is not "a new code on its way".
        resent: false,
        ...(action.clearCode && {
          digits: emptyCode(),
          touched: false,
          resetKey: state.resetKey + 1,
        }),
      }

    case 'reset':
      return { ...initialVerification, resetKey: state.resetKey + 1 }
  }
}

/** The digits typed, as the one string the API takes. */
export const codeOf = (state: VerificationState) => state.digits.join('')

/** The visitor tried to send, and the code is not all there. */
export const codeTooShort = (state: VerificationState) =>
  state.touched && codeOf(state).length !== CODE_LENGTH
