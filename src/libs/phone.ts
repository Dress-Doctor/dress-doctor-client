import {
  DEFAULT_COUNTRY_ISO,
  countryRows,
  suggestedCountryIsos,
} from '#/data/countries.data'
import utils from '#/libs/utils'
import { getLocale } from '#/paraglide/runtime'

export interface CountryDto {
  /** ISO 3166-1 alpha-2 code: `CM`. */
  iso: string
  /** Calling code, digits only: `237`. */
  dialCode: string
  /** Shortest and longest national number, in digits. */
  minLength: number
  maxLength: number
  /** What people write in front of a number at home (`0` in France); or `''`. */
  trunkPrefix: string
  flag: string
}

/** The API takes 8 to 15 digits in all, country code included. */
export const PHONE_MIN_DIGITS = 8
export const PHONE_MAX_DIGITS = 15

/**
 * The flag: two regional-indicator letters, which a phone draws as the flag.
 * Some desktops (Windows) show the two letters instead — the picker names the
 * country in words as well, so nothing depends on the flag.
 */
export function countryFlag(iso: string) {
  const letters = [...iso.toUpperCase()].map(
    (letter) => 0x1f1e6 + letter.charCodeAt(0) - 'A'.charCodeAt(0),
  )
  return String.fromCodePoint(...letters)
}

export const countries: CountryDto[] = countryRows.map(
  ([iso, dialCode, minLength, maxLength, trunkPrefix = '']) => ({
    iso,
    dialCode,
    minLength,
    maxLength,
    trunkPrefix,
    flag: countryFlag(iso),
  }),
)

const byIso = new Map(countries.map((country) => [country.iso, country]))

/** First row wins: the country a calling code mostly means comes first. */
const byDialCode = new Map<string, CountryDto>()
for (const country of countries) {
  if (!byDialCode.has(country.dialCode)) {
    byDialCode.set(country.dialCode, country)
  }
}

export const defaultCountry = byIso.get(DEFAULT_COUNTRY_ISO)!

/** The country for a code, or Cameroon when there is none or it is unknown. */
export function getCountry(iso: string | null | undefined) {
  return (iso && byIso.get(iso)) || defaultCountry
}

const regionNames = new Map<string, Intl.DisplayNames>()

/** The country's name in a language (the visitor's by default), from the browser. */
export function countryName(iso: string, locale: string = getLocale()) {
  let names = regionNames.get(locale)
  if (!names) {
    names = new Intl.DisplayNames(locale, { type: 'region' })
    regionNames.set(locale, names)
  }
  return names.of(iso) ?? iso
}

/** A country as the picker lists it. */
export interface CountryOptionDto extends CountryDto {
  /** The name in the visitor's language. */
  name: string
  /** What typing matches: the name in both languages, the ISO code, the code. */
  search: string
}

const optionsByLocale = new Map<string, CountryOptionDto[]>()

/**
 * What the country picker lists: the suggested countries in their set order,
 * then the rest by name in the visitor's language.
 *
 * A visitor may type the name in English or French whichever they read the
 * site in, the two-letter code (`FR`) or the calling code (`+33`), so all of
 * them are in `search`.
 */
export function countryOptions(): CountryOptionDto[] {
  const locale = getLocale()
  const cached = optionsByLocale.get(locale)
  if (cached) return cached

  const option = (country: CountryDto): CountryOptionDto => {
    const name = countryName(country.iso, locale)
    const names = new Set([
      name,
      countryName(country.iso, 'en'),
      countryName(country.iso, 'fr'),
    ])
    return {
      ...country,
      name,
      search: `${[...names].join(' ')} ${country.iso} +${country.dialCode}`,
    }
  }

  const suggested = suggestedCountryIsos.map((iso) => option(getCountry(iso)))
  const listed = new Set(suggested.map((country) => country.iso))
  const collator = new Intl.Collator(locale)
  const others = countries
    .filter((country) => !listed.has(country.iso))
    .map(option)
    .sort((a, b) => collator.compare(a.name, b.name))

  const options = [...suggested, ...others]
  optionsByLocale.set(locale, options)
  return options
}

/**
 * Groups the digits in threes for the eye: `689 688 248`, `202 555 0123`. In a
 * number of ten digits or more, a last group of one digit joins the group
 * before it, so it does not end on a lone digit. A shorter number is still
 * being typed, and its groups would only jump about.
 */
export function groupNational(digits: string) {
  const groups = digits.match(/\d{1,3}/g) ?? []
  if (
    digits.length >= 10 &&
    groups.length > 1 &&
    groups[groups.length - 1].length === 1
  ) {
    const last = groups.pop() as string
    groups[groups.length - 1] += last
  }
  return groups.join(' ')
}

/**
 * The national number as it should read after a change: digits only, without
 * what is not part of it.
 *
 * Two things people add are taken off: the country code typed again in front
 * (`237 689…` in the Cameroon box), and the trunk prefix they write at home
 * (`06…` in France, `8…` in Russia, `1…` in the US). A number is never written
 * with its trunk prefix once it is written for abroad, so it always goes — and
 * only the one, so `88005553535` becomes `8005553535`.
 *
 * `limit` holds the number to the longest the country has — the box stops
 * taking digits, which is right while someone is typing. Pass `false` for a
 * number that arrived whole (pasted, autofilled, kept when the country was
 * changed): a number that is too long is then kept, not cut, because cutting
 * it would turn it into a different, valid-looking number. It is held only to
 * what E.164 allows, and the visitor is told it is wrong.
 */
export function cleanNational(
  raw: string,
  country: CountryDto,
  limit: boolean = false,
) {
  let digits = utils.digitsOnly(raw)

  if (
    digits.length > country.maxLength &&
    digits.startsWith(country.dialCode)
  ) {
    digits = digits.slice(country.dialCode.length)
  }

  const { trunkPrefix } = country
  if (trunkPrefix && digits.startsWith(trunkPrefix)) {
    digits = digits.slice(trunkPrefix.length)
  }

  const room = PHONE_MAX_DIGITS - country.dialCode.length
  return digits.slice(0, limit ? Math.min(country.maxLength, room) : room)
}

/**
 * A whole number written with its country — `+1 202 555 0123`, or `00 33 …` —
 * read back into the country and the number. `null` when it is not written
 * that way, or when no country has that code.
 */
export function readInternational(raw: string) {
  const text = raw.trim()
  const international = text.startsWith('+') || text.startsWith('00')
  if (!international) return null

  const digits = utils.digitsOnly(text).replace(/^00/, '')
  for (const length of [3, 2, 1]) {
    const country = byDialCode.get(digits.slice(0, length))
    if (country) {
      return { country, national: cleanNational(digits.slice(length), country) }
    }
  }
  return null
}

/** Whether the digits are a whole number for that country. */
export function isValidNumber(country: CountryDto, national: string) {
  const length = utils.digitsOnly(national).length
  const total = country.dialCode.length + length

  return (
    length >= country.minLength &&
    length <= country.maxLength &&
    total >= PHONE_MIN_DIGITS &&
    total <= PHONE_MAX_DIGITS
  )
}

/** How the number goes to the API: `+` and the code, then the digits. */
export const toInternational = (country: CountryDto, national: string) =>
  `+${country.dialCode}${utils.digitsOnly(national)}`

/** How the number reads to a person: `+237 689 688 248`. */
export const formatInternational = (country: CountryDto, national: string) =>
  `+${country.dialCode} ${groupNational(utils.digitsOnly(national))}`
