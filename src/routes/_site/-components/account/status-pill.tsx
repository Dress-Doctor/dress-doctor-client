import { Box } from '@chakra-ui/react'
import type { StatusToneDto, StatusViewDto } from '#/data/account.data'

/**
 * Each tone is a pale fill with dark text of the same hue. The words carry the
 * meaning; colour only backs them up, so nothing depends on seeing it.
 */
const tones: Record<StatusToneDto, { bg: string; color: string }> = {
  neutral: { bg: 'site.sunken', color: 'site.ink-muted' },
  info: { bg: 'turquoise-blue.50', color: 'turquoise-blue.800' },
  success: { bg: 'green.50', color: 'green.800' },
  warning: { bg: 'amber-orange.100', color: 'amber-orange.800' },
  danger: { bg: 'red.50', color: 'red.800' },
}

/** A small rounded tag for where an order, pickup, payment or plan stands. */
function StatusPill({ status }: { status: StatusViewDto }) {
  const tone = tones[status.tone]

  return (
    <Box
      as="span"
      display="inline-block"
      px={3}
      py="3px"
      rounded="full"
      bg={tone.bg}
      color={tone.color}
      fontSize="12.5px"
      fontWeight="semibold"
      lineHeight="1.4"
      textAlign="center"
      textWrap="balance"
    >
      {status.label()}
    </Box>
  )
}

export default StatusPill
