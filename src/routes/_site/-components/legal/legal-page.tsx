import { Box, SimpleGrid } from '@chakra-ui/react'
import { useMemo } from 'react'
import SiteContainer from '#/components/site/site-container'
import { useActiveSection } from '#/hooks/use-active-section'
import type { LegalDocumentDto } from '#/interfaces/legal.dto'
import LegalHelp from './legal-help'
import LegalHero from './legal-hero'
import LegalSection from './legal-section'
import LegalToc from './legal-toc'

interface Props {
  doc: LegalDocumentDto
}

/**
 * A legal document laid out for reading: the title and summary, then the
 * contents list beside the numbered sections. The page header and footer come
 * from the `_site` layout, as on every public page.
 *
 * Takes the whole document as data, so the privacy policy and the terms are
 * the same page with different words.
 */
function LegalPage({ doc }: Props) {
  const ids = useMemo(
    () => doc.sections.map((section) => section.id),
    [doc.sections],
  )
  const active = useActiveSection(ids)

  return (
    <>
      <LegalHero doc={doc} />

      <SiteContainer pt={{ base: 4, lg: 6 }} pb={{ base: 16, md: 24 }}>
        <SimpleGrid
          gap={{ base: 6, lg: 14 }}
          columns={{ base: 1, lg: 2 }}
          templateColumns={{ lg: '240px minmax(0, 1fr)' }}
          alignItems="start"
        >
          <LegalToc path={doc.path} sections={doc.sections} active={active} />

          <Box maxW="720px" minW={0}>
            {doc.sections.map((section, index) => (
              <LegalSection key={section.id} section={section} index={index} />
            ))}

            <LegalHelp related={doc.related} />
          </Box>
        </SimpleGrid>
      </SiteContainer>
    </>
  )
}

export default LegalPage
