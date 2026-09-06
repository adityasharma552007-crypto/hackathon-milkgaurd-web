import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type SupportedLanguage = 'English' | 'Hindi' | 'Punjabi' | 'Marathi' | 'Gujarati'

interface LanguageState {
  language: SupportedLanguage
  _hasHydrated: boolean
  setLanguage: (lang: SupportedLanguage) => void
  setHasHydrated: (hydrated: boolean) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'English',
      _hasHydrated: false,
      setLanguage: (lang) => set({ language: lang }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'app_language',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
