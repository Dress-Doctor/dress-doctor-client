import { Box, Heading, HStack, Stack } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useId } from 'react'

interface DashboardCardProps extends Omit<BoxProps, 'title'> {
  /** The card's heading. Leave it out for a card that is only a container. */
  title?: ReactNode
  /** Which level the heading is, so it sits right under the page's own. */
  level?: 'h2' | 'h3'
  /** Something at the right of the heading, such as a status. */
  aside?: ReactNode
  children: ReactNode
}

/**
 * The white rounded panel every part of the account sits in. The look is the
 * one the account page has always had; it lives here so the five pages share
 * it instead of copying it.
 *
 * With a `title` it is a labelled region, so a screen reader can list the
 * cards on a page by name.
 */
function DashboardCard({
  title,
  level = 'h2',
  aside,
  children,
  ...rest
}: DashboardCardProps) {
  const headingId = useId()

  return (
    <Box
      as="section"
      aria-labelledby={title ? headingId : undefined}
      p={{ base: 5, md: 8 }}
      bg="white"
      rounded={{ base: '24px', md: '32px' }}
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
      boxShadow="0 24px 60px rgba(0, 23, 31, 0.08)"
      {...rest}
    >
      <Stack gap={{ base: 4, md: 5 }}>
        {title && (
          <HStack justify="space-between" align="center" gap={3} wrap="wrap">
            <Heading
              as={level}
              id={headingId}
              fontSize="xl"
              fontWeight="semibold"
              letterSpacing="-0.01em"
              textWrap="balance"
              color="site.ink"
            >
              {title}
            </Heading>
            {aside}
          </HStack>
        )}
        {children}
      </Stack>
    </Box>
  )
}

export default DashboardCard
