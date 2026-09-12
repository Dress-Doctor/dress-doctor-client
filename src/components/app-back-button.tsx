import { IconButton } from '@chakra-ui/react'
import type { IconButtonProps } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { LuArrowLeft } from 'react-icons/lu'

type Props = LinkProps & {
  /** Accessible name for the icon-only control, e.g. "Back to providers". */
  label: string
  size?: IconButtonProps['size']
}

function AppBackButton({ label, size = 'sm', ...linkProps }: Props) {
  return (
    <IconButton asChild colorPalette="gray" rounded="full" size={size}>
      <Link {...linkProps} aria-label={label}>
        <LuArrowLeft aria-hidden="true" />
      </Link>
    </IconButton>
  )
}

export default AppBackButton
