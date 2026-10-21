import { getLocale, locales, localizeUrl } from '#/paraglide/runtime'
import type { Locale } from '#/paraglide/runtime'

/**
 * The production origin. Canonical and alternate URLs are always built from
 * this, never from the request, so a preview or local URL can never become
 * the canonical one.
 */
export const SITE_URL = 'https://www.dressdoctor.io'

/** Language tags used for `og:locale`. Both languages are served from Cameroon. */
const ogLocales: Record<Locale, string> = {
  en: 'en_CM',
  fr: 'fr_CM',
}

/**
 * The absolute URL of `path` in a given language, with no search or hash — so
 * `/?estimate=kg` and `/` share one canonical.
 */
export function localizedUrl(path: string, locale: Locale = getLocale()) {
  return localizeUrl(new URL(path, SITE_URL), { locale }).href
}

/** An absolute URL for a file served from `public/`. */
export function publicUrl(path: string) {
  return new URL(path, SITE_URL).href
}

/**
 * Canonical plus `hreflang` links for a page that exists in every language.
 *
 * Each language version is its own canonical, and every version lists all of
 * them plus `x-default` (the English page), as Google expects.
 */
export function localizedLinks(path: string) {
  return [
    { rel: 'canonical', href: localizedUrl(path) },
    ...locales.map((locale) => ({
      rel: 'alternate',
      hrefLang: locale,
      href: localizedUrl(path, locale),
    })),
    {
      rel: 'alternate',
      hrefLang: 'x-default',
      href: localizedUrl(path, 'en'),
    },
  ]
}

/** `og:locale` for the current language, and the other as an alternate. */
export function ogLocaleMeta() {
  const current = getLocale()

  return [
    { property: 'og:locale', content: ogLocales[current] },
    ...locales
      .filter((locale) => locale !== current)
      .map((locale) => ({
        property: 'og:locale:alternate',
        content: ogLocales[locale],
      })),
  ]
}

/**
 * A JSON-LD `<script>` for a route's `head.scripts`.
 *
 * `<` is escaped so no string in the data can close the script tag early.
 */
export function jsonLdScript(data: object) {
  return {
    type: 'application/ld+json',
    children: JSON.stringify(data).replace(/</g, '\\u003c'),
  }
}

/**
 * Head for a page that is not ready to be found yet: kept out of the index,
 * but its links are still followed.
 */
export const noIndexHead = () => ({
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})
