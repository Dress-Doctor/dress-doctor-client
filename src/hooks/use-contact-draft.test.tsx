// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { emptyContact } from '#/libs/contact'
import { useContactDraft } from './use-contact-draft'

describe('useContactDraft', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useContactDraft())

    expect(result.current.contact).toEqual(emptyContact)
  })

  it('changes only what it is told, and keeps the rest', () => {
    const { result } = renderHook(() => useContactDraft())

    act(() => result.current.change({ firstName: 'Ada' }))
    act(() => result.current.change({ lastName: 'Deo' }))

    expect(result.current.contact.firstName).toBe('Ada')
    expect(result.current.contact.lastName).toBe('Deo')
    expect(result.current.contact.phoneCountry).toBe(emptyContact.phoneCountry)
  })

  it('forgets everything when it is cleared', () => {
    const { result } = renderHook(() => useContactDraft())
    act(() => result.current.change({ firstName: 'Ada', consent: true }))

    act(() => result.current.clear())

    expect(result.current.contact).toEqual(emptyContact)
  })
})
