import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'
import { adminApi } from './api-client/api-instances'
import authApi from './auth.api'

// See api-client.test.ts: the SSR cookie forwarding needs the Start runtime.
vi.mock('./api-client/server-cookies', () => ({
  forwardedCookieHeader: () => undefined,
  relaySetCookie: () => {},
  cookiePairsFrom: (values: string[]) =>
    values.map((value) => value.split(';')[0]).join('; '),
}))

describe('the customer portal identifies itself to the API', () => {
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

  it('names the customer portal on every request', async () => {
    await authApi.me()
    await authApi.logout()

    expect(seen).toHaveLength(2)
    for (const config of seen) {
      expect(headerOf(config, 'x-portal')).toBe('customer')
    }
  })

  it('asks for a code among customer accounts only', async () => {
    await authApi.requestCode({ identifier: '+237670678660' })
    await authApi.resendCode({ identifier: '+237670678660' })

    expect(seen.map((config) => config.url)).toEqual([
      '/v1/auth/initiate-login',
      '/v1/auth/resend-otp',
    ])
    for (const config of seen) {
      expect(bodyOf(config)).toEqual({
        identifier: '+237670678660',
        portal: 'customer',
      })
    }
  })

  it('checks the code against the customer account too', async () => {
    await authApi.verifyCode({
      identifier: '+237670678660',
      otpRef: 'ref',
      code: '123456',
    })

    expect(bodyOf(seen[0])).toEqual({
      identifier: '+237670678660',
      otpRef: 'ref',
      code: '123456',
      portal: 'customer',
    })
  })

  it('never sends a password', async () => {
    await authApi.requestCode({ identifier: 'ada@example.com' })

    expect(bodyOf(seen[0])).not.toHaveProperty('password')
  })
})
