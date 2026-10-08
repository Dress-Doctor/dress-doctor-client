import {
  Center,
  HStack,
  Icon,
  Link as ChakraLink,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import {
  homeAnchors,
  siteGradients,
  sitePaths,
  siteServices,
} from '#/data/site.data'
import { m } from '#/paraglide/messages'
import ServiceCard from '#/components/site/service-card'

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

        {/*
          The promise that sets Dress Doctor apart, lifted out of the lead: a
          turquoise callout with the pickup mark, in the same language as the
          hero badge and the booking buttons.
        */}
        <HStack
          mt={5}
          gap={3}
          display="inline-flex"
          pl={2}
          pr={{ base: 4, md: 5 }}
          py={2}
          rounded={{ base: '20px', md: 'full' }}
          bg="rgba(46, 207, 220, 0.1)"
          borderWidth="1px"
          borderColor="rgba(46, 207, 220, 0.32)"
          boxShadow="0 8px 22px rgba(46, 207, 220, 0.12)"
        >
          <Center
            flex="none"
            boxSize={9}
            rounded="full"
            color="white"
            bgGradient="to-b"
            gradientFrom={siteGradients.ctaFrom}
            gradientTo={siteGradients.ctaTo}
            boxShadow="0 6px 14px rgba(46, 207, 220, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)"
          >
            <Icon aria-hidden as={icons.pickups} boxSize={4.5} />
          </Center>

          <Text
            fontSize={{ base: '15px', md: '16.5px' }}
            fontWeight="semibold"
            lineHeight="1.4"
            textWrap="pretty"
            color="site.ink"
          >
            {m.home_services_leadHighlight()}
          </Text>
        </HStack>
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
