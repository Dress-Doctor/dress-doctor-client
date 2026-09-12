import { HStack } from '@chakra-ui/react'
import type { TableHeaderProps } from './interfaces'

const TableHeader = (props: TableHeaderProps) => {
  const { name, Icon, ...rest } = props
  return (
    <HStack whiteSpace="nowrap" {...rest}>
      {name} <Icon />
    </HStack>
  )
}

export default TableHeader
