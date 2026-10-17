import { Box, HStack, Link as ChakraLink, Stack } from '@chakra-ui/react'
import { Link, useMatchRoute, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { accountSections } from '#/data/account.data'
import { m } from '#/paraglide/messages'
import LogoutButton from './logout-button'

/**
 * The account's own navigation.
 *
 * A sticky list down the side on wide screens; a row of pills that scrolls
 * sideways on a phone, so there is no second menu to open. Both are the same
 * links, and the link for the page you are on says so (`aria-current`).
 *
 * "My details" is the account's front page, so it is matched exactly. The
 * others match any page below them: an order's page still lights "My orders".
 */
function AccountNav() {
  const matchRoute = useMatchRoute()
  const list = useRef<HTMLDivElement>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  // On a phone the pills scroll sideways. Bring the one for this page into
  // view, so a customer who lands on "My pickups" is not looking at "My
  // orders" with the page they are on hidden off the edge. `block: 'nearest'`
  // keeps the page itself from jumping up or down.
  useEffect(() => {
    list.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [pathname])

  return (
    <Box
      as="nav"
      aria-label={m.account_a11y_nav()}
      alignSelf="start"
      minW={0}
      position={{ lg: 'sticky' }}
      top={{ lg: '112px' }}
      // Lets the pill row run to the screen's edge on a phone.
      mx={{ base: -5, md: -7, lg: 0 }}
    >
      <Stack
        as="ul"
        ref={list}
        role="list"
        listStyleType="none"
        direction={{ base: 'row', lg: 'column' }}
        gap={{ base: 2, lg: 1 }}
        px={{ base: 5, md: 7, lg: 0 }}
        pb={{ base: 1, lg: 0 }}
        overflowX={{ base: 'auto', lg: 'visible' }}
        overscrollBehaviorX="contain"
        css={{
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {accountSections.map((section) => {
          const current = Boolean(
            matchRoute({ to: section.to, fuzzy: section.id !== 'details' }),
          )

          return (
            <li key={section.id}>
              <ChakraLink
                asChild
                display="flex"
                alignItems="center"
                px={{ base: 4, lg: 4 }}
                py={{ base: '9px', lg: '11px' }}
                rounded="full"
                whiteSpace="nowrap"
                fontSize={{ base: '14.5px', lg: '15px' }}
                fontWeight={current ? 'semibold' : 'medium'}
                color={current ? 'turquoise-blue.800' : 'site.ink-muted'}
                bg={current ? 'turquoise-blue.50' : 'transparent'}
                borderWidth="1px"
                borderColor={
                  current
                    ? 'turquoise-blue.200'
                    : { base: 'rgba(0, 23, 31, 0.1)', lg: 'transparent' }
                }
                textDecoration="none"
                transitionProperty="color, background, border-color"
                transitionDuration="moderate"
                _hover={{
                  color: 'site.ink',
                  bg: current ? 'turquoise-blue.50' : 'site.sunken',
                  textDecoration: 'none',
                }}
              >
                <Link
                  to={section.to}
                  aria-current={current ? 'page' : undefined}
                >
                  {section.label()}
                </Link>
              </ChakraLink>
            </li>
          )
        })}
      </Stack>

      {/* On a phone the way out sits under the page instead (see the layout). */}
      <HStack display={{ base: 'none', lg: 'flex' }} mt={6} ps={1}>
        <LogoutButton />
      </HStack>
    </Box>
  )
}

export default AccountNav
