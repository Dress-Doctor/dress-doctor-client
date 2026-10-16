import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReducer, useRef, useState } from 'react'
import { meQueryKey, refreshMe } from '#/hooks/use-me'
import { useCountdown } from '#/hooks/use-countdown'
import type {
  SignupOutcomeDto,
  SignupProfileDto,
  VerifyTargetDto,
} from '#/interfaces/signup.dto'
import { CODE_LENGTH } from '#/libs/otp'
import signupApi from '#/libs/signup.api'
import { signupErrorFrom } from '#/libs/signup-errors'
import {
  codeOf,
  codeTooShort,
  initialVerification,
  verificationReducer,
} from '#/libs/verification'

interface ContactVerificationOptions {
  /** Who the visitor says they are; sent with the code, read when it is sent. */
  profile: SignupProfileDto
  /**
   * Called once the code was accepted, the session has started and the account
   * is known. It must handle its own failures: the code is used up by then, so
   * a failure here is not the code's.
   */
  onVerified: (outcome: SignupOutcomeDto) => void | Promise<void>
}

/**
 * Proving a contact: send a code to a WhatsApp number or an email, take it
 * back, and so start a session. Shared by the pickup form and the plan form,
 * which both end with it.
 *
 * Nothing about it goes in the address. The reference of the code, the contact
 * and the digits stay in memory, so a refresh starts again. The rules about
 * what each step does to the state live in `verificationReducer`.
 */
export function useContactVerification({
  profile,
  onVerified,
}: ContactVerificationOptions) {
  const queryClient = useQueryClient()
  const [state, dispatch] = useReducer(verificationReducer, initialVerification)
  /** The code was accepted and the page is carrying on with the account. */
  const [finishing, setFinishing] = useState(false)
  const [outcome, setOutcome] = useState<SignupOutcomeDto | null>(null)

  /** Stop a second call starting in the same instant as the first. */
  const requesting = useRef(false)
  const verifying = useRef(false)

  const resendSeconds = useCountdown(state.resendAt)
  const expiresSeconds = useCountdown(state.sent?.expiresAt ?? null)

  const request = useMutation({
    mutationFn: (to: { target: VerifyTargetDto; resent: boolean }) =>
      signupApi.requestCode({ identifier: to.target.identifier }),
    onSuccess: (response, to) => {
      if (!response.data) {
        dispatch({
          type: 'failed',
          error: { kind: 'generic' },
          clearCode: false,
        })
        return
      }
      dispatch({
        type: 'sent',
        target: to.target,
        data: response.data,
        now: Date.now(),
        resent: to.resent,
      })
    },
    onError: (caught) =>
      dispatch({
        type: 'failed',
        error: signupErrorFrom(caught, 'request'),
        clearCode: false,
      }),
    onSettled: () => {
      requesting.current = false
    },
  })

  const complete = useMutation({
    mutationFn: signupApi.complete,
  })

  /** Sends a code to a contact. Also how the visitor changes where it goes. */
  const send = (target: VerifyTargetDto) => {
    if (requesting.current || finishing) return
    requesting.current = true
    request.mutate({ target, resent: false })
  }

  const askAgain = () => {
    const { sent } = state
    if (requesting.current || !sent || finishing) return
    if (resendSeconds > 0) return
    requesting.current = true
    request.mutate({ target: sent.target, resent: true })
  }

  const submitCode = (digits: string[] = state.digits) => {
    const { sent } = state
    if (!sent || verifying.current || finishing) return
    if (digits.join('').length !== CODE_LENGTH) {
      dispatch({ type: 'tooShort' })
      return
    }

    verifying.current = true
    complete.mutate(
      {
        identifier: sent.target.identifier,
        otpRef: sent.otpRef,
        code: digits.join(''),
        profile,
      },
      {
        onSuccess: async (response) => {
          setFinishing(true)
          // The cookie is new. Read the account fresh: the header and the
          // account page trust it. If that read fails the session is still
          // good, so the kept answer is only marked out of date.
          try {
            await refreshMe(queryClient)
          } catch {
            void queryClient.invalidateQueries({ queryKey: meQueryKey })
          }

          const result = response.data?.outcome ?? 'SIGNED_IN'
          setOutcome(result)
          await onVerified(result)
        },
        onError: (caught) => {
          verifying.current = false
          dispatch({
            type: 'failed',
            error: signupErrorFrom(caught, 'verify'),
            // The code is used up whatever went wrong, so start the boxes again.
            clearCode: true,
          })
        },
      },
    )
  }

  return {
    /** The contact the code went to, or `null` before one was sent. */
    target: state.sent?.target ?? null,
    /** Where the code went, hidden in the middle: `689 ••• 248`. */
    maskedContact: state.sent?.target.masked ?? '',
    sent: state.sent !== null,
    error: state.error,
    sending: request.isPending && !request.variables.resent,
    resending: request.isPending && request.variables.resent,
    resent: state.resent,
    resendSeconds,
    expiresSeconds,
    expired: state.sent !== null && expiresSeconds === 0,
    codeResetKey: state.resetKey,
    codeTooShort: codeTooShort(state),
    code: codeOf(state),
    verifying: complete.isPending || finishing,
    finishing,
    /** Set once the code was accepted: a new account, or one that was there. */
    outcome,
    send,
    askAgain,
    submitCode,
    changeCode: (digits: string[]) => dispatch({ type: 'digits', digits }),
    /** Back to choosing where the code goes. */
    changeContact: () => dispatch({ type: 'reset' }),
  }
}

export type ContactVerification = ReturnType<typeof useContactVerification>
