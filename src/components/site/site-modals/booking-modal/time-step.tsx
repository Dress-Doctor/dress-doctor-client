import { Center, Icon, RadioCard, Stack, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import { pickupWindows } from '#/data/booking.data'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import type { PickupWindowIdDto } from '#/interfaces/booking.dto'
import { dayLabels, isDayOpen, isWindowOpen } from '#/libs/booking'
import { m } from '#/paraglide/messages'
import ChoiceItem from '../choice-item'
import FieldMessage from '../field-message'

const groupLabel = {
  fontSize: '13px',
  fontWeight: 'semibold',
  color: 'site.ink',
} as const

/** Step 2: which day, and which part of the day. */
function TimeStep({ flow }: { flow: BookingFlow }) {
  const { draft, errors, days, now, update } = flow
  const chosenDay = days.find((day) => day.key === draft.date)

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text {...groupLabel}>{m.booking_date_label()}</Text>

        <RadioCard.Root
          display="grid"
          gap={2}
          gridTemplateColumns={{
            base: 'repeat(4, 1fr)',
            sm: 'repeat(7, 1fr)',
          }}
          name="date"
          value={draft.date}
          aria-label={m.booking_a11y_dayGroup()}
          onValueChange={(event) => {
            if (event.value) update({ date: event.value })
          }}
        >
          {days.map((day) => {
            const selected = draft.date === day.key
            const labels = dayLabels(day.date)

            return (
              <ChoiceItem
                key={day.key}
                value={day.key}
                selected={selected}
                disabled={!isDayOpen(day)}
                title={day.isSunday ? m.booking_date_closedSunday() : undefined}
                flexDirection="column"
                gap="3px"
                px={1}
                py="12px"
                textAlign="center"
              >
                <Text
                  fontSize="10.5px"
                  fontWeight="semibold"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                  color={selected ? 'turquoise-blue.700' : 'site.ink-muted'}
                >
                  {day.isToday ? m.booking_date_today() : labels.weekday}
                </Text>
                <Text
                  fontFamily="display"
                  fontSize="20px"
                  fontWeight="bold"
                  lineHeight="1"
                  color="site.ink"
                >
                  {labels.dayOfMonth}
                </Text>
                <Text
                  fontSize="11px"
                  color={selected ? 'turquoise-blue.700' : 'site.ink-muted'}
                >
                  {labels.month}
                </Text>
              </ChoiceItem>
            )
          })}
        </RadioCard.Root>

        <FieldMessage>
          {errors.date ? m.booking_error_date() : undefined}
        </FieldMessage>
      </Stack>

      <Stack gap={2}>
        <Text {...groupLabel}>{m.booking_time_label()}</Text>

        <RadioCard.Root
          display="grid"
          gap="10px"
          gridTemplateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
          name="windowId"
          value={draft.windowId}
          aria-label={m.booking_a11y_timeGroup()}
          onValueChange={(event) => {
            if (event.value) {
              update({ windowId: event.value as PickupWindowIdDto })
            }
          }}
        >
          {pickupWindows.map((window) => {
            const selected = draft.windowId === window.id
            const open = isWindowOpen(window, chosenDay, now)

            return (
              <ChoiceItem
                key={window.id}
                value={window.id}
                selected={selected}
                disabled={!open}
                title={open ? undefined : m.booking_time_over()}
                gap={2.5}
                p="12px"
              >
                <Center
                  flex="none"
                  boxSize="34px"
                  rounded="10px"
                  color={selected ? 'white' : 'site.ink'}
                  bg={selected ? 'turquoise-blue.500' : 'site.sunken'}
                  transitionProperty="background, color"
                  transitionDuration="moderate"
                >
                  <Icon aria-hidden boxSize={4} as={icons.clock} />
                </Center>
                <Stack gap={0.5} textAlign="start">
                  <Text fontSize="15px" fontWeight="bold" color="site.ink">
                    {window.label()}
                  </Text>
                  <Text
                    fontSize="12.5px"
                    whiteSpace="nowrap"
                    color="site.ink-muted"
                  >
                    {window.hours()}
                  </Text>
                </Stack>
              </ChoiceItem>
            )
          })}
        </RadioCard.Root>

        <FieldMessage>
          {errors.windowId ? m.booking_error_time() : undefined}
        </FieldMessage>
      </Stack>
    </Stack>
  )
}

export default TimeStep
