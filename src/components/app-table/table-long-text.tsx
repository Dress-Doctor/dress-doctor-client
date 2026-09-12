import { Text } from '@chakra-ui/react'

/**
 * An address and a customer's note are free text of any length. Truncated to a
 * sane measure with the whole value on the title, so one long entry cannot
 * stretch the row past the viewport.
 */
function TableLongText({ value }: { value?: string }) {
  if (!value) return '—'
  return (
    <Text truncate maxW="32ch" title={value}>
      {value}
    </Text>
  )
}

export default TableLongText
