import { create } from 'zustand'
import { EVENT_CATEGORIES } from '../lib/constants'

interface CategoryState {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: ['Todos', ...EVENT_CATEGORIES.map((c) => c.value)],
  selectedCategory: 'Todos',
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
}))
