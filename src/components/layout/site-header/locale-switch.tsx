import { Button, HStack } from '@chakra-ui/react'
import type { Locale } from '#/libs/i18n'
import { useLocale } from '#/libs/i18n/use-locale'
import { m } from '#/paraglide/messages'

/**
 * EN / FR, as the two-cell pill the design puts beside the header actions.
 *
 * Real buttons in a `radiogroup`, not styled spans: this switches the language
 * of the whole site, so it has to be reachable and announced.
 */
function LocaleSwitch() {
  const { locale, locales, setLocale } = useLocale()

  return (
    <HStack
      gap={0}
      rounded="full"
      overflow="hidden"
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.1)"
      role="radiogroup"
      aria-label={m.common_a11y_selectLanguage()}
    >
      {locales.map((code: Locale) => {
        const active = code === locale

        return (
          <Button
            key={code}
            role="radio"
            variant="plain"
            rounded="none"
            h="auto"
            minW="auto"
            px={2.5}
            py={1.5}
            fontSize="11px"
            fontWeight="bold"
            letterSpacing="0.05em"
            aria-checked={active}
            onClick={() => setLocale(code)}
            color={active ? 'white' : 'site.ink-muted'}
            bg={active ? 'dark-bluish-gray.500' : 'transparent'}
            transitionProperty="background, color"
            transitionDuration="fast"
            _hover={active ? undefined : { color: 'site.ink' }}
          >
            {code.toUpperCase()}
          </Button>
        )
      })}
    </HStack>
  )
}

export default LocaleSwitch
