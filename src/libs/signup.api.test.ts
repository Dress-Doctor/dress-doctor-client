import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'
import { adminApi } from './api-client/api-instances'
import signupApi from './signup.api'

// See api-client.test.ts: the SSR cookie forwarding needs the Start runtime.
vi.mock('./api-client/server-cookies', () => ({
  forwardedCookieHeader: () => undefined,
  relaySetCookie: () => {},
  cookiePairsFrom: (values: string[]) =>
    values.map((value) => value.split(';')[0]).join('; '),
}))

describe('sign-up and the requests after it', () => {
  const originalAdapter = adminApi.defaults.adapter
  let seen: InternalAxiosRequestConfig[] = []

  beforeEach(() => {
    seen = []
    adminApi.defaults.adapter = async (config) => {
      seen.push(config)
      return {
        config,
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {
          success: true,
          statusCode: 200,
          data: {},
          message: 'ok',
          timestamp: '2026-10-14T10:00:00.000Z',
        },
      }
    }
  })

  afterEach(() => {
    adminApi.defaults.adapter = originalAdapter
  })

  const headerOf = (config: InternalAxiosRequestConfig, name: string) =>
    (config.headers as unknown as Record<string, string>)[name]

  const bodyOf = (config: InternalAxiosRequestConfig) =>
    JSON.parse(String(config.data)) as Record<string, unknown>

  const profile = {
    firstName: 'Ada',
    lastName: 'Deo',
    phone: '+237698765294',
  }

  it('names the customer portal on every call', async () => {
    await signupApi.requestCode({ identifier: '+237698765294' })
    await signupApi.complete({
      identifier: '+237698765294',
      otpRef: 'ref',
      code: '123456',
      profile,
    })
    await signupApi.requestPickup({
      pickupAddress: 'Akwa',
      pickupTime: 'MORNING 8AM - 12PM',
      pickupDate: '2026-10-20T11:00:00.000Z',
    })
    await signupApi.requestPlan({ planCode: 'basic-pieces-monthly' })

    expect(seen).toHaveLength(4)
    for (const config of seen) {
      expect(headerOf(config, 'x-portal')).toBe('customer')
    }
  })

  it('sends the code to sign-up, not to sign-in', async () => {
    await signupApi.requestCode({ identifier: 'ada@example.com' })

    expect(seen[0].url).toBe('/v1/auth/signup/request-code')
    expect(bodyOf(seen[0])).toEqual({
      identifier: 'ada@example.com',
      portal: 'customer',
    })
  })

  it('checks the code with the profile and the portal', async () => {
    await signupApi.complete({
      identifier: '+237698765294',
      otpRef: 'ref',
      code: '123456',
      profile,
    })

    expect(seen[0].url).toBe('/v1/auth/signup/complete')
    expect(bodyOf(seen[0])).toEqual({
      identifier: '+237698765294',
      otpRef: 'ref',
      code: '123456',
      profile,
      portal: 'customer',
    })
  })

  it('needs no change reason for the two sign-up calls', async () => {
    await signupApi.requestCode({ identifier: '+237698765294' })
    await signupApi.complete({
      identifier: '+237698765294',
      otpRef: 'ref',
      code: '123456',
      profile,
    })

    for (const config of seen) {
      expect(headerOf(config, 'x-change-reason')).toBeUndefined()
    }
  })

  it('gives a reason for the pickup request, and sends no identity', async () => {
    await signupApi.requestPickup({
      pickupAddress: 'Akwa',
      pickupTime: 'MORNING 8AM - 12PM',
      pickupDate: '2026-10-20T11:00:00.000Z',
    })

    expect(seen[0].url).toBe('/v1/pickups/mine')
    expect(headerOf(seen[0], 'x-change-reason')).toMatch(/pickup/i)
    expect(Object.keys(bodyOf(seen[0])).sort()).toEqual([
      'pickupAddress',
      'pickupDate',
      'pickupTime',
    ])
  })

  it('gives a reason for the plan request, and sends the code of the plan only', async () => {
    await signupApi.requestPlan({ planCode: 'standard-kg-quarterly' })

    expect(seen[0].url).toBe('/v1/subscriptions')
    expect(headerOf(seen[0], 'x-change-reason')).toMatch(/plan/i)
    expect(bodyOf(seen[0])).toEqual({ planCode: 'standard-kg-quarterly' })
  })

  it('never sends a password', async () => {
    await signupApi.requestCode({ identifier: 'ada@example.com' })

    expect(bodyOf(seen[0])).not.toHaveProperty('password')
  })
})
