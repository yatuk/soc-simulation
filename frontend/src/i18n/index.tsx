import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useSettingsStore } from '@/store'
import tr from './tr.json'
import en from './en.json'

type Language = 'tr' | 'en'
type TranslationMap = Record<string, string | Record<string, unknown>>

const translations: Record<Language, TranslationMap> = { tr, en }

interface I18nContextValue {
  language: Language
  t: (key: string, fallback?: string) => string
}

const I18nContext = createContext<I18nContextValue>({
  language: 'tr',
  t: (key, fallback) => fallback ?? key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.settings.language)

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split('.')
      // Defansif: language bozuksa (örn. localStorage corruption) Türkçe'ye geri dön
      let value: unknown = translations[language] ?? translations['tr']
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = (value as Record<string, unknown>)[k]
        } else {
          return fallback ?? key
        }
      }
      return typeof value === 'string' ? value : fallback ?? key
    },
    [language],
  )

  return <I18nContext.Provider value={{ language, t }}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  return useContext(I18nContext)
}
