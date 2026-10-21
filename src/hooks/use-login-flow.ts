import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { DEFAULT_COUNTRY_ISO } from '#/data/countries.data'
import type { LoginChannelDto } from '#/interfaces/auth.dto'
import authApi from '#/libs/auth.api'
import { loginErrorFrom } from '#/libs/auth-errors'
import type { LoginErrorDto, LoginStageDto } from '#/libs/auth-errors'
import { CODE_LENGTH, RESEND_WAIT_SECONDS, emptyCode } from '#/libs/otp'
import { getCountry, isValidNumber, toInternational } from '#/libs/phone'
import { afterLoginPath } from '#/libs/redirect'
import utils from '#/libs/utils'
import { refreshMe } from '#/hooks/use-me'
import { useCountdown } from '#/hooks/use-countdown'

/** What the code step needs to know about the code that was sent. */
interface SentCodeDto {
  identifier: string
  /** The same contact with its middle hidden, to say where the code went. */
  masked: string
  otpRef: string
  /** Time the code stops working, in milliseconds. */
  expiresAt: number
}

/**
 * Everything the login page remembers, in order: pick a way, give the email
 * or number, ask for a code, enter it.
 *
 * Nothing about it goes in the address. The page's `redirect` is the only
 * thing read from there. The reference of the code and the contact stay in
 * memory, so a refresh starts again from the first step.
 */
export function useLoginFlow(redirect: string | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [channel, setChannel] = useState<LoginChannelDto>('whatsapp')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_ISO)
  /** Set once the visitor has tried to send, so an empty box is not nagged. */
  const [contactTouched, setContactTouched] = useState(false)

  const [sent, setSent] = useState<SentCodeDto | null>(null)
  const [code, setCode] = useState<string[]>(emptyCode)
  /** Bumped to empty the code boxes, which keep their own digits otherwise. */
  const [codeResetKey, setCodeResetKey] = useState(0)
  const [codeTouched, setCodeTouched] = useState(false)
  const [resendAt, setResendAt] = useState<number | null>(null)
  const [error, setError] = useState<LoginErrorDto | null>(null)
  const [resent, setResent] = useState(false)
  /** The code was accepted and the page is on its way to the account. */
  const [finishing, setFinishing] = useState(false)

  /** Stop a second call starting in the same instant as the first. */
  const verifying = useRef(false)
  const requesting = useRef(false)

  const resendSeconds = useCountdown(resendAt)
  const expiresSeconds = useCountdown(sent?.expiresAt ?? null)

  const country = getCountry(phoneCountry)
  const emailValid = utils.isEmail(email)
  const phoneValid = isValidNumber(country, phone)
  const contactValid = channel === 'email' ? emailValid : phoneValid

  const contactError =
    contactTouched && !contactValid
      ? channel === 'email'
        ? 'email'
        : 'phone'
      : null

  const fail = (stage: LoginStageDto, caught: unknown) =>
    setError(loginErrorFrom(caught, stage))

  const clearCode = () => {
    setCode(emptyCode())
    setCodeTouched(false)
    setCodeResetKey((key) => key + 1)
  }

  /** Takes a code from the API into the state the code step reads. */
  const accept = (
    identifier: string,
    masked: string,
    data: { otpRef: string; expiresAt: string } | undefined,
  ) => {
    if (!data) {
      setError({ kind: 'generic' })
      return false
    }
    setSent({
      identifier,
      masked,
      otpRef: data.otpRef,
      expiresAt: new Date(data.expiresAt).getTime(),
    })
    setResendAt(Date.now() + RESEND_WAIT_SECONDS * 1000)
    clearCode()
    return true
  }

  const request = useMutation({
    mutationFn: (to: { identifier: string; masked: string }) =>
      authApi.requestCode({ identifier: to.identifier }),
    onSuccess: (response, to) => {
      setResent(false)
      accept(to.identifier, to.masked, response.data)
    },
    onError: (caught) => fail('request', caught),
    onSettled: () => {
      requesting.current = false
    },
  })

  const resend = useMutation({
    mutationFn: (to: { identifier: string; masked: string }) =>
      authApi.resendCode({ identifier: to.identifier }),
    onSuccess: (response, to) => {
      if (accept(to.identifier, to.masked, response.data)) setResent(true)
    },
    onError: (caught) => {
      setResent(false)
      fail('request', caught)
    },
    onSettled: () => {
      requesting.current = false
    },
  })

  const verify = useMutation({
    mutationFn: (data: { identifier: string; otpRef: string; code: string }) =>
      authApi.verifyCode(data),
  })

  /**
   * Where the code goes. The API gets the email as typed, or `+` and the full
   * number; the screen shows it with the middle hidden (`+237 699 ••• 111`).
   */
  const target =
    channel === 'email'
      ? { identifier: email.trim(), masked: utils.maskIdentifier(email.trim()) }
      : {
          identifier: toInternational(country, phone),
          masked: `+${country.dialCode} ${utils.maskIdentifier(phone)}`,
        }

  const sending = request.isPending

  const send = () => {
    if (requesting.current || sending || finishing) return
    setContactTouched(true)
    if (!contactValid) return
    requesting.current = true
    setError(null)
    request.mutate(target)
  }

  const askAgain = () => {
    if (requesting.current || !sent || resend.isPending) return
    if (resendSeconds > 0 || finishing) return
    requesting.current = true
    setError(null)
    resend.mutate({ identifier: sent.identifier, masked: sent.masked })
  }

  const submitCode = (digits: string[] = code) => {
    if (!sent || verifying.current || finishing) return
    setCodeTouched(true)
    if (digits.join('').length !== CODE_LENGTH) return

    verifying.current = true
    setError(null)
    verify.mutate(
      {
        identifier: sent.identifier,
        otpRef: sent.otpRef,
        code: digits.join(''),
      },
      {
        onSuccess: async () => {
          setFinishing(true)
          try {
            // Read the account fresh: the page it lands on trusts it.
            await refreshMe(queryClient)
            await navigate({ href: afterLoginPath(redirect), replace: true })
          } catch (caught) {
            setFinishing(false)
            verifying.current = false
            fail('verify', caught)
          }
        },
        onError: (caught) => {
          verifying.current = false
          fail('verify', caught)
          clearCode()
        },
      },
    )
  }

  const changeChannel = (next: LoginChannelDto) => {
    setChannel(next)
    setError(null)
    setContactTouched(false)
  }

  const changeContact = () => {
    setSent(null)
    clearCode()
    setResendAt(null)
    setError(null)
    setResent(false)
  }

  /** From the code step: go back and pick the other way to get a code. */
  const tryOtherChannel = () => {
    changeContact()
    setChannel((current) => (current === 'email' ? 'whatsapp' : 'email'))
    setContactTouched(false)
  }

  return {
    step: sent ? ('code' as const) : ('contact' as const),
    channel,
    email,
    phone,
    phoneCountry,
    contactError,
    contactValid,
    error,
    sending,
    changeChannel,
    changeEmail: (value: string) => {
      setEmail(value)
      setError(null)
    },
    changePhone: (next: { country: string; number: string }) => {
      setPhoneCountry(next.country)
      setPhone(next.number)
      setError(null)
    },
    send,

    /** Where the code went, hidden in the middle: `689 ••• 248`. */
    maskedContact: sent?.masked ?? '',
    codeResetKey,
    codeTooShort: codeTouched && code.join('').length !== CODE_LENGTH,
    changeCode: (digits: string[]) => {
      setCode(digits)
      setError(null)
    },
    submitCode,
    verifying: verify.isPending || finishing,
    finishing,
    expiresSeconds,
    expired: Boolean(sent) && expiresSeconds === 0,
    resendSeconds,
    resending: resend.isPending,
    resent,
    askAgain,
    changeContact,
    tryOtherChannel,
  }
}
