import { HStack, Text, FormatNumber } from '@chakra-ui/react'
import type { TableNumberProps } from './interfaces'
import AppClipBoard from '../app-clipboard'

const TableNumber = (props: TableNumberProps) => {
  const { amount, currency, showCopy, format, style: textProps } = props

  const isEmpty =
    amount === null ||
    amount === undefined ||
    (typeof amount === 'string' && amount.trim() === '')

  if (isEmpty) return <Text color="fg.muted">—</Text>

  const style = format ?? (currency ? 'currency' : undefined)
  const isCurrency = style === 'currency'

  return (
    <HStack gap={0}>
      <Text fontFamily="heading" {...textProps}>
        <FormatNumber
          notation="standard"
          compactDisplay="long"
          value={Number(amount)}
          maximumFractionDigits={6}
          style={style}
          currency={isCurrency ? currency : undefined}
        />
      </Text>
      {showCopy && (
        <AppClipBoard
          size="xs"
          rounded="full"
          variant="ghost"
          value={amount.toString()}
          colorPalette={textProps?.colorPalette ?? 'gray'}
        />
      )}
    </HStack>
  )
}

export default TableNumber
