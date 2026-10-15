import { createFileRoute, redirect } from '@tanstack/react-router'
import { isCustomer, meQueryOptions } from '#/hooks/use-me'
import { isUnauthenticated } from '#/libs/auth-errors'
import { noIndexHead } from '#/libs/seo'
import { LOGIN_PATH } from '#/libs/redirect'
import { m } from '#/paraglide/messages'
import AccountPage from './-components/account/account-page'

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
    meta: [{ title: m.auth_account_metaTitle() }, ...noIndexHead().meta],
  }),

  component: AccountPage,
})
