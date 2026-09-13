import SiteLayout from '#/components/layout/site-layout'
import { Outlet, createFileRoute } from '@tanstack/react-router'

/**
 * The public website's layout boundary. Every page nested under it gets the
 * header, the footer and the site's light composition, the same way `_authed`
 * is what makes a route signed-in-only in the admin console.
 *
 * Pathless, so the pages below keep their own URLs — `/_site/index.tsx` is
 * still `/`.
 */
export const Route = createFileRoute('/_site')({ component: SiteShell })

function SiteShell() {
  return (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  )
}
