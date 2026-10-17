import { Icon, Stack, Text } from '@chakra-ui/react'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import { siteContact } from '#/data/site.data'
import type { MyProfileDto } from '#/interfaces/account.dto'
import { formatPhone } from '#/libs/account'
import utils from '#/libs/utils'
import { m } from '#/paraglide/messages'
import DashboardCard from './dashboard-card'

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
        {value ?? m.account_contact_notSet()}
      </Text>
    </Stack>
  )
}

/**
 * The contacts we hold. They are shown, not edited: a code is sent to the
 * WhatsApp number or the email to let someone in, so changing one on a whim
 * could hand the account to somebody else. We change them with the customer,
 * by message.
 */
function ContactCard({ profile }: { profile: MyProfileDto }) {
  const phone = formatPhone(profile.phone)

  return (
    <DashboardCard title={m.account_contact_title()}>
      <Stack as="dl" gap={0} divideY="1px" divideColor="rgba(0, 23, 31, 0.06)">
        <Detail
          label={m.account_contact_name()}
          value={
            utils.fullName(profile) === '—'
              ? undefined
              : utils.fullName(profile)
          }
        />
        <Detail label={m.account_contact_phone()} value={phone} />
        <Detail
          label={m.account_contact_whatsapp()}
          value={formatPhone(profile.whatsappPhone)}
        />
        <Detail label={m.account_contact_email()} value={profile.email} />
      </Stack>

      {profile.phoneUnverified && phone && (
        <Stack
          role="note"
          gap={1}
          p={4}
          rounded="16px"
          bg="amber-orange.50"
          borderWidth="1px"
          borderColor="amber-orange.200"
        >
          <Text
            fontSize="14.5px"
            fontWeight="semibold"
            color="amber-orange.900"
          >
            {m.account_contact_unchecked_title()}
          </Text>
          <Text fontSize="14px" lineHeight="1.55" color="amber-orange.900">
            {m.account_contact_unchecked_body()}
          </Text>
        </Stack>
      )}

      <Stack gap={3} align="flex-start">
        <Text
          fontSize="14px"
          lineHeight="1.55"
          textWrap="pretty"
          color="site.ink-muted"
        >
          {m.account_contact_change()}
        </Text>
        <SiteButton asChild variant="glass" px={5} py="10px" fontSize="14.5px">
          <a
            href={siteContact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon aria-hidden boxSize={4} as={icons.whatsappBrand} />
            {m.account_contact_messageUs()}
          </a>
        </SiteButton>
      </Stack>
    </DashboardCard>
  )
}

export default ContactCard
