import type { FileRoutesByTo } from '#/routeTree.gen'
import type { IconType } from 'react-icons/lib'

/** Which primary nav entry the current page belongs to. */
export type SiteNavKeyDto =
  | 'home'
  | 'services'
  | 'pricing'
  | 'catalog'
  | 'business'
  | 'locations'
  | 'resources'

export interface SiteNavLinkDto {
  key: SiteNavKeyDto
  /** Typed against the generated route tree, so a dead link cannot compile. */
  to: keyof FileRoutesByTo
  /** Called at render time so the label follows the active locale. */
  label: () => string
}

export interface SiteServiceDto {
  id: string
  icon: IconType
  to: keyof FileRoutesByTo
  name: () => string
  summary: () => string
  /** Entry price, already formatted with its unit ("From 1 000 XAF / kg"). */
  price: () => string
  /**
   * Illustration for the home service card, imported from `src/assets`.
   * Optional: without one, the card shows a placeholder tile.
   */
  image?: string
}

/** A profile on a social network, shown as an icon link in the footer. */
export interface SiteSocialDto {
  id: 'facebook' | 'tiktok'
  href: string
  icon: IconType
  /** Accessible name — the link shows the icon alone. */
  label: () => string
}

export interface SiteLinkDto {
  id: string
  to: keyof FileRoutesByTo
  label: () => string
}

/** Whether the estimator is pricing a weight or a list of garments. */
export type EstimateModeDto = 'kg' | 'piece'

/** The two ways to have laundry washed per kilo. */
export type KgServiceIdDto = 'washFold' | 'washIron'

export interface KgServiceDto {
  id: KgServiceIdDto
  /** Price per kilo, in XAF. */
  rate: number
  /** Smallest load we take for this service, in kg. */
  min: number
  name: () => string
}

/** Whether plan allowances are read as garments or as kilos. */
export type PlanModeDto = 'pieces' | 'kg'

/** Monthly, or a tenth cheaper paid three months at a time. */
export type PlanBillingDto = 'monthly' | 'quarterly'

export interface HomeStepDto {
  id: string
  /** Two-digit numeral painted in the roundel — "01" … "04". */
  index: string
  title: () => string
  body: () => string
  /** The last step is the arrival, and is the only one in amber. */
  accent: 'turquoise' | 'amber'
}

/**
 * One figure in the proof card: either a number that counts up, or fixed text
 * for a figure that is not a single number, such as a range of hours.
 */
export type HomeStatDto = {
  id: string
  label: () => string
} & (
  | {
      /** Target for the count-up; the label beside it says what it counts. */
      value: number
      decimals?: number
      suffix?: string
    }
  | { text: string }
)

export interface HomePieceDto {
  id: string
  price: number
  label: () => string
  /** Suits and bedsheets are priced per set, everything else per item. */
  unit: 'each' | 'set'
}

export interface HomePlanFeatureDto {
  id: string
  /** Lead clause, set in ink. */
  title: () => string
  /** Trailing qualifier, set in the muted grey after an em dash. */
  note: () => string
}

export interface HomePlanDto {
  id: string
  /** Monthly price in XAF before any quarterly discount. */
  price: number
  /** The middle plan is lifted out of the row and framed. */
  featured: boolean
  /** Staggered scroll-reveal delay, in milliseconds. */
  delay: number
  name: () => string
  tag: () => string
  best: () => string
  /** Label on the card's sign-up button. */
  cta: () => string
  allowKg: () => string
  allowPieces: () => string
  featuresKg: HomePlanFeatureDto[]
  featuresPieces: HomePlanFeatureDto[]
}

export interface HomeTestimonialDto {
  id: string
  /** Single letter in the avatar roundel. */
  initial: string
  /** Which brand gradient fills that roundel. */
  accent: 'turquoise' | 'amber' | 'charcoal'
  /** Cards are offset in a staircase; the middle one is indented. */
  indented: boolean
  delay: number
  /**
   * The reviewer's own words, exactly as posted on Google. Not translated, so
   * the meaning cannot drift — the French page marks them as English.
   */
  quote: string
  author: string
  /** True when `quote` is a shortened part of a longer review. */
  excerpt: boolean
}

export interface HomeFaqDto {
  id: string
  question: () => string
  answer: () => string
}
