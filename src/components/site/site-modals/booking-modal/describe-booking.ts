import { bookingServices } from '#/data/booking.data'
import { buildAddress, formatPickup, windowById } from '#/libs/booking'
import utils from '#/libs/utils'
import type { BookingFlow } from '#/hooks/use-booking-flow'

/**
 * The visitor's answers as short lines of text, or `null` for one they have
 * not given yet. The side panel and the "request sent" screen both read these,
 * so the two can never describe the same pickup in different words.
 */
export function describeBooking({ draft, days, customer }: BookingFlow) {
  const service = bookingServices.find((option) => option.id === draft.service)
  const day = days.find((candidate) => candidate.key === draft.date)
  const window = windowById(draft.windowId)

  return {
    service: service?.name() ?? null,
    pickup: day && window ? formatPickup(day, window) : null,
    address: draft.area.trim() ? buildAddress(draft) : null,
    // A signed-in customer is who the account says, not what the form holds.
    contact: customer
      ? utils.fullName(customer)
      : draft.firstName.trim()
        ? utils.fullName({
            firstName: draft.firstName,
            lastName: draft.lastName,
          })
        : null,
  }
}
