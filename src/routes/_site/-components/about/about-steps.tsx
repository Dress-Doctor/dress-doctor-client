import { Center, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { aboutSteps } from '#/data/about.data'
import { m } from '#/paraglide/messages'

/** The four steps from booking to delivery. */
function AboutSteps() {
  return (
    <SiteContainer as="section" py={{ base: 14, md: 24 }}>
      <Reveal>
        <SectionHeading
          eyebrow={m.about_steps_eyebrow()}
          title={m.about_steps_title()}
          maxW="720px"
        />
      </Reveal>

      <SimpleGrid
        as="ol"
        listStyleType="none"
        mt={{ base: 9, md: 12 }}
        columns={{ base: 1, sm: 2, lg: 4 }}
        gap={{ base: 4, md: 5 }}
      >
        {aboutSteps.map((step, index) => (
          <Reveal as="li" key={step.id} delay={index * 70}>
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
                aria-hidden
                boxSize={11}
                rounded="full"
                bgGradient="to-b"
                gradientFrom="turquoise-blue.400"
                gradientTo="turquoise-blue.600"
                color="white"
                fontFamily="display"
                fontSize="lg"
                fontWeight="bold"
              >
                {index + 1}
              </Center>
              <Stack gap={1.5}>
                <Heading
                  as="h3"
                  fontSize="xl"
                  fontWeight="semibold"
                  color="site.ink"
                >
                  {step.title()}
                </Heading>
                <Text lineHeight="1.6" color="site.ink-muted">
                  {step.text()}
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
          fontWeight="medium"
          color="site.ink"
        >
          {m.about_steps_closing()}
        </Text>
      </Reveal>
    </SiteContainer>
  )
}

export default AboutSteps
