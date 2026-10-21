import { Box, Stack, Text } from '@chakra-ui/react'
import { orderSteps } from '#/data/account.data'
import type { OrderStatusDto } from '#/interfaces/account.dto'
import { orderStep } from '#/libs/account'
import { m } from '#/paraglide/messages'

const stepLabels: Record<(typeof orderSteps)[number], () => string> = {
  CONFIRMED: m.account_order_step_confirmed,
  RECEIVED: m.account_order_step_received,
  WASHING: m.account_order_step_washing,
  READY: m.account_order_step_ready,
  DELIVERED: m.account_order_step_delivered,
}

/**
 * Where the order is on its way back to the customer: five short steps, the
 * ones reached filled in. It is a real ordered list, and the step the order is
 * on says so (`aria-current="step"`), so a screen reader hears the position
 * and not just a row of coloured bars.
 */
function OrderProgress({ status }: { status: OrderStatusDto | null }) {
  const at = orderStep(status)
  if (at < 0) return null

  return (
    <Stack
      as="ol"
      role="list"
      aria-label={m.account_order_progress()}
      direction="row"
      gap={{ base: 1.5, md: 3 }}
      listStyleType="none"
    >
      {orderSteps.map((step, index) => {
        const reached = index <= at
        const current = index === at

        return (
          <Stack
            as="li"
            key={step}
            flex="1"
            minW={0}
            gap={2}
            aria-current={current ? 'step' : undefined}
          >
            <Box
              aria-hidden
              h="6px"
              rounded="full"
              bg={reached ? 'turquoise-blue.500' : 'rgba(0, 23, 31, 0.08)'}
            />
            <Text
              fontSize={{ base: '11.5px', md: '13px' }}
              fontWeight={current ? 'bold' : 'medium'}
              lineHeight="1.3"
              color={current ? 'site.ink' : 'site.ink-muted'}
              overflowWrap="anywhere"
            >
              {stepLabels[step]()}
            </Text>
          </Stack>
        )
      })}
    </Stack>
  )
}

export default OrderProgress
