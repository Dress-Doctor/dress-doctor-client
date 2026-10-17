import { useMyProfile } from '#/hooks/use-my-profile'
import { AccountError, AccountSkeleton } from './account-states'
import ContactCard from './contact-card'
import PreferencesCard from './preferences-card'

/** "My details": who we think the customer is, and the few things they can change. */
function DetailsPage() {
  const profile = useMyProfile()

  if (profile.isPending) return <AccountSkeleton rows={2} />
  if (profile.isError) {
    return (
      <AccountError
        onRetry={() => void profile.refetch()}
        retrying={profile.isFetching}
      />
    )
  }

  return (
    <>
      <ContactCard profile={profile.data} />
      <PreferencesCard profile={profile.data} />
    </>
  )
}

export default DetailsPage
