import { useCategoryStore } from '../stores/categoryStore'
import { useEventStore } from '../stores/eventStore'

export function useCategories() {
  const categories = useCategoryStore((state) => state.categories)
  const selectedCategory = useCategoryStore((state) => state.selectedCategory)
  const setSelectedCategoryState = useCategoryStore((state) => state.setSelectedCategory)
  const setCategoryFilter = useEventStore((state) => state.setCategoryFilter)

  const setSelectedCategory = (category: string) => {
    setSelectedCategoryState(category)
    setCategoryFilter(category)
  }

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
  }
}
