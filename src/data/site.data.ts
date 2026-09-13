import icons from '#/config/icons'
import type { FileRoutesByTo } from '#/routeTree.gen'
import type {
  SiteLinkDto,
  SiteNavLinkDto,
  SiteServiceDto,
} from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'

/**
 * Every destination the public site links to, in one place.
 *
 * These are router paths, not `href` strings: `satisfies` checks every one of
 * them against the generated route tree, so deleting or renaming a page breaks
 * the build here rather than leaving a dead link for a visitor to find.
 */
export const sitePaths = {
  home: '/',
  booking: '/booking',
  services: '/services',
  washAndFold: '/services/wash-and-fold',
  pricing: '/pricing',
  catalog: '/catalog',
  corporate: '/corporate',
  hotels: '/industries/hotels',
  locations: '/locations',
  resources: '/resources',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  refund: '/refund-policy',
  delivery: '/delivery-policy',
} as const satisfies Record<string, keyof FileRoutesByTo>

/**
 * In-page anchors. Bare ids: they are handed to `Link`'s `hash` prop, and to
 * the matching element's `id`, so the `#` belongs to neither.
 */
export const homeAnchors = {
  services: 'services',
  estimate: 'estimate',
  faq: 'faq',
} as const

/**
 * Contact details the shop publishes. The WhatsApp link is `wa.me`, which
 * wants the number in international form with no punctuation.
 */
export const siteContact = {
  phoneDisplay: '+237 689 688 248',
  phoneHref: 'tel:+237689688248',
  whatsappNumber: '237689688248',
  whatsappHref: 'https://wa.me/237689688248',
  email: 'info@dressdoctor.io',
  emailHref: 'mailto:info@dressdoctor.io',
} as const

/**
 * The brand gradients the design repeats on every primary action and roundel.
 * Named here so a button and the roundel beside it cannot drift apart.
 */
export const siteGradients = {
  /** Primary CTA fill — turquoise, lit from the top. */
  ctaFrom: '#3AD5E1',
  ctaTo: '#24B9C6',
  /** The single mid-turquoise the design uses for gradient text and numerals. */
  turquoiseDeep: '#24B9C6',
} as const

export const siteNavLinks: SiteNavLinkDto[] = [
  { key: 'services', to: sitePaths.services, label: m.site_nav_services },
  { key: 'pricing', to: sitePaths.pricing, label: m.site_nav_pricing },
  { key: 'catalog', to: sitePaths.catalog, label: m.site_nav_catalog },
  { key: 'business', to: sitePaths.corporate, label: m.site_nav_business },
  { key: 'locations', to: sitePaths.locations, label: m.site_nav_locations },
  { key: 'resources', to: sitePaths.resources, label: m.site_nav_resources },
]

/**
 * The six services, shared by the nav's mega-menu, the home grid and the
 * footer column — one list so a price never reads differently in two places.
 */
export const siteServices: SiteServiceDto[] = [
  {
    id: 'washFold',
    icon: icons.laundry,
    to: sitePaths.washAndFold,
    name: m.site_service_washFold_name,
    summary: m.site_service_washFold_summary,
    price: m.site_service_washFold_price,
  },
  {
    id: 'perPiece',
    icon: icons.garment,
    to: sitePaths.services,
    name: m.site_service_perPiece_name,
    summary: m.site_service_perPiece_summary,
    price: m.site_service_perPiece_price,
  },
  {
    id: 'dryClean',
    icon: icons.dryClean,
    to: sitePaths.services,
    name: m.site_service_dryClean_name,
    summary: m.site_service_dryClean_summary,
    price: m.site_service_dryClean_price,
  },
  {
    id: 'ironing',
    icon: icons.ironing,
    to: sitePaths.services,
    name: m.site_service_ironing_name,
    summary: m.site_service_ironing_summary,
    price: m.site_service_ironing_price,
  },
  {
    id: 'bedding',
    icon: icons.bedding,
    to: sitePaths.services,
    name: m.site_service_bedding_name,
    summary: m.site_service_bedding_summary,
    price: m.site_service_bedding_price,
  },
  {
    id: 'shoeCare',
    icon: icons.shoeCare,
    to: sitePaths.services,
    name: m.site_service_shoeCare_name,
    summary: m.site_service_shoeCare_summary,
    price: m.site_service_shoeCare_price,
  },
]

export const footerCompanyLinks: SiteLinkDto[] = [
  {
    id: 'pricing',
    to: sitePaths.pricing,
    label: m.site_footer_link_pricing,
  },
  {
    id: 'business',
    to: sitePaths.corporate,
    label: m.site_footer_link_business,
  },
  { id: 'hotels', to: sitePaths.hotels, label: m.site_footer_link_hotels },
  {
    id: 'coverage',
    to: sitePaths.locations,
    label: m.site_footer_link_coverage,
  },
  { id: 'contact', to: sitePaths.contact, label: m.site_footer_link_contact },
]

export const footerExploreLinks: SiteLinkDto[] = [
  { id: 'catalog', to: sitePaths.catalog, label: m.site_footer_link_catalog },
  { id: 'booking', to: sitePaths.booking, label: m.site_footer_link_booking },
  {
    id: 'guides',
    to: sitePaths.resources,
    label: m.site_footer_link_guides,
  },
  {
    id: 'stains',
    to: sitePaths.resources,
    label: m.site_footer_link_stains,
  },
  { id: 'plans', to: sitePaths.pricing, label: m.site_footer_link_plans },
]

export const footerLegalLinks: SiteLinkDto[] = [
  {
    id: 'privacy',
    to: sitePaths.privacy,
    label: m.site_footer_legal_privacy,
  },
  { id: 'terms', to: sitePaths.terms, label: m.site_footer_legal_terms },
  { id: 'refund', to: sitePaths.refund, label: m.site_footer_legal_refund },
  {
    id: 'delivery',
    to: sitePaths.delivery,
    label: m.site_footer_legal_delivery,
  },
]
