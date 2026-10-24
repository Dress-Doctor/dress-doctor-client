import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'

/**
 * Shown for any address that matches no page. The `_site/import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'

/**
 route puts it
 * inside the site shell, so the header and footer stay and a visitor can carry
 * on from there.
 */
function NotFound() {
  return (
    <>
      <SiteContainer
        position="relative"
        py={{ base: 20, md: 32 }}
        textAlign="center"
        overflow="clip"
      >
        <Box
          aria-hidden
          position="absolute"
          top="50%"
          left="50%"
          w={{ base: '320px', md: '560px' }}
          h={{ base: '320px', md: '560px' }}
          transform="translate(-50%, -50%)"
          rounded="full"
          bg="turquoise-blue.100"
          opacity={0.5}
          filter="blur(90px)"
          pointerEvents="none"
        />

        <Stack position="relative" align="center" gap={5}>
          <Text
            aria-hidden
            fontFamily="heading"
            fontWeight="700"
            lineHeight="1"
            letterSpacing="-0.04em"
            fontSize={{ base: '112px', md: '176px' }}
            color="turquoise-blue.400"
          >
            404
          </Text>

          <Heading
            as="h1"
            fontSize={{ base: '2xl', md: '4xl' }}
            color="site.ink"
          >
            {m.site_notFound_title()}
          </Heading>

          <Text
            maxW="44ch"
            fontSize={{ base: 'md', md: 'lg' }}
            color="site.ink-muted"
          >
            {m.site_notFound_body()}
          </Text>

          <Flex mt={3} gap={3} wrap="wrap" justify="center">
            <SiteButton asChild>
              <Link to={sitePaths.home}>{m.site_notFound_home()}</Link>
            </SiteButton>
            <SiteButton asChild variant="glass">
              <Link to={sitePaths.services}>{m.site_notFound_services()}</Link>
            </SiteButton>
          </Flex>
        </Stack>
      </SiteContainer>
    </>
  )
}

export default NotFound
