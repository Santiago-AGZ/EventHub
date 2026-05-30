import { useMemo } from 'react'
import { useEventStore } from '../stores/eventStore'

export function useEvents() {
  const events = useEventStore((state) => state.events)
  const searchQuery = useEventStore((state) => state.searchQuery)
  const categoryFilter = useEventStore((state) => state.categoryFilter)
  const sortByDate = useEventStore((state) => state.sortByDate)
  const isLoading = useEventStore((state) => state.isLoading)
  
  const setSearchQuery = useEventStore((state) => state.setSearchQuery)
  const setCategoryFilter = useEventStore((state) => state.setCategoryFilter)
  const setSortByDate = useEventStore((state) => state.setSortByDate)
  const loadEvents = useEventStore((state) => state.loadEvents)
  const createEvent = useEventStore((state) => state.createEvent)
  const enrollInEvent = useEventStore((state) => state.enrollInEvent)
  const cancelEnrollment = useEventStore((state) => state.cancelEnrollment)
  const getUserEnrollments = useEventStore((state) => state.getUserEnrollments)
  const isUserEnrolled = useEventStore((state) => state.isUserEnrolled)

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const matchesSearch =
          event.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.ubicacion.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesCategory =
          categoryFilter === 'Todos' || event.categoria === categoryFilter

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha).getTime()
        const dateB = new Date(b.fecha).getTime()
        return sortByDate === 'asc' ? dateA - dateB : dateB - dateA
      })
  }, [events, searchQuery, categoryFilter, sortByDate])

  return {
    events,
    filteredEvents,
    searchQuery,
    categoryFilter,
    sortByDate,
    isLoading,
    setSearchQuery,
    setCategoryFilter,
    setSortByDate,
    loadEvents,
    createEvent,
    enrollInEvent,
    cancelEnrollment,
    getUserEnrollments,
    isUserEnrolled,
  }
}
