import { describe, expect, it } from 'vitest'
import type { VerifyTargetDto } from '#/interfaces/signup.dto'
import { CODE_LENGTH, RESEND_WAIT_SECONDS } from './otp'
import {
  codeOf,
  codeTooShort,
  initialVerification,
  verificationReducer,
} from './verification'
import type { VerificationAction, VerificationState } from './verification'

const whatsapp: VerifyTargetDto = {
  channel: 'whatsapp',
  identifier: '+237698765294',
  masked: '+237 698 ••• 294',
}
const email: VerifyTargetDto = {
  channel: 'email',
  identifier: 'ada@example.com',
  masked: 'a•a@example.com',
}

const NOW = Date.parse('2026-10-14T10:00:00.000Z')
const EXPIRES = '2026-10-14T10:05:00.000Z'

const sent = (
  target: VerifyTargetDto = whatsapp,
  resent = false,
): VerificationAction => ({
  type: 'sent',
  target,
  data: { otpRef: 'ref-1', expiresAt: EXPIRES },
  now: NOW,
  resent,
})

const run = (...actions: VerificationAction[]): VerificationState =>
  actions.reduce(verificationReducer, initialVerification)

const typed = (code: string) => code.split('')

describe('before any code is sent', () => {
  it('has nothing sent and empty boxes', () => {
    expect(initialVerification.sent).toBeNull()
    expect(initialVerification.digits).toEqual(Array(CODE_LENGTH).fill(''))
    expect(initialVerification.error).toBeNull()
  })
})

describe('when a code is sent', () => {
  it('remembers where, which and until when', () => {
    const state = run(sent())

    expect(state.sent).toEqual({
      target: whatsapp,
      otpRef: 'ref-1',
      expiresAt: Date.parse(EXPIRES),
    })
  })

  it('makes the visitor wait before asking again', () => {
    const state = run(sent())

    expect(state.resendAt).toBe(NOW + RESEND_WAIT_SECONDS * 1000)
  })

  it('empties the boxes, and tells the page to clear them', () => {
    const before = run(sent(), { type: 'digits', digits: typed('123456') })
    const after = verificationReducer(before, sent())

    expect(after.digits).toEqual(Array(CODE_LENGTH).fill(''))
    expect(after.resetKey).toBe(before.resetKey + 1)
  })

  it('forgets an earlier complaint', () => {
    const state = run(
      sent(),
      { type: 'failed', error: { kind: 'wait', minutes: 5 }, clearCode: false },
      sent(),
    )

    expect(state.error).toBeNull()
  })

  it('says when it is a second code for the same contact', () => {
    expect(run(sent(whatsapp, false)).resent).toBe(false)
    expect(run(sent(), sent(whatsapp, true)).resent).toBe(true)
  })

  it('moves to the new contact when the visitor changes where it goes', () => {
    const state = run(sent(whatsapp), sent(email))

    expect(state.sent?.target).toEqual(email)
  })
})

describe('typing the code', () => {
  it('keeps the digits', () => {
    const state = run(sent(), { type: 'digits', digits: typed('12') })

    expect(state.digits).toEqual(typed('12'))
  })

  it('takes back a complaint, since the visitor is fixing it', () => {
    const state = run(
      sent(),
      { type: 'failed', error: { kind: 'codeWrong' }, clearCode: true },
      { type: 'digits', digits: typed('1') },
    )

    expect(state.error).toBeNull()
  })

  it('reads the digits as the one string the API takes', () => {
    const state = run(sent(), { type: 'digits', digits: typed('123456') })

    expect(codeOf(state)).toBe('123456')
  })

  it('does not nag about a short code until a send was tried', () => {
    const typing = run(sent(), { type: 'digits', digits: typed('123') })
    expect(codeTooShort(typing)).toBe(false)

    const tried = verificationReducer(typing, { type: 'tooShort' })
    expect(codeTooShort(tried)).toBe(true)
  })

  it('stops nagging once all the digits are in', () => {
    const state = run(
      sent(),
      { type: 'tooShort' },
      { type: 'digits', digits: typed('123456') },
    )

    expect(codeTooShort(state)).toBe(false)
  })
})

describe('when something fails', () => {
  it('keeps the code and the digits when only asking for a code failed', () => {
    const state = run(
      sent(),
      { type: 'digits', digits: typed('123456') },
      { type: 'failed', error: { kind: 'network' }, clearCode: false },
    )

    expect(state.error).toEqual({ kind: 'network' })
    expect(state.sent?.otpRef).toBe('ref-1')
    expect(codeOf(state)).toBe('123456')
  })

  it('starts the boxes again when checking the code failed', () => {
    const before = run(sent(), { type: 'digits', digits: typed('123456') })
    const after = verificationReducer(before, {
      type: 'failed',
      error: { kind: 'codeWrong' },
      clearCode: true,
    })

    expect(after.error).toEqual({ kind: 'codeWrong' })
    expect(codeOf(after)).toBe('')
    expect(after.resetKey).toBe(before.resetKey + 1)
  })

  it('does not call a failed resend a new code on its way', () => {
    const state = run(sent(), sent(whatsapp, true), {
      type: 'failed',
      error: { kind: 'rateLimited' },
      clearCode: false,
    })

    expect(state.resent).toBe(false)
  })

  it('keeps the contact, so the visitor can ask for the code again', () => {
    const state = run(sent(), {
      type: 'failed',
      error: { kind: 'numberHasAccount' },
      clearCode: true,
    })

    expect(state.sent?.target).toEqual(whatsapp)
  })
})

describe('changing the contact', () => {
  it('goes back to the start and clears the boxes', () => {
    const before = run(
      sent(),
      { type: 'digits', digits: typed('12') },
      { type: 'failed', error: { kind: 'wait' }, clearCode: false },
    )
    const after = verificationReducer(before, { type: 'reset' })

    expect(after.sent).toBeNull()
    expect(after.resendAt).toBeNull()
    expect(after.error).toBeNull()
    expect(codeOf(after)).toBe('')
    expect(after.resetKey).toBe(before.resetKey + 1)
  })
})
