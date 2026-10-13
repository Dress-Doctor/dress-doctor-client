# Dress Doctor — customer website

The public website for a laundry and dry-cleaning business in Douala,
Cameroon: services, prices, plans, booking a pickup. Built with TanStack Start
(React 19) and Chakra UI v3. It follows the structure and conventions of
`dress-doctor-admin` — when unsure how something is done, look there first.

## The most important writing rule — text customers read

Write all customer-facing text in **simple, clear British English**.

Our customers are mainly everyday people in Douala, Cameroon, and English may
not be their first language. The text must be easy to understand at a quick
glance.

Follow these rules:

- Use simple, everyday words.
- Prefer short sentences.
- Avoid advanced, technical, corporate or academic words.
- Avoid words that sound too formal or sophisticated.
- Write the way a helpful person would naturally speak to a customer.
- Use British English spelling and wording (`colour`, `organise`, `-ise` not
  `-ize`).
- Make the meaning clear without making the customer think too much.
- Avoid technical explanations on the customer-facing UI.
- Do not expose internal system terms, developer language or implementation
  details to customers.
- Use familiar words such as "payment", "order", "pickup", "delivery",
  "clothes", "price", "status" and "account" where they fit.
- If a simpler word means the same thing, always choose the simpler word.
- Keep buttons and labels short and obvious.
- Do not add words just to make the text sound professional.

### Examples

| Instead of                                                                   | Use                                                 |
| ---------------------------------------------------------------------------- | --------------------------------------------------- |
| Your transaction has been successfully processed and recorded in our system. | Your payment was successful.                        |
| Please provide the required information to proceed with your request.        | Please fill in the details below.                   |
| Your order is currently undergoing processing.                               | We are working on your order.                       |
| Your request has been submitted successfully and is pending review.          | Your request has been sent. We will review it soon. |

### Important

Do not make the English sound childish or unprofessional. The goal is:

**Simple + Clear + Friendly + Professional + British English**

Before adding any customer-facing text, ask yourself:

> Would an ordinary customer in Douala understand this immediately?

If the answer is no, rewrite it in simpler English.

This covers everything a visitor reads: headings, body copy, buttons, labels,
placeholders, error messages, `aria-label`s and alt text. The French catalogue
follows the same rule — plain, natural French, not a stiff translation.

Keep technical names exact everywhere else. Code comments, commit messages and
docs are written in plain British English too, but a prop, file path, command
or error message is always quoted word for word.

## Finding code — always start with CodeGraph

This repo is indexed by CodeGraph. **Use it before grep, find, or opening files
one by one.**

- Preferred: the `codegraph_explore` tool. Ask a plain question or name the
  symbols and files you care about.
- From a terminal: `codegraph explore "<symbols or question>"`.

Reach for `grep`/`Glob`/`Read` only when CodeGraph cannot answer — for example
JSON message catalogues.

## Building and changing UI — always use the skills

| When                                                          | Skill                       |
| ------------------------------------------------------------- | --------------------------- |
| Building a **new** component, page, form or layout            | `/chakra-ui-builder`        |
| Changing, cleaning up or converting an **existing** component | `/chakra-ui-refactor`       |
| **Reviewing** any component you just built or changed         | `/web-interface-guidelines` |

After building or refactoring, run `/web-interface-guidelines` and fix what it
reports before calling the work done.

## Commands

```bash
npm run dev          # dev server on port 3001
npm run build        # production build
npm run lint         # eslint
npm run format       # prettier --write, then eslint --fix
npx tsc --noEmit     # typecheck — there is no npm script for this
npm run i18n         # recompile messages after editing messages/**/*.json
npm run chakra-theme # regenerate theme types after editing src/config/theme.ts
npm run generate-routes  # regenerate the route tree
npm test             # vitest, single run
```

Do not start a dev server with a bare `npm run dev` in the background when a
preview tool is available — use the preview tooling instead.

## Layout of the code

```
src/components/site/      shared website pieces (SiteButton, Reveal…)
src/components/layout/    header, footer and page shell
src/routes/               file-based routes (TanStack Router)
  _site.tsx               pathless layout that wraps every public page
  _site/                  the public pages
  **/-components/         page-only components; the `-` keeps them out of routing
src/data/                 static content lists (site.data.ts, home.data.ts)
src/hooks/                small React hooks, one per file (use-in-view…)
src/interfaces/           DTO types (*.dto.ts)
src/config/theme.ts       the Chakra theme — brand colours, fonts, radii
messages/                 translation catalogues, per namespace, `en` and `fr`
```

## Rules that are easy to get wrong

**Navigation uses the router's `Link`, never a bare `<a>`.** Pair it with a
Chakra component through `asChild`, as the admin does:

```tsx
<ChakraLink asChild {...styles}>
  <Link to={sitePaths.pricing}>…</Link>
</ChakraLink>

<SiteButton asChild>
  <Link to={sitePaths.pricing}>…</Link>
</SiteButton>
```

Destinations are typed `keyof FileRoutesByTo` and live in `sitePaths`, so a
dead link fails the build. Active state comes from `useMatchRoute`. Only
external targets (`wa.me`, `tel:`, `mailto:`) use `href`.

**The pickup form and the plan form are modals, not pages.** There is no
`/booking` route. A button that wants one calls `useSiteModals()` and its
`openBooking()` or `openSubscribe()`, and carries `aria-haspopup="dialog"`.
Both forms are rendered once, by `SiteLayout`.

**The address is the state.** Which form is open and its main choices live in
the query string, declared once on the `_site` layout so every page reads them:
`modal` (`booking` or `subscribe`), `service`, `tier` (`basic`, `standard`,
`premium`), and the plan cards' `plan` (`pieces` or `kg`) and `billing`. So
`/?modal=booking&service=washFold` and `/services?modal=subscribe&tier=premium`
open the right form, and a refresh, a shared link and the back button all land
on the same screen. Rules:

- Never write a path to change them — navigate with `to: '.'` and a `search`
  function, so nothing redirects, reloads or scrolls.
- Opening a form pushes a history entry; a choice made inside it replaces the
  current one; closing replaces and drops the form's own params (`modal`,
  `service` or `tier`).
- Nothing clears a param on its own after reading it. It changes only when the
  visitor does something.
- Names, phone numbers, dates and notes never go in the address.

**A phone number can be from any country.** The forms hold a number as the
country (an ISO code, `CM` by default) and the national digits, and `PhoneInput`
draws the country picker in front of the number. It goes to the API as `+` and
the country code, then the digits — `+237689688248` — never as bare digits: the
`+` is what stops a short number from another country being read as a
Cameroonian one. The list is `src/data/countries.data.ts`, read through
`src/libs/phone.ts`. Country names are not in it, they come from
`Intl.DisplayNames`, so there is nothing to translate and no phone library to
ship. A visitor who types a code or a leading `0` in front is understood; one
who pastes `+33 6…` moves the country with it. The box stops taking digits at
the country's longest number while someone types, but a pasted number is kept
whole and flagged as wrong rather than cut short into a different one.

**Text shown to visitors must be translated.** Never hardcode a visible string.
Add it to `messages/<namespace>/en.json` _and_ `fr.json`, run `npm run i18n`,
then call it at render time: `m.home_hero_title()`.

Namespaces follow the admin: one folder per area, and every key starts with
its folder name.

| Folder             | Prefix     | Holds                                               |
| ------------------ | ---------- | --------------------------------------------------- |
| `messages/common/` | `common_*` | shared UI strings (actions, pagination, selectors…) |
| `messages/site/`   | `site_*`   | header, footer, services list, shared a11y labels   |
| `messages/home/`   | `home_*`   | the home page sections                              |

A new namespace folder is invisible until its path is added to
`project.inlang/settings.json`. Always write both languages — a missing French
entry quietly shows English to French visitors.

**Colours come from the theme.** Use the brand palettes (`turquoise-blue`,
`amber-orange`, `dark-bluish-gray`) and the `site.*` tokens. The public site is
light-only, so the `site.*` tokens are fixed values that do not flip in dark
mode.

## Before you say it is done

1. `npx tsc --noEmit` — no new errors from your files.
2. `npm run lint` — clean.
3. For UI work, `/web-interface-guidelines` run and its findings dealt with.
4. Report honestly. If something is still broken or you skipped a step, say so.
