import { createIsomorphicFn } from '@tanstack/react-start'
import {
  getRequestHeader,
  setResponseHeader,
} from '@tanstack/react-start/server'

/**
 * The session cookie the browser attaches automatically, expressed as a header
 * value the server can attach by hand.
 *
 * During SSR the API call originates from the Node server, not the browser, so
 * nothing attaches the cookie for us — the incoming document request carries
 * it and we forward it onto the outgoing API request. Without this, every
 * server-side `beforeLoad`/`loader` sees an anonymous user and a hard reload
 * bounces an authenticated user to the login page.
 *
 * On the client it returns undefined: the browser owns the cookie jar, and
 * `document.cookie` cannot read HttpOnly cookies anyway.
 */
export const forwardedCookieHeader = createIsomorphicFn()
  .client(() => undefined as string | undefined)
  .server(() => getRequestHeader('cookie'))

/**
 * Hands cookies the API issued mid-SSR back to the browser on the document
 * response.
 *
 * This is what makes a server-side token refresh safe. The API rotates refresh
 * tokens and revokes the old one, so if the server refreshed and kept the new
 * cookie to itself, the browser would be left holding a revoked token and the
 * next request would sign the user out — the reuse detector would even revoke
 * the whole chain.
 */
export const relaySetCookie = createIsomorphicFn()
  .client((_values: string[]) => {})
  .server((values: string[]) => {
    // Set-Cookie is the one header that legitimately repeats, so the array.
    setResponseHeader('set-cookie', values)
  })

/**
 * `name=value; name2=value2` from a Set-Cookie list, for reusing freshly
 * rotated cookies on the retried request within the same SSR pass.
 */
export const cookiePairsFrom = (values: string[]): string =>
  values.map((value) => value.split(';')[0]).join('; ')
