import { languageData } from '@/data/common.data'
import type { Locale } from '@/libs/i18n'
import { useLocale } from '@/libs/i18n/use-locale'
import { Select, Space } from 'antd'

function LanguageItem({ flag, label }: { flag: string; label: string }) {
  return (
    <Space>
      <span role="img" aria-label={label}>
        {flag}
      </span>
      {label}
    </Space>
  )
}

function AppLanguage() {
  const { locale, setLocale } = useLocale()

  return (
    <Select
      value={locale}
      style={{ width: 120 }}
      options={languageData}
      onChange={(lang: Locale) => setLocale(lang)}
      labelRender={(option) => {
        const item = languageData.find((l) => l.value === option.value)
        return <LanguageItem {...item!} />
      }}
      optionRender={(option) => <LanguageItem {...option.data} />}
    />
  )
}

export default AppLanguage
