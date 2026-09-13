import { HStack, Icon, IconButton, Text } from '@chakra-ui/react'
import icons from '#/config/icons'

interface QuantityStepperProps {
  /** Already formatted — "6 kg" in the kilo mode, "2" in the per-piece rows. */
  value: string
  size?: 'sm' | 'md'
  decreaseLabel: string
  increaseLabel: string
  canDecrease?: boolean
  canIncrease?: boolean
  onDecrease: () => void
  onIncrease: () => void
}

const sizes = {
  md: { button: '42px', icon: 5, value: '27px', width: '60px', pad: '1px' },
  sm: { button: '32px', icon: 4, value: '16px', width: '22px', pad: '6px' },
} as const

/**
 * Minus / value / plus, as two real buttons around a live figure.
 *
 * The buttons carry their own labels ("Add one shirt") because the visible
 * glyph is a bare − and +, which says nothing on its own.
 */
function QuantityStepper({
  value,
  size = 'md',
  decreaseLabel,
  increaseLabel,
  canDecrease = true,
  canIncrease = true,
  onDecrease,
  onIncrease,
}: QuantityStepperProps) {
  const scale = sizes[size]

  /**
   * The small variant is drawn at 32px, which is under the 44px a thumb needs.
   * Rather than redraw it, the hit area is grown with a transparent pseudo
   * element — the design keeps its proportions and the target still clears the
   * minimum.
   */
  const button = {
    variant: 'outline' as const,
    rounded: 'full',
    position: 'relative' as const,
    boxSize: scale.button,
    minW: scale.button,
    _before: {
      content: '""',
      position: 'absolute',
      inset: `-${scale.pad}`,
      rounded: 'inherit',
    },
    color: 'site.ink',
    borderWidth: '1.5px',
    borderColor: 'rgba(0, 23, 31, 0.14)',
    transitionProperty: 'border-color, background, transform',
    transitionDuration: 'fast',
    _hover: { borderColor: 'site.ink', bg: 'rgba(0, 23, 31, 0.03)' },
    _active: { transform: 'scale(0.92)' },
  }

  return (
    <HStack gap={size === 'md' ? 3.5 : 3}>
      <IconButton
        {...button}
        aria-label={decreaseLabel}
        disabled={!canDecrease}
        onClick={onDecrease}
      >
        <Icon as={icons.minus} boxSize={scale.icon} />
      </IconButton>

      <Text
        fontFamily="display"
        fontSize={scale.value}
        fontWeight={size === 'md' ? 'extrabold' : 'bold'}
        minW={scale.width}
        textAlign="center"
        color="site.ink"
      >
        {value}
      </Text>

      <IconButton
        {...button}
        aria-label={increaseLabel}
        disabled={!canIncrease}
        onClick={onIncrease}
      >
        <Icon as={icons.add} boxSize={scale.icon} />
      </IconButton>
    </HStack>
  )
}

export default QuantityStepper
