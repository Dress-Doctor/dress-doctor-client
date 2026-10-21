import { Heading, Icon, Stack, Text } from '@chakra-ui/react'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import { useMyOrders } from '#/hooks/use-my-orders'
import { useMyProfile } from '#/hooks/use-my-profile'
import { useSiteModals } from '#/hooks/use-site-modals'
import { m } from '#/paraglide/messages'
import { AccountEmpty, AccountError, AccountSkeleton } from './account-states'
import OrderCard from './order-card'

/** "My orders": every order, newest first, a page at a time. */
function OrdersPage() {
  const profile = useMyProfile()
  const orders = useMyOrders(profile.data?.customerCode)
  const { openBooking } = useSiteModals()

  const failed = profile.isError || orders.isError
  if (failed) {
    return (
      <AccountError
        retrying={profile.isFetching || orders.isFetching}
        onRetry={() => {
          if (profile.isError) void profile.refetch()
          else void orders.refetch()
        }}
      />
    )
  }
  if (profile.isPending || orders.isPending) return <AccountSkeleton />

  const rows = orders.data.pages.flatMap((page) => page.data)
  const total = orders.data.pages[0]?.total ?? rows.length

  return (
    <Stack gap={4}>
      <Stack gap={1}>
        <Heading
          as="h2"
          fontSize="2xl"
          fontWeight="semibold"
          letterSpacing="-0.015em"
          color="site.ink"
        >
          {m.account_orders_title()}
        </Heading>
        {rows.length > 0 && (
          <Text color="site.ink-muted">
            {m.account_orders_count({ count: total })}
          </Text>
        )}
      </Stack>

      {rows.length === 0 ? (
        <AccountEmpty
          level="h3"
          icon={icons.orders}
          title={m.account_orders_empty_title()}
          body={m.account_orders_empty_body()}
          action={
            <SiteButton
              py="14px"
              fontSize="15px"
              aria-haspopup="dialog"
              onClick={() => openBooking()}
            >
              {m.site_nav_bookPickup()}
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </SiteButton>
          }
        />
      ) : (
        <Stack as="ul" role="list" listStyleType="none" gap={3}>
          {rows.map((order) => (
            <li key={order._id}>
              <OrderCard order={order} />
            </li>
          ))}
        </Stack>
      )}

      {orders.hasNextPage && (
        <SiteButton
          variant="glass"
          alignSelf="center"
          px={6}
          py="12px"
          fontSize="15px"
          loading={orders.isFetchingNextPage}
          loadingText={m.account_state_loading()}
          onClick={() => void orders.fetchNextPage()}
        >
          {m.account_state_showMore()}
        </SiteButton>
      )}
    </Stack>
  )
}

export default OrdersPage
