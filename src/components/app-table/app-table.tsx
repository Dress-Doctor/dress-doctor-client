import { m } from '@/paraglide/messages'
import { Box, Progress, SkeletonText, Table } from '@chakra-ui/react'
import { Empty } from 'antd'
import type { AppTableProps } from './interfaces'

type EventType = React.MouseEvent<HTMLTableRowElement, MouseEvent>
export default function AppTable<T>(props: AppTableProps<T>) {
  const {
    data,
    rowKey,
    columns,
    loading,
    emptyMessage,
    navigateTo,
    ...containerProps
  } = props

  /**
   * A click anywhere in the row opens it — unless it landed on a control the
   * cell put there for its own sake, such as a copy button.
   *
   * `closest`, not `target instanceof HTMLButtonElement`: a button renders its
   * icon inside itself, so clicking the icon makes the `<svg>` the target and
   * the button check misses. The reader hits Copy and the page navigates
   * instead. Links are matched too, for the same reason.
   */
  const handleClick = ({ target }: EventType, row: T) => {
    const control =
      target instanceof Element ? target.closest('button, a') : null
    if (control) return

    if (navigateTo && !loading) navigateTo(row)
  }

  return (
    <Box display="flex" flexDir="column" {...containerProps}>
      {loading && (
        <Progress.Root size="xs" w="100%" value={null} mb={1}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      )}
      <Table.ScrollArea flex="1" minH="0">
        <Table.Root size="sm" interactive stickyHeader>
          <Table.Header>
            <Table.Row bgColor="turquoise-blue.subtle">
              {columns.map((column, index) => (
                <Table.ColumnHeader
                  key={index}
                  fontWeight="bold"
                  borderBottomWidth={1}
                  hideBelow={column.hideBelow}
                  _first={{ borderTopLeftRadius: 'lg' }}
                  _last={{ borderTopRightRadius: 'lg' }}
                >
                  {column.header}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {data.map((row, index) => (
              <Table.Row
                key={rowKey(row)}
                role="group"
                className="group"
                bgColor="inherit"
                _last={{ '& td': { borderBottom: 'none' } }}
                cursor={navigateTo ? 'pointer' : 'default'}
                onClick={(event) => handleClick(event, row)}
                _hover={
                  navigateTo
                    ? {
                        bgColor: 'bg.subtle',
                        color: 'turquoise-blue.500 !important',
                      }
                    : {}
                }
              >
                {columns.map((col, idx) => (
                  <Table.Cell
                    key={idx}
                    // fontSize="xs"
                    borderBottomWidth={1}
                    hideBelow={col.hideBelow}
                    textAlign={
                      col.align === 'end'
                        ? 'end'
                        : col.align === 'center'
                          ? 'center'
                          : 'start'
                    }
                  >
                    {loading ? (
                      <SkeletonText noOfLines={1} />
                    ) : col.cell ? (
                      col.cell(row)
                    ) : typeof col.accessor === 'function' ? (
                      col.accessor(row, index)
                    ) : (
                      (row as never)[col.accessor]
                    )}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {!loading && data.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-[#667479] text-xl text-center">
                {emptyMessage ?? m.common_table_noData()}
              </span>
            }
          />
          // <RenderEmptyState {...emptyStateAction} />
        )}
      </Table.ScrollArea>
    </Box>
  )
}
