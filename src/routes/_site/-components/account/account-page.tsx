import { Box, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import icons from '#/config/icons'
import { meQueryOptions } from '#/hooks/use-me'
import { useLogout } from '#/hooks/use-logout'
import { useSiteModals } from '#/hooks/use-site-modals'
import { formatInternational, readInternational } from '#/libs/phone'
import utils from '#/libs/utils'
import { m } from '#/paraglide/messages'

const bloom = [
  'radial-gradient(700px 360px at 88% 8%, rgba(255, 137, 74, 0.1), transparent 65%)',
  'radial-gradient(900px 480px at 8% 90%, rgba(46, 207, 220, 0.14), transparent 60%)',
].join(', ')

interface DetailProps {
  label: string
  value: string | undefined
}

/** One labelled line of the customer's details. */
function Detail({ label, value }: DetailProps) {
  return (
    <Stack gap={0.5} py={3}>
      <Text
        as="dt"
        fontSize="12.5px"
        fontWeight="semibold"
        color="site.ink-subtle"
      >
        {label}
      </Text>
      {/* A number or an address is not for a page translator to rewrite. */}
      <Text
        as="dd"
        translate={value ? 'no' : undefined}
        overflowWrap="anywhere"
        fontSize="16px"
        color={value ? 'site.ink' : 'site.ink-subtle'}
      >
        {value ?? m.auth_account_notSet()}
      </Text>
    </Stack>
  )
}

/** The signed-in customer's page: who they are, and a way to log out. */
function AccountPage() {
  const { data: me } = useSuspenseQuery(meQueryOptions())
  const { logout, loggingOut } = useLogout()
  const { openBooking } = useSiteModals()
  const { user } = me

  const language =
    user.preferredLanguage === 'fr'
      ? m.auth_account_languageFr()
      : m.auth_account_languageEn()

  /** Stored as digits with the country code: `237699000111` -> `+237 699 000 111`. */
  const readable = (digits: string | undefined) => {
    if (!digits) return undefined
    const parsed = readInternational(`+${utils.digitsOnly(digits)}`)
    return parsed
      ? formatInternational(parsed.country, parsed.national)
      : `+${utils.digitsOnly(digits)}`
  }

  return (
    <Box as="section" bgImage={bloom}>
      <SiteContainer py={{ base: 10, md: 16 }}>
        <Stack maxW="38rem" mx="auto" gap={{ base: 6, md: 8 }}>
          <Stack gap={3}>
            <Heading
              as="h1"
              fontSize="clamp(30px, 4.6vw, 42px)"
              fontWeight="semibold"
              lineHeight="1.08"
              letterSpacing="-0.025em"
              textWrap="balance"
              color="site.ink"
            >
              {m.auth_account_title({ name: user.firstName })}
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              lineHeight="1.6"
              textWrap="pretty"
              color="site.ink-muted"
            >
              {m.auth_account_lead()}
            </Text>
          </Stack>

          <Box
            p={{ base: 5, md: 8 }}
            bg="white"
            rounded={{ base: '24px', md: '32px' }}
            borderWidth="1px"
            borderColor="rgba(0, 23, 31, 0.06)"
            boxShadow="0 24px 60px rgba(0, 23, 31, 0.08)"
          >
            <Text
              as="h2"
              fontSize="xl"
              fontWeight="semibold"
              letterSpacing="-0.01em"
              color="site.ink"
            >
              {m.auth_account_details()}
            </Text>

            <Stack
              as="dl"
              mt={2}
              gap={0}
              divideY="1px"
              divideColor="rgba(0, 23, 31, 0.06)"
            >
              <Detail
                label={m.auth_account_phone()}
                value={readable(user.phone)}
              />
              <Detail
                label={m.auth_account_whatsapp()}
                value={readable(user.whatsappPhone ?? user.phone)}
              />
              <Detail label={m.auth_account_email()} value={user.email} />
              <Detail label={m.auth_account_language()} value={language} />
            </Stack>
          </Box>

          <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
            <SiteButton
              flex={{ sm: '1' }}
              py="14px"
              fontSize="15px"
              aria-haspopup="dialog"
              onClick={() => openBooking()}
            >
              {m.site_nav_bookPickup()}
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </SiteButton>

            <SiteButton
              variant="glass"
              flex={{ sm: '1' }}
              py="14px"
              fontSize="15px"
              loading={loggingOut}
              loadingText={m.auth_account_loggingOut()}
              onClick={() => logout()}
            >
              <Icon aria-hidden boxSize={4} as={icons.logout} />
              {m.auth_account_logout()}
            </SiteButton>
          </Stack>
        </Stack>
      </SiteContainer>
    </Box>
  )
}

export default AccountPage
