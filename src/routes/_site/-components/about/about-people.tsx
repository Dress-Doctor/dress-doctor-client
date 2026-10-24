import { Box, Grid, Stack, Text } from '@chakra-ui/react'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { m } from '#/paraglide/messages'

const body = {
  fontSize: { base: 'md', md: 'lg' },
  lineHeight: '1.7',
  color: 'site.ink-muted',
} as const

/** The team, and the promise we make to a customer. */
function AboutPeople() {
  return (
    <SiteContainer as="section" py={{ base: 14, md: 24 }}>
      <Grid
        gap={{ base: 10, lg: 16 }}
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        alignItems="start"
      >
        <Reveal>
          <SectionHeading
            size="md"
            eyebrow={m.about_people_eyebrow()}
            title={m.about_people_title()}
          />
          <Stack mt={6} gap={4} textWrap="pretty">
            <Text {...body} fontWeight="medium" color="site.ink">
              {m.about_people_p1()}
            </Text>
            <Text {...body}>{m.about_people_p2()}</Text>
            <Text {...body}>{m.about_people_p3()}</Text>
          </Stack>
        </Reveal>

        <Reveal delay={90}>
          <Box
            p={{ base: 7, md: 10 }}
            rounded="28px"
            bg="dark-bluish-gray.500"
            color="white"
          >
            <SectionHeading
              size="md"
              tone="light"
              eyebrow={m.about_promise_eyebrow()}
              title={m.about_promise_title()}
            />
            <Stack mt={6} gap={4} textWrap="pretty">
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                lineHeight="1.7"
                color="whiteAlpha.800"
              >
                {m.about_promise_p1()}
              </Text>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                lineHeight="1.7"
                color="whiteAlpha.800"
              >
                {m.about_promise_p2()}
              </Text>
              <Text
                pt={2}
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="semibold"
                lineHeight="1.45"
                color="white"
              >
                {m.about_promise_closing()}
              </Text>
            </Stack>
          </Box>
        </Reveal>
      </Grid>
    </SiteContainer>
  )
}

export default AboutPeople
