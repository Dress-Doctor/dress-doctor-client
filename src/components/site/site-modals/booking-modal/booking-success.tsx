import {
  Box,
  Button,
  Center,
  Dialog,
  HStack,
  Icon,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import type { IconType } from 'react-icons/lib'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import { sitePaths } from '#/data/site.data'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import { formatHeldPickup } from '#/libs/booking'
import { whatsappUrl } from '#/libs/whatsapp'
import { m } from '#/paraglide/messages'
import { describeBooking } from './describe-booking'
import SuccessHero from '../success-hero'
import { modalPadX } from '../modal-header'

const card = {
  p: 4.5,
  rounded: '16px',
  bg: 'site.sunken',
} as const

const cardTitle = {
  mb: 3,
  fontSize: '13px',
  fontWeight: 'bold',
  color: 'site.ink',
} as const

function Detail({
  icon,
  label,
  value,
}: {
  icon: IconType
  label: string
  value: string
}) {
  return (
    <HStack gap={2.5} align="flex-start">
      <Center
        flex="none"
        boxSize="30px"
        rounded="8px"
        bg="white"
        color="turquoise-blue.700"
      >
        <Icon aria-hidden boxSize="14px" as={icon} />
      </Center>
      <Box minW={0}>
        <Text fontSize="11.5px" color="site.ink-subtle">
          {label}
        </Text>
        <Text
          fontSize="13.5px"
          fontWeight="semibold"
          color="site.ink"
          overflowWrap="anywhere"
        >
          {value}
        </Text>
      </Box>
    </HStack>
  )
}

/** The status of a pickup already in hand, in words a customer uses. */
function statusText(status: string) {
  switch (status) {
    case 'PENDING':
      return m.booking_success_statusPending()
    case 'CONFIRMED':
      return m.booking_success_statusConfirmed()
    case 'ASSIGNED':
      return m.booking_success_statusAssigned()
    default:
      return status
  }
}

/**
 * Tells a visitor what signing up did: a new account, or a login to the one
 * they had. A customer who was signed in already needs neither, so there is no
 * card for them.
 */
function AccountCard({
  outcome,
}: {
  outcome: NonNullable<BookingFlow['placed']>['outcome']
}) {
  if (!outcome) return null
  const created = outcome === 'CREATED'

  return (
    <HStack {...card} mt={3.5} gap={3.5} align="flex-start" flexWrap="wrap">
      <Center
        flex="none"
        boxSize="38px"
        rounded="10px"
        bg="white"
        color="turquoise-blue.700"
      >
        <Icon aria-hidden boxSize="17px" as={icons.user} />
      </Center>

      <Box flex="1" minW="220px">
        <Text {...cardTitle} mb={1}>
          {created
            ? m.booking_success_accountTitle()
            : m.booking_success_loggedInTitle()}
        </Text>
        <Text fontSize="13.5px" lineHeight="1.55" color="site.ink-muted">
          {created
            ? m.booking_success_accountBody()
            : m.booking_success_loggedInBody()}
        </Text>
      </Box>

      <SiteButton asChild px={5} py="10px" fontSize="14px">
        <Link to={sitePaths.account}>
          {m.booking_success_accountAction()}
          <Icon aria-hidden boxSize={3.5} as={icons.forward} />
        </Link>
      </SiteButton>
    </HStack>
  )
}

/**
 * Shown once the request has gone. It is honest about what has happened: we
 * have the request, and we will confirm it — nothing here says it is booked
 * until a person has said so. The WhatsApp button carries the details the API
 * has no place for, the service and the notes.
 *
 * A customer who already had a pickup open is shown that one instead, with the
 * reference they already have: asking twice does not make two.
 */
function BookingSuccess({
  flow,
  onClose,
}: {
  flow: BookingFlow
  onClose: () => void
}) {
  const { draft, reference, placed } = flow
  const summary = describeBooking(flow)
  const dash = '—'
  const existing = placed?.existing ?? null

  // What the visitor typed this time is not what is on the pickup already in
  // hand, so the message and the card name only what that pickup holds.
  const when = existing
    ? formatHeldPickup(existing.pickupDate, existing.pickupTime)
    : summary.pickup

  const notes = existing ? '' : draft.notes.trim()
  const message =
    m.booking_whatsapp_message({
      reference,
      service: existing ? dash : (summary.service ?? dash),
      when: when ?? dash,
      area: existing ? dash : (summary.address ?? dash),
      name: summary.contact ?? dash,
    }) + (notes ? m.booking_whatsapp_notes({ notes }) : '')

  const steps = [
    m.booking_success_next1(),
    m.booking_success_next2(),
    m.booking_success_next3(),
  ]

  return (
    <>
      <SuccessHero
        title={
          existing
            ? m.booking_success_existingTitle()
            : m.booking_success_title()
        }
        body={
          existing ? m.booking_success_existingBody() : m.booking_success_body()
        }
      >
        {reference && (
          <HStack
            display="inline-flex"
            mt={3.5}
            gap={2}
            px={3.5}
            py={2}
            rounded="full"
            fontSize="12px"
            bg="white"
            borderWidth="1px"
            borderColor="rgba(0, 23, 31, 0.1)"
            boxShadow="0 1px 2px rgba(0, 23, 31, 0.04)"
          >
            <Text as="span" color="site.ink-muted">
              {m.booking_success_ref()}
            </Text>
            <Text
              as="span"
              fontFamily="label"
              fontWeight="bold"
              letterSpacing="0.04em"
              color="site.ink"
            >
              {reference}
            </Text>
          </HStack>
        )}
      </SuccessHero>

      <Dialog.Body
        flex="1"
        minH={0}
        overflowY="auto"
        overscrollBehavior="contain"
        px={modalPadX}
        py={5}
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3.5}>
          <Stack {...card} gap={0}>
            <Text {...cardTitle}>{m.booking_success_yourPickup()}</Text>
            <Stack gap={3}>
              {existing ? (
                <>
                  <Detail
                    icon={icons.calendar}
                    label={m.booking_summary_pickup()}
                    value={when ?? dash}
                  />
                  <Detail
                    icon={icons.check}
                    label={m.booking_success_existingStatus()}
                    value={statusText(existing.status)}
                  />
                </>
              ) : (
                <>
                  <Detail
                    icon={icons.garment}
                    label={m.booking_summary_service()}
                    value={summary.service ?? dash}
                  />
                  <Detail
                    icon={icons.calendar}
                    label={m.booking_summary_pickup()}
                    value={summary.pickup ?? dash}
                  />
                  <Detail
                    icon={icons.location}
                    label={m.booking_summary_address()}
                    value={summary.address ?? dash}
                  />
                </>
              )}
            </Stack>
          </Stack>

          <Stack {...card} gap={0}>
            <Text {...cardTitle}>{m.booking_success_nextTitle()}</Text>
            <Stack as="ol" gap={3} listStyleType="none">
              {steps.map((step, index) => (
                <HStack as="li" key={step} gap={2.5} align="flex-start">
                  <Center
                    flex="none"
                    boxSize={6}
                    rounded="full"
                    fontFamily="label"
                    fontSize="12px"
                    fontWeight="bold"
                    color={index === 0 ? 'white' : 'site.ink-muted'}
                    bg={index === 0 ? 'turquoise-blue.500' : 'white'}
                    borderWidth={index === 0 ? 0 : '1.5px'}
                    borderColor="rgba(0, 23, 31, 0.12)"
                  >
                    {index + 1}
                  </Center>
                  <Text
                    mt={0.5}
                    fontSize="13.5px"
                    fontWeight="medium"
                    color="site.ink"
                  >
                    {step}
                  </Text>
                </HStack>
              ))}
            </Stack>
          </Stack>
        </SimpleGrid>

        <AccountCard outcome={placed?.outcome ?? null} />
      </Dialog.Body>

      <Dialog.Footer
        flex="none"
        gap={3}
        rowGap={3}
        flexWrap="wrap"
        justifyContent="space-between"
        px={modalPadX}
        pt={3.5}
        pb={{ base: 5, md: 6 }}
        borderTopWidth="1px"
        borderColor="rgba(0, 23, 31, 0.06)"
      >
        <HStack
          gap={1.5}
          fontSize="13px"
          fontWeight="semibold"
          color="turquoise-blue.700"
        >
          <Icon aria-hidden boxSize={3.5} as={icons.secure} />
          {m.booking_success_free()}
        </HStack>

        <HStack gap={2.5}>
          <Button
            variant="outline"
            h="auto"
            px={5}
            py="11px"
            rounded="full"
            fontSize="14px"
            fontWeight="semibold"
            color="site.ink"
            borderWidth="1.5px"
            borderColor="rgba(0, 23, 31, 0.13)"
            _hover={{ bg: 'rgba(0, 23, 31, 0.04)' }}
            onClick={onClose}
          >
            {m.booking_success_close()}
          </Button>

          <SiteButton
            asChild
            px={5}
            py="11px"
            fontSize="14px"
            boxShadow="0 10px 24px rgba(46, 207, 220, 0.35)"
          >
            <ChakraLink
              target="_blank"
              rel="noopener"
              href={whatsappUrl(message)}
            >
              <Icon aria-hidden boxSize={4} as={icons.whatsappBrand} />
              {m.booking_success_whatsapp()}
            </ChakraLink>
          </SiteButton>
        </HStack>
      </Dialog.Footer>
    </>
  )
}

export default BookingSuccess
