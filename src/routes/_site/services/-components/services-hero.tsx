import {
  Box,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
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

/** Where you are, then the page title and the promise behind it. */
function ServicesHero() {
  return (
    <Box as="section" position="relative" overflow="hidden" bgImage={bloom}>
      <SiteContainer pt={{ base: 10, md: 14 }} pb={{ base: 4, md: 6 }}>
        <Box as="nav" aria-label={m.services_a11y_breadcrumb()}>
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
                  {m.services_breadcrumb_home()}
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
              {m.site_nav_services()}
            </Text>
          </HStack>
        </Box>

        <Reveal mt={{ base: 5, md: 6 }}>
          <Heading
            as="h1"
            maxW="18ch"
            fontSize="clamp(36px, 5.4vw, 60px)"
            fontWeight="semibold"
            lineHeight="1.04"
            letterSpacing="-0.028em"
            textWrap="balance"
            color="site.ink"
          >
            {m.services_hero_title()}
          </Heading>

          <Text
            mt={4}
            maxW="56ch"
            fontSize={{ base: 'md', md: 'lg' }}
            lineHeight="1.6"
            textWrap="pretty"
            color="site.ink-muted"
          >
            {m.services_hero_lead()}
          </Text>
        </Reveal>
      </SiteContainer>
    </Box>
  )
}

export default ServicesHero
