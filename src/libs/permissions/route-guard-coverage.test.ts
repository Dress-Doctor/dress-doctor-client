import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The guard is only worth having if every admin route uses it, so this reads
 * the route files themselves rather than trusting anyone to remember.
 *
 * A new page under `/admin` fails here until it either declares a permission
 * or is listed below as deliberately open. That is the point: the failure
 * should land on whoever adds the route, not on whoever notices months later
 * that a URL was reachable by typing it.
 *
 * The list of routes comes from `routeTree.gen.ts` — the generated file the
 * router actually serves — and is cross-checked against a walk of the folder.
 * Either source alone has a blind spot: the folder walk would miss a route
 * declared outside `_authed/admin/`, and the generated tree would go stale if
 * someone edited routes without re-running `npm run generate-routes`. Both
 * agreeing is the assertion.
 *
 * Source-scanning is a blunt instrument, and it is the right one here. The
 * alternative — importing each route module — drags in every component, chart
 * and message catalogue on the page to answer a question about one line of
 * configuration.
 */

const SRC = join(process.cwd(), 'src')
const ROUTES = join(SRC, 'routes')
const ADMIN_ROUTES = join(ROUTES, '_authed/admin')
const ROUTE_TREE = join(SRC, 'routeTree.gen.ts')

/**
 * Routes that carry no permission, and why. Anything not here must be guarded.
 * Keyed by path relative to the admin folder, not by file name: every detail
 * route is also called `index.tsx`, and matching on the name alone would wave
 * all of them through.
 *
 * `route.tsx` is the layout — the chrome around the pages, gating nothing on
 * its own. `index.tsx` at the top only redirects to the dashboard. The
 * dashboard and profile are open to every signed-in admin, matching the
 * sidebar, which gives neither a `permission`. `forbidden.tsx` is where the
 * guard sends people, so gating it would loop.
 */
const DELIBERATELY_OPEN = new Set([
  'route.tsx',
  'index.tsx',
  'dashboard.tsx',
  'profile.tsx',
  'forbidden.tsx',
])

/** Every admin route the generated tree imports, relative to the admin folder. */
function routesFromTree(): string[] {
  const tree = readFileSync(ROUTE_TREE, 'utf8')
  const imports = [
    ...tree.matchAll(/from '\.\/routes\/(_authed\/admin[^']*)'/g),
  ]

  return imports.map((match) => {
    const withoutExt = join(ROUTES, match[1])
    // The generated tree imports without an extension. Routes are `.tsx`, but
    // one with no component of its own could legitimately be `.ts`.
    const file = ['.tsx', '.ts']
      .map((ext) => `${withoutExt}${ext}`)
      .find((candidate) => existsSync(candidate))

    expect(file, `no file on disk for route ${match[1]}`).toBeDefined()
    return relative(ADMIN_ROUTES, file as string)
  })
}

/** Every route file on disk, ignoring page-only `-components` folders. */
function routesFromDisk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      return entry.name.startsWith('-') ? [] : routesFromDisk(full)
    }
    if (/\.test\.tsx?$/.test(entry.name)) return []
    return /\.tsx?$/.test(entry.name) ? [relative(ADMIN_ROUTES, full)] : []
  })
}

const fromTree = routesFromTree()
const fromDisk = routesFromDisk(ADMIN_ROUTES)

describe('the route list this test checks is the real one', () => {
  it('finds admin routes at all', () => {
    // A wrong path would make every assertion below vacuously pass.
    expect(fromTree.length).toBeGreaterThan(5)
  })

  it('matches the generated route tree against the files on disk', () => {
    // A mismatch means either a route was added without re-running
    // `npm run generate-routes`, or one lives somewhere this walk does not
    // look. Both would let an unguarded page through, so both fail here.
    expect([...fromDisk].sort()).toEqual([...fromTree].sort())
  })
})

describe('every admin route is permission-gated', () => {
  it.each(fromTree.map((name) => ({ name })))('$name', ({ name }) => {
    const source = readFileSync(join(ADMIN_ROUTES, name), 'utf8')
    // Whitespace-tolerant: prettier wraps the composed form across lines.
    const guarded = /requirePermission\(\s*PERMISSIONS\./

    if (DELIBERATELY_OPEN.has(name)) {
      expect(source).not.toMatch(guarded)
      return
    }

    expect(source).toMatch(guarded)
    // Bound to a const and handed to the route, which is the shape that
    // survives TanStack's own inference — see `requirePermission`.
    expect(source).toMatch(/const beforeLoad = requirePermission\(/)
    expect(source).toMatch(/\n\s*beforeLoad,/)
  })

  it('has an entry for every open route, and no stale ones', () => {
    // A deleted or renamed route would otherwise leave a hole in the allowlist
    // that silently exempts the next file to take that name.
    const stale = [...DELIBERATELY_OPEN].filter(
      (name) => !fromTree.includes(name),
    )
    expect(stale).toEqual([])
  })
})

describe('the guard is reached through one helper', () => {
  it.each(fromTree.map((name) => ({ name })))(
    '$name builds no permission logic of its own',
    ({ name }) => {
      const source = readFileSync(join(ADMIN_ROUTES, name), 'utf8')

      // A route deciding for itself is exactly what this pattern replaces:
      // the check belongs in `requirePermission`, where it is tested once.
      expect(source).not.toMatch(/ability\.can\(/)
      expect(source).not.toMatch(/buildAbility\(/)
    },
  )
})
