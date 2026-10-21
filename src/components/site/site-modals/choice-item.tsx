import { Center, Icon, RadioCard } from '@chakra-ui/react'
import icons from '#/config/icons'

/** The round tick on the right of a selected card. */
export function ChoiceCheck({ selected }: { selected: boolean }) {
  return (
    <Center
      aria-hidden
      flex="none"
      boxSize="22px"
      rounded="full"
      borderWidth="1.5px"
      borderColor={selected ? 'turquoise-blue.500' : 'rgba(0, 23, 31, 0.12)'}
      bg={selected ? 'turquoise-blue.500' : 'transparent'}
      color={selected ? 'white' : 'transparent'}
      transitionProperty="background, border-color, color"
      transitionDuration="moderate"
    >
      <Icon boxSize={3} as={icons.check} strokeWidth="3" />
    </Center>
  )
}

interface ChoiceItemProps extends RadioCard.ItemControlProps {
  value: string
  selected: boolean
  disabled?: boolean
  /** Tooltip text — says why a choice cannot be picked. */
  title?: string
}

/**
 * One card in a "pick one" group.
 *
 * `RadioCard` rather than a row of buttons: the group is a real radio group,
 * so the arrow keys move between cards and a screen reader reads it as one
 * question with several answers.
 *
 * In Chakra's `RadioCard` the item is the bordered box and the control is the
 * row of content inside it, so the look goes on the item and `controlProps`
 * (gap, padding, direction) on the control.
 *
 * The look follows `selected` from the caller rather than Chakra's checked
 * state, because the contents of the card — its round tick, its icon badge —
 * need to change with it too. `_checked` is set to the same values only
 * because the recipe has its own, which would otherwise win.
 */
function ChoiceItem({
  value,
  selected,
  disabled,
  title,
  children,
  ...controlProps
}: ChoiceItemProps) {
  const look = {
    borderColor: selected ? 'turquoise-blue.500' : 'rgba(0, 23, 31, 0.12)',
    bg: selected ? 'turquoise-blue.50' : 'white',
    boxShadow: selected ? '0 0 0 4px rgba(46, 207, 220, 0.1)' : 'none',
  }

  return (
    <RadioCard.Item
      value={value}
      disabled={disabled}
      title={title}
      rounded="14px"
      borderWidth="1.5px"
      cursor="pointer"
      color="site.ink"
      {...look}
      transitionProperty="border-color, background, box-shadow"
      transitionDuration="moderate"
      _checked={look}
      _hover={{
        borderColor: selected ? 'turquoise-blue.500' : 'rgba(0, 23, 31, 0.28)',
      }}
      _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
      // The real input is hidden, so the ring is drawn on the card around it.
      css={{
        '&:has(input:focus-visible)': {
          outline: '2px solid',
          outlineColor: 'var(--chakra-colors-turquoise-blue-600)',
          outlineOffset: '2px',
        },
      }}
    >
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl
        w="full"
        p={0}
        alignItems="center"
        _disabled={{ bg: 'transparent' }}
        {...controlProps}
      >
        {children}
      </RadioCard.ItemControl>
    </RadioCard.Item>
  )
}

export default ChoiceItem
