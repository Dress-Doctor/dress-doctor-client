import type {
  EstimateModeDto,
  PlanBillingDto,
  PlanModeDto,
} from '#/interfaces/site.dto'
import { SITE_NAME, homeStructuredData, shareImages } from '#/data/seo.data'
import {
  jsonLdScript,
  localizedLinks,
  localizedUrl,
  ogLocaleMeta,
} from '#/libs/seo'
import { m } from '#/paraglide/messages'
import CoverageSection from '#/routes/-components/home/coverage-section'
import CtaSection from '#/routes/-components/home/cta-section'
import EstimatorSection from '#/routes/-components/home/estimator-section'
import FaqSection from '#/routes/-components/home/faq-section'
import HeroSection from '#/routes/-components/home/hero-section'
import PlansSection from '#/routes/-components/home/plans-section'
import ServicesSection from '#/routes/-components/home/services-section'
import StatsSection from '#/routes/-components/home/stats-section'
import StepsSection from '#/routes/-components/home/steps-section'
import TestimonialsSection from '#/routes/-components/home/testimonials-section'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

/**
 * The three choices on the page that change what a visitor is looking at.
 *
 * They live in the URL rather than in component state so a price someone was
 * shown can be sent to someone else, and so coming back to the page does not
 * silently re-price their laundry.
 */
export interface HomeSearch {
  estimate?: EstimateModeDto
  plan?: PlanModeDto
  billing?: PlanBillingDto
}

/** Reads one search value, falling back rather than throwing on nonsense. */
const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined =>
  typeof value === 'string' && allowed.includes(value as T)
    ? (value as T)
    : undefined

export const Route = createFileRoute('/_site/')({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    estimate: oneOf(search.estimate, ['kg', 'piece'] as const),
    plan: oneOf(search.plan, ['pieces', 'kg'] as const),
    billing: oneOf(search.billing, ['monthly', 'quarterly'] as const),
  }),

  head: () => ({
    meta: [
      { title: m.home_meta_title() },
      { name: 'description', content: m.home_meta_description() },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },

      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:url', content: localizedUrl('/') },
      { property: 'og:title', content: m.home_meta_ogTitle() },
      { property: 'og:description', content: m.home_meta_description() },
      { property: 'og:image', content: shareImages.openGraph },
      { property: 'og:image:width', content: String(shareImages.width) },
      { property: 'og:image:height', content: String(shareImages.height) },
      { property: 'og:image:alt', content: m.home_meta_ogImageAlt() },
      ...ogLocaleMeta(),

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: localizedUrl('/') },
      { name: 'twitter:title', content: m.home_meta_ogTitle() },
      { name: 'twitter:description', content: m.home_meta_description() },
      { name: 'twitter:image', content: shareImages.twitter },
      { name: 'twitter:image:alt', content: m.home_meta_ogImageAlt() },
    ],
    links: localizedLinks('/'),
    scripts: [jsonLdScript(homeStructuredData())],
  }),

  component: Home,
})

/**
 * The public home page. Composition, plus the three toggles that are shared
 * with the URL — every section owns its own copy, data and local state.
 */
function Home() {
  const navigate = useNavigate({ from: Route.fullPath })
  const {
    estimate = 'kg',
    plan = 'kg',
    billing = 'monthly',
  } = Route.useSearch()

  /** `replace` so flipping a toggle does not fill the back button with steps. */
  const update = (next: HomeSearch) =>
    navigate({
      replace: true,
      resetScroll: false,
      search: (current) => ({ ...current, ...next }),
    })

  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <StepsSection />
      <EstimatorSection
        mode={estimate}
        onModeChange={(mode) => update({ estimate: mode })}
      />
      <PlansSection
        mode={plan}
        billing={billing}
        onModeChange={(mode) => update({ plan: mode })}
        onBillingChange={(period) => update({ billing: period })}
      />
      <TestimonialsSection />
      <CoverageSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
