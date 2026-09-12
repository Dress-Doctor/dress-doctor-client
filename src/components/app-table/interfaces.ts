import type {
  BoxProps,
  PaginationRootProps,
  StackProps,
  TextProps,
} from '@chakra-ui/react'
import type { IconType } from 'react-icons'

export type ColumnProps<T> = {
  header: React.ReactNode
  cell?: (row: T) => React.ReactNode
  align?: 'start' | 'center' | 'end'
  /**
   * Drop the column below this breakpoint, header and cells together. A wide
   * table on a phone is a table nobody scrolls to the end of, so the columns
   * that answer "which pickup is this" stay and the rest come back as the
   * viewport earns them.
   */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
  accessor:
    keyof T | ((row: T, index: number) => React.ReactNode | string | number)
}

export type AppTableProps<T> = BoxProps & {
  data: T[]
  loading?: boolean
  emptyMessage?: string
  columns: ColumnProps<T>[]
  navigateTo?: (item: T) => void
  rowKey: (row: T) => string | number
}

export type TableHeaderProps = StackProps & {
  name: string
  Icon: IconType
}

export type TableNumberProps = {
  style?: TextProps
  currency?: string
  showCopy?: boolean
  amount: number | string | null | undefined
  /**
   * Number style. Defaults to `"currency"` when `currency` is set, else
   * `"decimal"`. `"percent"` expects a ratio (0.06 → 6%).
   */
  format?: 'currency' | 'percent' | 'decimal'
}

export type TablePaginationProps = PaginationRootProps & {
  setLimit: (limit: number) => void
}

export type TableActionBarProps<T> = {
  params: T
  blackList?: string[]
  onResetFilter: (newParams: T) => void
}
