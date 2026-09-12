import { m } from '#/paraglide/messages'
import { Clipboard, IconButton } from '@chakra-ui/react'
import type { IconButtonProps } from '@chakra-ui/react'

type Props = { value: string } & IconButtonProps

/**
 * Copy-to-clipboard button. Icon-only, so it needs an accessible name — and it
 * gets one by default rather than leaving each call site to remember: a table
 * row can carry several of these, and "button" repeated five times tells a
 * screen-reader user nothing about which one they are on.
 *
 * The default names the value it copies ("Copy UT-DU9JFM"), which is what
 * distinguishes one from the next. It sits before `{...rest}`, so a caller
 * with a better label — a field name, say — still wins.
 */
function AppClipBoard({ value, ...rest }: Props) {
  return (
    <Clipboard.Root value={value}>
      <Clipboard.Trigger asChild>
        <IconButton
          size="xs"
          variant="surface"
          colorPalette="gray"
          aria-label={m.common_a11y_copyValue({ value })}
          {...rest}
        >
          <Clipboard.Indicator pointerEvents="none" />
        </IconButton>
      </Clipboard.Trigger>
    </Clipboard.Root>
  )
}

export default AppClipBoard
