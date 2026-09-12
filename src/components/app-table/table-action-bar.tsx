import { ActionBar, Button } from '@chakra-ui/react'
import type { TableActionBarProps } from './interfaces'
import { LuTrash2 } from 'react-icons/lu'

type ParamType = {
  limit?: number
  dateTo?: string
  dateFrom?: string
  pageNumber?: number
}

export default function TableActionBar<T extends ParamType>({
  blackList = ['limit', 'pageNumber', 'dateTo', 'dateFrom'],
  params,
  onResetFilter,
}: TableActionBarProps<T>) {
  const countParams = Object.entries(params).filter(
    ([key]) => !blackList.includes(key),
  ).length

  const handleClick = () => {
    const clearedParams = Object.entries(params).reduce((acc, [key, value]) => {
      acc[key as keyof T] = (
        blackList.includes(key) ? value : undefined
      ) as T[keyof T]
      return acc
    }, {} as T)

    onResetFilter(clearedParams)
  }

  return (
    <ActionBar.Root open={!!countParams}>
      <ActionBar.Positioner>
        <ActionBar.Content>
          <ActionBar.SelectionTrigger>
            {`${countParams} filter${countParams >= 2 ? 's' : ''} applied`}
          </ActionBar.SelectionTrigger>
          <ActionBar.Separator />
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={handleClick}
          >
            <LuTrash2 />
            Clear All Filter
          </Button>
        </ActionBar.Content>
      </ActionBar.Positioner>
    </ActionBar.Root>
  )
}
