import { Button, Span } from '@chakra-ui/react'
import type { ButtonProps } from '@chakra-ui/react'
import React, { forwardRef } from 'react'
import { Tooltip } from '../ui/tooltip'

interface Props extends ButtonProps {
  tooltips?: string
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const TimeButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { children, onClick, tooltips, ...rest } = props

  return (
    <Button
      ref={ref}
      size="xs"
      onClick={onClick}
      touchAction="manipulation"
      /**
       * Some of these buttons are an icon alone, so the tooltip text is the only
       * name they have — a tooltip is not one, so `aria-label` as well.
       */
      aria-label={tooltips}
      {...rest}
    >
      <Tooltip
        showArrow
        openDelay={0}
        closeDelay={0}
        content={tooltips}
        positioning={{ placement: 'top' }}
      >
        {/* `span`, not `p`: a paragraph inside a button is invalid markup. */}
        <Span>{children}</Span>
      </Tooltip>
    </Button>
  )
})

TimeButton.displayName = 'TimeButton'
export default TimeButton
