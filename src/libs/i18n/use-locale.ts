import { getLocale, locales, setLocale } from '@/paraglide/runtime'
import type { Locale } from './index'

/**
 * Reads the active locale and exposes the switcher.
 *
 * `setLocale` reloads the document by default (Paraglide's cookie strategy),
 * so no reactive state is needed — the current value is read synchronously
 * from the locale cookie on each render.
 */
export function useLocale() {
  return {
    locale: getLocale(),
    locales: locales as readonly Locale[],
    setLocale,
  }
}
