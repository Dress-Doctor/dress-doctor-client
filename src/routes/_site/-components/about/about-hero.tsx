import {
  Box,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SiteContainer from '#/components/site/site-container'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'

const bloom = [
  'radial-gradient(700px 360px at 88% 8%, rgba(255, 137, 74, 0.1), transparent 65%)',
  'radial-gradient(900px 480px at 8% 90%, rgba(46, 207, 220, 0.14), transparent 60%)',
].join(', ')

/** Where you are, then who we are in three short paragraphs. */
function AboutHero() {
  return (
    <Box as="section" position="relative" overflow="hidden" bgImage={bloom}>
      <SiteContainer pt={{ base: 10, md: 14 }} pb={{ base: 12, md: 20 }}>
        <Box as="nav" aria-label={m.about_a11y_breadcrumb()}>
          <HStack
            as="ol"
            listStyleType="none"
            wrap="wrap"
            gap={2}
            fontSize="13px"
            color="site.ink-muted"
          >
            <HStack as="li" gap={2}>
              <ChakraLink
                asChild
                gap={1.5}
                color="site.ink-muted"
                _hover={{ color: 'site.ink' }}
              >
                <Link to={sitePaths.home}>
                  <Icon aria-hidden boxSize={3.5} as={icons.home} />
                  {m.about_breadcrumb_home()}
                </Link>
              </ChakraLink>
            </HStack>
            <Text as="li" aria-hidden color="site.ink-subtle">
              /
            </Text>
            <Text
              as="li"
              aria-current="page"
              fontWeight="semibold"
              color="site.ink"
            >
              {m.about_breadcrumb_current()}
            </Text>
          </HStack>
        </Box>

        <Reveal mt={{ base: 5, md: 6 }}>
          <Text
            as="span"
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="0.14em"
            fontFamily="label"
            textTransform="uppercase"
            color="turquoise-blue.700"
          >
            {m.about_hero_eyebrow()}
          </Text>

          <Heading
            as="h1"
            mt={3.5}
            maxW="16ch"
            fontSize="clamp(36px, 5.4vw, 60px)"
            fontWeight="semibold"
            lineHeight="1.04"
            letterSpacing="-0.028em"
            textWrap="balance"
            color="site.ink"
          >
            {m.about_hero_title()}
          </Heading>

          <Stack mt={6} gap={4} maxW="62ch" textWrap="pretty">
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="medium"
              lineHeight="1.5"
              color="site.ink"
            >
              {m.about_hero_lead1()}
            </Text>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              lineHeight="1.65"
              color="site.ink-muted"
            >
              {m.about_hero_lead2()}
            </Text>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              lineHeight="1.65"
              color="site.ink-muted"
            >
              {m.about_hero_lead3()}
            </Text>
          </Stack>
        </Reveal>
      </SiteContainer>
    </Box>
  )
}

export default AboutHero
