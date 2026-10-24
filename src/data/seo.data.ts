import { businessFacts, homeFaqs } from '#/data/home.data'
import { aboutFounder, aboutPlaces } from '#/data/about.data'
import {
  siteContact,
  sitePaths,
  siteServices,
  siteSocials,
} from '#/data/site.data'
import {
  SITE_URL,
  jsonLdScript,
  localizedLinks,
  localizedUrl,
  ogLocaleMeta,
  publicUrl,
} from '#/libs/seo'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import type { Locale } from '#/paraglide/runtime'

export const SITE_NAME = 'Dress Doctor'

/**
 * Share images in `public/`, both exactly 1200 × 630 (1.91 : 1). They are
 * JPEGs to stay well under the size WhatsApp will show as a link preview.
 * Keep `width`, `height` and `type` in step with the files.
 */
export const shareImages = {
  openGraph: publicUrl('/opengraph-image.jpg'),
  twitter: publicUrl('/twitter-image.jpg'),
  width: 1200,
  height: 630,
  type: 'image/jpeg',
} as const

/**
 * The About page's own share image, one per language because the heading on
 * it is written in that language. Same size and type as `shareImages`.
 * Keyed by `Locale`, so adding a language fails the typecheck until its image
 * exists. The `?v=` tag makes WhatsApp and Facebook fetch the image again;
 * raise it whenever a file is replaced.
 */
export const aboutShareImages: Record<Locale, string> = {
  en: publicUrl('/opengraph-about-en.jpg?v=2'),
  fr: publicUrl('/opengraph-about-fr.jpg?v=2'),
}

/** A page's share image, used for both the Open Graph and Twitter cards. */
export interface ShareImage {
  openGraph: string
  twitter: string
  alt: string
}

/**
 * Opening hours as shown in the footer (Mon–Sat, 8am–7pm). Keep the two in
 * step: structured data must match what visitors can read on the page.
 * Sunday is left out on purpose: a day that is not listed means closed.
 */
const openingHours = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  opens: '08:00',
  closes: '19:00',
}

interface PageHeadOptions {
  /** Router path of the page, such as `/privacy`. */
  path: string
  title: string
  description: string
  /** The trail shown on the page, home first. Adds `BreadcrumbList` data. */
  breadcrumbs?: BreadcrumbItem[]
  /**
   * The page's own share image. Must be 1200 × 630 JPEG like `shareImages`;
   * leave it out to use the site's default image.
   */
  image?: ShareImage
}

export interface BreadcrumbItem {
  name: string
  /** Router path of the page, such as `/services`. */
  path: string
}

/** `BreadcrumbList` data for a trail, with each link in the current language. */
export function breadcrumbData(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: localizedUrl(item.path),
    })),
  }
}

/**
 * Head for an ordinary indexable page: title, description, canonical and
 * `hreflang` links, and the Open Graph and Twitter cards.
 *
 * The home page builds its own because it also carries structured data; every
 * other page that simply wants to be found can use this one.
 */
export function pageHead({
  path,
  title,
  description,
  breadcrumbs,
  image = {
    openGraph: shareImages.openGraph,
    twitter: shareImages.twitter,
    alt: m.home_meta_ogImageAlt(),
  },
}: PageHeadOptions) {
  const url = localizedUrl(path)

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },

      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image.openGraph },
      { property: 'og:image:type', content: shareImages.type },
      { property: 'og:image:width', content: String(shareImages.width) },
      { property: 'og:image:height', content: String(shareImages.height) },
      { property: 'og:image:alt', content: image.alt },
      ...ogLocaleMeta(),

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: url },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image.twitter },
      { name: 'twitter:image:alt', content: image.alt },
    ],
    links: localizedLinks(path),
    scripts: breadcrumbs ? [jsonLdScript(breadcrumbData(breadcrumbs))] : [],
  }
}

/** The shop's Google Maps listing ("Dress Doctor Laundry Service") and its pin. */
const googleMapsUrl = 'https://www.google.com/maps?cid=14365337946916511723'
const businessLocation = { latitude: 4.0733878, longitude: 9.7183829 }

const ids = {
  website: `${SITE_URL}/#website`,
  business: `${SITE_URL}/#business`,
}

/**
 * JSON-LD for the home page, in the current language.
 *
 * Only confirmed facts that the page itself states: name, contact details,
 * city (all of Douala), opening hours, services, payment methods, the Google
 * rating and review count, and the visible FAQ.
 */
export function homeStructuredData() {
  const locale = getLocale()
  const pageUrl = localizedUrl('/')

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ids.website,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        inLanguage: ['en', 'fr'],
      },
      {
        '@type': 'DryCleaningOrLaundry',
        '@id': ids.business,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: publicUrl('/web-app-manifest-512x512.png'),
        image: shareImages.openGraph,
        telephone: siteContact.phoneHref.replace('tel:', ''),
        email: siteContact.email,
        sameAs: [...siteSocials.map((social) => social.href), googleMapsUrl],
        hasMap: googleMapsUrl,
        geo: { '@type': 'GeoCoordinates', ...businessLocation },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Douala',
          addressCountry: 'CM',
        },
        areaServed: { '@type': 'City', name: 'Douala' },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: openingHours.days,
            opens: openingHours.opens,
            closes: openingHours.closes,
          },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: businessFacts.googleRating,
          bestRating: 5,
          reviewCount: businessFacts.googleReviewCount,
        },
        currenciesAccepted: 'XAF',
        paymentAccepted: 'Cash, MTN Mobile Money, Orange Money',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: m.home_services_eyebrow(),
          itemListElement: siteServices.map((service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.name(),
              description: service.summary(),
              areaServed: { '@type': 'City', name: 'Douala' },
            },
          })),
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: m.home_meta_title(),
        description: m.home_meta_description(),
        inLanguage: locale,
        isPartOf: { '@id': ids.website },
        about: { '@id': ids.business },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        inLanguage: locale,
        mainEntity: homeFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question(),
          acceptedAnswer: { '@type': 'Answer', text: faq.answer() },
        })),
      },
    ],
  }
}

/**
 * JSON-LD for the About page: the page itself, and the factory and office as
 * places of the same business the home page describes (matched by `@id`).
 */
export function aboutStructuredData() {
  const pageUrl = localizedUrl(sitePaths.about)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: m.about_meta_title(),
        description: m.about_meta_description(),
        inLanguage: getLocale(),
        isPartOf: { '@id': ids.website },
        about: { '@id': ids.business },
      },
      {
        '@type': 'DryCleaningOrLaundry',
        '@id': ids.business,
        founder: {
          '@type': 'Person',
          name: aboutFounder.name,
          jobTitle: m.about_story_role(),
        },
        location: aboutPlaces.map((place) => ({
          '@type': 'Place',
          name: `${SITE_NAME} — ${place.label()}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: place.address(),
            addressLocality: 'Douala',
            addressCountry: 'CM',
          },
        })),
      },
    ],
  }
}
