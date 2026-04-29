import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '../types'

interface AppState {
  // 搜索历史
  searchHistory: string[]
  addSearchHistory: (term: string) => void
  clearSearchHistory: () => void

  // 收藏
  favorites: string[]
  toggleFavorite: (char: string) => void
  isFavorite: (char: string) => boolean

  // 学习进度
  learnedChars: Set<string>
  markAsLearned: (char: string) => void

  // 设置
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      searchHistory: [],
      addSearchHistory: (term) => {
        const { searchHistory } = get()
        const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 10)
        set({ searchHistory: newHistory })
      },
      clearSearchHistory: () => set({ searchHistory: [] }),

      favorites: [],
      toggleFavorite: (char) => {
        const { favorites } = get()
        const isFav = favorites.includes(char)
        set({
          favorites: isFav
            ? favorites.filter(c => c !== char)
            : [...favorites, char]
        })
      },
      isFavorite: (char) => get().favorites.includes(char),

      learnedChars: new Set(),
      markAsLearned: (char) => {
        const { learnedChars } = get()
        learnedChars.add(char)
        set({ learnedChars: new Set(learnedChars) })
      },

      settings: {
        autoPlay: true,
        animationSpeed: 1,
        showPinyin: true,
        showGuideLines: true,
      },
      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } })
      },
    }),
    {
      name: 'kids-writing-storage',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        favorites: state.favorites,
        learnedChars: Array.from(state.learnedChars),
        settings: state.settings,
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        learnedChars: new Set(persisted.learnedChars || []),
      }),
    }
  )
)
