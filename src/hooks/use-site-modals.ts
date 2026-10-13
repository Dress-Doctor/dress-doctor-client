import { createContext, useContext } from 'react'
import type {
  BookingPrefillDto,
  SubscribePrefillDto,
} from '#/interfaces/booking.dto'

export interface SiteModalsApi {
  /** Opens the pickup form, optionally with a service or an area filled in. */
  openBooking: (prefill?: BookingPrefillDto) => void
  /** Opens the plan form, optionally on a given plan, count mode and billing. */
  openSubscribe: (prefill?: SubscribePrefillDto) => void
}

export const SiteModalsContext = createContext<SiteModalsApi | null>(null)

/**
 * The one way any button on the site opens the pickup or plan form. Both forms
 * are rendered once, by the site layout, so every button opens the same one.
 */
export function useSiteModals() {
  const api = useContext(SiteModalsContext)
  if (!api) {
    throw new Error('useSiteModals must be used inside <SiteModalsProvider>')
  }
  return api
}
