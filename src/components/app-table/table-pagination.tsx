import { m } from '@/paraglide/messages'
import {
  ButtonGroup,
  HStack,
  IconButton,
  Pagination,
  Text,
} from '@chakra-ui/react'
import { Select } from 'antd'
import { useEffect, useId } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import type { TablePaginationProps } from './interfaces'

const options = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
]

const TablePagination = (props: TablePaginationProps) => {
  const { setLimit, ...rest } = props
  const { page, pageSize, count, onPageChange } = rest
  const pageSizeId = useId()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return

      const currentPage = page ?? 1
      const size = pageSize ?? 10
      const totalPages = count ? Math.ceil(count / size) : undefined
      const nextPage =
        event.key === 'ArrowRight' ? currentPage + 1 : currentPage - 1

      if (nextPage < 1) return
      if (totalPages && nextPage > totalPages) return

      event.preventDefault()
      onPageChange?.({ page: nextPage, pageSize: size })
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [page, pageSize, count, onPageChange])

  return (
    <HStack
      py={2}
      gap={3}
      wrap="wrap"
      borderTopWidth={1}
      justify="space-between"
      borderBottomWidth={1}
    >
      <HStack>
        <Text asChild>
          <label htmlFor={pageSizeId}>{m.common_pagination_showLabel()}</label>
        </Text>
        <Select
          size="small"
          labelInValue
          id={pageSizeId}
          options={options}
          aria-label={m.common_a11y_pageSize()}
          style={{ width: 80, borderRadius: 4 }}
          onChange={({ value }) => setLimit(Number(value))}
          value={options.find((o) => o.value === props.pageSize)}
        />
        <Text fontVariantNumeric="tabular-nums">
          {m.common_pagination_ofLabel()} {props.count}
        </Text>
      </HStack>

      <Pagination.Root
        {...rest}
        page={rest.page}
        onPageChange={(details) => {
          if (rest.onPageChange)
            rest.onPageChange({ ...details, page: details.page })
        }}
      >
        <ButtonGroup
          attached
          size="sm"
          variant="outline"
          aria-label={m.common_a11y_pagination()}
        >
          <Pagination.PrevTrigger asChild>
            <IconButton
              touchAction="manipulation"
              aria-label={m.common_a11y_prevPage()}
            >
              <HiChevronLeft aria-hidden="true" />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={({ value }) => (
              <IconButton
                zIndex={{ _selected: '1' }}
                touchAction="manipulation"
                fontVariantNumeric="tabular-nums"
                aria-label={m.common_a11y_gotoPage({ page: value })}
                variant={{ base: 'outline', _selected: 'solid' }}
              >
                {value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton
              touchAction="manipulation"
              aria-label={m.common_a11y_nextPage()}
            >
              <HiChevronRight aria-hidden="true" />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </HStack>
  )
}

export default TablePagination
