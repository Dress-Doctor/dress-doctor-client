import {
  Box,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import {
  accountErrorText,
  orderStatusView,
  paymentStatusView,
} from '#/data/account.data'
import { useMyOrder } from '#/hooks/use-my-order'
import { useReceipt } from '#/hooks/use-receipt'
import type { MyOrderDto } from '#/interfaces/account.dto'
import {
  formatDate,
  formatMoney,
  isOrderCancelled,
  orderAdjustment,
} from '#/libs/account'
import { accountErrorFrom, isNotFound } from '#/libs/account-errors'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'
import { AccountEmpty, AccountError, AccountSkeleton } from './account-states'
import DashboardCard from './dashboard-card'
import OrderProgress from './order-progress'
import StatusPill from './status-pill'

/** One line of the money summary: a label on the left, the figure on the right. */
function Figure({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <HStack justify="space-between" gap={4} align="baseline">
      <Text
        as="dt"
        fontSize={strong ? '16px' : '14.5px'}
        fontWeight={strong ? 'semibold' : 'normal'}
        color={strong ? 'site.ink' : 'site.ink-muted'}
      >
        {label}
      </Text>
      <Text
        as="dd"
        translate="no"
        whiteSpace="nowrap"
        fontVariantNumeric="tabular-nums"
        fontSize={strong ? '18px' : '15px'}
        fontWeight={strong ? 'bold' : 'medium'}
        color="site.ink"
      >
        {value}
      </Text>
    </HStack>
  )
}

/** What the customer is told about when the order comes back. */
function deliveryLine(order: MyOrderDto): string | undefined {
  const status = order.orderStatus?.orderStatusName
  if (isOrderCancelled(status)) return m.account_order_cancelled()
  if (status === 'DELIVERED') {
    return m.account_order_deliveredOn({
      date: formatDate(order.deliveredAt) ?? '',
    })
  }
  const expected = formatDate(order.estimatedDeliveryDate)
  return expected ? m.account_order_expected({ date: expected }) : undefined
}

/** The clothes on the order, one line each, or the weight when it was weighed. */
function ItemsCard({ order }: { order: MyOrderDto }) {
  const items = order.orderItems ?? []
  const covered = order.pricingModel === 'SUBSCRIPTION'

  return (
    <DashboardCard level="h3" title={m.account_order_items()}>
      {items.length === 0 ? (
        <Text color="site.ink-muted">
          {order.totalWeightKg
            ? m.account_order_weight({ kg: order.totalWeightKg })
            : m.account_order_noItems()}
        </Text>
      ) : (
        <Stack
          as="ul"
          role="list"
          listStyleType="none"
          gap={0}
          divideY="1px"
          divideColor="rgba(0, 23, 31, 0.06)"
        >
          {items.map((line) => (
            <HStack
              as="li"
              key={line._id}
              justify="space-between"
              align="flex-start"
              gap={4}
              py={3}
            >
              <Box minW={0}>
                <Text
                  fontWeight="medium"
                  overflowWrap="anywhere"
                  color="site.ink"
                >
                  {line.item?.itemName ?? '—'}
                </Text>
                <Text fontSize="13px" color="site.ink-muted">
                  {m.account_order_quantity({ count: line.quantity })}
                </Text>
              </Box>
              {!covered && line.lineTotal > 0 && (
                <Text translate="no" fontWeight="medium" whiteSpace="nowrap">
                  {formatMoney(line.lineTotal)}
                </Text>
              )}
            </HStack>
          ))}
        </Stack>
      )}

      {covered && (
        <Text fontSize="13.5px" color="site.ink-muted">
          {m.account_order_covered()}
        </Text>
      )}
    </DashboardCard>
  )
}

function PaymentCard({ order }: { order: MyOrderDto }) {
  const adjustment = orderAdjustment(order)
  const cancelled = isOrderCancelled(order.orderStatus?.orderStatusName)

  return (
    <DashboardCard
      level="h3"
      title={m.account_order_payment()}
      aside={<StatusPill status={paymentStatusView[order.paymentStatus]} />}
    >
      <Stack as="dl" gap={2}>
        <Figure
          label={m.account_order_subtotal()}
          value={formatMoney(order.orderAmount)}
        />
        {adjustment < 0 && (
          <Figure
            label={m.account_order_discount()}
            value={`− ${formatMoney(-adjustment)}`}
          />
        )}
        {adjustment > 0 && (
          <Figure
            label={m.account_order_extra()}
            value={`+ ${formatMoney(adjustment)}`}
          />
        )}
        <Figure
          strong
          label={m.account_order_total()}
          value={formatMoney(order.totalAmount)}
        />
        <Figure
          label={m.account_order_paid()}
          value={formatMoney(order.amountPaid)}
        />
        {!cancelled && order.balanceDue > 0 && (
          <Figure
            strong
            label={m.account_order_balance()}
            value={formatMoney(order.balanceDue)}
          />
        )}
      </Stack>

      <Stack gap={2}>
        <Text as="h4" fontSize="14px" fontWeight="semibold" color="site.ink">
          {m.account_order_payments()}
        </Text>
        {order.payments.length === 0 ? (
          <Text fontSize="14px" color="site.ink-muted">
            {m.account_order_noPayments()}
          </Text>
        ) : (
          <Stack as="ul" role="list" listStyleType="none" gap={2}>
            {order.payments.map((payment) => (
              <HStack
                as="li"
                key={payment._id}
                justify="space-between"
                gap={4}
                align="baseline"
              >
                <Text fontSize="14px" color="site.ink-muted">
                  {formatDate(payment.paidAt)}
                  {payment.paymentMethod?.paymentMethodName && (
                    <>
                      {' · '}
                      <Text as="span" translate="no">
                        {payment.paymentMethod.paymentMethodName}
                      </Text>
                    </>
                  )}
                </Text>
                <Text
                  translate="no"
                  fontSize="14.5px"
                  fontWeight="medium"
                  whiteSpace="nowrap"
                >
                  {formatMoney(payment.amount)}
                </Text>
              </HStack>
            ))}
          </Stack>
        )}
      </Stack>
    </DashboardCard>
  )
}

/** One order: where it is, what is on it, what has been paid, and the receipt. */
function OrderDetailPage({ orderCode }: { orderCode: string }) {
  const query = useMyOrder(orderCode)
  const receipt = useReceipt()

  if (query.isPending) return <AccountSkeleton rows={3} />

  if (query.isError) {
    if (isNotFound(query.error)) {
      return (
        <AccountEmpty
          icon={icons.orders}
          title={m.account_order_notFound_title()}
          body={m.account_order_notFound_body()}
          action={
            <SiteButton
              asChild
              variant="glass"
              px={6}
              py="12px"
              fontSize="15px"
            >
              <Link to={sitePaths.accountOrders}>{m.account_order_back()}</Link>
            </SiteButton>
          }
        />
      )
    }
    return (
      <AccountError
        retrying={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const order = query.data
  const status = order.orderStatus?.orderStatusName ?? null
  const line = deliveryLine(order)
  // A receipt is for an order we have taken in; a draft or a cancelled one has none.
  const hasReceipt =
    status !== null && status !== 'DRAFT' && status !== 'CANCELLED'

  return (
    <Stack gap={{ base: 5, md: 6 }}>
      <Stack gap={3}>
        <ChakraLink
          asChild
          alignSelf="flex-start"
          fontSize="14.5px"
          fontWeight="medium"
          color="site.ink-muted"
          textDecoration="none"
          _hover={{ color: 'site.ink', textDecoration: 'none' }}
        >
          <Link to={sitePaths.accountOrders}>
            <Icon aria-hidden boxSize={4} as={icons.back} />
            {m.account_order_back()}
          </Link>
        </ChakraLink>

        <HStack justify="space-between" align="center" gap={3} wrap="wrap">
          <Heading
            as="h2"
            fontSize="2xl"
            fontWeight="semibold"
            letterSpacing="-0.015em"
            overflowWrap="anywhere"
            color="site.ink"
          >
            {m.account_order_title({ code: order.orderCode })}
          </Heading>
          {status && <StatusPill status={orderStatusView[status]} />}
        </HStack>
      </Stack>

      <DashboardCard level="h3" title={m.account_order_where()}>
        <OrderProgress status={status} />
        {line && (
          <Text lineHeight="1.6" textWrap="pretty" color="site.ink-muted">
            {line}
          </Text>
        )}
      </DashboardCard>

      <ItemsCard order={order} />
      <PaymentCard order={order} />

      {order.pickupRequest && (
        <Text fontSize="14px" color="site.ink-muted">
          {m.account_order_fromPickup()}{' '}
          <Text as="span" translate="no" fontWeight="medium" color="site.ink">
            {order.pickupRequest.reference}
          </Text>
        </Text>
      )}

      {hasReceipt && (
        <Stack gap={2} align="flex-start">
          <SiteButton
            variant="glass"
            px={6}
            py="12px"
            fontSize="15px"
            loading={receipt.isPending}
            loadingText={m.account_order_receiptLoading()}
            onClick={() => receipt.mutate(order.orderCode)}
          >
            <Icon aria-hidden boxSize={4} as={icons.download} />
            {m.account_order_receipt()}
          </SiteButton>
          <Text
            role="alert"
            fontSize="13.5px"
            color="red.600"
            hidden={!receipt.isError}
          >
            {receipt.isError &&
              accountErrorText[accountErrorFrom(receipt.error)]()}
          </Text>
        </Stack>
      )}
    </Stack>
  )
}

export default OrderDetailPage
