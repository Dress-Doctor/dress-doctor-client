import { Grid, Icon, Link as ChakraLink, Stack } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import CheckItem from '#/components/site/check-item'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'

/**
 * Coverage: all of Douala. Deliberately not a list of neighbourhoods — any
 * short list would read as "only these", which is not true.
 */
function CoverageSection() {
  return (
    <SiteContainer as="section" pt={{ base: 16, md: '120px' }}>
      <Reveal>
        <Grid
          gap={{ base: 10, lg: 14 }}
          alignItems="center"
          templateColumns={{ base: '1fr', lg: '1fr 1.2fr' }}
        >
          <Stack gap={0}>
            <SectionHeading
              size="md"
              eyebrow={m.home_coverage_eyebrow()}
              title={m.home_coverage_title()}
              lead={m.home_coverage_lead()}
              maxW="42ch"
            />

            <ChakraLink
              asChild
              mt={3}
              py={2}
              gap={2}
              display="inline-flex"
              alignItems="center"
              alignSelf="flex-start"
              fontSize="15.5px"
              fontWeight="semibold"
              textDecoration="none"
              color="turquoise-blue.700"
            >
              <Link to={sitePaths.locations}>
                {m.home_coverage_cta()}
                <Icon aria-hidden boxSize={3.5} as={icons.forward} />
              </Link>
            </ChakraLink>
          </Stack>

          <Stack
            gap={4}
            p={{ base: 6, md: 8 }}
            rounded="24px"
            bg="white"
            borderWidth="1px"
            borderColor="rgba(0, 23, 31, 0.06)"
            boxShadow="0 1px 2px rgba(0, 23, 31, 0.03), 0 16px 40px rgba(0, 23, 31, 0.05)"
          >
            <CheckItem label={m.home_coverage_pointPickup()} />
            <CheckItem label={m.home_coverage_pointDelivery()} />
            <CheckItem label={m.home_coverage_pointBook()} />
          </Stack>
        </Grid>
      </Reveal>
    </SiteContainer>
  )
}

export default CoverageSection
