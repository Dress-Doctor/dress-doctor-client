import { Presence } from '@chakra-ui/react'
import type { PresenceProps } from '@chakra-ui/react'

/**
 * Default enter/exit motion for anything that mounts, unmounts or is remounted
 * via `key`. Every prop is overridable, so callers can swap the animation or
 * the render strategy without dropping the defaults.
 */
function AppPresence({ children, ...props }: PresenceProps) {
  return (
    <Presence
      animationDuration="moderate"
      animationName={{
        _open: 'slide-from-bottom, fade-in',
        _closed: 'slide-to-bottom, fade-out',
      }}
      {...props}
    >
      {children}
    </Presence>
  )
}

export default AppPresence
