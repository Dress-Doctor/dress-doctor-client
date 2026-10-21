import { Box, HStack, Icon, Link, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import SiteContainer from '#/components/site/site-container'
import { siteContact } from '#/data/site.data'
import { m } from '#/paraglide/messages'

interface InfoBarProps {
  /** Collapsed once the reader has scrolled past the top of the page. */
  collapsed: boolean
}

/**
 * The thin strip above the nav: how to reach the shop, and the promise that
 * pickup costs nothing.
 *
 * It collapses to zero height on scroll rather than unmounting, so the sticky
 * header shrinks in one continuous movement instead of the nav jumping up.
 */
function InfoBar({ collapsed }: InfoBarProps) {
  return (
    <Box
      overflow="hidden"
      maxH={collapsed ? '0' : '44px'}
      opacity={collapsed ? 0 : 1}
      bg="rgba(246, 249, 250, 0.9)"
      borderBottomWidth="1px"
      borderColor={collapsed ? 'transparent' : 'rgba(0, 23, 31, 0.05)'}
      transitionProperty="max-height, opacity, border-color"
      transitionDuration="moderate"
      transitionTimingFunction="ease-in-out"
      aria-hidden={collapsed}
      display={{ base: 'none', md: 'block' }}
    >
      <SiteContainer>
        <HStack h="40px" gap={4} justify="space-between" fontSize="13px">
          <HStack gap={5}>
            <Link
              href={siteContact.whatsappHref}
              target="_blank"
              rel="noopener"
              gap={2}
              fontWeight="medium"
              color="site.ink"
              textDecoration="none"
              _hover={{ color: 'turquoise-blue.700' }}
            >
              <Box
                flex="none"
                boxSize={2}
                rounded="full"
                bg="site.whatsapp"
                boxShadow="0 0 0 3px rgba(37, 211, 102, 0.18)"
              />
              <Icon
                aria-hidden
                boxSize={3.5}
                as={icons.whatsappBrand}
                color="site.whatsapp"
              />
              {siteContact.phoneDisplay}
            </Link>

            <HStack gap={1.5} color="site.ink-muted">
              <Icon aria-hidden boxSize={3.5} as={icons.location} />
              <Text as="span">{m.site_nav_location()}</Text>
            </HStack>
          </HStack>

          <HStack
            gap={1.5}
            px={3}
            py={1}
            rounded="full"
            flex="none"
            fontSize="xs"
            fontWeight="semibold"
            whiteSpace="nowrap"
            color="amber-orange.700"
            bg="rgba(255, 137, 74, 0.08)"
            borderWidth="1px"
            borderColor="rgba(255, 137, 74, 0.25)"
            display={{ base: 'none', lg: 'flex' }}
          >
            <Icon aria-hidden boxSize={3.5} as={icons.pickups} />
            {m.site_nav_freePickup()}
          </HStack>
        </HStack>
      </SiteContainer>
    </Box>
  )
}

export default InfoBar
