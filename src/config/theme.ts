import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { theme as antdTheme } from 'antd'
import type { ThemeConfig } from 'antd'

/* -------------------------------------------------------------------------- */
/*                          Palette (single source)                           */
/* -------------------------------------------------------------------------- */

const brand = {
  'turquoise-blue': {
    DEFAULT: '#2ECFDC',
    50: '#E8FAFC',
    100: '#C6F3F7',
    200: '#9EE9F0',
    300: '#75DDE7',
    400: '#4CD3DF',
    500: '#2ECFDC', // base
    600: '#24A9B5',
    700: '#1A7E86',
    800: '#12575D',
    900: '#0B383D',
    950: '#051E21',
  },
  'dark-bluish-gray': {
    DEFAULT: '#202938',
    50: '#F3F6FA',
    100: '#E1E6EF',
    200: '#C6CEDC',
    300: '#A8B3C7',
    400: '#8896AF',
    500: '#202938', // base
    600: '#1A2230',
    700: '#141A24',
    800: '#0D1118',
    900: '#070A0D',
    950: '#030406',
  },
  'amber-orange': {
    DEFAULT: '#FF894A',
    50: '#FFF8F3',
    100: '#FFEBDD',
    200: '#FFD4B5',
    300: '#FFBC8D',
    400: '#FFA368',
    500: '#FF894A', // base
    600: '#E46D33',
    700: '#B95023',
    800: '#8F3918',
    900: '#652310',
    950: '#421407',
  },
} as const

/**
 * Chakra's own default tokens, mirrored here so Ant Design can consume the
 * exact same hex values. Keep in sync with `@chakra-ui/react` defaults if the
 * Chakra major version changes.
 */
const chakraDefaults = {
  black: '#09090B',
  white: '#FFFFFF',
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#111111',
  },
  red: {
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    950: '#1f0808',
  },
  green: {
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    950: '#03190c',
  },
  blue: {
    300: '#a3cfff',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    950: '#0c142e',
  },
} as const

/**
 * Dark-mode neutrals, tinted toward `dark-bluish-gray` rather than Chakra's
 * zinc. Two reasons: the brand navy is the product's own colour, and a pure
 * #09090B canvas with zinc panels leaves every surface within ~3% lightness of
 * its neighbour, so the sidebar, page and cards read as one flat sheet.
 *
 * Ordered by elevation, not by name — `canvas` sits furthest back and each step
 * up is a visible lift. `border` lands on the brand's own 500 so hairlines
 * belong to the palette instead of drifting grey.
 */
const darkSurface = {
  canvas: '#0A0E15',
  panel: '#111826',
  raised: '#18202F',
  emphasized: '#202A3B',
  border: '#202938',
  borderMuted: '#18202F',
  borderEmphasized: '#2A3547',
} as const

const fonts = {
  body: `"jost", system-ui, sans-serif`,
  heading: `"figtree", system-ui, sans-serif`,
  mono: 'monospace',
}

/** Chakra semantic radii: l1 = radii.xs (2px), l2 = radii.sm (4px), l3 = radii.md (6px). */
const radii = { l1: 2, l2: 4, l3: 6 }

/* -------------------------------------------------------------------------- */
/*                                   Chakra                                   */
/* -------------------------------------------------------------------------- */

type Scale = Record<string, string>
type TokenScale<T extends Scale> = { [K in keyof T]: { value: T[K] } }

const toTokens = <T extends Scale>(scale: T) =>
  Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [key, { value }]),
  ) as TokenScale<T>

/**
 * Builds the standard Chakra semantic slots for a brand palette.
 *
 * Dark mode is not the light ramp with the numbers swapped. A solid fill has to
 * carry text, and on a dark canvas the accessible pairing is a *brighter* fill
 * with near-black text — turquoise 600 under white is 2.9:1, while turquoise
 * 400 under the palette's darkest step clears 9:1. So a separate dark
 * contrast colour rather than one value for both modes.
 */
const brandSemanticTokens = (
  name: keyof typeof brand,
  contrast: string,
  darkContrast: string,
) => ({
  DEFAULT: {
    value: { base: `{colors.${name}.500}`, _dark: `{colors.${name}.400}` },
  },
  contrast: { value: { base: contrast, _dark: darkContrast } },
  fg: {
    value: { base: `{colors.${name}.700}`, _dark: `{colors.${name}.200}` },
  },
  muted: {
    value: { base: `{colors.${name}.200}`, _dark: `{colors.${name}.800}` },
  },
  solid: {
    value: { base: `{colors.${name}.600}`, _dark: `{colors.${name}.400}` },
  },
  subtle: {
    value: { base: `{colors.${name}.100}`, _dark: `{colors.${name}.900}` },
  },
  focusRing: {
    value: { base: `{colors.${name}.500}`, _dark: `{colors.${name}.400}` },
  },
  emphasized: {
    value: { base: `{colors.${name}.300}`, _dark: `{colors.${name}.700}` },
  },
  border: {
    value: { base: `{colors.${name}.400}`, _dark: `{colors.${name}.700}` },
  },
})

export const chakraTheme = createSystem(
  defaultConfig,
  defineConfig({
    globalCss: { html: { colorPalette: 'turquoise-blue' } },

    theme: {
      tokens: {
        fonts: {
          body: { value: fonts.body },
          heading: { value: fonts.heading },
        },
        colors: {
          'turquoise-blue': toTokens(brand['turquoise-blue']),
          'dark-bluish-gray': toTokens(brand['dark-bluish-gray']),
          'amber-orange': toTokens(brand['amber-orange']),
        },
      },
      semanticTokens: {
        colors: {
          'turquoise-blue': brandSemanticTokens(
            'turquoise-blue',
            'white',
            brand['turquoise-blue'][950],
          ),
          'dark-bluish-gray': brandSemanticTokens(
            'dark-bluish-gray',
            'white',
            brand['dark-bluish-gray'][950],
          ),
          'amber-orange': brandSemanticTokens(
            'amber-orange',
            'black',
            brand['amber-orange'][950],
          ),

          /**
           * Neutral surfaces. Light keeps Chakra's own values; only dark is
           * re-pitched onto the navy ramp.
           *
           * The order matters as much as the hue. In light mode a panel is white
           * and the page behind it is grey — the surface is *lighter* than its
           * background. Chakra's dark defaults invert that (page #09090B, panel
           * #111), so the admin shell ended up with a sidebar darker than the
           * content it frames. Here `bg` (panels, sidebar, header, menus) sits
           * above `bg.muted` (the page), which keeps the depth cues pointing the
           * same way in both modes and lets one set of components serve both.
           */
          /**
           * The neutral *palette* — what `colorPalette="gray"` resolves to on
           * buttons, switches, avatars and skeletons. Left alone it stays zinc,
           * so a ghost button on a navy panel arrives as a grey chip. Only the
           * dark side is redefined; `base` is inherited from Chakra.
           */
          gray: {
            fg: { value: { _dark: '{colors.dark-bluish-gray.200}' } },
            subtle: { value: { _dark: darkSurface.raised } },
            muted: { value: { _dark: darkSurface.emphasized } },
            emphasized: { value: { _dark: darkSurface.borderEmphasized } },
          },

          bg: {
            DEFAULT: {
              value: { base: '{colors.white}', _dark: darkSurface.panel },
            },
            subtle: {
              value: { base: '{colors.gray.50}', _dark: darkSurface.raised },
            },
            muted: {
              value: { base: '{colors.gray.100}', _dark: darkSurface.canvas },
            },
            emphasized: {
              value: {
                base: '{colors.gray.200}',
                _dark: darkSurface.emphasized,
              },
            },
            /** Hover lift for rows and nav items — must read above `bg`. */
            sunken: {
              value: { base: '{colors.gray.100}', _dark: darkSurface.raised },
            },
            panel: {
              value: { base: '{colors.white}', _dark: darkSurface.panel },
            },
          },
          fg: {
            DEFAULT: {
              value: {
                base: '{colors.black}',
                _dark: '{colors.dark-bluish-gray.50}',
              },
            },
            muted: {
              value: {
                base: '{colors.gray.600}',
                _dark: '{colors.dark-bluish-gray.300}',
              },
            },
            subtle: {
              value: {
                base: '{colors.gray.400}',
                _dark: '{colors.dark-bluish-gray.400}',
              },
            },
          },
          border: {
            DEFAULT: {
              value: { base: '{colors.gray.200}', _dark: darkSurface.border },
            },
            muted: {
              value: {
                base: '{colors.gray.100}',
                _dark: darkSurface.borderMuted,
              },
            },
            subtle: {
              value: {
                base: '{colors.gray.50}',
                _dark: darkSurface.borderMuted,
              },
            },
            emphasized: {
              value: {
                base: '{colors.gray.300}',
                _dark: darkSurface.borderEmphasized,
              },
            },
          },
        },
      },
    },
  }),
)

/* -------------------------------------------------------------------------- */
/*                                Ant Design                                  */
/* -------------------------------------------------------------------------- */

const primary = brand['turquoise-blue']
const warning = brand['amber-orange']
const navy = brand['dark-bluish-gray']
const { black, white, gray, red, green, blue } = chakraDefaults

/** Mode-independent tokens: typography, sizing, radii — mirrored from Chakra. */
const sharedToken = {
  fontFamily: fonts.body,
  fontFamilyCode: fonts.mono,
  fontSize: 14, // Chakra control text = fontSizes.sm
  lineWidth: 1,
  borderRadius: radii.l2,
  borderRadiusSM: radii.l1,
  borderRadiusLG: radii.l3,
  controlHeight: 40, // Chakra button size="md" → h: 10 (2.5rem)
} as const

/**
 * Light theme — neutrals mirror Chakra's light semantic tokens
 * (bg → white, fg → black, border → gray.200, bg.subtle → gray.50).
 */
export const antTheme: ThemeConfig = {
  token: {
    ...sharedToken,

    // Brand — turquoise-blue
    colorPrimary: primary[500],
    colorPrimaryHover: primary[400],
    colorPrimaryActive: primary[600],
    colorPrimaryBorder: primary[200],
    colorPrimaryBorderHover: primary[300],
    colorPrimaryBg: primary[50],
    colorPrimaryBgHover: primary[100],
    colorPrimaryText: primary[700],
    colorPrimaryTextHover: primary[600],
    colorPrimaryTextActive: primary[800],
    colorLink: primary[600],
    colorLinkHover: primary[500],
    colorLinkActive: primary[700],

    // Warning — amber-orange
    colorWarning: warning[500],
    colorWarningHover: warning[400],
    colorWarningActive: warning[600],
    colorWarningBorder: warning[200],
    colorWarningBorderHover: warning[300],
    colorWarningBg: warning[50],
    colorWarningBgHover: warning[100],
    colorWarningText: warning[700],

    // Status — Chakra fg.error / fg.success / fg.info (light)
    colorError: red[500],
    colorErrorHover: red[400],
    colorErrorActive: red[600],
    colorSuccess: green[500],
    colorSuccessHover: green[400],
    colorSuccessActive: green[600],
    colorInfo: blue[500],
    colorInfoHover: blue[400],
    colorInfoActive: blue[600],

    // Surfaces — Chakra bg / bg.panel / bg.subtle
    colorBgBase: white,
    colorBgContainer: white,
    colorBgElevated: white,
    colorBgLayout: gray[50],
    colorBgSpotlight: black,

    // Text — Chakra fg / fg.muted / fg.subtle
    colorTextBase: black,
    colorText: black,
    colorTextSecondary: gray[600],
    colorTextTertiary: gray[400],
    colorTextQuaternary: gray[300],
    // Stated rather than derived from `colorTextQuaternary`, so an antd field's
    // hint matches a Chakra one's — both are `fg.subtle`.
    colorTextPlaceholder: gray[400],

    // Borders — Chakra border / border.muted
    colorBorder: gray[200],
    colorBorderSecondary: gray[100],

    // Fills — Chakra gray scale
    colorFill: gray[300],
    colorFillSecondary: gray[200],
    colorFillTertiary: gray[100],
    colorFillQuaternary: gray[50],
  },
  components: {
    Layout: {
      bodyBg: gray[50],
      headerBg: white,
      siderBg: white,
      footerBg: gray[50],
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: primary[50],
      itemSelectedColor: primary[700],
    },
  },
}

/**
 * Dark theme — neutrals mirror Chakra's dark semantic tokens
 * (bg → black #09090B, bg.panel → gray.950, fg → gray.50, border → gray.800).
 */
export const antDarkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    ...sharedToken,

    // Brand — turquoise-blue. Lifted a step versus light mode: 500 is a mid
    // tone that reads muddy against a dark panel, and it is the colour antd
    // paints active borders, links and picker accents with.
    colorPrimary: primary[400],
    colorPrimaryHover: primary[300],
    colorPrimaryActive: primary[500],
    colorPrimaryBorder: primary[700],
    colorPrimaryBorderHover: primary[600],
    colorPrimaryBg: primary[900],
    colorPrimaryBgHover: primary[800],
    colorPrimaryText: primary[300],
    colorPrimaryTextHover: primary[200],
    colorPrimaryTextActive: primary[400],
    colorLink: primary[400],
    colorLinkHover: primary[300],
    colorLinkActive: primary[500],

    // Warning — amber-orange
    colorWarning: warning[500],
    colorWarningHover: warning[400],
    colorWarningActive: warning[600],
    colorWarningBorder: warning[800],
    colorWarningBorderHover: warning[700],
    colorWarningBg: warning[950],
    colorWarningBgHover: warning[900],
    colorWarningText: warning[300],

    // Status — Chakra fg.error / fg.success / fg.info (dark)
    colorError: red[400],
    colorErrorHover: red[300],
    colorErrorActive: red[500],
    colorErrorBg: red[950],
    colorSuccess: green[400],
    colorSuccessHover: green[300],
    colorSuccessActive: green[500],
    colorSuccessBg: green[950],
    colorInfo: blue[400],
    colorInfoHover: blue[300],
    colorInfoActive: blue[500],
    colorInfoBg: blue[950],

    // Surfaces — the same navy ramp Chakra uses, so an antd Select dropdown
    // sitting on a Chakra panel is the same colour as the panel.
    colorBgBase: darkSurface.canvas,
    colorBgContainer: darkSurface.panel,
    colorBgElevated: darkSurface.raised,
    colorBgLayout: darkSurface.canvas,
    colorBgSpotlight: darkSurface.emphasized,

    // Text — Chakra fg / fg.muted / fg.subtle (dark)
    colorTextBase: navy[50],
    colorText: navy[50],
    colorTextSecondary: navy[300],
    colorTextTertiary: navy[400],
    /**
     * `navy[400]`, not `navy[500]`: this ramp is not monotonic — `500` is the
     * brand base `#202938`, which is *darker* than the panel behind it
     * (`#111826`). Used as a text colour it disappeared, and antd derives
     * `colorTextPlaceholder` and `colorTextDisabled` from this token, which is
     * why the placeholders read as empty fields. There is no fourth step below
     * Chakra's `fg.subtle`, so this stops at the dimmest one that is defined.
     */
    colorTextQuaternary: navy[400],
    // Stated rather than derived, so an antd field's hint matches a Chakra
    // one's — both are `fg.subtle`.
    colorTextPlaceholder: navy[400],

    // Borders — Chakra border / border.muted (dark)
    colorBorder: darkSurface.border,
    colorBorderSecondary: darkSurface.borderMuted,

    // Fills — hover/track surfaces, lifted off the panel rather than sunk
    colorFill: darkSurface.borderEmphasized,
    colorFillSecondary: darkSurface.emphasized,
    colorFillTertiary: darkSurface.raised,
    colorFillQuaternary: darkSurface.panel,
  },
  components: {
    Layout: {
      bodyBg: darkSurface.canvas,
      headerBg: darkSurface.panel,
      siderBg: darkSurface.panel,
      footerBg: darkSurface.canvas,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: primary[950],
      itemSelectedColor: primary[300],
    },
  },
}

export default chakraTheme
