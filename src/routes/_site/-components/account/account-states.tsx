import { Box, Center, Icon, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { IconType } from 'react-icons/lib'
import type { ReactNode } from 'react'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import { m } from '#/paraglide/messages'

interface AccountEmptyProps {
  /** Which level the title is. `h3` when the page already has its own `h2`. */
  level?: 'h2' | 'h3'
  icon: IconType
  title: string
  body: string
  /** The one thing to do about it, such as a button that books a pickup. */
  action?: ReactNode
}

/** What a list says when it has nothing in it yet. Never a blank space. */
export function AccountEmpty({
  level = 'h2',
  icon,
  title,
  body,
  action,
}: AccountEmptyProps) {
  return (
    <Stack align="center" gap={4} py={{ base: 6, md: 10 }} textAlign="center">
      <Center
        boxSize="56px"
        rounded="full"
        bg="turquoise-blue.50"
        color="turquoise-blue.700"
      >
        <Icon aria-hidden boxSize={6} as={icon} />
      </Center>
      <Stack gap={1.5} maxW="26rem">
        <Text
          as={level}
          fontSize="xl"
          fontWeight="semibold"
          textWrap="balance"
          color="site.ink"
        >
          {title}
        </Text>
        <Text lineHeight="1.6" textWrap="pretty" color="site.ink-muted">
          {body}
        </Text>
      </Stack>
      {action}
    </Stack>
  )
}

interface AccountErrorProps {
  /** Asks again. Left out, there is no button. */
  onRetry?: () => void
  retrying?: boolean
  title?: string
  body?: string
}

/**
 * What a page says when it could not load. It says so in words and offers to
 * try again; the app-wide "Request failed" toast is switched off for these
 * queries, so this is the only message.
 */
export function AccountError({
  onRetry,
  retrying,
  title = m.account_state_errorTitle(),
  body = m.account_state_errorBody(),
}: AccountErrorProps) {
  return (
    <Stack
      role="alert"
      align="center"
      gap={4}
      py={{ base: 6, md: 10 }}
      textAlign="center"
    >
      <Center
        boxSize="56px"
        rounded="full"
        bg="amber-orange.100"
        color="amber-orange.700"
      >
        <Icon aria-hidden boxSize={6} as={icons.alert} />
      </Center>
      <Stack gap={1.5} maxW="26rem">
        <Text
          as="h2"
          fontSize="xl"
          fontWeight="semibold"
          textWrap="balance"
          color="site.ink"
        >
          {title}
        </Text>
        <Text lineHeight="1.6" textWrap="pretty" color="site.ink-muted">
          {body}
        </Text>
      </Stack>
      {onRetry && (
        <SiteButton
          variant="glass"
          px={6}
          py="12px"
          fontSize="15px"
          loading={retrying}
          loadingText={m.account_state_loading()}
          onClick={onRetry}
        >
          <Icon aria-hidden boxSize={4} as={icons.retry} />
          {m.common_action_tryAgain()}
        </SiteButton>
      )}
    </Stack>
  )
}

/**
 * Grey blocks where cards will be. The page keeps its height while it loads,
 * so nothing jumps when the real cards arrive.
 */
export function AccountSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Stack gap={3} aria-busy="true" aria-live="polite">
      <Box srOnly>{m.account_state_loading()}</Box>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} h="104px" rounded="24px" />
      ))}
    </Stack>
  )
}
