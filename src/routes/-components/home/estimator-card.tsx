import {
  Box,
  Flex,
  Icon,
  RadioCard,
  SegmentGroup,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import {
  KG_DEFAULT,
  KG_MAX,
  homeKgServices,
  homePieceDefaults,
  homePieces,
} from '#/data/home.data'
import { useSiteModals } from '#/hooks/use-site-modals'
import type { EstimateModeDto, KgServiceIdDto } from '#/interfaces/site.dto'
import utils from '#/libs/utils'
import { m } from '#/paraglide/messages'
import QuantityStepper from './quantity-stepper'

interface EstimatorCardProps {
  mode: EstimateModeDto
  onModeChange: (mode: EstimateModeDto) => void
}

/**
 * The estimator itself: a white card floating on the navy panel.
 *
 * Which of the two ways of pricing is on screen lives in the URL, so the panel
 * a visitor was shown is the one they come back to; the quantities stay local,
 * because the figure is an estimate the rider confirms at the door and there
 * is nothing to restore.
 */
function EstimatorCard({ mode, onModeChange }: EstimatorCardProps) {
  const { openBooking } = useSiteModals()
  const [kgServiceId, setKgServiceId] = useState<KgServiceIdDto>('washFold')
  const [kg, setKg] = useState(KG_DEFAULT)
  const [counts, setCounts] = useState<Record<string, number>>(() => ({
    ...homePieceDefaults,
  }))

  const kgService =
    homeKgServices.find((service) => service.id === kgServiceId) ??
    homeKgServices[0]

  const total =
    mode === 'kg'
      ? Math.max(kg, kgService.min) * kgService.rate
      : homePieces.reduce(
          (sum, piece) => sum + (counts[piece.id] ?? 0) * piece.price,
          0,
        )

  // A smaller minimum never lowers the load; a larger one lifts it to fit.
  const selectKgService = (id: KgServiceIdDto) => {
    const next = homeKgServices.find((service) => service.id === id)
    if (!next) return
    setKgServiceId(id)
    setKg((value) => Math.max(value, next.min))
  }

  const setCount = (id: string, next: number) =>
    setCounts((current) => ({ ...current, [id]: Math.max(next, 0) }))

  return (
    <Box
      p="30px"
      rounded="24px"
      bg="rgba(255, 255, 255, 0.96)"
      backdropFilter="blur(20px)"
      boxShadow="0 40px 80px rgba(0, 23, 31, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
    >
      <SegmentGroup.Root
        w="full"
        p={1}
        rounded="full"
        bg="rgba(0, 23, 31, 0.05)"
        value={mode}
        aria-label={m.home_estimator_a11y_mode()}
        onValueChange={(event) => onModeChange(event.value as EstimateModeDto)}
      >
        <SegmentGroup.Indicator
          rounded="full"
          bg="dark-bluish-gray.500"
          boxShadow="0 4px 12px rgba(32, 41, 56, 0.25)"
        />

        {(
          [
            ['kg', m.home_estimator_modeKg()],
            ['piece', m.home_estimator_modePiece()],
          ] as const
        ).map(([value, label]) => (
          <SegmentGroup.Item
            key={value}
            value={value}
            flex="1"
            py={2.5}
            rounded="full"
            cursor="pointer"
            justifyContent="center"
            fontSize="14.5px"
            fontWeight="semibold"
            color={mode === value ? 'white' : 'site.ink-muted'}
            _checked={{ color: 'white' }}
          >
            <SegmentGroup.ItemText>{label}</SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        ))}
      </SegmentGroup.Root>

      {mode === 'kg' ? (
        <>
          <RadioCard.Root
            mt={5}
            value={kgServiceId}
            aria-label={m.home_estimator_a11y_kgService()}
            onValueChange={(event) =>
              event.value && selectKgService(event.value as KgServiceIdDto)
            }
          >
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2.5}>
              {homeKgServices.map((service) => (
                <RadioCard.Item
                  key={service.id}
                  value={service.id}
                  cursor="pointer"
                  rounded="16px"
                  bg="white"
                  borderWidth="1.5px"
                  borderColor="rgba(0, 23, 31, 0.1)"
                  transitionProperty="border-color, background, box-shadow"
                  transitionDuration="moderate"
                  _hover={{ borderColor: 'rgba(0, 23, 31, 0.25)' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'turquoise-blue.700',
                    outlineOffset: '2px',
                  }}
                  _checked={{
                    bg: 'rgba(46, 207, 220, 0.08)',
                    borderColor: '#24B9C6',
                    boxShadow: '0 4px 14px rgba(46, 207, 220, 0.2)',
                  }}
                >
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl
                    p={3.5}
                    gap={2}
                    alignItems="flex-start"
                  >
                    <RadioCard.ItemContent gap={1}>
                      <RadioCard.ItemText
                        fontSize="14.5px"
                        fontWeight="semibold"
                        lineHeight="1.3"
                        color="site.ink"
                      >
                        {service.name()}
                      </RadioCard.ItemText>
                      <RadioCard.ItemDescription
                        fontFamily="display"
                        fontSize="13px"
                        fontVariantNumeric="tabular-nums"
                        whiteSpace="nowrap"
                        fontWeight="semibold"
                        color="site.ink"
                      >
                        {m.home_estimator_kgRate({
                          price: utils.toXaf(service.rate),
                        })}
                      </RadioCard.ItemDescription>
                      <RadioCard.ItemDescription
                        fontSize="12.5px"
                        color="site.ink-muted"
                      >
                        {m.home_estimator_kgMin({ count: service.min })}
                      </RadioCard.ItemDescription>
                    </RadioCard.ItemContent>
                    <RadioCard.ItemIndicator
                      boxSize={4}
                      borderColor="rgba(0, 23, 31, 0.25)"
                      _checked={{ bg: '#24B9C6', borderColor: '#24B9C6' }}
                    />
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              ))}
            </SimpleGrid>
          </RadioCard.Root>

          <Flex
            mt="22px"
            gap={4}
            rowGap={5}
            wrap="wrap"
            align="center"
            justify="space-between"
          >
            <Stack gap={0.5}>
              <Text fontSize="15.5px" fontWeight="semibold" color="site.ink">
                {m.home_estimator_kgQuestion()}
              </Text>
              <Text fontSize="13px" color="site.ink-muted">
                {m.home_estimator_kgHint()}
              </Text>
            </Stack>

            <QuantityStepper
              value={m.home_estimator_kgUnit({ count: kg })}
              canDecrease={kg > kgService.min}
              canIncrease={kg < KG_MAX}
              decreaseLabel={m.home_estimator_a11y_decreaseKg()}
              increaseLabel={m.home_estimator_a11y_increaseKg()}
              onDecrease={() =>
                setKg((value) => Math.max(value - 1, kgService.min))
              }
              onIncrease={() => setKg((value) => Math.min(value + 1, KG_MAX))}
            />
          </Flex>
        </>
      ) : (
        <Stack gap={0} mt={4}>
          {homePieces.map((piece) => {
            const label = piece.label()
            const quantity = counts[piece.id] ?? 0
            const price = utils.toXaf(piece.price)

            return (
              <Flex
                key={piece.id}
                gap={4}
                py={2.5}
                align="center"
                justify="space-between"
                borderBottomWidth="1px"
                borderColor="rgba(0, 23, 31, 0.06)"
              >
                <Stack gap={0}>
                  <Text fontSize="15px" fontWeight="medium" color="site.ink">
                    {label}
                  </Text>
                  <Text
                    fontFamily="display"
                    fontSize="12.5px"
                    fontWeight="semibold"
                    color="site.ink-muted"
                  >
                    {piece.unit === 'set'
                      ? m.home_piece_perSet({ price })
                      : m.home_piece_each({ price })}
                  </Text>
                </Stack>

                <QuantityStepper
                  size="sm"
                  value={String(quantity)}
                  canDecrease={quantity > 0}
                  decreaseLabel={m.home_estimator_a11y_decrease({
                    item: label,
                  })}
                  increaseLabel={m.home_estimator_a11y_increase({
                    item: label,
                  })}
                  onDecrease={() => setCount(piece.id, quantity - 1)}
                  onIncrease={() => setCount(piece.id, quantity + 1)}
                />
              </Flex>
            )
          })}
        </Stack>
      )}

      <Flex mt={6} gap={4} align="flex-end" justify="space-between">
        <Stack gap={0}>
          <Text fontSize="13.5px" color="site.ink-muted">
            {m.home_estimator_total()}
          </Text>
          <Text
            aria-live="polite"
            whiteSpace="nowrap"
            fontFamily="display"
            fontVariantNumeric="tabular-nums"
            fontSize={{ base: '32px', md: '38px' }}
            fontWeight="extrabold"
            lineHeight="1.1"
            letterSpacing="-0.01em"
            color="amber-orange.500"
          >
            {utils.toXaf(total)}
          </Text>
        </Stack>

        <Text
          maxW="14ch"
          fontSize="12.5px"
          textAlign="right"
          color="site.ink-muted"
        >
          {m.home_estimator_freeDelivery()}
        </Text>
      </Flex>

      <SiteButton
        w="full"
        mt={5}
        px={4}
        py={4}
        fontSize="md"
        aria-haspopup="dialog"
        onClick={() =>
          openBooking({ service: mode === 'kg' ? kgServiceId : 'perpiece' })
        }
      >
        {m.home_estimator_cta()}
        <Icon aria-hidden boxSize={3.5} as={icons.forward} />
      </SiteButton>
    </Box>
  )
}

export default EstimatorCard
