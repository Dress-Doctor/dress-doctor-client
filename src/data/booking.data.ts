import icons from '#/config/icons'
import { pickupAddressData } from '#/data/pick-up-form.data'
import { homeKgServices } from '#/data/home.data'
import type {
  BookingServiceOptionDto,
  PickupWindowDto,
} from '#/interfaces/booking.dto'
import utils from '#/libs/utils'
import { m } from '#/paraglide/messages'

/** The days a visitor can book, counting today. */
export const PICKUP_DAYS = 7

/** We take no pickups on a Sunday. `Date#getDay` counts Sunday as 0. */
export const CLOSED_WEEKDAY = 0

/**
 * The three pickup windows. `apiValue` is the exact string the API accepts, so
 * it is kept here with the labels that describe it.
 */
export const pickupWindows: PickupWindowDto[] = [
  {
    id: 'morning',
    apiValue: 'MORNING 8AM - 12PM',
    startHour: 8,
    endHour: 12,
    label: m.booking_time_morning,
    hours: m.booking_time_morningHours,
  },
  {
    id: 'afternoon',
    apiValue: 'AFTERNOON 12PM - 5PM',
    startHour: 12,
    endHour: 17,
    label: m.booking_time_afternoon,
    hours: m.booking_time_afternoonHours,
  },
  {
    id: 'evening',
    apiValue: 'EVENING 5PM - 8PM',
    startHour: 17,
    endHour: 20,
    label: m.booking_time_evening,
    hours: m.booking_time_eveningHours,
  },
]

const kgRate = (id: 'washFold' | 'washIron') =>
  homeKgServices.find((service) => service.id === id)!.rate

/**
 * What a visitor can ask us to pick up. The per-kilo prices come from the same
 * list the home page's price calculator uses, so a rate is only written once.
 */
export const bookingServices: BookingServiceOptionDto[] = [
  {
    id: 'washFold',
    name: m.home_estimator_washFold,
    description: m.booking_service_washFold_desc,
    price: () =>
      m.booking_service_perKgPrice({ price: utils.toXaf(kgRate('washFold')) }),
  },
  {
    id: 'washIron',
    name: m.home_estimator_washIron,
    description: m.booking_service_washIron_desc,
    price: () =>
      m.booking_service_perKgPrice({ price: utils.toXaf(kgRate('washIron')) }),
  },
  {
    id: 'perpiece',
    name: m.site_service_perPiece_name,
    description: m.booking_service_perPiece_desc,
    price: m.site_service_perPiece_price,
  },
]

/** One mark per service, for the round badge on each option. */
export const bookingServiceIcons = {
  washFold: icons.laundry,
  washIron: icons.ironing,
  perpiece: icons.garment,
} as const

/**
 * The places in Douala a visitor can pick from. The shop's list names a few
 * places twice in a different letter case ("Bonapriso", "BONAPRISO"), so each
 * is kept once — the list needs one entry per place to show and to select.
 */
export const pickupAddresses = [
  ...new Map(
    pickupAddressData.map((address) => [
      address.value.trim().toLowerCase(),
      address,
    ]),
  ).values(),
]
