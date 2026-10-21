import { Center, Icon, RadioCard, Stack, Text } from '@chakra-ui/react'
import { bookingServiceIcons, bookingServices } from '#/data/booking.data'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import type { BookingServiceIdDto } from '#/interfaces/booking.dto'
import { m } from '#/paraglide/messages'
import ChoiceItem, { ChoiceCheck } from '../choice-item'
import FieldMessage from '../field-message'

/** Step 1: what we are collecting. */
function ServiceStep({ flow }: { flow: BookingFlow }) {
  const { draft, errors, update } = flow

  return (
    <Stack gap={2.5}>
      <RadioCard.Root
        display="flex"
        flexDirection="column"
        gap="10px"
        name="service"
        value={draft.service}
        aria-label={m.booking_a11y_serviceGroup()}
        onValueChange={(event) => {
          if (event.value)
            update({ service: event.value as BookingServiceIdDto })
        }}
      >
        {bookingServices.map((option) => {
          const selected = draft.service === option.id

          return (
            <ChoiceItem
              key={option.id}
              value={option.id}
              selected={selected}
              gap={3.5}
              px="18px"
              py="15px"
            >
              <Center
                flex="none"
                boxSize="44px"
                rounded="12px"
                color={selected ? 'white' : 'site.ink'}
                bg={selected ? 'turquoise-blue.500' : 'site.sunken'}
                transitionProperty="background, color"
                transitionDuration="moderate"
              >
                <Icon
                  aria-hidden
                  boxSize={5}
                  as={bookingServiceIcons[option.id]}
                />
              </Center>

              <Stack flex="1" gap={0.5} minW={0} textAlign="start">
                <Text fontSize="16px" fontWeight="bold" color="site.ink">
                  {option.name()}
                </Text>
                <Text fontSize="13px" lineHeight="1.4" color="site.ink-muted">
                  {option.description()}
                </Text>
                {/* Under the words on a phone, where a third column is too tight. */}
                <Text
                  display={{ md: 'none' }}
                  mt={0.5}
                  fontSize="13.5px"
                  fontWeight="bold"
                  color="turquoise-blue.700"
                >
                  {option.price()}
                </Text>
              </Stack>

              <Text
                display={{ base: 'none', md: 'block' }}
                fontSize="14px"
                fontWeight="bold"
                whiteSpace="nowrap"
                color="turquoise-blue.700"
              >
                {option.price()}
              </Text>

              <ChoiceCheck selected={selected} />
            </ChoiceItem>
          )
        })}
      </RadioCard.Root>

      <FieldMessage>
        {errors.service ? m.booking_error_service() : undefined}
      </FieldMessage>
    </Stack>
  )
}

export default ServiceStep
