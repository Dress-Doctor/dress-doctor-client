import { HStack, Icon } from '@chakra-ui/react'
import type { StackProps } from '@chakra-ui/react'
import icons from '#/config/icons'

const STARS = [1, 2, 3, 4, 5]

interface StarRatingProps extends StackProps {
  /** Read out to assistive tech; the stars themselves are decorative. */
  label: string
  size?: number
}

/** The five-star mark beside the hero's social proof and each testimonial. */
function StarRating({ label, size = 4, ...props }: StarRatingProps) {
  return (
    <HStack
      gap={0.5}
      role="img"
      color="amber-orange.500"
      aria-label={label}
      {...props}
    >
      {STARS.map((star) => (
        <Icon
          key={star}
          aria-hidden
          as={icons.star}
          boxSize={size}
          fill="currentColor"
        />
      ))}
    </HStack>
  )
}

export default StarRating
