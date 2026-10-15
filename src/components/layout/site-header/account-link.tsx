import { sitePaths } from '#/data/site.data'
import { useIsSignedIn } from '#/hooks/use-me'
import { m } from '#/paraglide/messages'
import NavLink from './nav-link'

/**
 * "Log in" for a visitor, "My account" for a signed-in customer.
 *
 * Both go to the page that fits: `/login` sends a signed-in customer on to
 * their account anyway, but the label should say where the link leads.
 */
function AccountLink() {
  const signedIn = useIsSignedIn()

  return signedIn ? (
    <NavLink to={sitePaths.account}>{m.site_nav_account()}</NavLink>
  ) : (
    <NavLink to={sitePaths.login}>{m.site_nav_logIn()}</NavLink>
  )
}

export default AccountLink
