import { createFileRoute } from '@tanstack/react-router'
import { aboutStructuredData, pageHead } from '#/data/seo.data'
import { sitePaths } from '#/data/site.data'
import { jsonLdScript } from '#/libs/seo'
import { m } from '#/paraglide/messages'
import AboutCta from './-components/about/about-cta'
import AboutHero from './-components/about/about-hero'
import AboutPeople from './-components/about/about-people'
import AboutPlaces from './-components/about/about-places'
import AboutServices from './-components/about/about-services'
import AboutSteps from './-components/about/about-steps'
import AboutStory from './-components/about/about-story'

export const Route = createFileRoute('/_site/about')({
  head: () => {
    const head = pageHead({
      path: sitePaths.about,
      title: m.about_meta_title(),
      description: m.about_meta_description(),
      breadcrumbs: [
        { name: m.about_breadcrumb_home(), path: sitePaths.home },
        { name: m.about_breadcrumb_current(), path: sitePaths.about },
      ],
    })

    return {
      ...head,
      scripts: [...head.scripts, jsonLdScript(aboutStructuredData())],
    }
  },

  component: AboutPage,
})

function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutServices />
      <AboutSteps />
      <AboutPeople />
      <AboutPlaces />
      <AboutCta />
    </>
  )
}
