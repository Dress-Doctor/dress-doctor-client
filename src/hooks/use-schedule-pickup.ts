import { useMutation } from '@tanstack/react-query'
import type {
  PickupScheduledDto,
  SchedulePickupDataDto,
} from '#/interfaces/booking.dto'
import APIClient, { withChangeReason } from '#/libs/api-client'

const pickups = new APIClient<PickupScheduledDto, SchedulePickupDataDto>(
  '/v1/pickups',
)

/**
 * Sends a pickup request from the website. The endpoint is public — no
 * sign-in — and the API still wants a reason on every change, which is why
 * the header is set here and not left to each caller.
 */
export function useSchedulePickup() {
  return useMutation({
    mutationFn: (data: SchedulePickupDataDto) =>
      pickups.post(
        data,
        withChangeReason('Pickup requested on the Dress Doctor website'),
      ),
  })
}
