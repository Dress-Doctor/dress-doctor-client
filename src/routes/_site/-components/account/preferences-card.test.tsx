// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Router from '@tanstack/react-router'
import type { MyProfileDto } from '#/interfaces/account.dto'
import { rejecting } from '#/test/mocks'
import { renderWithProviders } from '#/test/render'
import PreferencesCard from './preferences-card'

const { updateProfile } = vi.hoisted(() => ({ updateProfile: vi.fn() }))
vi.mock('#/libs/account.api', () => ({ default: { updateProfile } }))
// Leaving the page is the router's business; these tests do not mount one.
vi.mock('@tanstack/react-router', async (original) => ({
  ...(await original<typeof Router>()),
  useBlocker: () => ({ status: 'idle' }),
}))

const profile: MyProfileDto = {
  customerCode: 'CU-AH7LCH',
  firstName: 'Ada',
  lastName: 'Deo',
  phone: '237698765294',
  whatsappPhone: '237698765294',
  email: 'ada@example.com',
  phoneUnverified: false,
  preferredLanguage: 'en',
  pickupAddress: 'Bonapriso, Douala',
  notificationsOptIn: true,
}

describe('PreferencesCard', () => {
  beforeEach(() => {
    updateProfile.mockReset()
  })

  const show = () => renderWithProviders(<PreferencesCard profile={profile} />)
  const address = () =>
    screen.getByLabelText<HTMLTextAreaElement>('Pickup address')
  const save = () => screen.getByRole('button', { name: 'Save changes' })

  it('starts on what is saved', () => {
    show()

    expect(address().value).toBe('Bonapriso, Douala')
    expect(screen.getByRole('radio', { name: 'English' })).toHaveProperty(
      'checked',
      true,
    )
  })

  it('has no box for a phone number or an email: those are changed with us', () => {
    show()

    expect(screen.queryByLabelText(/phone/i)).toBeNull()
    expect(screen.queryByLabelText(/email/i)).toBeNull()
  })

  it('sends only the address when only the address changed, to the customer’s own code', async () => {
    updateProfile.mockResolvedValue({})
    show()

    fireEvent.change(address(), { target: { value: 'Akwa, near the market' } })
    fireEvent.click(save())

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith('CU-AH7LCH', {
        pickupAddress: 'Akwa, near the market',
      }),
    )
  })

  it('sends the language when the customer picks French', async () => {
    updateProfile.mockResolvedValue({})
    show()

    // The control is a styled label over a hidden radio. Its state settles a
    // moment after the click, so wait for the form to notice before saving.
    fireEvent.click(screen.getByText('Français'))
    await screen.findByRole('button', { name: 'Undo changes' })
    fireEvent.click(save())

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith('CU-AH7LCH', {
        preferredLanguage: 'fr',
      }),
    )
  })

  it('tells the customer it is saved', async () => {
    updateProfile.mockResolvedValue({})
    show()
    fireEvent.change(address(), { target: { value: 'Akwa' } })

    fireEvent.click(save())

    expect(await screen.findByText('Your changes are saved.')).toBeTruthy()
  })

  it('says so, and sends nothing, when Save is pressed with nothing changed', async () => {
    show()

    fireEvent.click(save())

    expect(
      await screen.findByText('You have not changed anything.'),
    ).toBeTruthy()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('does not count extra spaces around the address as a change', async () => {
    show()

    fireEvent.change(address(), { target: { value: '  Bonapriso, Douala  ' } })
    fireEvent.click(save())

    expect(
      await screen.findByText('You have not changed anything.'),
    ).toBeTruthy()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('offers to undo only once something has changed, and puts the saved answers back', () => {
    show()
    expect(screen.queryByRole('button', { name: 'Undo changes' })).toBeNull()

    fireEvent.change(address(), { target: { value: 'Somewhere else' } })
    fireEvent.click(screen.getByRole('button', { name: 'Undo changes' }))

    expect(address().value).toBe('Bonapriso, Douala')
    expect(screen.queryByRole('button', { name: 'Undo changes' })).toBeNull()
  })

  it('says why in words when it could not be saved, and keeps what was typed', async () => {
    updateProfile.mockImplementation(rejecting(new AxiosError('Network Error')))
    show()
    fireEvent.change(address(), { target: { value: 'Akwa' } })

    fireEvent.click(save())

    expect(await screen.findByText(/cannot reach Dress Doctor/i)).toBeTruthy()
    expect(address().value).toBe('Akwa')
  })

  it('stops being "saved" as soon as the customer types again', async () => {
    updateProfile.mockResolvedValue({})
    show()
    fireEvent.change(address(), { target: { value: 'Akwa' } })
    fireEvent.click(save())
    await screen.findByText('Your changes are saved.')

    fireEvent.change(address(), { target: { value: 'Akwa, gate 2' } })

    expect(screen.queryByText('Your changes are saved.')).toBeNull()
  })
})
