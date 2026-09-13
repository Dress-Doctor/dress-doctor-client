import { Box, Flex, Icon, SegmentGroup, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import {
  KG_DEFAULT,
  KG_MAX,
  KG_MIN,
  KG_RATE,
  homePieceDefaults,
  homePieces,
} from '#/data/home.data'
import { sitePaths } from '#/data/site.data'
import type { EstimateModeDto } from '#/interfaces/site.dto'
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
  const [kg, setKg] = useState(KG_DEFAULT)
  const [counts, setCounts] = useState<Record<string, number>>(() => ({
    ...homePieceDefaults,
  }))

  const total =
    mode === 'kg'
      ? Math.max(kg, KG_MIN) * KG_RATE
      : homePieces.reduce(
          (sum, piece) => sum + (counts[piece.id] ?? 0) * piece.price,
          0,
        )

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
        <Flex
          mt="26px"
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
            canDecrease={kg > KG_MIN}
            canIncrease={kg < KG_MAX}
            decreaseLabel={m.home_estimator_a11y_decreaseKg()}
            increaseLabel={m.home_estimator_a11y_increaseKg()}
            onDecrease={() => setKg((value) => Math.max(value - 1, KG_MIN))}
            onIncrease={() => setKg((value) => Math.min(value + 1, KG_MAX))}
          />
        </Flex>
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

      <SiteButton asChild w="full" mt={5} px={4} py={4} fontSize="md">
        <Link
          to={sitePaths.booking}
          search={{ service: mode === 'kg' ? 'perkg' : 'perpiece' }}
        >
          {m.home_estimator_cta()}
          <Icon aria-hidden boxSize={3.5} as={icons.forward} />
        </Link>
      </SiteButton>
    </Box>
  )
}

export default EstimatorCard
