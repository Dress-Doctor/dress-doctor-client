import { HStack, Image, Stack, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import mark from '#/assets/logos/dress-doctor-primary.svg'
import { m } from '#/paraglide/messages'

/**
 * The mark and wordmark in the header.
 *
 * The image is imported rather than pointed at `/logos/*` so the bundler emits
 * a hashed URL for it — the same reasoning as `components/logo.tsx`.
 */
function SiteBrand() {
  return (
    <Link to="/" aria-label="Dress Doctor">
      <HStack gap={2.5} flex="none">
        <Image
          src={mark}
          alt=""
          h="42px"
          w="auto"
          htmlWidth={512}
          htmlHeight={512}
        />

        <Stack gap={0.5} display={{ base: 'none', sm: 'flex' }}>
          <Text
            as="span"
            fontFamily="display"
            fontSize="22px"
            fontWeight="extrabold"
            letterSpacing="-0.01em"
            lineHeight="1"
            color="dark-bluish-gray.500"
            translate="no"
          >
            Dress Doctor
          </Text>
          <Text
            as="span"
            fontFamily="display"
            fontSize="11px"
            letterSpacing="0.14em"
            lineHeight="1"
            textTransform="uppercase"
            color="site.ink-subtle"
          >
            {m.site_nav_tagline()}
          </Text>
        </Stack>
      </HStack>
    </Link>
  )
}

export default SiteBrand
