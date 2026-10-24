import { businessFacts, homeFaqs } from '#/data/home.data'
import { siteContact, siteServices, siteSocials } from '#/data/site.data'
import {
  SITE_URL,
  localizedLinks,
  localizedUrl,
  ogLocaleMeta,
  publicUrl,
} from '#/libs/seo'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'

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
 * Opening hours as shown in the footer (Mon–Sat, 8am–7pm). Keep the two in
 * step: structured data must match what visitors can read on the page.
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
}

/**
 * Head for an ordinary indexable page: title, description, canonical and
 * `hreflang` links, and the Open Graph and Twitter cards.
 *
 * The home page builds its own because it also carries structured data; every
 * other page that simply wants to be found can use this one.
 */
export function pageHead({ path, title, description }: PageHeadOptions) {
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
      { property: 'og:image', content: shareImages.openGraph },
      { property: 'og:image:type', content: shareImages.type },
      { property: 'og:image:width', content: String(shareImages.width) },
      { property: 'og:image:height', content: String(shareImages.height) },
      { property: 'og:image:alt', content: m.home_meta_ogImageAlt() },
      ...ogLocaleMeta(),

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: url },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: shareImages.twitter },
      { name: 'twitter:image:alt', content: m.home_meta_ogImageAlt() },
    ],
    links: localizedLinks(path),
  }
}

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
        sameAs: siteSocials.map((social) => social.href),
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
          // Closed all day: Google's format is opens and closes both 00:00.
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            opens: '00:00',
            closes: '00:00',
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
