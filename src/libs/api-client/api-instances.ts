import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import config from '#/config/config'
import { getLocale } from '#/libs/i18n'
import type { ErrorResponseDto } from '#/interfaces/api-client.dto'
import {
  cookiePairsFrom,
  forwardedCookieHeader,
  relaySetCookie,
} from './server-cookies'

/**
 * The single axios instance behind every API call (CLAUDE.md §5).
 * - Platform gate: x-api-key / x-api-secret on every request
 * - User gate: the HttpOnly session cookie, sent by the browser
 * - Accept-Language: read per-request from the app store (fr default)
 * - 401: ONE silent refresh → retry the original request
 *
 * No access token is ever held in JS. `withCredentials` is what carries the
 * session, so an XSS cannot read or exfiltrate it — which in turn requires the
 * API to keep `credentials: true` behind an exact-origin allowlist.
 */
const clientApi = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

/** One process serves every user, so nothing session-shaped may be module state. */
const isServer = typeof window === 'undefined'

const platformHeaders = () => ({
  'x-api-key': config.clientKey,
  'x-api-secret': config.clientSecret,
  'Accept-Language': getLocale(),
})

clientApi.interceptors.request.use((req) => {
  Object.assign(req.headers, platformHeaders())

  // SSR only: the browser is not making this call, so the document request's
  // cookie has to be relayed by hand. A retry may already carry a fresher one.
  if (isServer && !req.headers['Cookie']) {
    const cookie = forwardedCookieHeader()
    if (cookie) req.headers['Cookie'] = cookie
  }

  return req
})

/**
 * Client-only single-flight: concurrent 401s in one browser share a refresh.
 * On the server this must stay null — one process serves many users, and a
 * shared promise would hand one user's rotated session to another.
 */
let refreshInFlight: Promise<string | null> | null = null

/**
 * Rotates the session using the refresh cookie and resolves to the cookie
 * header a follow-up request should use (empty string in the browser, where
 * the cookie jar handles it), or null when the session is over.
 *
 * On the server the issued cookies are also relayed onto the document
 * response: the API revokes the old refresh token on rotation, so a browser
 * left holding it would be signed out on its next request — and the reuse
 * detector would revoke the whole chain.
 */
async function refreshSession(cookie?: string): Promise<string | null> {
  try {
    // Raw axios (not adminApi) so a 401 here can't recurse into this handler.
    const res = await axios.post(
      `${config.baseUrl}/v1/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: {
          ...platformHeaders(),
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
    )

    const issued = res.headers['set-cookie']
    if (isServer && Array.isArray(issued) && issued.length) {
      relaySetCookie(issued)
      return cookiePairsFrom(issued)
    }

    return ''
  } catch {
    return null
  }
}

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean }

clientApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponseDto>) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (status === 401 && original && !original._retried) {
      const cookie = isServer
        ? (original.headers?.['Cookie'] as string | undefined)
        : undefined

      let refreshed: string | null
      if (isServer) {
        refreshed = await refreshSession(cookie)
      } else {
        refreshInFlight = refreshInFlight ?? refreshSession()
        refreshed = await refreshInFlight
        refreshInFlight = null
      }

      if (refreshed !== null) {
        original._retried = true
        // Carry the rotated cookie on this request only — never in module
        // state, which would bleed one user's session into another's render.
        if (refreshed) {
          original.headers = { ...original.headers, Cookie: refreshed }
        }
        return clientApi.request(original)
      }
      // Refresh failed → the session is over. The route guard owns the
      // redirect; it re-runs because the session query rejects.
    }

    return Promise.reject(error)
  },
)

export { clientApi as adminApi }
