import { Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import { accountErrorText } from '#/data/account.data'
import { useCancelPickup } from '#/hooks/use-cancel-pickup'
import { useMyPickups } from '#/hooks/use-my-pickups'
import { useSiteModals } from '#/hooks/use-site-modals'
import type { MyPickupDto } from '#/interfaces/account.dto'
import { accountErrorFrom } from '#/libs/account-errors'
import type { AccountErrorKindDto } from '#/libs/account-errors'
import { m } from '#/paraglide/messages'
import AccountNotice from './account-notice'
import { AccountEmpty, AccountError, AccountSkeleton } from './account-states'
import ConfirmDialog from './confirm-dialog'
import PickupCard from './pickup-card'

/** "My pickups": every request for us to collect clothes, newest first. */
function PickupsPage() {
  const pickups = useMyPickups()
  const cancel = useCancelPickup()
  const { openBooking } = useSiteModals()

  // The pickup is kept while the dialog fades out, so its text does not blank.
  const [target, setTarget] = useState<MyPickupDto | null>(null)
  const [open, setOpen] = useState(false)
  const [failure, setFailure] = useState<AccountErrorKindDto | null>(null)
  // Set when staff confirmed the pickup before the customer cancelled it.
  const [tooLate, setTooLate] = useState(false)

  if (pickups.isPending) return <AccountSkeleton />
  if (pickups.isError) {
    return (
      <AccountError
        retrying={pickups.isFetching}
        onRetry={() => void pickups.refetch()}
      />
    )
  }

  const rows = pickups.data.pages.flatMap((page) => page.data)

  const ask = (pickup: MyPickupDto) => {
    setTarget(pickup)
    setFailure(null)
    setTooLate(false)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setFailure(null)
  }

  const confirm = () => {
    if (!target) return
    setFailure(null)
    cancel.mutate(target.reference, {
      onSuccess: close,
      onError: (error) => {
        const kind = accountErrorFrom(error)
        // Nothing is left to try: the list behind now shows it confirmed, and
        // the page says why the cancel did not go through.
        if (kind === 'pickupNotPending') {
          close()
          setTooLate(true)
          return
        }
        setFailure(kind)
      },
    })
  }

  const bookButton = (
    <SiteButton
      py="14px"
      fontSize="15px"
      aria-haspopup="dialog"
      onClick={() => openBooking()}
    >
      {m.site_nav_bookPickup()}
      <Icon aria-hidden boxSize={3.5} as={icons.forward} />
    </SiteButton>
  )

  return (
    <Stack gap={4}>
      <HStack justify="space-between" align="flex-end" gap={3} wrap="wrap">
        <Stack gap={1}>
          <Heading
            as="h2"
            fontSize="2xl"
            fontWeight="semibold"
            letterSpacing="-0.015em"
            color="site.ink"
          >
            {m.account_pickups_title()}
          </Heading>
          {rows.length > 0 && (
            <Text color="site.ink-muted">{m.account_pickups_lead()}</Text>
          )}
        </Stack>
      </HStack>

      {tooLate && (
        <AccountNotice>{m.account_error_pickupNotPending()}</AccountNotice>
      )}

      {rows.length === 0 ? (
        <AccountEmpty
          level="h3"
          icon={icons.pickups}
          title={m.account_pickups_empty_title()}
          body={m.account_pickups_empty_body()}
          action={bookButton}
        />
      ) : (
        <Stack as="ul" role="list" listStyleType="none" gap={3}>
          {rows.map((pickup) => (
            <li key={pickup.reference}>
              <PickupCard pickup={pickup} onCancel={ask} />
            </li>
          ))}
        </Stack>
      )}

      {pickups.hasNextPage && (
        <SiteButton
          variant="glass"
          alignSelf="center"
          px={6}
          py="12px"
          fontSize="15px"
          loading={pickups.isFetchingNextPage}
          loadingText={m.account_state_loading()}
          onClick={() => void pickups.fetchNextPage()}
        >
          {m.account_state_showMore()}
        </SiteButton>
      )}

      <ConfirmDialog
        open={open}
        title={m.account_pickups_cancel_title()}
        body={m.account_pickups_cancel_body()}
        confirmLabel={m.account_pickups_cancel_confirm()}
        keepLabel={m.account_pickups_cancel_keep()}
        destructive
        pending={cancel.isPending}
        error={failure ? accountErrorText[failure]() : undefined}
        onConfirm={confirm}
        onClose={close}
      />
    </Stack>
  )
}

export default PickupsPage
