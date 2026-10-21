import { SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { TextProps } from '@chakra-ui/react'
import Reveal from '#/components/site/reveal'
import SiteContainer from '#/components/site/site-container'
import { homeStats } from '#/data/home.data'
import { useCountUp } from '#/hooks/use-count-up'
import type { HomeStatDto } from '#/interfaces/site.dto'

const figureStyles: TextProps = {
  fontFamily: 'display',
  fontVariantNumeric: 'tabular-nums',
  fontSize: { base: '30px', md: '38px' },
  fontWeight: 'extrabold',
  letterSpacing: '-0.02em',
  lineHeight: '1.1',
  color: 'site.ink',
}

/** A single number that counts up the first time it is seen. */
function CountUpFigure({
  value,
  decimals,
  suffix,
}: {
  value: number
  decimals?: number
  suffix?: string
}) {
  const { ref, text } = useCountUp<HTMLParagraphElement>(value, { decimals })

  return (
    <Text ref={ref} {...figureStyles}>
      {text}
      {suffix}
    </Text>
  )
}

function Stat({ stat, first }: { stat: HomeStatDto; first: boolean }) {
  return (
    <Stack
      gap={1}
      textAlign="center"
      borderLeftWidth={{ base: 0, lg: first ? 0 : '1px' }}
      borderColor="rgba(0, 23, 31, 0.07)"
    >
      {'text' in stat ? (
        <Text {...figureStyles}>{stat.text}</Text>
      ) : (
        <CountUpFigure
          value={stat.value}
          decimals={stat.decimals}
          suffix={stat.suffix}
        />
      )}
      <Text fontSize="sm" color="site.ink-muted">
        {stat.label()}
      </Text>
    </Stack>
  )
}

/** The four-figure proof card that straddles the fold under the hero. */
function StatsSection() {
  return (
    <SiteContainer as="section">
      <Reveal
        px={7}
        py="34px"
        rounded="24px"
        bg="rgba(255, 255, 255, 0.7)"
        backdropFilter="blur(12px)"
        borderWidth="1px"
        borderColor="rgba(0, 23, 31, 0.06)"
        boxShadow="0 1px 2px rgba(0, 23, 31, 0.03), 0 20px 48px rgba(0, 23, 31, 0.06)"
      >
        <SimpleGrid columns={{ base: 2, lg: 4 }} gap={6} rowGap={8}>
          {homeStats.map((stat, index) => (
            <Stat key={stat.id} stat={stat} first={index === 0} />
          ))}
        </SimpleGrid>
      </Reveal>
    </SiteContainer>
  )
}

export default StatsSection
