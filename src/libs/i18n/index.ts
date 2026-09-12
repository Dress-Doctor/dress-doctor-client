/**
 * Single entry point for the app's i18n runtime.
 *
 * Components import messages from `@/paraglide/messages` (the `m` namespace);
 * everything else — reading/setting the active locale, locale-aware
 * formatting — goes through this module so feature code never reaches into the
 * generated `@/paraglide/*` output directly.
 */
export {
  getLocale,
  setLocale,
  locales,
  baseLocale,
  isLocale,
} from '@/paraglide/runtime'

/** All locales the app supports, e.g. `"en" | "fr"`. */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type Locale = (typeof import('@/paraglide/runtime'))['locales'][number]
