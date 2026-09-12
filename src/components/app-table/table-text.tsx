import { Group, Text } from '@chakra-ui/react'
import AppClipBoard from '../app-clipboard'

type Props = {
  value?: string | number
  /**
   * What lands on the clipboard, when that is not what is on screen.
   *
   * A phone number is the reason this exists: the cell shows `698 765 294`
   * because grouped digits are readable, but the spaces are display-only — the
   * API never takes them, and neither does a dialler. So the reader sees the
   * grouped form and pastes the raw one.
   */
  copyValue?: string
}

function TableText({ value, copyValue }: Props) {
  if (!value) return null

  return (
    <Group>
      <Text>{value}</Text>
      <AppClipBoard
        size="xs"
        rounded="full"
        variant="ghost"
        colorPalette="gray"
        value={copyValue ?? value.toString()}
      />
    </Group>
  )
}

export default TableText
