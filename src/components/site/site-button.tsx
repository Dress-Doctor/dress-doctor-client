import { Button } from '@chakra-ui/react'
import type { ButtonProps } from '@chakra-ui/react'
import { siteGradients } from '#/data/site.data'

export type SiteButtonVariant = 'primary' | 'glass' | 'onDark' | 'solidDark'

export interface SiteButtonProps extends Omit<ButtonProps, 'variant'> {
  /**
   * `primary` is the turquoise pill that carries every booking action.
   * `glass` is its companion on the light page, `onDark` on a navy panel, and
   * `solidDark` the charcoal pill the non-featured plan cards use.
   */
  variant?: SiteButtonVariant
}

/** The lift and the press, shared by every pill. */
const rise = { transform: 'translateY(-2px)' }
const press = { transform: 'scale(0.97)' }

/**
 * Only the two properties the design actually animates. The three variants
 * that also change their border or fill on hover extend this list rather than
 * falling back to `all`.
 */
const MOTION = 'transform, box-shadow'

const variants: Record<SiteButtonVariant, ButtonProps> = {
  primary: {
    color: 'white',
    border: 'none',
    bgGradient: 'to-b',
    gradientFrom: siteGradients.ctaFrom,
    gradientTo: siteGradients.ctaTo,
    boxShadow:
      '0 14px 34px rgba(46, 207, 220, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    _hover: {
      ...rise,
      boxShadow:
        '0 20px 44px rgba(46, 207, 220, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    },
  },
  glass: {
    color: 'site.ink',
    bg: 'rgba(255, 255, 255, 0.75)',
    borderWidth: '1px',
    borderColor: 'rgba(0, 23, 31, 0.1)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 14px rgba(0, 23, 31, 0.05)',
    transitionProperty: `${MOTION}, border-color`,
    _hover: {
      ...rise,
      borderColor: 'rgba(0, 23, 31, 0.22)',
      boxShadow: '0 10px 24px rgba(0, 23, 31, 0.08)',
    },
  },
  onDark: {
    color: 'white',
    bg: 'rgba(255, 255, 255, 0.08)',
    borderWidth: '1px',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backdropFilter: 'blur(8px)',
    transitionProperty: `${MOTION}, background`,
    _hover: { ...rise, bg: 'rgba(255, 255, 255, 0.14)' },
  },
  solidDark: {
    color: 'white',
    bg: 'dark-bluish-gray.500',
    boxShadow: '0 14px 30px rgba(32, 41, 56, 0.28)',
    transitionProperty: `${MOTION}, background`,
    _hover: { ...rise, bg: 'dark-bluish-gray.600' },
  },
}

/**
 * The website's pill actions.
 *
 * Built on Chakra's `Button` with `variant="plain"` so the focus ring, the
 * disabled handling and the `asChild` escape hatch all still apply — most of
 * these are links, rendered as
 * `<SiteButton asChild><Link to="…"/></SiteButton>` — the router's anchor is
 * the styled element, which is the same `asChild` pairing the admin console's
 * sidebar and back button use.
 *
 * The measurements are the design's own: a 17/32 pill at 16.5px, which is off
 * Chakra's 4px spacing grid on both axes, so they are stated in pixels rather
 * than snapped to the nearest token and left a point short.
 */
function SiteButton({
  variant = 'primary',
  children,
  ...props
}: SiteButtonProps) {
  return (
    <Button
      variant="plain"
      position="relative"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      h="auto"
      px="32px"
      py="17px"
      gap={2.5}
      rounded="full"
      fontFamily="body"
      fontSize="16.5px"
      fontWeight="semibold"
      lineHeight="1.2"
      whiteSpace="nowrap"
      textDecoration="none"
      transitionProperty={MOTION}
      transitionDuration="moderate"
      transitionTimingFunction="ease"
      _active={press}
      {...variants[variant]}
      {...props}
    >
      {children}
    </Button>
  )
}

export default SiteButton
