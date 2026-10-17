// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toPickupDate } from '#/libs/booking'
import { apiError } from '#/test/api-errors'
import { rejecting } from '#/test/mocks'
import { renderHookWithClient } from '#/test/render'
import { useBookingFlow } from './use-booking-flow'
import { useContactDraft } from './use-contact-draft'

const signup = vi.hoisted(() => ({
  requestCode: vi.fn(),
  complete: vi.fn(),
  requestPickup: vi.fn(),
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

const pickupPlaced = (created = true) => ({
  data: {
    created,
    pickupRequest: {
      _id: 'p1',
      reference: 'PU-A4F92C',
      pickupDate: '2026-10-15T11:00:00.000Z',
      pickupTime: 'MORNING 8AM - 12PM',
      status: created ? 'PENDING' : 'CONFIRMED',
    },
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

const who = {
  firstName: 'Ada',
  lastName: 'Deo',
  phone: '698 765 294',
  phoneCountry: 'CM',
  consent: true,
}

/** Thursday the 15th is open; the clock says it is Wednesday morning. */
const DAY = '2026-10-15'

describe('useBookingFlow', () => {
  beforeEach(() => {
    for (const fn of [...Object.values(signup), ...Object.values(auth)]) {
      fn.mockReset()
    }
    // Only the clock is faked: the timers the hooks wait on stay real.
    vi.useFakeTimers({
      toFake: ['Date'],
      now: new Date(2026, 9, 14, 8, 0, 0),
    })
    auth.me.mockImplementation(rejecting(apiError(401)))
    signup.requestCode.mockResolvedValue(codeSent())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function setup(props: { signedIn?: boolean } = {}) {
    if (props.signedIn) auth.me.mockResolvedValue(customerAnswer)
    const setService = vi.fn()
    const hook = renderHookWithClient(() => {
      const contact = useContactDraft()
      const flow = useBookingFlow({
        open: true,
        service: undefined,
        setService,
        contact,
      })
      return { flow, contact }
    })
    return { ...hook, setService }
  }

  type Hook = ReturnType<typeof setup>['result']

  /** Answers the pickup's own questions: what, when and where. */
  function answerPickup(result: Hook) {
    act(() => result.current.flow.update({ service: 'washFold' }))
    act(() => {
      result.current.flow.next()
    })
    act(() => result.current.flow.update({ date: DAY, windowId: 'morning' }))
    act(() => {
      result.current.flow.next()
    })
    act(() =>
      result.current.flow.update({ area: 'Akwa', street: 'Near the market' }),
    )
  }

  /** Signed out, all the way to a code that has been sent. */
  async function atTheCode() {
    const hook = setup()
    answerPickup(hook.result)
    act(() => {
      hook.result.current.flow.next()
    })
    expect(hook.result.current.flow.step).toBe('contact')
    act(() => hook.result.current.contact.change(who))
    act(() => {
      hook.result.current.flow.next()
    })
    await waitFor(() =>
      expect(hook.result.current.flow.verification.sent).toBe(true),
    )
    return hook
  }

  function acceptCode(result: Hook) {
    signup.complete.mockResolvedValue({ data: { outcome: 'CREATED' } })
    act(() => result.current.flow.verification.submitCode('123456'.split('')))
  }

  describe('the steps', () => {
    it('takes a visitor who is not signed in through five steps, ending on the code', () => {
      const { result } = setup()

      expect(result.current.flow.steps).toEqual([
        'service',
        'time',
        'address',
        'contact',
        'verify',
      ])
    })

    it('stops a signed-in customer after the address', async () => {
      const { result } = setup({ signedIn: true })

      await waitFor(() => expect(result.current.flow.customer).not.toBeNull())

      expect(result.current.flow.steps).toEqual(['service', 'time', 'address'])
    })

    it('answers with the first missing field and stays where it is', () => {
      const { result } = setup()

      let wrong: string | undefined
      act(() => {
        wrong = result.current.flow.next()
      })

      expect(wrong).toBe('service')
      expect(result.current.flow.step).toBe('service')
      expect(result.current.flow.errors.service).toBe(true)
    })

    it('goes back a step, and not past the first', () => {
      const { result } = setup()
      act(() => result.current.flow.update({ service: 'washFold' }))
      act(() => {
        result.current.flow.next()
      })
      expect(result.current.flow.step).toBe('time')

      act(() => result.current.flow.back())
      expect(result.current.flow.step).toBe('service')

      act(() => result.current.flow.back())
      expect(result.current.flow.step).toBe('service')
    })

    it('puts the service in the address, and takes it out again', () => {
      const { result, setService } = setup()

      act(() => result.current.flow.update({ service: 'washIron' }))
      expect(setService).toHaveBeenLastCalledWith('washIron')

      act(() => result.current.flow.update({ service: null }))
      expect(setService).toHaveBeenLastCalledWith(undefined)
    })
  })

  describe('a visitor who is not signed in', () => {
    it('proves their contact before anything is asked for', async () => {
      const { result } = await atTheCode()

      expect(result.current.flow.step).toBe('verify')
      expect(signup.requestCode).toHaveBeenCalledWith({
        identifier: '+237698765294',
      })
      expect(signup.requestPickup).not.toHaveBeenCalled()
    })

    it('asks for the pickup the moment the code is accepted, sending where and when and nothing else', async () => {
      signup.requestPickup.mockResolvedValue(pickupPlaced())
      const { result } = await atTheCode()

      acceptCode(result)

      await waitFor(() => expect(result.current.flow.placed).not.toBeNull())
      expect(signup.requestPickup).toHaveBeenCalledWith({
        pickupAddress: 'Near the market, Akwa',
        pickupTime: 'MORNING 8AM - 12PM',
        pickupDate: toPickupDate(DAY),
      })
      expect(result.current.flow.placed).toMatchObject({
        reference: 'PU-A4F92C',
        created: true,
        outcome: 'CREATED',
        existing: null,
      })
    })

    it('says so when a pickup was already open, and hands back that one', async () => {
      signup.requestPickup.mockResolvedValue(pickupPlaced(false))
      const { result } = await atTheCode()

      acceptCode(result)

      await waitFor(() => expect(result.current.flow.placed).not.toBeNull())
      expect(result.current.flow.placed?.created).toBe(false)
      expect(result.current.flow.placed?.existing?.reference).toBe('PU-A4F92C')
    })

    it('goes back to the details when the session ended before the request', async () => {
      signup.requestPickup.mockImplementation(rejecting(apiError(401)))
      const { result } = await atTheCode()

      acceptCode(result)

      await waitFor(() => expect(result.current.flow.step).toBe('contact'))
      expect(result.current.flow.sendError?.kind).toBe('sessionEnded')
      expect(result.current.flow.verification.sent).toBe(false)
      expect(result.current.flow.placed).toBeNull()
    })

    it('cannot go back once the code was accepted', async () => {
      signup.requestPickup.mockImplementation(rejecting(apiError(500)))
      const { result } = await atTheCode()
      acceptCode(result)
      await waitFor(() => expect(result.current.flow.sendError).not.toBeNull())

      act(() => result.current.flow.back())

      expect(result.current.flow.step).toBe('verify')
    })

    it('is not busy once the request failed, so "try again" can be pressed', async () => {
      signup.requestPickup.mockImplementation(rejecting(apiError(500)))
      const { result } = await atTheCode()

      acceptCode(result)

      await waitFor(() => expect(result.current.flow.canRetry).toBe(true))
      expect(result.current.flow.sending).toBe(false)
    })

    it('sends the request again on retry, with no new code', async () => {
      signup.requestPickup.mockImplementationOnce(rejecting(apiError(500)))
      signup.requestPickup.mockResolvedValueOnce(pickupPlaced())
      const { result } = await atTheCode()
      acceptCode(result)
      await waitFor(() => expect(result.current.flow.canRetry).toBe(true))

      act(() => result.current.flow.retry())

      await waitFor(() => expect(result.current.flow.placed).not.toBeNull())
      expect(signup.requestPickup).toHaveBeenCalledTimes(2)
      expect(signup.complete).toHaveBeenCalledTimes(1)
      expect(signup.requestCode).toHaveBeenCalledTimes(1)
      expect(result.current.flow.placed?.outcome).toBe('CREATED')
    })

    it('does not send a second code when the visitor goes back to the details and forward again', async () => {
      const { result } = await atTheCode()

      act(() => result.current.flow.back())
      expect(result.current.flow.step).toBe('contact')
      act(() => {
        result.current.flow.next()
      })

      expect(result.current.flow.step).toBe('verify')
      expect(signup.requestCode).toHaveBeenCalledTimes(1)
    })
  })

  describe('a customer who is signed in', () => {
    it('asks from the address step, with no details and no code', async () => {
      signup.requestPickup.mockResolvedValue(pickupPlaced())
      const { result } = setup({ signedIn: true })
      await waitFor(() => expect(result.current.flow.customer).not.toBeNull())
      answerPickup(result)

      act(() => {
        result.current.flow.next()
      })

      await waitFor(() => expect(result.current.flow.placed).not.toBeNull())
      expect(signup.requestCode).not.toHaveBeenCalled()
      expect(result.current.flow.placed?.outcome).toBeNull()
      expect(signup.requestPickup).toHaveBeenCalledWith({
        pickupAddress: 'Near the market, Akwa',
        pickupTime: 'MORNING 8AM - 12PM',
        pickupDate: toPickupDate(DAY),
      })
    })
  })

  describe('finishing', () => {
    it('forgets everything once the confirmation has closed', async () => {
      signup.requestPickup.mockResolvedValue(pickupPlaced())
      const { result } = await atTheCode()
      acceptCode(result)
      await waitFor(() => expect(result.current.flow.submitted).toBe(true))

      act(() => result.current.flow.finish())

      expect(result.current.flow.placed).toBeNull()
      expect(result.current.flow.step).toBe('service')
      expect(result.current.flow.draft.area).toBe('')
      expect(result.current.contact.contact.firstName).toBe('')
    })

    it('keeps the answers while nothing has been sent', async () => {
      const { result } = await atTheCode()

      act(() => result.current.flow.finish())

      expect(result.current.flow.draft.area).toBe('Akwa')
      expect(result.current.flow.step).toBe('verify')
    })
  })
})
