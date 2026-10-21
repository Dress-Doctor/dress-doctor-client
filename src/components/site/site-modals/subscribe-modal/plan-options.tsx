import { Flex, Icon, RadioCard, SegmentGroup, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import { homePlans } from '#/data/home.data'
import type { SubscribeFlow } from '#/hooks/use-subscribe-flow'
import type { PlanBillingDto, PlanModeDto } from '#/interfaces/site.dto'
import utils from '#/libs/utils'
import { m } from '#/paraglide/messages'
import ChoiceItem from '../choice-item'

/** The same look as the segmented controls above the plan cards on the page. */
const segmentItem = {
  gap: 1.5,
  px: 3.5,
  py: 2,
  rounded: 'full',
  cursor: 'pointer',
  fontSize: '13.5px',
  fontWeight: 'semibold',
  color: 'site.ink-subtle',
  _checked: { color: 'site.ink' },
} as const

const segmentIndicator = {
  rounded: 'full',
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'rgba(0, 23, 31, 0.1)',
  boxShadow: '0 4px 12px rgba(0, 23, 31, 0.08)',
} as const

/** The three plans as cards to pick from. */
export function PlanPicker({ flow }: { flow: SubscribeFlow }) {
  return (
    <RadioCard.Root
      display="grid"
      gap={2}
      gridTemplateColumns="repeat(3, 1fr)"
      value={flow.planId}
      aria-label={m.subscribe_a11y_planGroup()}
      onValueChange={(event) => {
        if (event.value) flow.setPlanId(event.value)
      }}
    >
      {homePlans.map((plan) => (
        <ChoiceItem
          key={plan.id}
          value={plan.id}
          selected={flow.planId === plan.id}
          flexDirection="column"
          alignItems="flex-start"
          gap={0.5}
          px={3}
          py="10px"
          textAlign="start"
        >
          <Text fontSize="15px" fontWeight="bold" color="site.ink">
            {plan.name()}
          </Text>
          <Text
            fontSize="12.5px"
            lineHeight="1.35"
            fontVariantNumeric="tabular-nums"
            color="site.ink-muted"
          >
            {m.subscribe_planPrice({ price: utils.toXaf(plan.price) })}
          </Text>
        </ChoiceItem>
      ))}
    </RadioCard.Root>
  )
}

/** Count in pieces or kilos, and pay every month or every three. */
export function PlanToggles({ flow }: { flow: SubscribeFlow }) {
  return (
    <Flex gap={3} wrap="wrap">
      <SegmentGroup.Root
        p={1}
        gap={1}
        rounded="full"
        bg="rgba(0, 23, 31, 0.045)"
        value={flow.mode}
        aria-label={m.home_plans_countBy()}
        onValueChange={(event) => flow.setMode(event.value as PlanModeDto)}
      >
        <SegmentGroup.Indicator {...segmentIndicator} />

        <SegmentGroup.Item value="pieces" {...segmentItem}>
          <Icon aria-hidden boxSize={3.5} as={icons.garment} />
          <SegmentGroup.ItemText>{m.home_plans_pieces()}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>

        <SegmentGroup.Item value="kg" {...segmentItem}>
          <Icon aria-hidden boxSize={3.5} as={icons.weight} />
          <SegmentGroup.ItemText>{m.home_plans_kg()}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      </SegmentGroup.Root>

      <SegmentGroup.Root
        p={1}
        gap={1}
        rounded="full"
        bg="rgba(0, 23, 31, 0.045)"
        value={flow.billing}
        aria-label={m.home_plans_a11y_billing()}
        onValueChange={(event) =>
          flow.setBilling(event.value as PlanBillingDto)
        }
      >
        <SegmentGroup.Indicator {...segmentIndicator} />

        <SegmentGroup.Item value="monthly" {...segmentItem}>
          <SegmentGroup.ItemText>
            {m.home_plans_monthly()}
          </SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>

        <SegmentGroup.Item value="quarterly" {...segmentItem}>
          <SegmentGroup.ItemText>
            {m.home_plans_quarterly()}
          </SegmentGroup.ItemText>
          <Text
            as="span"
            px={2}
            py={0.5}
            rounded="full"
            fontSize="10px"
            fontWeight="extrabold"
            letterSpacing="0.06em"
            fontFamily="label"
            textTransform="uppercase"
            color="amber-orange.700"
            bg="rgba(255, 137, 74, 0.14)"
          >
            {m.home_plans_save()}
          </Text>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      </SegmentGroup.Root>
    </Flex>
  )
}
