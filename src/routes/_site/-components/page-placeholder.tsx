import SiteContainer from '#/components/site/site-container'
import { Heading, Stack, Text } from '@chakra-ui/react'
import { m } from '#/paraglide/messages'

interface Props {
  title: string
}

/**
 * Stand-in body for the website pages the nav links to but that have not been
 * designed yet.
 *
 * They exist as real routes rather than dead `href`s so every link on the home
 * page is a typed, client-side `Link` — TanStack's `to` is checked against the
 * generated route tree, so a page that is missing here is a compile error
 * rather than a 404 a visitor finds first.
 */
function PagePlaceholder({ title }: Props) {
  return (
    <SiteContainer py={{ base: 20, md: 32 }}>
      <Stack gap={3} maxW="46ch">
        <Heading as="h1" fontSize={{ base: '2xl', md: '4xl' }} color="site.ink">
          {title}
        </Heading>
        <Text fontSize="md" color="site.ink-muted">
          {m.site_placeholder_body()}
        </Text>
      </Stack>
    </SiteContainer>
  )
}

export default PagePlaceholder
