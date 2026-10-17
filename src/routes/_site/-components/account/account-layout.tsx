import {
  Box,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Outlet } from '@tanstack/react-router'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import icons from '#/config/icons'
import { meQueryOptions } from '#/hooks/use-me'
import { useSiteModals } from '#/hooks/use-site-modals'
import { m } from '#/paraglide/messages'
import AccountNav from './account-nav'
import LogoutButton from './logout-button'

const bloom = [
  'radial-gradient(700px 360px at 88% 8%, rgba(255, 137, 74, 0.1), transparent 65%)',
  'radial-gradient(900px 480px at 8% 90%, rgba(46, 207, 220, 0.14), transparent 60%)',
].join(', ')

/**
 * The frame every account page sits in: a greeting, the way to move between
 * the pages, and the page itself.
 *
 * The route above guards it, so by the time this draws, the signed-in
 * customer's name is already known and every page below can rely on it.
 */
function AccountLayout() {
  const { data: me } = useSuspenseQuery(meQueryOptions())
  const { openBooking } = useSiteModals()

  return (
    <Box as="section" bgImage={bloom}>
      <SiteContainer py={{ base: 8, md: 14 }}>
        <Stack gap={{ base: 6, md: 10 }}>
          <Stack
            justify="space-between"
            align={{ base: 'flex-start', md: 'flex-end' }}
            direction={{ base: 'column', md: 'row' }}
            gap={5}
          >
            <Stack gap={2} minW={0}>
              <Heading
                as="h1"
                fontSize="clamp(30px, 4.6vw, 42px)"
                fontWeight="semibold"
                lineHeight="1.08"
                letterSpacing="-0.025em"
                textWrap="balance"
                overflowWrap="anywhere"
                color="site.ink"
              >
                {m.account_title({ name: me.user.firstName })}
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                lineHeight="1.6"
                textWrap="pretty"
                color="site.ink-muted"
              >
                {m.account_lead()}
              </Text>
            </Stack>

            <SiteButton
              flex="none"
              py="14px"
              fontSize="15px"
              aria-haspopup="dialog"
              onClick={() => openBooking()}
            >
              {m.site_nav_bookPickup()}
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </SiteButton>
          </Stack>

          {/*
           * `minmax(0, 1fr)` on both layouts, so a wide child (the row of
           * pills on a phone) scrolls on its own instead of stretching the
           * column and pushing the page off the screen.
           */}
          <SimpleGrid
            gap={{ base: 6, lg: 12 }}
            templateColumns={{
              base: 'minmax(0, 1fr)',
              lg: '220px minmax(0, 1fr)',
            }}
            alignItems="start"
          >
            <AccountNav />

            <Stack gap={{ base: 5, md: 6 }} minW={0}>
              <Outlet />

              {/* On a wide screen the way out is in the navigation. */}
              <HStack display={{ base: 'flex', lg: 'none' }} pt={2}>
                <LogoutButton />
              </HStack>
            </Stack>
          </SimpleGrid>
        </Stack>
      </SiteContainer>
    </Box>
  )
}

export default AccountLayout
