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
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
    }),
    { name: 'mathquest-settings' }
  )
)

export default useSettingsStore
