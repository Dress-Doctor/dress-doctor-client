import { statusColorData } from '#/data/common.data'
import type { AppStatusTypeDto } from '#/interfaces/common.dto'
import { m } from '@/paraglide/messages'
import { Badge, Status } from '@chakra-ui/react'

export const STATUS_LABEL: Record<AppStatusTypeDto, () => string> = {
  DRAFT: m.common_status_draft,
  CONFIRMED: m.common_status_confirmed,
  RECEIVED: m.common_status_received,
  WASHING: m.common_status_washing,
  READY: m.common_status_ready,
  DELIVERED: m.common_status_delivered,
  CANCELLED: m.common_status_cancelled,
  PENDING: m.common_status_pending,
  ASSIGNED: m.common_status_assigned,
  PICKED_UP: m.common_status_pickedUp,
  UNPAID: m.common_status_unpaid,
  PAID: m.common_status_paid,
  PARTIAL: m.common_status_partial,
  OVERPAID: m.common_status_overpaid,
  ACTIVE: m.common_status_active,
  INACTIVE: m.common_status_inactive,
}

const TableStatus = ({ status }: { status: AppStatusTypeDto }) => {
  // Indexing, not `.get()` — the record is exhaustive, so there is no miss to
  // guard against and no fallback that could quietly hide a new status.
  const colorPalette = statusColorData[status]
  const label = STATUS_LABEL[status]()

  return (
    <Badge px={2} rounded="full" variant="surface" colorPalette={colorPalette}>
      <Status.Root colorPalette={colorPalette}>
        <Status.Indicator />
      </Status.Root>
      {label}
    </Badge>
  )
}

export default TableStatus
