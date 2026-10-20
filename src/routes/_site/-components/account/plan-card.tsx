import { HStack, Icon, Progress, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import { accountErrorText, planStatusView } from '#/data/account.data'
import { usePlanActions } from '#/hooks/use-plan-actions'
import type { MySubscriptionDto } from '#/interfaces/account.dto'
import {
  allowanceText,
  cycleText,
  formatDate,
  formatMoney,
  planActions,
  planName,
  planPrice,
  quotaMeter,
} from '#/libs/account'
import { accountErrorFrom } from '#/libs/account-errors'
import type { AccountErrorKindDto } from '#/libs/account-errors'
import { m } from '#/paraglide/messages'
import ConfirmDialog from './confirm-dialog'
import DashboardCard from './dashboard-card'
import type { PlanActionKind } from './plan-dialogs'
import { planDialogCopy } from './plan-dialogs'
import StatusPill from './status-pill'

/** How much of the period's allowance is left, as a bar and in words. */
function Meter({ plan }: { plan: MySubscriptionDto }) {
  const meter = quotaMeter(plan)
  const left =
    plan.quotaType === 'PIECES'
      ? m.account_plan_leftPieces({ left: meter.left, total: meter.total })
      : m.account_plan_leftKg({ left: meter.left, total: meter.total })

  return (
    <Stack gap={2}>
      <Progress.Root
        value={100 - meter.percentUsed}
        max={100}
        size="md"
        shape="full"
        colorPalette="turquoise-blue"
        aria-label={m.account_plan_meter()}
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Text fontWeight="semibold" color="site.ink">
        {left}
      </Text>
    </Stack>
  )
}

/**
 * The plan the customer has now, or the request they are waiting on, with the
 * things they can do to it: pause, resume, or end it.
 *
 * Every one of them asks first. Which buttons show comes from the plan's
 * status; the API checks again, and if staff moved the plan a moment ago the
 * dialog says so and the page shows how it stands now.
 */
function PlanCard({
  plan,
  onChanged,
}: {
  plan: MySubscriptionDto
  /**
   * The plan had already changed when the customer pressed the button. The card
   * may be about to disappear (an ended plan has no card), so the page, not the
   * dialog, tells them.
   */
  onChanged: () => void
}) {
  const actions = planActions(plan.status, plan)
  const { pause, resume, cancel, renew } = usePlanActions()

  // The action stays set while the dialog fades out, so its words do not
  // change under the customer's eyes as it closes.
  const [asking, setAsking] = useState<PlanActionKind>('cancel')
  const [open, setOpen] = useState(false)
  const [failure, setFailure] = useState<AccountErrorKindDto | null>(null)

  const mutations = { pause, resume, cancel, renew }
  const active = mutations[asking]
  const copy = planDialogCopy(asking, plan.status)

  const ask = (action: PlanActionKind) => {
    setAsking(action)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setFailure(null)
  }

  const confirm = () => {
    setFailure(null)
    mutations[asking].mutate(plan._id, {
      onSuccess: close,
      onError: (error) => {
        const kind = accountErrorFrom(error)
        if (kind === 'planChanged') {
          close()
          onChanged()
          return
        }
        setFailure(kind)
      },
    })
  }

  const price = planPrice(plan)
  const live = plan.status === 'ACTIVE' || plan.status === 'PAUSED'
  const ended = plan.status === 'EXPIRED'
  const fee = plan.currentPeriod

  return (
    <DashboardCard
      level="h3"
      title={planName(plan.planId)}
      aside={<StatusPill status={planStatusView[plan.status]} />}
    >
      <Stack gap={1}>
        {price !== undefined && (
          <Text fontSize="lg" fontWeight="semibold" color="site.ink">
            <Text as="span" translate="no">
              {formatMoney(price)}
            </Text>{' '}
            {cycleText(plan.billingCycle)}
          </Text>
        )}
        <Text color="site.ink-muted">
          {m.account_plan_includes({
            allowance: allowanceText(plan.quotaType, plan.quotaAmount),
            cycle: cycleText(plan.billingCycle),
          })}
        </Text>
      </Stack>

      {(live || ended) && <Meter plan={plan} />}

      {live && plan.currentPeriodStart && plan.currentPeriodEnd && (
        <Text fontSize="14.5px" color="site.ink-muted">
          {m.account_plan_period({
            start: formatDate(plan.currentPeriodStart) ?? '',
            end: formatDate(plan.currentPeriodEnd) ?? '',
          })}
        </Text>
      )}

      {/* Why it ended, in plain words: the date came, or the allowance ran out. */}
      {ended && (
        <Text lineHeight="1.6" textWrap="pretty" color="site.ink-muted">
          {plan.expiredReason === 'CONSUMED'
            ? m.account_plan_endedUsedUp()
            : m.account_plan_endedDate()}
        </Text>
      )}

      {/* The plan is ending and we need to hear from the customer. */}
      {plan.status === 'ACTIVE' && actions.renew && (
        <Text lineHeight="1.6" textWrap="pretty" color="site.ink-muted">
          {m.account_plan_renewDue({
            date: formatDate(plan.currentPeriodEnd) ?? '',
          })}
        </Text>
      )}
      {plan.status === 'ACTIVE' && plan.renewalConfirmed && (
        <Text lineHeight="1.6" textWrap="pretty" color="site.ink-muted">
          {m.account_plan_renewConfirmed({
            date: formatDate(plan.currentPeriodEnd) ?? '',
          })}
        </Text>
      )}

      {/* What this period costs and what has been paid. It never decides
          whether the plan is running. */}
      {fee && (live || ended) && (
        <Stack gap={0.5} fontSize="14.5px" color="site.ink-muted">
          <Text>
            {fee.paymentStatus === 'PAID'
              ? m.account_plan_feePaid()
              : fee.paymentStatus === 'PARTIALLY_PAID'
                ? m.account_plan_feePartial({
                    paid: formatMoney(fee.amountPaid),
                    left: formatMoney(fee.outstanding),
                  })
                : m.account_plan_feeUnpaid({
                    left: formatMoney(fee.outstanding),
                  })}
          </Text>
          {fee.paymentStatus !== 'PAID' && fee.renewal?.paymentDueAt && (
            <Text>
              {m.account_plan_feeDue({
                date: formatDate(fee.renewal.paymentDueAt) ?? '',
              })}
            </Text>
          )}
        </Stack>
      )}

      {plan.status === 'PENDING' && (
        <Text lineHeight="1.6" textWrap="pretty" color="site.ink-muted">
          {m.account_plan_pendingNote()}
        </Text>
      )}
      {plan.status === 'PAUSED' && (
        <Text lineHeight="1.6" textWrap="pretty" color="site.ink-muted">
          {m.account_plan_pausedNote()}
        </Text>
      )}

      {(actions.renew || actions.pause || actions.resume || actions.cancel) && (
        <HStack gap={3} wrap="wrap">
          {actions.renew && (
            <SiteButton
              px={6}
              py="12px"
              fontSize="15px"
              aria-haspopup="dialog"
              onClick={() => ask('renew')}
            >
              <Icon aria-hidden boxSize={4} as={icons.forward} />
              {m.account_plan_renew()}
            </SiteButton>
          )}
          {actions.pause && (
            <SiteButton
              px={6}
              py="12px"
              fontSize="15px"
              aria-haspopup="dialog"
              onClick={() => ask('pause')}
            >
              <Icon aria-hidden boxSize={4} as={icons.pause} />
              {m.account_plan_pause()}
            </SiteButton>
          )}
          {actions.resume && (
            <SiteButton
              px={6}
              py="12px"
              fontSize="15px"
              aria-haspopup="dialog"
              onClick={() => ask('resume')}
            >
              <Icon aria-hidden boxSize={4} as={icons.play} />
              {m.account_plan_resume()}
            </SiteButton>
          )}
          {actions.cancel && (
            <SiteButton
              variant="glass"
              px={6}
              py="12px"
              fontSize="15px"
              aria-haspopup="dialog"
              onClick={() => ask('cancel')}
            >
              {plan.status === 'PENDING'
                ? m.account_plan_withdraw()
                : m.account_plan_cancel()}
            </SiteButton>
          )}
        </HStack>
      )}

      <ConfirmDialog
        open={open}
        title={copy.title}
        body={copy.body}
        confirmLabel={copy.confirm}
        keepLabel={copy.keep}
        destructive={copy.destructive}
        pending={active.isPending}
        error={failure ? accountErrorText[failure]() : undefined}
        onConfirm={confirm}
        onClose={close}
      />
    </DashboardCard>
  )
}

export default PlanCard
