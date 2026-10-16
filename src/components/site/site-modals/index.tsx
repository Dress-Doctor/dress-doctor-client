import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import { DEFAULT_PLAN_BILLING, DEFAULT_PLAN_MODE } from '#/data/home.data'
import { useBookingFlow } from '#/hooks/use-booking-flow'
import { useContactDraft } from '#/hooks/use-contact-draft'
import { SiteModalsContext } from '#/hooks/use-site-modals'
import type { SiteModalsApi } from '#/hooks/use-site-modals'
import { useSubscribeFlow } from '#/hooks/use-subscribe-flow'
import type { SiteSearchDto } from '#/interfaces/booking.dto'
import BookingModal from './booking-modal'
import SubscribeModal from './subscribe-modal'

/**
 * Owns the pickup form and the plan form for the whole public site.
 *
 * They are rendered here, once, and every button that wants one calls
 * `useSiteModals()` — so there is only ever one booking form to keep right.
 *
 * Which form is open, and the choices inside it, live in the address (see
 * `SiteSearchDto`), and this reads them from there. Opening one adds a step
 * to the browser history, so Back — or the phone's back button — closes it;
 * a choice made inside it replaces the current step instead, so Back does not
 * have to undo each tap. Nothing here is ever taken out of the address on its
 * own: it changes only when the visitor does something, such as closing the
 * form. A link such as `/?modal=booking&service=washFold`, or a refresh, lands
 * on the same screen.
 *
 * Every change is a search-only navigation — no path is given, so the page
 * stays where it is and nothing reloads or scrolls.
 */
function SiteModalsProvider({ children }: PropsWithChildren) {
  const search = useSearch({ from: '/_site' })
  const navigate = useNavigate()

  /** Writes only what changed; the rest of the address is carried over. */
  const write = (patch: Partial<SiteSearchDto>, replace: boolean) =>
    navigate({
      to: '.',
      replace,
      resetScroll: false,
      search: (current) => ({ ...current, ...patch }),
    })

  const replaceSearch = (patch: Partial<SiteSearchDto>) => write(patch, true)

  const bookingOpen = search.modal === 'booking'
  const subscribeOpen = search.modal === 'subscribe'

  // Who the visitor is, shared by both forms: they ask for the same details.
  const contact = useContactDraft()

  const booking = useBookingFlow({
    open: bookingOpen,
    service: search.service,
    setService: (service) => replaceSearch({ service }),
    contact,
  })

  const subscribe = useSubscribeFlow({
    open: subscribeOpen,
    tier: search.tier,
    mode: search.plan ?? DEFAULT_PLAN_MODE,
    billing: search.billing ?? DEFAULT_PLAN_BILLING,
    change: ({ planId, mode, billing }) =>
      replaceSearch({
        ...(planId && { tier: planId }),
        ...(mode && { plan: mode }),
        ...(billing && { billing }),
      }),
    contact,
  })

  // A form takes its own choices out of the address when it closes — what is
  // left is the page's: the plan cards' count and billing.
  const closeBooking = () =>
    replaceSearch({ modal: undefined, service: undefined })
  const closeSubscribe = () =>
    replaceSearch({ modal: undefined, tier: undefined })

  // The button that opened a form gets focus back when it closes. They open
  // from code, not from a trigger Chakra knows about, so it is kept by hand.
  const opener = useRef<HTMLElement | null>(null)
  const returnFocusTo = () =>
    opener.current?.isConnected ? opener.current : null

  // What the buttons are given never changes between renders. The forms' own
  // state changes on every key press, and a context value that moved with it
  // would re-render every button on the page each time.
  const api = useMemo<SiteModalsApi>(() => {
    const open = (patch: Partial<SiteSearchDto>) => {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      void navigate({
        to: '.',
        resetScroll: false,
        search: (current) => ({ ...current, ...patch }),
      })
    }

    return {
      openBooking: (prefill) =>
        open({
          modal: 'booking',
          ...(prefill?.service && { service: prefill.service }),
        }),
      openSubscribe: (prefill) =>
        open({
          modal: 'subscribe',
          ...(prefill?.plan && { tier: prefill.plan }),
          ...(prefill?.mode && { plan: prefill.mode }),
          ...(prefill?.billing && { billing: prefill.billing }),
        }),
    }
  }, [navigate])

  return (
    <SiteModalsContext value={api}>
      {children}
      <BookingModal
        flow={booking}
        open={bookingOpen}
        onClose={closeBooking}
        returnFocusTo={returnFocusTo}
      />
      <SubscribeModal
        flow={subscribe}
        open={subscribeOpen}
        onClose={closeSubscribe}
        returnFocusTo={returnFocusTo}
      />
    </SiteModalsContext>
  )
}

export default SiteModalsProvider
