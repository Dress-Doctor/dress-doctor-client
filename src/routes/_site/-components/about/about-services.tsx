import {
  Center,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { aboutServices } from '#/data/about.data'
import { m } from '#/paraglide/messages'

/** What we do, as six short cards and a line about the monthly plans. */
function AboutServices() {
  return (
    <SiteContainer as="section" py={{ base: 14, md: 24 }}>
      <Reveal>
        <SectionHeading
          eyebrow={m.about_services_eyebrow()}
          title={m.about_services_title()}
          lead={m.about_services_lead()}
          maxW="720px"
        />
      </Reveal>

      <SimpleGrid
        as="ul"
        listStyleType="none"
        mt={{ base: 9, md: 12 }}
        columns={{ base: 1, sm: 2, lg: 3 }}
        gap={{ base: 4, md: 5 }}
      >
        {aboutServices.map((service, index) => (
          <Reveal as="li" key={service.id} delay={index * 60}>
            <Stack
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
                boxSize={12}
                rounded="16px"
                bg="rgba(46, 207, 220, 0.14)"
                color="turquoise-blue.700"
              >
                <Icon aria-hidden as={service.icon} boxSize={6} />
              </Center>
              <Stack gap={1.5}>
                <Heading
                  as="h3"
                  fontSize="xl"
                  fontWeight="semibold"
                  color="site.ink"
                >
                  {service.title()}
                </Heading>
                <Text lineHeight="1.6" color="site.ink-muted">
                  {service.text()}
                </Text>
              </Stack>
            </Stack>
          </Reveal>
        ))}
      </SimpleGrid>

      <Reveal mt={8}>
        <Text
          maxW="62ch"
          fontSize={{ base: 'md', md: 'lg' }}
          color="site.ink-muted"
        >
          {m.about_services_plans()}
        </Text>
      </Reveal>
    </SiteContainer>
  )
}

export default AboutServices
