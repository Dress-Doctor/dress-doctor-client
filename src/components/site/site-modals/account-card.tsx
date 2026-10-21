import { Box, Center, HStack, Icon, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import { sitePaths } from '#/data/site.data'
import type { SignupOutcomeDto } from '#/interfaces/signup.dto'
import { m } from '#/paraglide/messages'
import { successCard, successCardTitle } from './success-card'

/**
 * Tells a visitor what signing up did: a new account, or a login to the one
 * they had. A customer who was signed in already needs neither, so there is no
 * card for them.
 *
 * Both finished forms show it, with a way into the account. The link leaves the
 * page, so the form closes with it.
 */
function AccountCard({ outcome }: { outcome: SignupOutcomeDto | null }) {
  if (!outcome) return null
  const created = outcome === 'CREATED'

  return (
    <HStack
      {...successCard}
      mt={3.5}
      gap={3.5}
      align="flex-start"
      flexWrap="wrap"
    >
      <Center
        flex="none"
        boxSize="38px"
        rounded="10px"
        bg="white"
        color="turquoise-blue.700"
      >
        <Icon aria-hidden boxSize="17px" as={icons.user} />
      </Center>

      <Box flex="1" minW="220px">
        <Text {...successCardTitle} mb={1}>
          {created
            ? m.common_account_createdTitle()
            : m.common_account_loggedInTitle()}
        </Text>
        <Text fontSize="13.5px" lineHeight="1.55" color="site.ink-muted">
          {created
            ? m.common_account_createdBody()
            : m.common_account_loggedInBody()}
        </Text>
      </Box>

      <SiteButton asChild px={5} py="10px" fontSize="14px">
        <Link to={sitePaths.account}>
          {m.common_account_open()}
          <Icon aria-hidden boxSize={3.5} as={icons.forward} />
        </Link>
      </SiteButton>
    </HStack>
  )
}

export default AccountCard
