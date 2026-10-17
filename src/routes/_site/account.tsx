import { createFileRoute, redirect } from '@tanstack/react-router'
import { isCustomer, meQueryOptions } from '#/hooks/use-me'
import { isUnauthenticated } from '#/libs/auth-errors'
import { noIndexHead } from '#/libs/seo'
import { LOGIN_PATH } from '#/libs/redirect'
import { m } from '#/paraglide/messages'
import AccountLayout from './-components/account/account-layout'

/**
 * The customer's account. This route is the frame (greeting and navigation);
 * every page below it (`account/…`) draws inside it and is guarded by the same
 * check, since a child route runs its parent's `beforeLoad` first.
 */
export const Route = createFileRoute('/_site/account')({
  // Only a signed-in customer gets in. Anybody else is sent to log in, and
  // brought back here once they have.
  beforeLoad: async ({ context: { queryClient }, location }) => {
    const toLogin = () =>
      redirect({
        to: LOGIN_PATH,
        search: { redirect: location.href },
        replace: true,
      })

    try {
      const me = await queryClient.ensureQueryData(meQueryOptions())
      if (!isCustomer(me)) throw toLogin()
    } catch (error) {
      if (isUnauthenticated(error)) throw toLogin()
      throw error
    }
  },

  head: () => ({
    meta: [{ title: m.account_meta_details() }, ...noIndexHead().meta],
  }),

  component: AccountLayout,
})
