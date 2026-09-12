import { paraglideMiddleware } from '@/paraglide/server'
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

const fetchHandler = createStartHandler(defaultStreamHandler)

/**
 * Custom server entry so Paraglide can resolve the locale on the server.
 *
 * The `url` strategy reads the locale from the path, which only works in the
 * browser unless something puts the request into AsyncLocalStorage first.
 * Without this, `getLocale()` falls back to `baseLocale` during SSR: `/fr`
 * pages render in English, and the router's `output` rewrite drops the `/fr`
 * prefix and 307s back to the unprefixed path.
 *
 * The original `req` is passed through, *not* the delocalized one the
 * middleware hands to the callback — the router already delocalizes via
 * `rewrite.input`, and doing it twice loops the redirect.
 */
export default {
  fetch: (req: Request) => paraglideMiddleware(req, () => fetchHandler(req)),
}
