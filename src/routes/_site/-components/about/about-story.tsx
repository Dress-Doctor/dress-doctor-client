import { Box, Grid, Image, Stack, Text } from '@chakra-ui/react'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { aboutFounder } from '#/data/about.data'
import { m } from '#/paraglide/messages'

const body = {
  fontSize: { base: 'md', md: 'lg' },
  lineHeight: '1.75',
  color: 'site.ink-muted',
} as const

/** The turning points of the story read larger, so a skim still tells it. */
const turn = {
  fontSize: { base: 'lg', md: 'xl' },
  fontWeight: 'semibold',
  lineHeight: '1.45',
  color: 'site.ink',
} as const

/** The founder's story, in their own first-person words. */
function AboutStory() {
  return (
    <SiteContainer
      as="section"
      pt={{ base: 8, md: 12 }}
      pb={{ base: 14, md: 24 }}
    >
      <Grid
        gap={{ base: 8, lg: 16 }}
        templateColumns={{ base: '1fr', lg: '5fr 7fr' }}
        alignItems="start"
      >
        <Reveal position={{ lg: 'sticky' }} top={{ lg: '120px' }}>
          <SectionHeading
            size="md"
            eyebrow={m.about_story_eyebrow()}
            title={m.about_story_title()}
          />

          <Box as="figure" mt={8} maxW={{ base: '320px', lg: '360px' }}>
            <Image
              src={aboutFounder.image}
              alt={m.about_story_photoAlt()}
              htmlWidth={960}
              htmlHeight={960}
              loading="lazy"
              w="full"
              aspectRatio={1}
              objectFit="cover"
              rounded="28px"
              boxShadow="0 1px 2px rgba(0, 23, 31, 0.04), 0 24px 56px rgba(0, 23, 31, 0.12)"
            />
            <Box as="figcaption" mt={4}>
              <Text fontWeight="semibold" color="site.ink">
                {aboutFounder.name}
              </Text>
              <Text fontSize="sm" color="site.ink-muted">
                {m.about_story_role()}
              </Text>
            </Box>
          </Box>
        </Reveal>

        <Reveal>
          <Stack gap={5} maxW="62ch" textWrap="pretty">
            <Text {...body}>{m.about_story_p1()}</Text>
            <Text {...turn}>{m.about_story_p2()}</Text>
            <Text {...body}>{m.about_story_p3()}</Text>
            <Text {...body}>{m.about_story_p4()}</Text>
            <Text {...turn}>{m.about_story_p5()}</Text>
            <Text {...body}>{m.about_story_p6()}</Text>
            <Text {...body}>{m.about_story_p7()}</Text>
            <Text {...turn}>{m.about_story_p8()}</Text>
            <Text {...body}>{m.about_story_p9()}</Text>

            <Box
              mt={2}
              px={{ base: 5, md: 7 }}
              py={{ base: 5, md: 6 }}
              rounded="20px"
              bg="rgba(46, 207, 220, 0.1)"
              borderLeftWidth="4px"
              borderColor="turquoise-blue.500"
            >
              <Text
                fontSize={{ base: 'lg', md: '22px' }}
                fontWeight="semibold"
                lineHeight="1.4"
                color="site.ink"
              >
                {m.about_story_closing()}
              </Text>
            </Box>
          </Stack>
        </Reveal>
      </Grid>
    </SiteContainer>
  )
}

export default AboutStory
