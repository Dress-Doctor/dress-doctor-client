import { HStack, Icon, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import { pickupStatusView, pricingModelLabel } from '#/data/account.data'
import { siteContact } from '#/data/site.data'
import type { MyPickupDto } from '#/interfaces/account.dto'
import { formatDate, formatPickupWhen } from '#/libs/account'
import { m } from '#/paraglide/messages'
import StatusPill from './status-pill'

interface PickupCardProps {
  pickup: MyPickupDto
  /** Opens the "cancel this pickup?" question for this one. */
  onCancel: (pickup: MyPickupDto) => void
}

/** One labelled line of a pickup. */
function Line({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Stack gap={0.5}>
      <Text
        as="dt"
        fontSize="12.5px"
        fontWeight="semibold"
        color="site.ink-subtle"
      >
        {label}
      </Text>
      <Text as="dd" overflowWrap="anywhere" color="site.ink">
        {children}
      </Text>
    </Stack>
  )
}

/**
 * One pickup request.
 *
 * While it is waiting for our call it can be cancelled here. After that a
 * rider may already be on the way, so the customer settles it with us on
 * WhatsApp instead, and the card says so rather than showing a button that
 * the API would refuse.
 */
function PickupCard({ pickup, onCancel }: PickupCardProps) {
  const pending = pickup.status === 'PENDING'
  const settled = pickup.status === 'PICKED_UP' || pickup.status === 'CANCELLED'

  return (
    <Stack
      gap={4}
      p={{ base: 4, md: 5 }}
      bg="white"
      rounded={{ base: '20px', md: '24px' }}
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
      boxShadow="0 12px 32px rgba(0, 23, 31, 0.05)"
      opacity={pickup.status === 'CANCELLED' ? 0.75 : 1}
    >
      <HStack justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <Text
          translate="no"
          fontSize="17px"
          fontWeight="semibold"
          letterSpacing="0.01em"
        >
          {pickup.reference}
        </Text>
        <StatusPill status={pickupStatusView[pickup.status]} />
      </HStack>

      <Stack as="dl" gap={3}>
        <Line label={m.account_pickups_when()}>
          {formatPickupWhen(pickup.pickupDate, pickup.pickupTime)}
        </Line>
        <Line label={m.account_pickups_address()}>{pickup.pickupAddress}</Line>
        {pickup.pricingModel && (
          <Line label={m.account_pickups_pricing()}>
            {pricingModelLabel[pickup.pricingModel]()}
          </Line>
        )}
        <Line label={m.account_pickups_sent()}>
          {formatDate(pickup.createdAt)}
        </Line>
        {pickup.orderCodes.length > 0 && (
          <Line label={m.account_pickups_orders()}>
            <HStack as="span" gap={3} wrap="wrap">
              {pickup.orderCodes.map((code) => (
                <ChakraLink
                  asChild
                  key={code}
                  translate="no"
                  fontWeight="medium"
                  color="turquoise-blue.800"
                >
                  <Link
                    to="/account/orders/$orderCode"
                    params={{ orderCode: code }}
                  >
                    {code}
                  </Link>
                </ChakraLink>
              ))}
            </HStack>
          </Line>
        )}
      </Stack>

      {pending && (
        <SiteButton
          variant="glass"
          alignSelf="flex-start"
          px={5}
          py="10px"
          fontSize="14.5px"
          aria-haspopup="dialog"
          onClick={() => onCancel(pickup)}
        >
          {m.account_pickups_cancel()}
        </SiteButton>
      )}

      {!pending && !settled && (
        <Text fontSize="13.5px" lineHeight="1.55" color="site.ink-muted">
          {m.account_pickups_change()}{' '}
          <ChakraLink
            href={siteContact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            fontWeight="medium"
            color="turquoise-blue.800"
          >
            <Icon
              aria-hidden
              boxSize={3.5}
              me={1}
              verticalAlign="-2px"
              as={icons.whatsappBrand}
            />
            {m.account_pickups_changeLink()}
          </ChakraLink>
        </Text>
      )}
    </Stack>
  )
}

export default PickupCard
