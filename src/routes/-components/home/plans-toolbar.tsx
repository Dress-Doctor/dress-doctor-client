import {
  Box,
  Button,
  Center,
  Flex,
  Icon,
  SegmentGroup,
  Text,
} from '@chakra-ui/react'
import icons from '#/config/icons'
import type { PlanBillingDto, PlanModeDto } from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'

interface PlansToolbarProps {
  mode: PlanModeDto
  billing: PlanBillingDto
  onModeChange: (mode: PlanModeDto) => void
  onBillingChange: (billing: PlanBillingDto) => void
}

/** The two segmented controls share everything but their indicator. */
const segmentItem = {
  gap: 2,
  px: 4,
  py: 2.5,
  rounded: 'full',
  cursor: 'pointer',
  fontSize: 'sm',
  fontWeight: 'semibold',
  justifyContent: 'center',
  color: 'site.ink-subtle',
  _checked: { color: 'site.ink' },
} as const

/**
 * How the plan cards should be read: counting garments or counting weight, and
 * billed monthly or a tenth cheaper every quarter.
 *
 * Two `SegmentGroup`s rather than styled divs — these change the figures on
 * three price cards, so they have to behave like the radio groups they are.
 */
function PlansToolbar({
  mode,
  billing,
  onModeChange,
  onBillingChange,
}: PlansToolbarProps) {
  return (
    <Flex
      gap={4}
      rowGap={3}
      wrap="wrap"
      align="center"
      justify="center"
      mx="auto"
      pl={6}
      pr={3}
      py={2.5}
      w="fit-content"
      maxW="full"
      rounded="full"
      bg="white"
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.05)"
      boxShadow="0 1px 2px rgba(0, 23, 31, 0.03), 0 16px 40px rgba(0, 23, 31, 0.08)"
    >
      <Text fontSize="13.5px" fontWeight="semibold" color="site.ink-subtle">
        {m.home_plans_countBy()}
      </Text>

      <SegmentGroup.Root
        p={1}
        gap={1}
        rounded="full"
        bg="rgba(0, 23, 31, 0.045)"
        value={mode}
        aria-label={m.home_plans_countBy()}
        onValueChange={(event) => onModeChange(event.value as PlanModeDto)}
      >
        <SegmentGroup.Indicator
          rounded="full"
          bg="white"
          borderWidth="1px"
          borderColor="rgba(0, 23, 31, 0.1)"
          boxShadow="0 4px 12px rgba(0, 23, 31, 0.08)"
        />

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

      <Box
        aria-hidden
        w="1px"
        h="30px"
        bg="rgba(0, 23, 31, 0.08)"
        display={{ base: 'none', md: 'block' }}
      />

      <SegmentGroup.Root
        gap={1}
        rounded="full"
        bg="transparent"
        value={billing}
        aria-label={m.home_plans_a11y_billing()}
        onValueChange={(event) =>
          onBillingChange(event.value as PlanBillingDto)
        }
      >
        <SegmentGroup.Indicator
          rounded="full"
          bg="white"
          borderWidth="1.5px"
          borderColor="#24B9C6"
          boxShadow="0 4px 14px rgba(46, 207, 220, 0.22)"
        />

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

/** The explanation of the mode that is currently selected, and a way out of it. */
export function PlansModeNote({
  mode,
  onModeChange,
}: Pick<PlansToolbarProps, 'mode' | 'onModeChange'>) {
  const isKg = mode === 'kg'

  return (
    <Flex
      mx="auto"
      mt="22px"
      gap={4}
      rowGap={3}
      wrap="wrap"
      align="center"
      maxW="860px"
      pl={4}
      pr={3}
      py={3}
      rounded="18px"
      fontSize="sm"
      lineHeight="1.55"
      color="site.ink-muted"
      bg="rgba(255, 137, 74, 0.06)"
      borderWidth="1px"
      borderColor="rgba(255, 137, 74, 0.2)"
    >
      <Center
        flex="none"
        boxSize={10}
        rounded="12px"
        bg="white"
        color="amber-orange.700"
        boxShadow="0 6px 16px rgba(0, 23, 31, 0.07)"
      >
        <Icon
          aria-hidden
          boxSize={4.5}
          as={isKg ? icons.weight : icons.garment}
        />
      </Center>

      <Text flex="1" minW="16rem">
        <Text as="span" fontWeight="bold" color="site.ink">
          {isKg ? m.home_plans_kgModeTitle() : m.home_plans_piecesModeTitle()} —
        </Text>{' '}
        {isKg ? m.home_plans_kgModeBody() : m.home_plans_piecesModeBody()}
      </Text>

      <Button
        variant="outline"
        rounded="full"
        h="auto"
        px={4}
        py={2.5}
        gap={1.5}
        flex="none"
        bg="white"
        fontSize="13px"
        fontWeight="semibold"
        color="site.ink"
        whiteSpace="nowrap"
        borderColor="rgba(0, 23, 31, 0.1)"
        boxShadow="0 2px 8px rgba(0, 23, 31, 0.04)"
        transitionProperty="border-color, transform"
        transitionDuration="moderate"
        _hover={{
          borderColor: 'rgba(0, 23, 31, 0.3)',
          transform: 'translateY(-1px)',
        }}
        _active={{ transform: 'scale(0.97)' }}
        onClick={() => onModeChange(isKg ? 'pieces' : 'kg')}
      >
        {isKg ? m.home_plans_switchToPieces() : m.home_plans_switchToKg()}
        <Icon aria-hidden boxSize={3} as={icons.forward} />
      </Button>
    </Flex>
  )
}

export default PlansToolbar
