import { Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import { planStatusView } from '#/data/account.data'
import { useMySubscriptions } from '#/hooks/use-my-subscriptions'
import { useSiteModals } from '#/hooks/use-site-modals'
import { formatDate, planName, splitPlans } from '#/libs/account'
import { m } from '#/paraglide/messages'
import AccountNotice from './account-notice'
import { AccountEmpty, AccountError, AccountSkeleton } from './account-states'
import DashboardCard from './dashboard-card'
import PlanCard from './plan-card'
import StatusPill from './status-pill'

/** "My plan": the plan now, what is left of it, and the plans before it. */
function PlanPage() {
  const query = useMySubscriptions()
  const { openSubscribe } = useSiteModals()
  // Set when a button was pressed on a plan that had already changed.
  const [changed, setChanged] = useState(false)

  if (query.isPending) return <AccountSkeleton rows={2} />
  if (query.isError) {
    return (
      <AccountError
        retrying={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const { current, earlier } = splitPlans(query.data)

  const askForPlan = (
    <SiteButton
      py="14px"
      fontSize="15px"
      aria-haspopup="dialog"
      onClick={() => openSubscribe()}
    >
      {m.account_plan_request()}
      <Icon aria-hidden boxSize={3.5} as={icons.forward} />
    </SiteButton>
  )

  return (
    <Stack gap={{ base: 5, md: 6 }}>
      <Heading
        as="h2"
        fontSize="2xl"
        fontWeight="semibold"
        letterSpacing="-0.015em"
        color="site.ink"
      >
        {m.account_plan_title()}
      </Heading>

      {changed && (
        <AccountNotice>{m.account_error_planChanged()}</AccountNotice>
      )}

      {current ? (
        <PlanCard plan={current} onChanged={() => setChanged(true)} />
      ) : (
        <DashboardCard>
          <AccountEmpty
            level="h3"
            icon={icons.sparkles}
            title={m.account_plan_empty_title()}
            body={m.account_plan_empty_body()}
            action={askForPlan}
          />
        </DashboardCard>
      )}

      {earlier.length > 0 && (
        <DashboardCard level="h3" title={m.account_plan_earlier()}>
          <Stack
            as="ul"
            role="list"
            listStyleType="none"
            gap={0}
            divideY="1px"
            divideColor="rgba(0, 23, 31, 0.06)"
          >
            {earlier.map((plan) => (
              <HStack
                as="li"
                key={plan._id}
                justify="space-between"
                align="center"
                gap={3}
                py={3}
                wrap="wrap"
              >
                <Stack gap={0.5} minW={0}>
                  <Text fontWeight="medium" color="site.ink">
                    {planName(plan.planId)}
                  </Text>
                  <Text fontSize="13px" color="site.ink-muted">
                    {m.account_plan_askedOn({
                      date: formatDate(plan.createdAt) ?? '',
                    })}
                  </Text>
                </Stack>
                <StatusPill status={planStatusView[plan.status]} />
              </HStack>
            ))}
          </Stack>
        </DashboardCard>
      )}
    </Stack>
  )
}

export default PlanPage
