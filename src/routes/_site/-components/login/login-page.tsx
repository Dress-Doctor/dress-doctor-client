import { Box, Flex } from '@chakra-ui/react'
import { useLoginFlow } from '#/hooks/use-login-flow'
import CodeStep from './code-step'
import ContactStep from './contact-step'
import LoginAside from './login-aside'

const bloom = [
  'radial-gradient(700px 360px at 12% 6%, rgba(255, 137, 74, 0.08), transparent 65%)',
  'radial-gradient(900px 480px at 0% 100%, rgba(46, 207, 220, 0.12), transparent 60%)',
].join(', ')

interface LoginPageProps {
  /** Where to go after logging in; already checked to stay on this site. */
  redirect: string | undefined
}

/**
 * The login page: the form on one side, a photo that says what logging in gets
 * the customer on the other. Below the large breakpoint the photo is dropped
 * and the form takes the whole width.
 */
function LoginPage({ redirect }: LoginPageProps) {
  const flow = useLoginFlow(redirect)

  return (
    <Box
      as="section"
      display="grid"
      gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
    >
      <Flex
        align="center"
        justify="center"
        px={{ base: 5, md: 10, lg: 14 }}
        py={{ base: 10, md: 14 }}
        bg="site.canvas"
        bgImage={bloom}
      >
        <Box w="full" maxW="28rem">
          {flow.step === 'code' ? (
            <CodeStep flow={flow} />
          ) : (
            <ContactStep flow={flow} />
          )}
        </Box>
      </Flex>

      <LoginAside step={flow.step} />
    </Box>
  )
}

export default LoginPage
