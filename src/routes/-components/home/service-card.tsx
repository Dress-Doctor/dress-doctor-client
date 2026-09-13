import {
  Center,
  Flex,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import type { SiteServiceDto } from '#/interfaces/site.dto'

/**
 * One service in the home grid — mark, name, what it covers, and the price it
 * starts at. The whole card is the link, so the target is the card, not the
 * arrow in its corner.
 */
function ServiceCard({ service }: { service: SiteServiceDto }) {
  return (
    <ChakraLink
      asChild
      display="block"
      h="full"
      p="30px"
      rounded="22px"
      bg="white"
      textDecoration="none"
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
      boxShadow="0 1px 2px rgba(0, 23, 31, 0.03), 0 12px 32px rgba(0, 23, 31, 0.04)"
      transitionProperty="box-shadow, transform, border-color"
      transitionDuration="moderate"
      _hover={{
        transform: 'translateY(-4px)',
        borderColor: 'rgba(46, 207, 220, 0.35)',
        boxShadow:
          '0 2px 4px rgba(0, 23, 31, 0.04), 0 28px 60px rgba(46, 207, 220, 0.16)',
      }}
    >
      <Link to={service.to}>
        <Stack gap={0} h="full">
          <Center
            boxSize="54px"
            rounded="16px"
            color="turquoise-blue.700"
            bgGradient="to-br"
            gradientFrom="rgba(46, 207, 220, 0.18)"
            gradientTo="rgba(46, 207, 220, 0.06)"
            borderWidth="1px"
            borderColor="rgba(46, 207, 220, 0.25)"
          >
            <Icon aria-hidden as={service.icon} boxSize={6} />
          </Center>

          <Text
            as="h3"
            mt={5}
            fontSize="xl"
            fontWeight="semibold"
            color="site.ink"
          >
            {service.name()}
          </Text>

          <Text
            mt={2}
            fontSize="14.5px"
            lineHeight="1.6"
            color="site.ink-muted"
            textWrap="pretty"
          >
            {service.summary()}
          </Text>

          <Flex mt={4} gap={3} align="center" justify="space-between">
            <Text
              fontFamily="display"
              fontSize="13.5px"
              fontWeight="bold"
              color="amber-orange.500"
            >
              {service.price()}
            </Text>

            <Center
              flex="none"
              boxSize="30px"
              rounded="full"
              color="turquoise-blue.700"
              bg="rgba(46, 207, 220, 0.12)"
            >
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </Center>
          </Flex>
        </Stack>
      </Link>
    </ChakraLink>
  )
}

export default ServiceCard
