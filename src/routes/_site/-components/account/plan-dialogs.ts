import type { PlanStatusDto } from '#/interfaces/account.dto'
import { m } from '#/paraglide/messages'

export type PlanActionKind = 'pause' | 'resume' | 'cancel' | 'renew'

export interface PlanDialogCopyDto {
  title: string
  body: string
  confirm: string
  keep: string
  /** Ending a plan cannot be undone, so its button is red. */
  destructive: boolean
}

/**
 * What the confirm dialog says for each thing a customer can do to a plan.
 *
 * "Cancel" means two things: a plan that is running ends, and a request that
 * is still waiting for us is taken back. They are told apart here, because the
 * second loses the customer nothing and the first cannot be undone, and the
 * words should say which one is about to happen.
 */
export function planDialogCopy(
  action: PlanActionKind,
  status: PlanStatusDto,
): PlanDialogCopyDto {
  if (action === 'pause') {
    return {
      title: m.account_plan_pause_title(),
      body: m.account_plan_pause_body(),
      confirm: m.account_plan_pause_confirm(),
      keep: m.account_plan_pause_keep(),
      destructive: false,
    }
  }

  if (action === 'renew') {
    return {
      title: m.account_plan_renew_title(),
      body:
        status === 'EXPIRED'
          ? m.account_plan_renew_bodyEnded()
          : m.account_plan_renew_bodyRunning(),
      confirm: m.account_plan_renew_confirm(),
      keep: m.account_plan_renew_keep(),
      destructive: false,
    }
  }

  if (action === 'resume') {
    return {
      title: m.account_plan_resume_title(),
      body: m.account_plan_resume_body(),
      confirm: m.account_plan_resume_confirm(),
      keep: m.account_plan_resume_keep(),
      destructive: false,
    }
  }

  if (status === 'PENDING') {
    return {
      title: m.account_plan_withdraw_title(),
      body: m.account_plan_withdraw_body(),
      confirm: m.account_plan_withdraw_confirm(),
      keep: m.account_plan_withdraw_keep(),
      destructive: false,
    }
  }

  return {
    title: m.account_plan_cancel_title(),
    body: m.account_plan_cancel_body(),
    confirm: m.account_plan_cancel_confirm(),
    keep: m.account_plan_cancel_keep(),
    destructive: true,
  }
}
