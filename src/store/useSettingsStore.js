import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n'

const useSettingsStore = create(
  persist(
    (set) => ({
      language: localStorage.getItem('mathquest-lang') || 'en',
      soundEnabled: true,
      musicEnabled: true,

      setLanguage: (lang) => {
        i18n.changeLanguage(lang)
        localStorage.setItem('mathquest-lang', lang)
        set({ language: lang })
      },
      toggleLanguage: () => set((s) => {
        const newLang = s.language === 'en' ? 'zh' : 'en'
        i18n.changeLanguage(newLang)
        localStorage.setItem('mathquest-lang', newLang)
        return { language: newLang }
      }),
      devMode: false,
      toggleDevMode: () => set((s) => ({ devMode: !s.devMode })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
    }),
    { name: 'mathquest-settings' }
  )
)

export default useSettingsStore
