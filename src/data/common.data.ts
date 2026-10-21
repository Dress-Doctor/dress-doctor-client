import type {
  AppStatusTypeDto,
  DialCodeDataDto,
  LanguageDataDto,
  PaymentModeDto,
} from '#/interfaces/common.dto'
import type { ColorPalette } from '@chakra-ui/react'
import blank from '@/assets/payment-method/blank.png'
import cash from '@/assets/payment-method/cash.png'
import mtnMomo from '@/assets/payment-method/momo.png'
import orangeMoney from '@/assets/payment-method/om.png'

export const languageData: LanguageDataDto[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
]

/** Cameroon is the market Dress Doctor operates in, and so every default. */
export const dialCode: DialCodeDataDto = {
  country: 'CM',
  name: 'Cameroon',
  flag: '🇨🇲',
  dialCode: '+237',
  nationalLength: 9,
}

/**
 * Countries a customer's number may belong to.
 *
 * Not the whole ISO list: the shop is in Douala, so this is Cameroon and its
 * neighbours, plus the diaspora countries customers actually keep a WhatsApp
 * number in. Someone living in Douala may well be reachable on a US number,
 * which is the case that put a picker on the field at all.
 *
 * `nationalLength` is the digit count after the dial code, used to tell the
 * operator their number is short before the API does. Where a country has
 * several valid lengths the longest is listed, so a valid number is never
 * refused here — the API stays the source of truth.
 */
export const dialCodes: DialCodeDataDto[] = [
  {
    country: 'CM',
    name: 'Cameroon',
    flag: '🇨🇲',
    dialCode: '+237',
    nationalLength: 9,
  },
  {
    country: 'US',
    name: 'United States',
    flag: '🇺🇸',
    dialCode: '+1',
    nationalLength: 10,
  },
  {
    country: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    dialCode: '+1',
    nationalLength: 10,
  },
  {
    country: 'FR',
    name: 'France',
    flag: '🇫🇷',
    dialCode: '+33',
    nationalLength: 9,
  },
  {
    country: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    dialCode: '+32',
    nationalLength: 9,
  },
  {
    country: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    dialCode: '+44',
    nationalLength: 10,
  },
  {
    country: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    dialCode: '+49',
    nationalLength: 11,
  },
  {
    country: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    dialCode: '+39',
    nationalLength: 10,
  },
  {
    country: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    dialCode: '+34',
    nationalLength: 9,
  },
  {
    country: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    dialCode: '+41',
    nationalLength: 9,
  },
  {
    country: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    dialCode: '+234',
    nationalLength: 10,
  },
  {
    country: 'GA',
    name: 'Gabon',
    flag: '🇬🇦',
    dialCode: '+241',
    nationalLength: 8,
  },
  {
    country: 'GQ',
    name: 'Equatorial Guinea',
    flag: '🇬🇶',
    dialCode: '+240',
    nationalLength: 9,
  },
  {
    country: 'TD',
    name: 'Chad',
    flag: '🇹🇩',
    dialCode: '+235',
    nationalLength: 8,
  },
  {
    country: 'CF',
    name: 'Central African Republic',
    flag: '🇨🇫',
    dialCode: '+236',
    nationalLength: 8,
  },
  {
    country: 'CG',
    name: 'Congo',
    flag: '🇨🇬',
    dialCode: '+242',
    nationalLength: 9,
  },
  {
    country: 'CI',
    name: 'Côte d’Ivoire',
    flag: '🇨🇮',
    dialCode: '+225',
    nationalLength: 10,
  },
  {
    country: 'SN',
    name: 'Senegal',
    flag: '🇸🇳',
    dialCode: '+221',
    nationalLength: 9,
  },
  {
    country: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    dialCode: '+233',
    nationalLength: 9,
  },
  {
    country: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    dialCode: '+27',
    nationalLength: 9,
  },
  {
    country: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    dialCode: '+971',
    nationalLength: 9,
  },
  {
    country: 'CN',
    name: 'China',
    flag: '🇨🇳',
    dialCode: '+86',
    nationalLength: 11,
  },
]

export const SKELETON_DATA = [1, 2, 3].map((id) => ({ _id: id }))

export const statusColorData = {
  /**
   * Order lifecycle, coloured so the row reads as progress: cool hues while the
   * order moves through the shop, then the two terminal states in the
   * conventional green/red. `READY` breaks the cool run on purpose — it is the
   * only step waiting on someone outside the shop, so it should catch the eye
   * when an operator scans the list.
   */
  DRAFT: 'gray',
  RECEIVED: 'cyan',
  CANCELLED: 'red',
  WASHING: 'purple',
  CONFIRMED: 'blue',
  DELIVERED: 'green',
  READY: 'amber-orange',

  /**
   * Pickup lifecycle. `CONFIRMED` and `CANCELLED` are the order colours above —
   * same word, same meaning, same badge. The three that are pickup-only follow
   * the order palette's logic: the step waiting on someone catches the eye,
   * the shop's own work is cool, and the terminal success is green.
   */
  PENDING: 'amber-orange',
  ASSIGNED: 'purple',
  PICKED_UP: 'green',

  // Payment Status
  PAID: 'green',
  UNPAID: 'red',
  OVERPAID: 'green',
  PARTIAL: 'amber-orange',

  // Active Status
  ACTIVE: 'green',
  INACTIVE: 'red',
} as const satisfies Record<AppStatusTypeDto, ColorPalette>

export const paymentModeImage = new Map<PaymentModeDto | string, string>([
  ['BB', blank],
  ['Cash', cash],
  ['MTN Momo', mtnMomo],
  ['Orange Money', orangeMoney],
])
