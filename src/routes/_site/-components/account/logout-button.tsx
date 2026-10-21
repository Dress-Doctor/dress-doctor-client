import { Icon } from '@chakra-ui/react'
import SiteButton from '#/components/site/site-button'
import icons from '#/config/icons'
import { useLogout } from '#/hooks/use-logout'
import { m } from '#/paraglide/messages'

/** The way out of the account. Takes the customer home when it is done. */
function LogoutButton() {
  const { logout, loggingOut } = useLogout()

  return (
    <SiteButton
      variant="glass"
      px={5}
      py="10px"
      fontSize="14.5px"
      loading={loggingOut}
      loadingText={m.account_loggingOut()}
      onClick={() => logout()}
    >
      <Icon aria-hidden boxSize={4} as={icons.logout} />
      {m.account_logout()}
    </SiteButton>
  )
}

export default LogoutButton
