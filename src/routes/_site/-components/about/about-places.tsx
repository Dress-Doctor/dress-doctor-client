import {
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { aboutMapEmbed, aboutPlaces } from '#/data/about.data'
import { m } from '#/paraglide/messages'

/** The factory and the office, a reminder that we come to you, and the map. */
function AboutPlaces() {
  return (
    <SiteContainer
      as="section"
      pt={{ base: 14, md: 24 }}
      pb={{ base: 4, md: 8 }}
    >
      <Reveal>
        <SectionHeading
          eyebrow={m.about_places_eyebrow()}
          title={m.about_places_title()}
          lead={m.about_places_lead()}
          maxW="720px"
        />
      </Reveal>

      <SimpleGrid
        as="ul"
        listStyleType="none"
        mt={{ base: 9, md: 12 }}
        columns={{ base: 1, md: 2 }}
        gap={{ base: 4, md: 5 }}
      >
        {aboutPlaces.map((place, index) => (
          <Reveal as="li" key={place.id} delay={index * 70}>
            <Flex
              gap={4}
              h="full"
              p={{ base: 6, md: 7 }}
              rounded="22px"
              bg="white"
              borderWidth="1px"
              borderColor="rgba(0, 23, 31, 0.06)"
              boxShadow="0 1px 2px rgba(0, 23, 31, 0.03), 0 12px 32px rgba(0, 23, 31, 0.04)"
            >
              <Center
                flexShrink={0}
                boxSize={12}
                rounded="16px"
                bg="rgba(255, 137, 74, 0.14)"
                color="amber-orange.700"
              >
                <Icon aria-hidden as={icons.location} boxSize={6} />
              </Center>
              <Stack gap={1}>
                <Heading
                  as="h3"
                  fontSize="xl"
                  fontWeight="semibold"
                  color="site.ink"
                >
                  {place.label()}
                </Heading>
                <Text fontWeight="medium" color="site.ink">
                  {place.address()}
                </Text>
                <Text color="site.ink-muted">{m.about_places_city()}</Text>
              </Stack>
            </Flex>
          </Reveal>
        ))}
      </SimpleGrid>

      <Reveal mt={6}>
        <Flex gap={3} maxW="72ch" color="site.ink-muted">
          <Icon
            aria-hidden
            as={icons.info}
            boxSize={5}
            mt={0.5}
            flexShrink={0}
          />
          <Text lineHeight="1.6">{m.about_places_note()}</Text>
        </Flex>
      </Reveal>

      <Reveal mt={{ base: 8, md: 10 }}>
        <Box
          overflow="hidden"
          rounded="24px"
          borderWidth="1px"
          borderColor="rgba(0, 23, 31, 0.06)"
          boxShadow="0 12px 32px rgba(0, 23, 31, 0.06)"
          h={{ base: '300px', md: '420px' }}
        >
          <iframe
            src={aboutMapEmbed}
            title={m.about_a11y_map()}
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </Box>
      </Reveal>
    </SiteContainer>
  )
}

export default AboutPlaces
