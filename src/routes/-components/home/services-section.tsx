import { Icon, Link as ChakraLink, SimpleGrid } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { homeAnchors, sitePaths, siteServices } from '#/data/site.data'
import { m } from '#/paraglide/messages'
import ServiceCard from './service-card'

/** Stagger across the three columns, restarting on each row. */
const REVEAL_DELAYS = [0, 80, 160]

function ServicesSection() {
  return (
    <SiteContainer
      as="section"
      pt={{ base: 16, md: '110px' }}
      id={homeAnchors.services}
      scrollMarginTop="100px"
    >
      <Reveal maxW="620px" mb={14}>
        <SectionHeading
          eyebrow={m.home_services_eyebrow()}
          title={m.home_services_title()}
          lead={m.home_services_lead()}
        />
      </Reveal>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="22px">
        {siteServices.map((service, index) => (
          <Reveal key={service.id} h="full" delay={REVEAL_DELAYS[index % 3]}>
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </SimpleGrid>

      <ChakraLink
        asChild
        mt={8}
        mx="auto"
        w="fit-content"
        py={2}
        gap={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="15.5px"
        fontWeight="semibold"
        textDecoration="none"
        color="turquoise-blue.700"
      >
        <Link to={sitePaths.services}>
          {m.home_services_cta()}
          <Icon aria-hidden boxSize={3.5} as={icons.forward} />
        </Link>
      </ChakraLink>
    </SiteContainer>
  )
}

export default ServicesSection
