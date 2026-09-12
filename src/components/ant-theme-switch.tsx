import { antDarkTheme, antTheme } from '#/config/theme'
import { ConfigProvider } from 'antd'
import type { PropsWithChildren } from 'react'
import { useColorMode } from './ui/color-mode'

function AntThemeSwitch({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode()

  return (
    <ConfigProvider theme={colorMode === 'dark' ? antDarkTheme : antTheme}>
      {children}
    </ConfigProvider>
  )
}

export default AntThemeSwitch
