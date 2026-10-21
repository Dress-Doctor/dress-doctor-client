import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { signupErrorFrom } from './signup-errors'

/** An error as axios builds it when the API answers with a status. */
function apiError(status: number, code: string, message = 'Failed') {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data: {
      success: false,
      statusCode: status,
      error: { code },
      message,
      timestamp: '2026-10-14T10:00:00.000Z',
    },
  }
  return error
}

describe('signupErrorFrom', () => {
  it('reads a wrong or old code when checking one', () => {
    expect(signupErrorFrom(apiError(401, 'UNAUTHENTICATED'), 'verify')).toEqual(
      { kind: 'codeWrong' },
    )
  })

  describe('after the code, when the customer is signed in', () => {
    it('reads a phone that has an account as a reason to use the phone’s WhatsApp', () => {
      expect(
        signupErrorFrom(apiError(409, 'PHONE_NEEDS_PROOF'), 'verify'),
      ).toEqual({ kind: 'numberHasAccount' })
    })

    it('reads a contact a code cannot settle', () => {
      expect(
        signupErrorFrom(apiError(409, 'CONTACT_IN_USE'), 'verify'),
      ).toEqual({ kind: 'contactInUse' })
    })

    it('reads a switched-off account', () => {
      expect(
        signupErrorFrom(apiError(403, 'ACCOUNT_INACTIVE'), 'verify'),
      ).toEqual({ kind: 'inactive' })
    })
  })

  describe('the request that follows', () => {
    it('reads a plan we do not have', () => {
      expect(signupErrorFrom(apiError(404, 'PLAN_NOT_FOUND'), 'send')).toEqual({
        kind: 'planUnavailable',
      })
    })

    it.each(['SUBSCRIPTION_PENDING', 'SUBSCRIPTION_EXISTS'])(
      'reads %s as a request that is already open',
      (code) => {
        expect(signupErrorFrom(apiError(409, code), 'send')).toEqual({
          kind: 'requestOpen',
        })
      },
    )

    it('reads an ended session, not a wrong code', () => {
      expect(signupErrorFrom(apiError(401, 'UNAUTHENTICATED'), 'send')).toEqual(
        { kind: 'sessionEnded' },
      )
    })

    it('reads a refusal as its own kind, not as an ended session', () => {
      expect(signupErrorFrom(apiError(403, 'FORBIDDEN'), 'send')).toEqual({
        kind: 'sendRefused',
      })
    })
  })

  describe('limits', () => {
    it('reads too many codes from one connection', () => {
      expect(signupErrorFrom(apiError(429, 'RATE_LIMITED'), 'request')).toEqual(
        { kind: 'rateLimited' },
      )
    })

    it('reads the API being too busy as its own kind', () => {
      expect(signupErrorFrom(apiError(503, 'SERVICE_BUSY'), 'request')).toEqual(
        { kind: 'busy' },
      )
    })

    it('reads the cool-down after too many tries, with its minutes', () => {
      const error = apiError(
        400,
        'BAD_REQUEST',
        'Please wait for 5 minute(s) before requesting another code.',
      )

      expect(signupErrorFrom(error, 'request')).toEqual({
        kind: 'wait',
        minutes: 5,
      })
    })

    it('reads a locked contact, before the code', () => {
      expect(signupErrorFrom(apiError(403, 'FORBIDDEN'), 'request')).toEqual({
        kind: 'locked',
      })
      expect(signupErrorFrom(apiError(403, 'FORBIDDEN'), 'verify')).toEqual({
        kind: 'locked',
      })
    })
  })

  it('reads details the API refused', () => {
    expect(
      signupErrorFrom(apiError(400, 'VALIDATION_ERROR'), 'verify'),
    ).toEqual({ kind: 'invalid' })
  })

  it('reads no answer at all as the network', () => {
    expect(signupErrorFrom(new AxiosError('Network Error'), 'request')).toEqual(
      {
        kind: 'network',
      },
    )
  })

  it('reads a server fault, or anything it does not know, as generic', () => {
    expect(signupErrorFrom(apiError(500, 'INTERNAL'), 'verify')).toEqual({
      kind: 'generic',
    })
    expect(signupErrorFrom(new Error('boom'), 'verify')).toEqual({
      kind: 'generic',
    })
    expect(signupErrorFrom(apiError(418, 'TEAPOT'), 'request')).toEqual({
      kind: 'generic',
    })
  })

  it('never carries the API’s own words', () => {
    const error = apiError(409, 'CONTACT_IN_USE', 'Secret staff-only detail')

    expect(JSON.stringify(signupErrorFrom(error, 'verify'))).not.toContain(
      'Secret',
    )
  })
})
