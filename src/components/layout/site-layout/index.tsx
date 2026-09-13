import { Box, Flex, Link } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'
import SiteFooter from '#/components/layout/site-footer'
import SiteHeader from '#/components/layout/site-header'
import { m } from '#/paraglide/messages'

const MAIN_ID = 'main-content'

/**
 * The public website's shell: header, page, footer.
 *
 * `overflowX="clip"` rather than `hidden` — several sections bleed decorative
 * glows past the viewport edge, and `hidden` on an ancestor would silently
 * break the header's `position: sticky`.
 */
function SiteLayout({ children }: PropsWithChildren) {
  return (
    <Flex
      direction="column"
      minH="100dvh"
      overflowX="clip"
      bg="site.canvas"
      color="site.ink"
      fontFamily="body"
    >
      <Link
        href={`#${MAIN_ID}`}
        srOnly
        _focusVisible={{
          srOnly: false,
          position: 'fixed',
          top: 4,
          left: 4,
          zIndex: 'skipNav',
          px: 4,
          py: 2,
          rounded: 'full',
          bg: 'white',
          color: 'site.ink',
          boxShadow: 'lg',
        }}
      >
        {m.site_a11y_skipToContent()}
      </Link>

      <SiteHeader />

      <Box as="main" id={MAIN_ID} flex="1">
        {children}
      </Box>

      <SiteFooter />
    </Flex>
  )
}

export default SiteLayout
