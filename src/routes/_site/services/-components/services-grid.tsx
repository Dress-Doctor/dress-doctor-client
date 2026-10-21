import { Heading, SimpleGrid } from '@chakra-ui/react'
import Reveal from '#/components/site/reveal'
import ServiceCard from '#/components/site/service-card'
import SiteContainer from '#/components/site/site-container'
import { siteServices } from '#/data/site.data'
import { m } from '#/paraglide/messages'

/** Stagger across the three columns, restarting on each row. */
const REVEAL_DELAYS = [0, 80, 160]

/** The six services, on the same card the home page uses. */
function ServicesGrid() {
  return (
    <SiteContainer as="section" pt={{ base: 8, md: 10 }}>
      {/* Keeps the heading order flat: the cards are h3, the page title h1. */}
      <Heading as="h2" srOnly>
        {m.services_a11y_list()}
      </Heading>

      <SimpleGrid
        as="ul"
        listStyleType="none"
        columns={{ base: 1, sm: 2, lg: 3 }}
        gap="22px"
      >
        {siteServices.map((service, index) => (
          <Reveal
            as="li"
            key={service.id}
            h="full"
            delay={REVEAL_DELAYS[index % 3]}
          >
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </SimpleGrid>
    </SiteContainer>
  )
}

export default ServicesGrid
