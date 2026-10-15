import { describe, expect, it } from 'vitest'
import { ACCOUNT_PATH, afterLoginPath, sameSitePath } from './redirect'

describe('sameSitePath', () => {
  it('keeps a path on this site, with its search', () => {
    expect(sameSitePath('/account')).toBe('/account')
    expect(sameSitePath('/services?modal=booking&service=washFold')).toBe(
      '/services?modal=booking&service=washFold',
    )
  })

  it.each([
    ['another site', 'https://evil.example/account'],
    ['a protocol-relative link', '//evil.example'],
    ['a backslash link', '/\\evil.example'],
    ['a script', 'javascript:alert(1)'],
    ['a relative path', 'account'],
    ['a control character', '/account\n//evil.example'],
    ['a number', 12],
    ['nothing', undefined],
  ])('drops %s', (_name, value) => {
    expect(sameSitePath(value)).toBeUndefined()
  })
})

describe('afterLoginPath', () => {
  it('goes where the visitor was headed', () => {
    expect(afterLoginPath('/fr/services')).toBe('/fr/services')
  })

  it('goes to the account when there is nowhere better', () => {
    expect(afterLoginPath(undefined)).toBe(ACCOUNT_PATH)
    expect(afterLoginPath('//evil.example')).toBe(ACCOUNT_PATH)
  })

  it('never sends someone back to the login page', () => {
    expect(afterLoginPath('/login')).toBe(ACCOUNT_PATH)
    expect(afterLoginPath('/login?redirect=%2Faccount')).toBe(ACCOUNT_PATH)
  })
})
