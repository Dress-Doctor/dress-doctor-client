// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SignupProfileDto, VerifyTargetDto } from '#/interfaces/signup.dto'
import { apiError } from '#/test/api-errors'
import { rejecting } from '#/test/mocks'
import { renderHookWithClient } from '#/test/render'
import { useContactVerification } from './use-contact-verification'

const signup = vi.hoisted(() => ({ requestCode: vi.fn(), complete: vi.fn() }))
const auth = vi.hoisted(() => ({ me: vi.fn() }))
vi.mock('#/libs/signup.api', () => ({ default: signup }))
vi.mock('#/libs/auth.api', () => ({ default: auth }))

const target: VerifyTargetDto = {
  channel: 'whatsapp',
  identifier: '+237698765294',
  masked: '+237 698 ••• 294',
}
const profile: SignupProfileDto = {
  firstName: 'Ada',
  lastName: 'Deo',
  phone: '+237698765294',
}
const codeSent = () => ({
  data: {
    otpRef: 'ref-1',
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  },
})
const digits = (code: string) => code.split('')

describe('useContactVerification', () => {
  const onVerified = vi.fn()

  beforeEach(() => {
    signup.requestCode.mockReset()
    signup.complete.mockReset()
    auth.me.mockReset()
    onVerified.mockReset()
    auth.me.mockResolvedValue({ data: { user: { _id: 'u1' } } })
  })

  const setup = () =>
    renderHookWithClient(() => useContactVerification({ profile, onVerified }))

  /** Gets a code out, so the next step has something to check. */
  async function withCodeSent() {
    signup.requestCode.mockResolvedValue(codeSent())
    const hook = setup()
    act(() => hook.result.current.send(target))
    await waitFor(() => expect(hook.result.current.sent).toBe(true))
    return hook
  }

  describe('sending a code', () => {
    it('sends it to the contact it is given, and says where it went', async () => {
      const { result } = await withCodeSent()

      expect(signup.requestCode).toHaveBeenCalledWith({
        identifier: '+237698765294',
      })
      expect(result.current.target).toEqual(target)
      expect(result.current.maskedContact).toBe('+237 698 ••• 294')
    })

    it('starts with nothing sent', () => {
      const { result } = setup()

      expect(result.current.sent).toBe(false)
      expect(result.current.target).toBeNull()
      expect(result.current.expired).toBe(false)
    })

    it('does not start a second call in the same instant as the first', async () => {
      signup.requestCode.mockResolvedValue(codeSent())
      const { result } = setup()

      act(() => {
        result.current.send(target)
        result.current.send(target)
      })

      await waitFor(() => expect(result.current.sent).toBe(true))
      expect(signup.requestCode).toHaveBeenCalledTimes(1)
    })

    it('says why when the API turns it down', async () => {
      signup.requestCode.mockImplementation(
        rejecting(apiError(429, 'RATE_LIMITED')),
      )
      const { result } = setup()

      act(() => result.current.send(target))

      await waitFor(() =>
        expect(result.current.error?.kind).toBe('rateLimited'),
      )
      expect(result.current.sent).toBe(false)
    })

    it('is not blocked after a failure: the visitor can try again', async () => {
      signup.requestCode.mockImplementationOnce(rejecting(apiError(500)))
      signup.requestCode.mockResolvedValueOnce(codeSent())
      const { result } = setup()

      act(() => result.current.send(target))
      await waitFor(() => expect(result.current.error).not.toBeNull())
      act(() => result.current.send(target))

      await waitFor(() => expect(result.current.sent).toBe(true))
      expect(signup.requestCode).toHaveBeenCalledTimes(2)
    })
  })

  describe('asking for another code', () => {
    it('makes the visitor wait before another is sent', async () => {
      const { result } = await withCodeSent()
      expect(result.current.resendSeconds).toBeGreaterThan(0)

      act(() => result.current.askAgain())

      expect(signup.requestCode).toHaveBeenCalledTimes(1)
    })

    it('does nothing before a first code has gone', () => {
      const { result } = setup()

      act(() => result.current.askAgain())

      expect(signup.requestCode).not.toHaveBeenCalled()
    })
  })

  describe('checking the code', () => {
    it('will not check digits that are not all there', async () => {
      const { result } = await withCodeSent()

      act(() => result.current.submitCode(digits('12')))

      expect(signup.complete).not.toHaveBeenCalled()
      expect(result.current.codeTooShort).toBe(true)
    })

    it('sends the digits with the code’s reference, the contact and who the visitor is', async () => {
      signup.complete.mockResolvedValue({ data: { outcome: 'CREATED' } })
      const { result } = await withCodeSent()

      act(() => result.current.submitCode(digits('123456')))
      await waitFor(() => expect(onVerified).toHaveBeenCalled())

      expect(signup.complete).toHaveBeenCalledWith(
        {
          identifier: '+237698765294',
          otpRef: 'ref-1',
          code: '123456',
          profile,
        },
        expect.anything(),
      )
    })

    it('reads who is signed in again before it carries on, and then says how they got in', async () => {
      signup.complete.mockResolvedValue({ data: { outcome: 'CREATED' } })
      const { result } = await withCodeSent()

      act(() => result.current.submitCode(digits('123456')))
      await waitFor(() => expect(onVerified).toHaveBeenCalledWith('CREATED'))

      expect(auth.me).toHaveBeenCalled()
      expect(result.current.outcome).toBe('CREATED')
      expect(result.current.finishing).toBe(true)
      expect(result.current.verifying).toBe(true)
    })

    it('counts a visitor as signed in when the API does not say how', async () => {
      signup.complete.mockResolvedValue({ data: undefined })
      const { result } = await withCodeSent()

      act(() => result.current.submitCode(digits('123456')))

      await waitFor(() => expect(onVerified).toHaveBeenCalledWith('SIGNED_IN'))
    })

    it('carries on even when reading the account fails, since the code is used up', async () => {
      signup.complete.mockResolvedValue({ data: { outcome: 'SIGNED_IN' } })
      auth.me.mockImplementation(rejecting(apiError(500)))
      const { result } = await withCodeSent()

      act(() => result.current.submitCode(digits('123456')))

      await waitFor(() => expect(onVerified).toHaveBeenCalledWith('SIGNED_IN'))
    })

    it('does not check the same code twice when pressed twice', async () => {
      signup.complete.mockResolvedValue({ data: { outcome: 'CREATED' } })
      const { result } = await withCodeSent()

      act(() => {
        result.current.submitCode(digits('123456'))
        result.current.submitCode(digits('123456'))
      })
      await waitFor(() => expect(onVerified).toHaveBeenCalled())

      expect(signup.complete).toHaveBeenCalledTimes(1)
    })

    it('empties the boxes and says the code is wrong, and lets the visitor try again', async () => {
      signup.complete.mockImplementationOnce(
        rejecting(apiError(401, 'UNAUTHENTICATED')),
      )
      signup.complete.mockResolvedValueOnce({ data: { outcome: 'CREATED' } })
      const { result } = await withCodeSent()
      const before = result.current.codeResetKey

      act(() => result.current.submitCode(digits('000000')))
      await waitFor(() => expect(result.current.error?.kind).toBe('codeWrong'))

      expect(result.current.codeResetKey).toBeGreaterThan(before)
      expect(result.current.verifying).toBe(false)
      expect(onVerified).not.toHaveBeenCalled()

      act(() => result.current.submitCode(digits('123456')))
      await waitFor(() => expect(onVerified).toHaveBeenCalledWith('CREATED'))
    })
  })

  describe('starting again', () => {
    it('goes back to choosing where the code goes, with nothing proven', async () => {
      const { result } = await withCodeSent()

      act(() => result.current.changeContact())

      expect(result.current.sent).toBe(false)
      expect(result.current.target).toBeNull()
      expect(result.current.outcome).toBeNull()
      expect(result.current.finishing).toBe(false)
    })

    it('can send to a new contact after starting again', async () => {
      const { result } = await withCodeSent()
      act(() => result.current.changeContact())
      signup.requestCode.mockResolvedValue(codeSent())

      act(() =>
        result.current.send({
          channel: 'email',
          identifier: 'ada@example.com',
          masked: 'a•••a@example.com',
        }),
      )

      await waitFor(() => expect(result.current.target?.channel).toBe('email'))
      expect(signup.requestCode).toHaveBeenLastCalledWith({
        identifier: 'ada@example.com',
      })
    })
  })
})
