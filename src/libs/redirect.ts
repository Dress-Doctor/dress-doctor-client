/** The two pages the sign-in is about. `sitePaths` points at these. */
export const LOGIN_PATH = '/login'
export const ACCOUNT_PATH = '/account'

/**
 * A path on this site that is safe to send someone to after they log in.
 *
 * The destination arrives in the address, so anyone can write one. Only a
 * path that starts with a single `/` is kept. `//evil.com` and `/\evil.com`
 * both look like paths but leave the site, and a control character can hide
 * the rest of a link.
 */
export function sameSitePath(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (!value.startsWith('/')) return undefined
  if (value.startsWith('//') || value.startsWith('/\\')) return undefined
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return undefined
  return value
}

/** Where a customer goes once they are in: where they were headed, or home. */
export function afterLoginPath(redirect: string | undefined): string {
  const safe = sameSitePath(redirect)
  // Sending someone back to the login page would just bounce them again.
  if (!safe || safe === LOGIN_PATH || safe.startsWith(`${LOGIN_PATH}?`)) {
    return ACCOUNT_PATH
  }
  return safe
}
