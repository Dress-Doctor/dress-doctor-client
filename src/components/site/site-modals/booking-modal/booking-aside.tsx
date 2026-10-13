import { Box, Center, Flex, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import type { IconType } from 'react-icons/lib'
import icons from '#/config/icons'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import { m } from '#/paraglide/messages'
import { describeBooking } from './describe-booking'

interface SummaryRowProps {
  icon: IconType
  label: string
  value: string | null
  empty: string
  last?: boolean
}

/** One line of the summary: a small icon, what it is, and the answer so far. */
function SummaryRow({ icon, label, value, empty, last }: SummaryRowProps) {
  return (
    <HStack
      gap={3}
      py={3.5}
      align="flex-start"
      fontSize="14px"
      borderBottomWidth={last ? 0 : '1px'}
      borderColor="whiteAlpha.100"
    >
      <Center
        flex="none"
        boxSize={8}
        rounded="8px"
        bg="whiteAlpha.100"
        color="turquoise-blue.300"
      >
        <Icon aria-hidden boxSize="15px" as={icon} />
      </Center>
      <Box minW={0}>
        <Text fontSize="12px" color="whiteAlpha.600">
          {label}
        </Text>
        <Text
          mt={0.5}
          fontWeight={value ? 'medium' : 'normal'}
          fontStyle={value ? 'normal' : 'italic'}
          color={value ? 'white' : 'whiteAlpha.500'}
          overflowWrap="anywhere"
        >
          {value ?? empty}
        </Text>
      </Box>
    </HStack>
  )
}

/**
 * The navy panel beside the form on a wide screen: the answers so far, filling
 * in as the visitor goes, and the shop's promise. Hidden on a phone and a
 * tablet, where there is no room for it.
 */
function BookingAside({ flow }: { flow: BookingFlow }) {
  const summary = describeBooking(flow)

  return (
    <Flex
      as="aside"
      display={{ base: 'none', lg: 'flex' }}
      position="relative"
      direction="column"
      gap={4.5}
      overflow="hidden"
      p={8}
      color="white"
      bgImage="linear-gradient(160deg, #202938 0%, #141A24 100%)"
    >
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        pointerEvents="none"
        bgImage="radial-gradient(420px 240px at 100% 0%, rgba(46, 207, 220, 0.18), transparent 60%), radial-gradient(360px 240px at 0% 100%, rgba(255, 137, 74, 0.14), transparent 60%)"
      />

      <Stack position="relative" gap={0}>
        <Text
          fontFamily="label"
          fontSize="13px"
          fontWeight="bold"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="whiteAlpha.600"
        >
          {m.booking_summary_title()}
        </Text>

        <SummaryRow
          icon={icons.garment}
          label={m.booking_summary_service()}
          value={summary.service}
          empty={m.booking_summary_emptyService()}
        />
        <SummaryRow
          icon={icons.calendar}
          label={m.booking_summary_pickup()}
          value={summary.pickup}
          empty={m.booking_summary_emptyPickup()}
        />
        <SummaryRow
          icon={icons.location}
          label={m.booking_summary_address()}
          value={summary.address}
          empty={m.booking_summary_emptyAddress()}
        />
        <SummaryRow
          last
          icon={icons.user}
          label={m.booking_summary_contact()}
          value={summary.contact}
          empty={m.booking_summary_emptyContact()}
        />
      </Stack>

      <HStack
        position="relative"
        mt="auto"
        gap={2.5}
        p={4}
        align="flex-start"
        rounded="14px"
        fontSize="13px"
        lineHeight="1.55"
        color="whiteAlpha.800"
        bg="whiteAlpha.100"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
      >
        <Icon
          aria-hidden
          flex="none"
          boxSize={4}
          mt={0.5}
          as={icons.secure}
          color="turquoise-blue.300"
        />
        <Box>
          <Text as="strong" display="block" color="white">
            {m.booking_promise_title()}
          </Text>
          {m.booking_promise_body()}
        </Box>
      </HStack>
    </Flex>
  )
}

export default BookingAside
