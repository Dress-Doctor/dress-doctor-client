import { Image } from '@chakra-ui/react'
import type { ImageProps } from '@chakra-ui/react'
import darkMark from '#/assets/logos/dress-doctor-white.png'
import lightMark from '#/assets/logos/dress-doctor-primary.svg'

/**
 * Both variants render and are toggled with CSS `_dark`, so the correct mark is
 * painted on the first frame — no color-mode flash on hydration.
 *
 * Imported rather than referenced as `/logos/*` paths under `public/`: those are
 * copied verbatim and resolve only against this app's own origin, so the mark
 * broke anywhere the components were reused (the Claude Design import rendered
 * it as a broken image). Importing routes them through the bundler — Vite emits
 * hashed, cache-busted URLs here, and the design-system build inlines them.
 */
const sources = {
  light: lightMark,
  dark: darkMark,
}

export default function Logo({
  alt = 'Dress Doctor',
  h = 50,
  ...props
}: ImageProps) {
  return (
    <>
      <Image
        {...props}
        w="auto"
        alt={alt}
        h={`${h}px`}
        src={sources.light}
        _dark={{ display: 'none' }}
      />
      <Image
        {...props}
        w="auto"
        alt={alt}
        aria-hidden
        h={`${h}px`}
        display="none"
        src={sources.dark}
        _dark={{ display: 'block' }}
      />
    </>
  )
}
