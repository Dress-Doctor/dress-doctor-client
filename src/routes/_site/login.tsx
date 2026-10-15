import { createFileRoute, redirect } from '@tanstack/react-router'
import { isCustomer, meQueryOptions } from '#/hooks/use-me'
import { noIndexHead } from '#/libs/seo'
import { afterLoginPath, sameSitePath } from '#/libs/redirect'
import { m } from '#/paraglide/messages'
import LoginPage from './-components/login/login-page'

export const Route = createFileRoute('/_site/login')({
  // The page the visitor was sent here from. Anything that is not a path on
  // this site is dropped, so a crafted link cannot send them elsewhere.
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: sameSitePath(search.redirect),
  }),

  // A customer who is already in has no use for this page.
  beforeLoad: async ({ context: { queryClient }, search }) => {
    const me = await queryClient
      .ensureQueryData(meQueryOptions())
      .catch(() => null)

    if (me && isCustomer(me)) {
      throw redirect({ href: afterLoginPath(search.redirect) })
    }
  },

  head: () => ({
    meta: [
      { title: m.auth_meta_title() },
      { name: 'description', content: m.auth_meta_description() },
      ...noIndexHead().meta,
    ],
  }),

  component: LoginRoute,
})

function LoginRoute() {
  const { redirect: destination } = Route.useSearch()
  return <LoginPage redirect={destination} />
}
