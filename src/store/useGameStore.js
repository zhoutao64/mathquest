import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useGameStore = create(
  persist(
    (set, get) => ({
      // Character
      character: null, // 'milo' | 'maya'
      setCharacter: (c) => set({ character: c }),

      // XP and level
      xp: 0,
      level: 1,
      addXP: (amount) => {
        const newXP = get().xp + amount
        const newLevel = Math.floor(newXP / 200) + 1 // 200 XP per level
        set({ xp: newXP, level: newLevel })
      },

      // Zone progress: { zone1: { levels: { 1: { completed, stars, attempts }, ... }, bossDefeated } }
      zones: {},
      completeLevel: (zoneId, levelId, stars) => {
        const zones = { ...get().zones }
        if (!zones[zoneId]) zones[zoneId] = { levels: {}, bossDefeated: false }
        const prev = zones[zoneId].levels[levelId]
        zones[zoneId].levels[levelId] = {
          completed: true,
          stars: Math.max(stars, prev?.stars || 0),
          attempts: (prev?.attempts || 0) + 1,
        }
        set({ zones })
      },
      defeatBoss: (zoneId) => {
        const zones = { ...get().zones }
        if (!zones[zoneId]) zones[zoneId] = { levels: {}, bossDefeated: false }
        zones[zoneId].bossDefeated = true
        set({ zones })
      },

      // Knowledge cards collected
      knowledgeCards: [],
      addCard: (cardId) => {
        const cards = get().knowledgeCards
        if (!cards.includes(cardId)) set({ knowledgeCards: [...cards, cardId] })
      },

      // Check if zone is completed (boss defeated)
      isZoneCompleted: (zoneId) => {
        return get().zones[zoneId]?.bossDefeated || false
      },

      // Unlocked zones (zone1 always unlocked, others need previous boss defeated)
      isZoneUnlocked: (zoneId) => {
        const zoneOrder = ['zone1', 'zone2', 'zone3', 'zone4', 'zone5', 'zone6']
        const idx = zoneOrder.indexOf(zoneId)
        if (idx === 0) return true
        const prevZone = zoneOrder[idx - 1]
        return get().zones[prevZone]?.bossDefeated || false
      },

      // Check if a level is unlocked (previous level must be completed, or it's level 1)
      isLevelUnlocked: (zoneId, levelId) => {
        if (levelId === 1) return true
        return get().zones[zoneId]?.levels[levelId - 1]?.completed || false
      },

      // Get stars for a level
      getLevelStars: (zoneId, levelId) => {
        return get().zones[zoneId]?.levels[levelId]?.stars || 0
      },

      // Total stars
      getTotalStars: () => {
        let total = 0
        Object.values(get().zones).forEach(zone => {
          Object.values(zone.levels).forEach(level => {
            total += level.stars || 0
          })
        })
        return total
      },

      // Cutscene tracking
      viewedCutscenes: [],
      markCutsceneSeen: (cutsceneId) => {
        const viewed = get().viewedCutscenes
        if (!viewed.includes(cutsceneId)) {
          set({ viewedCutscenes: [...viewed, cutsceneId] })
        }
      },
      hasCutsceneSeen: (cutsceneId) => {
        return get().viewedCutscenes.includes(cutsceneId)
      },

      // Reset
      reset: () => set({ character: null, xp: 0, level: 1, zones: {}, knowledgeCards: [], viewedCutscenes: [] }),
    }),
    { name: 'mathquest-progress' }
  )
)

export default useGameStore
