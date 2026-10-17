import { Dialog, HStack, Portal, Stack, Text } from '@chakra-ui/react'
import SiteButton from '#/components/site/site-button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  body: string
  /** The button that does it. It says what it does: "Cancel plan", not "Yes". */
  confirmLabel: string
  /** The button that backs out. It says what stays: "Keep my plan". */
  keepLabel: string
  /** The words for a failure, shown here so the customer sees them in place. */
  error?: string
  pending?: boolean
  /** Red for something that cannot be undone, turquoise for the rest. */
  destructive?: boolean
  onConfirm: () => void
  onClose: () => void
}

/**
 * Asks before something that cannot be undone, or that changes a plan.
 *
 * It is an alert dialog: focus starts on the safe button ("keep"), Escape and a
 * tap outside both back out, and the page behind stops moving. A failure stays
 * inside the dialog, beside the button that was pressed, instead of a toast
 * that could be missed.
 */
function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  keepLabel,
  error,
  pending,
  destructive,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      lazyMount
      unmountOnExit
      role="alertdialog"
      open={open}
      placement="center"
      motionPreset="slide-in-bottom"
      // Backing out while the call is on its way would hide its answer.
      closeOnEscape={!pending}
      closeOnInteractOutside={!pending}
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
            w="full"
            maxW="26rem"
            m={0}
            p={{ base: 5, md: 7 }}
            rounded={{ base: '24px', md: '28px' }}
            bg="white"
            color="site.ink"
            fontFamily="body"
            boxShadow="0 40px 80px -30px rgba(20, 26, 36, 0.4)"
            css={{ '& button': { touchAction: 'manipulation' } }}
          >
            <Stack gap={5}>
              <Stack gap={2}>
                <Dialog.Title
                  fontSize="xl"
                  fontWeight="semibold"
                  letterSpacing="-0.01em"
                  textWrap="balance"
                >
                  {title}
                </Dialog.Title>
                <Dialog.Description
                  lineHeight="1.6"
                  textWrap="pretty"
                  color="site.ink-muted"
                >
                  {body}
                </Dialog.Description>
              </Stack>

              <Text
                role="alert"
                fontSize="13.5px"
                color="red.600"
                hidden={!error}
              >
                {error}
              </Text>

              <HStack gap={3} wrap="wrap" justify="flex-end">
                <Dialog.CloseTrigger asChild>
                  <SiteButton
                    variant="glass"
                    px={6}
                    py="12px"
                    fontSize="15px"
                    disabled={pending}
                  >
                    {keepLabel}
                  </SiteButton>
                </Dialog.CloseTrigger>

                <SiteButton
                  px={6}
                  py="12px"
                  fontSize="15px"
                  loading={pending}
                  onClick={onConfirm}
                  {...(destructive && {
                    bgGradient: 'none',
                    bg: 'red.600',
                    boxShadow: '0 12px 28px rgba(220, 38, 38, 0.3)',
                    _hover: {
                      bg: 'red.700',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  {confirmLabel}
                </SiteButton>
              </HStack>
            </Stack>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default ConfirmDialog
