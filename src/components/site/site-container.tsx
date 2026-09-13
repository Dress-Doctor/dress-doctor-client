import { Container } from '@chakra-ui/react'
import type { ContainerProps } from '@chakra-ui/react'

/**
 * The website's measure — 1240px of content inside a 28px gutter, which is
 * what every section on the marketing pages is aligned to.
 */
function SiteContainer({ children, ...props }: ContainerProps) {
  return (
    <Container maxW="1240px" px={{ base: 5, md: 7 }} {...props}>
      {children}
    </Container>
  )
}

export default SiteContainer
