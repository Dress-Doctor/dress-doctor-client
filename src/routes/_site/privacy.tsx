import { Box, SimpleGrid } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import SiteContainer from '#/components/site/site-container'
import { privacySections } from '#/data/privacy.data'
import { pageHead } from '#/data/seo.data'
import { sitePaths } from '#/data/site.data'
import { useActiveSection } from '#/hooks/use-active-section'
import { m } from '#/paraglide/messages'
import PrivacyHelp from '#/routes/_site/-components/privacy/privacy-help'
import PrivacyHero from '#/routes/_site/-components/privacy/privacy-hero'
import PrivacySection from '#/routes/_site/-components/privacy/privacy-section'
import PrivacyToc from '#/routes/_site/-components/privacy/privacy-toc'

const sectionIds = privacySections.map((section) => section.id)

export const Route = createFileRoute('/_site/privacy')({
  head: () =>
    pageHead({
      path: sitePaths.privacy,
      title: m.privacy_meta_title(),
      description: m.privacy_meta_description(),
    }),

  component: PrivacyPage,
})

/**
 * The privacy policy: the title and summary, then the contents list beside
 * the twelve sections. The page header and footer come from the `_site`
 * layout, as on every public page.
 */
function PrivacyPage() {
  const active = useActiveSection(sectionIds)

  return (
    <>
      <PrivacyHero />

      <SiteContainer pt={{ base: 4, lg: 6 }} pb={{ base: 16, md: 24 }}>
        <SimpleGrid
          gap={{ base: 6, lg: 14 }}
          columns={{ base: 1, lg: 2 }}
          templateColumns={{ lg: '240px minmax(0, 1fr)' }}
          alignItems="start"
        >
          <PrivacyToc sections={privacySections} active={active} />

          <Box maxW="720px" minW={0}>
            {privacySections.map((section, index) => (
              <PrivacySection
                key={section.id}
                section={section}
                index={index}
              />
            ))}

            <PrivacyHelp />
          </Box>
        </SimpleGrid>
      </SiteContainer>
    </>
  )
}
