import { Box, HStack, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { orderStatusView, paymentStatusView } from '#/data/account.data'
import type { MyOrderRowDto } from '#/interfaces/account.dto'
import { formatDate, formatMoney, isOrderCancelled } from '#/libs/account'
import { m } from '#/paraglide/messages'
import StatusPill from './status-pill'

/**
 * One order in the list. The whole card is the link, so there is one big
 * target to tap rather than a small "view" button.
 */
function OrderCard({ order }: { order: MyOrderRowDto }) {
  const cancelled = isOrderCancelled(order.status)
  const delivered = order.status === 'DELIVERED' && order.deliveredAt
  const owing = !cancelled && order.balanceDue > 0

  return (
    <ChakraLink
      asChild
      display="block"
      p={{ base: 4, md: 5 }}
      bg="white"
      rounded={{ base: '20px', md: '24px' }}
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
      boxShadow="0 12px 32px rgba(0, 23, 31, 0.05)"
      color="site.ink"
      textDecoration="none"
      transitionProperty="box-shadow, border-color"
      transitionDuration="moderate"
      _hover={{
        textDecoration: 'none',
        borderColor: 'turquoise-blue.300',
        boxShadow: '0 16px 40px rgba(0, 23, 31, 0.09)',
      }}
    >
      <Link
        to="/account/orders/$orderCode"
        params={{ orderCode: order.orderCode }}
      >
        <Stack gap={3}>
          <HStack
            justify="space-between"
            align="flex-start"
            gap={3}
            wrap="wrap"
          >
            <Text
              translate="no"
              fontSize="17px"
              fontWeight="semibold"
              letterSpacing="0.01em"
            >
              {order.orderCode}
            </Text>
            {order.status && (
              <StatusPill status={orderStatusView[order.status]} />
            )}
          </HStack>

          <Text fontSize="14px" color="site.ink-muted">
            {delivered
              ? m.account_orders_deliveredOn({
                  date: formatDate(order.deliveredAt) ?? '',
                })
              : m.account_orders_receivedOn({
                  date: formatDate(order.receivedAt ?? order.createdAt) ?? '',
                })}
            {' · '}
            {m.account_orders_items({ count: order.items })}
          </Text>

          {!cancelled && (
            <HStack justify="space-between" align="center" gap={3} wrap="wrap">
              <Box>
                <Text fontSize="12.5px" color="site.ink-subtle">
                  {m.account_orders_total()}
                </Text>
                <Text
                  fontSize="17px"
                  fontWeight="semibold"
                  translate="no"
                  whiteSpace="nowrap"
                  fontVariantNumeric="tabular-nums"
                >
                  {formatMoney(order.totalAmount)}
                </Text>
              </Box>

              <Stack gap={1} align="flex-end">
                <StatusPill status={paymentStatusView[order.paymentStatus]} />
                {owing && (
                  <Text fontSize="12.5px" color="site.ink-muted" translate="no">
                    {m.account_orders_balance({
                      amount: formatMoney(order.balanceDue),
                    })}
                  </Text>
                )}
              </Stack>
            </HStack>
          )}
        </Stack>
      </Link>
    </ChakraLink>
  )
}

export default OrderCard
