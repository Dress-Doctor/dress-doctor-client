import { Heading, Stack, Text } from '@chakra-ui/react'
import type { StackProps } from '@chakra-ui/react'

interface SectionHeadingProps extends StackProps {
  /** Small uppercase label above the title. */
  eyebrow: string
  title: string
  lead?: string
  /** Heading level, so the page keeps one `h1` and a flat run of `h2`s. */
  as?: 'h1' | 'h2' | 'h3'
  /** Title size; the estimator and coverage panels run one step smaller. */
  size?: 'md' | 'lg'
  /** `light` sits on a navy panel and flips the palette. */
  tone?: 'dark' | 'light'
}

const titleSizes = {
  lg: { base: '4xl', md: '5xl' },
  md: { base: '3xl', md: '4xl' },
} as const

/**
 * Eyebrow, title and lead paragraph — the opening of every section on the
 * marketing pages, so the rhythm between the three never drifts.
 */
function SectionHeading({
  eyebrow,
  title,
  lead,
  as = 'h2',
  size = 'lg',
  tone = 'dark',
  ...props
}: SectionHeadingProps) {
  const onNavy = tone === 'light'

  return (
    <Stack gap={0} {...props}>
      <Text
        as="span"
        fontSize="xs"
        fontWeight="bold"
        letterSpacing="0.14em"
        textTransform="uppercase"
        color={onNavy ? 'turquoise-blue.500' : 'turquoise-blue.700'}
      >
        {eyebrow}
      </Text>

      <Heading
        as={as}
        mt={3.5}
        fontSize={titleSizes[size]}
        fontWeight="semibold"
        lineHeight="1.08"
        letterSpacing="-0.025em"
        textWrap="balance"
        color={onNavy ? 'white' : 'site.ink'}
      >
        {title}
      </Heading>

      {lead && (
        <Text
          mt={4}
          fontSize={{ base: 'md', md: 'lg' }}
          lineHeight="1.65"
          textWrap="pretty"
          color={onNavy ? 'whiteAlpha.700' : 'site.ink-muted'}
        >
          {lead}
        </Text>
      )}
    </Stack>
  )
}

export default SectionHeading
