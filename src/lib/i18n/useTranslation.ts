'use client'

import { useLanguageStore, type SupportedLanguage } from '@/store/useLanguageStore'
import { translations } from './translations'

export function useTranslation() {
  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)
  const hasHydrated = useLanguageStore((s) => s._hasHydrated)

  const t = (key: string, fallback?: string): string => {
    // Read from state or fallback to localStorage if available
    let activeLang = language
    if (!hasHydrated && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('app_language')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed?.state?.language) activeLang = parsed.state.language
        } catch {
          activeLang = (stored as SupportedLanguage) || 'English'
        }
      }
    }

    const dict = translations[activeLang] || translations['English']
    return dict?.[key] ?? translations['English']?.[key] ?? fallback ?? key
  }

  return { t, language, setLanguage }
}
