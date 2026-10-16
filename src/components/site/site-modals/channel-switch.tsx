import { HStack, Icon, SegmentGroup } from '@chakra-ui/react'
import icons from '#/config/icons'
import type { LoginChannelDto } from '#/interfaces/auth.dto'
import { m } from '#/paraglide/messages'

interface ChannelSwitchProps {
  value: LoginChannelDto
  disabled?: boolean
  onChange: (next: LoginChannelDto) => void
}

/** Two big choices — WhatsApp or email — for where the code is sent. */
function ChannelSwitch({ value, disabled, onChange }: ChannelSwitchProps) {
  const items = [
    {
      value: 'whatsapp',
      label: (
        <HStack gap={2}>
          <Icon aria-hidden boxSize={4} as={icons.whatsappBrand} />
          {m.auth_channel_whatsapp()}
        </HStack>
      ),
    },
    {
      value: 'email',
      label: (
        <HStack gap={2}>
          <Icon aria-hidden boxSize={4} as={icons.email} />
          {m.auth_channel_email()}
        </HStack>
      ),
    },
  ]

  return (
    <SegmentGroup.Root
      aria-label={m.auth_a11y_channel()}
      w="full"
      size="lg"
      rounded="14px"
      p="4px"
      bg="site.sunken"
      value={value}
      disabled={disabled}
      colorPalette="turquoise-blue"
      onValueChange={(event) => onChange(event.value as LoginChannelDto)}
    >
      <SegmentGroup.Indicator rounded="11px" bg="white" shadow="sm" />
      <SegmentGroup.Items
        items={items}
        flex="1"
        justifyContent="center"
        fontWeight="semibold"
        fontSize="15px"
        cursor="pointer"
      />
    </SegmentGroup.Root>
  )
}

export default ChannelSwitch
