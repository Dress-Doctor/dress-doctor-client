import { createFileRoute } from '@tanstack/react-router'
import CtaSection from '#/components/site/cta-section'
import { pageHead } from '#/data/seo.data'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'
import ServicesCompare from './-components/services-compare'
import ServicesGrid from './-components/services-grid'
import ServicesHero from './-components/services-hero'

export const Route = createFileRoute('/_site/services/')({
  head: () =>
    pageHead({
      path: sitePaths.services,
      title: m.services_meta_title(),
      description: m.services_meta_description(),
    }),

  component: ServicesPage,
})

function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesGrid />
      <ServicesCompare />
      <CtaSection />
    </>
  )
}
