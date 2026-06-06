import { useEventStore } from '@/stores/eventStore'

export function useEvents() {
  return useEventStore()
}
