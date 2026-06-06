import { useEventStore } from '@/stores/eventStore'

export function useCategories() {
  const categories = useEventStore((s) => s.categories)
  const loadCategories = useEventStore((s) => s.loadCategories)

  return { categories, loadCategories }
}
