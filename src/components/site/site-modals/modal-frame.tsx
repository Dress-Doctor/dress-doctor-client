import { Dialog, Portal } from '@chakra-ui/react'

interface ModalFrameProps extends Dialog.ContentProps {
  open: boolean
  onClose: () => void
  /** The dialog's name for a screen reader — the visible headings change per step. */
  label: string
  /** Where focus goes when the dialog closes: the button that opened it. */
  returnFocusTo: () => HTMLElement | null
  /** Called once the closing animation has finished and the dialog is gone. */
  onExitComplete: () => void
}

/**
 * The shared shell of the pickup and plan forms: a frosted backdrop, and a
 * white card with the website's large corner radius.
 *
 * Chakra's `Dialog` does the hard parts — focus is held inside and given back
 * to the button that opened it, Escape and a tap on the backdrop both close,
 * and the page behind stops scrolling. Nothing is rendered until the form is
 * opened, and it is removed again when it closes.
 *
 * The card never grows taller than the screen: the body of each form scrolls
 * on its own, so the header and the buttons stay in reach on a small phone.
 */
function ModalFrame({
  open,
  onClose,
  label,
  returnFocusTo,
  onExitComplete,
  children,
  ...contentProps
}: ModalFrameProps) {
  return (
    <Dialog.Root
      lazyMount
      unmountOnExit
      open={open}
      finalFocusEl={returnFocusTo}
      onExitComplete={onExitComplete}
      placement="center"
      scrollBehavior="inside"
      motionPreset="slide-in-bottom"
      onOpenChange={(event) => {
        if (!event.open) onClose()
      }}
    >
      <Portal>
        <Dialog.Backdrop
          bg="rgba(20, 26, 36, 0.55)"
          backdropFilter="blur(8px)"
        />
        <Dialog.Positioner p={{ base: 3, md: 6 }}>
          <Dialog.Content
            aria-label={label}
            w="full"
            m={0}
            maxH={{ base: 'calc(100dvh - 24px)', md: 'calc(100dvh - 48px)' }}
            overflow="hidden"
            rounded={{ base: '24px', md: '32px' }}
            bg="white"
            color="site.ink"
            fontFamily="body"
            boxShadow="0 40px 80px -30px rgba(20, 26, 36, 0.4)"
            // Taps act at once, with no wait for a double-tap zoom.
            css={{ '& button, & label, & a': { touchAction: 'manipulation' } }}
            {...contentProps}
          >
            {children}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default ModalFrame
