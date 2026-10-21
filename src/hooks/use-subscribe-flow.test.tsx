// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiError } from '#/test/api-errors'
import { rejecting } from '#/test/mocks'
import { renderHookWithClient } from '#/test/render'
import { useContactDraft } from './use-contact-draft'
import { useSubscribeFlow } from './use-subscribe-flow'

const signup = vi.hoisted(() => ({
  requestCode: vi.fn(),
  complete: vi.fn(),
  requestPlan: vi.fn(),
}))
const auth = vi.hoisted(() => ({ me: vi.fn(), logout: vi.fn() }))
vi.mock('#/libs/signup.api', () => ({ default: signup }))
vi.mock('#/libs/auth.api', () => ({ default: auth }))
// Logging out goes through the router, which these tests do not mount.
vi.mock('#/hooks/use-logout', () => ({
  useLogout: () => ({ logout: vi.fn(), loggingOut: false }),
}))

const codeSent = () => ({
  data: {
    otpRef: 'ref-1',
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  },
})

const customerAnswer = {
  data: {
    user: {
      _id: 'u1',
      firstName: 'Ada',
      lastName: 'Deo',
      isActive: true,
      userTypeId: { _id: 't1', userTypeName: 'CUSTOMER' },
    },
  },
}

/** A visitor who has filled in every field the form asks for. */
const who = {
  firstName: 'Ada',
  lastName: 'Deo',
  phone: '698 765 294',
  phoneCountry: 'CM',
  consent: true,
}

describe('useSubscribeFlow', () => {
  beforeEach(() => {
    for (const fn of [...Object.values(signup), ...Object.values(auth)]) {
      fn.mockReset()
    }
    // Nobody is signed in unless a test says so.
    auth.me.mockImplementation(rejecting(apiError(401)))
    signup.requestCode.mockResolvedValue(codeSent())
  })

  function setup(props: { signedIn?: boolean } = {}) {
    if (props.signedIn) auth.me.mockResolvedValue(customerAnswer)
    const change = vi.fn()
    const hook = renderHookWithClient(() => {
      const contact = useContactDraft()
      const flow = useSubscribeFlow({
        open: true,
        tier: undefined,
        mode: 'kg',
        billing: 'monthly',
        change,
        contact,
      })
      return { flow, contact }
    })
    return { ...hook, change }
  }

  /** Signed out, with the details filled in and a code sent. */
  async function atTheCode() {
    const hook = setup()
    act(() => hook.result.current.contact.change(who))
    act(() => {
      hook.result.current.flow.submit()
    })
    await waitFor(() =>
      expect(hook.result.current.flow.verification.sent).toBe(true),
    )
    return hook
  }

  /** The code was right: the request goes the moment it is accepted. */
  async function codeAccepted(
    result: Awaited<ReturnType<typeof atTheCode>>['result'],
  ) {
    signup.complete.mockResolvedValue({ data: { outcome: 'CREATED' } })
    act(() => result.current.flow.verification.submitCode('123456'.split('')))
  }

  describe('the details step', () => {
    it('starts on the details', () => {
      const { result } = setup()

      expect(result.current.flow.step).toBe('details')
      expect(result.current.flow.submitted).toBe(false)
    })

    it('names the plan the way the API knows it', () => {
      const { result } = setup()

      expect(result.current.flow.planCode).toMatch(/^[a-z]+-kg-monthly$/)
    })

    it('answers with the first field that is wrong, and goes nowhere', () => {
      const { result } = setup()

      let wrong: string | undefined
      act(() => {
        wrong = result.current.flow.submit()
      })

      expect(wrong).toBe('firstName')
      expect(result.current.flow.step).toBe('details')
      expect(result.current.flow.errors.firstName).toBe(true)
      expect(signup.requestCode).not.toHaveBeenCalled()
    })

    it('clears a complaint as soon as the field is changed', () => {
      const { result } = setup()
      act(() => {
        result.current.flow.submit()
      })

      act(() => result.current.flow.update({ firstName: 'Ada' }))

      expect(result.current.flow.errors.firstName).toBeUndefined()
      expect(result.current.flow.errors.lastName).toBe(true)
    })

    it('moves to the code and sends one when every field is right', async () => {
      const { result } = await atTheCode()

      expect(result.current.flow.step).toBe('verify')
      expect(signup.requestCode).toHaveBeenCalledWith({
        identifier: '+237698765294',
      })
    })
  })

  describe('going back and forward again', () => {
    it('does not send a second code to a contact one is already out for', async () => {
      const { result } = await atTheCode()

      act(() => result.current.flow.back())
      expect(result.current.flow.step).toBe('details')
      act(() => {
        result.current.flow.submit()
      })

      expect(result.current.flow.step).toBe('verify')
      expect(signup.requestCode).toHaveBeenCalledTimes(1)
    })

    it('sends a new code when the number changed', async () => {
      const { result } = await atTheCode()
      act(() => result.current.flow.back())
      act(() => result.current.flow.update({ phone: '677 123 456' }))

      act(() => {
        result.current.flow.submit()
      })

      await waitFor(() => expect(signup.requestCode).toHaveBeenCalledTimes(2))
      expect(signup.requestCode).toHaveBeenLastCalledWith({
        identifier: '+237677123456',
      })
    })
  })

  describe('once the code is accepted', () => {
    it('asks for the plan at once, and says it was requested', async () => {
      signup.requestPlan.mockResolvedValue({ data: {} })
      const { result } = await atTheCode()

      await codeAccepted(result)

      await waitFor(() => expect(result.current.flow.placed).not.toBeNull())
      expect(signup.requestPlan).toHaveBeenCalledWith({
        planCode: result.current.flow.planCode,
      })
      expect(result.current.flow.placed).toEqual({
        kind: 'requested',
        outcome: 'CREATED',
      })
      expect(result.current.flow.submitted).toBe(true)
    })

    it('cannot be gone back from: a code that was accepted cannot be un-proved', async () => {
      signup.requestPlan.mockImplementation(rejecting(apiError(500)))
      const { result } = await atTheCode()
      await codeAccepted(result)
      await waitFor(() => expect(result.current.flow.sendError).not.toBeNull())

      act(() => result.current.flow.back())

      expect(result.current.flow.step).toBe('verify')
    })

    it('says a request is already waiting, instead of an error', async () => {
      signup.requestPlan.mockImplementation(
        rejecting(apiError(409, 'SUBSCRIPTION_PENDING')),
      )
      const { result } = await atTheCode()

      await codeAccepted(result)

      await waitFor(() => expect(result.current.flow.placed).not.toBeNull())
      expect(result.current.flow.placed?.kind).toBe('open')
      expect(result.current.flow.sendError).toBeNull()
    })

    it('says a plan already running is the same, not a fault', async () => {
      signup.requestPlan.mockImplementation(
        rejecting(apiError(409, 'SUBSCRIPTION_EXISTS')),
      )
      const { result } = await atTheCode()

      await codeAccepted(result)

      await waitFor(() => expect(result.current.flow.placed?.kind).toBe('open'))
    })

    it('hands the visitor to WhatsApp when the website does not know the plan', async () => {
      signup.requestPlan.mockImplementation(
        rejecting(apiError(404, 'PLAN_NOT_FOUND')),
      )
      const { result } = await atTheCode()

      await codeAccepted(result)

      await waitFor(() =>
        expect(result.current.flow.placed?.kind).toBe('whatsapp'),
      )
      expect(result.current.flow.placed?.outcome).toBe('CREATED')
    })

    it('sends the visitor back to the details when the session ended in between', async () => {
      signup.requestPlan.mockImplementation(rejecting(apiError(401)))
      const { result } = await atTheCode()

      await codeAccepted(result)

      await waitFor(() => expect(result.current.flow.step).toBe('details'))
      expect(result.current.flow.sendError?.kind).toBe('sessionEnded')
      // Nothing is proven any more: the code starts again.
      expect(result.current.flow.verification.sent).toBe(false)
      expect(result.current.flow.placed).toBeNull()
    })

    it('stays on the code step when the API refuses the request, and can try again', async () => {
      signup.requestPlan.mockImplementation(rejecting(apiError(403)))
      const { result } = await atTheCode()

      await codeAccepted(result)

      await waitFor(() => expect(result.current.flow.canRetry).toBe(true))
      expect(result.current.flow.sendError?.kind).toBe('sendRefused')
      // The session is fine, so nothing starts again from the details.
      expect(result.current.flow.step).toBe('verify')
      expect(result.current.flow.placed).toBeNull()
    })

    it('is not busy once the request failed, so the button can be pressed again', async () => {
      signup.requestPlan.mockImplementation(rejecting(apiError(500)))
      const { result } = await atTheCode()

      await codeAccepted(result)

      await waitFor(() => expect(result.current.flow.canRetry).toBe(true))
      expect(result.current.flow.sending).toBe(false)
    })

    it('is busy from the moment the code is accepted until the request answers', async () => {
      let answer: (value: unknown) => void = () => {}
      signup.requestPlan.mockImplementation(
        () => new Promise((resolve) => (answer = resolve)),
      )
      const { result } = await atTheCode()

      await codeAccepted(result)
      await waitFor(() => expect(signup.requestPlan).toHaveBeenCalled())
      expect(result.current.flow.sending).toBe(true)

      await act(async () => answer({ data: {} }))
      await waitFor(() => expect(result.current.flow.placed).not.toBeNull())
    })

    it('can send the request again without a new code when it failed for another reason', async () => {
      signup.requestPlan.mockImplementationOnce(rejecting(apiError(500)))
      signup.requestPlan.mockResolvedValueOnce({ data: {} })
      const { result } = await atTheCode()
      await codeAccepted(result)
      await waitFor(() => expect(result.current.flow.canRetry).toBe(true))

      act(() => {
        result.current.flow.submit()
      })

      await waitFor(() =>
        expect(result.current.flow.placed?.kind).toBe('requested'),
      )
      expect(signup.requestPlan).toHaveBeenCalledTimes(2)
      expect(signup.complete).toHaveBeenCalledTimes(1)
      expect(signup.requestCode).toHaveBeenCalledTimes(1)
    })
  })

  describe('a customer who is signed in', () => {
    it('just asks, with no details and no code', async () => {
      signup.requestPlan.mockResolvedValue({ data: {} })
      const { result } = setup({ signedIn: true })
      await waitFor(() => expect(result.current.flow.customer).not.toBeNull())

      act(() => {
        result.current.flow.submit()
      })

      await waitFor(() => expect(result.current.flow.placed).not.toBeNull())
      expect(signup.requestCode).not.toHaveBeenCalled()
      expect(result.current.flow.placed).toEqual({
        kind: 'requested',
        outcome: null,
      })
    })
  })

  describe('finishing', () => {
    it('forgets the visitor’s details once the confirmation has closed', async () => {
      signup.requestPlan.mockResolvedValue({ data: {} })
      const { result } = await atTheCode()
      await codeAccepted(result)
      await waitFor(() => expect(result.current.flow.submitted).toBe(true))

      act(() => result.current.flow.finish())

      expect(result.current.flow.placed).toBeNull()
      expect(result.current.flow.step).toBe('details')
      expect(result.current.contact.contact.firstName).toBe('')
      expect(result.current.flow.verification.sent).toBe(false)
    })

    it('keeps everything while the request has not gone', async () => {
      const { result } = await atTheCode()

      act(() => result.current.flow.finish())

      expect(result.current.contact.contact.firstName).toBe('Ada')
      expect(result.current.flow.step).toBe('verify')
    })
  })
})
