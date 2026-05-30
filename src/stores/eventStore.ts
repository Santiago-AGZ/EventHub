import { create } from 'zustand'
import type { Evento } from '../lib/constants'
import { INITIAL_MOCK_EVENTS } from '../lib/constants'
import { supabase, isSupabaseConfigured } from '../services/supabase'

interface EventStoreState {
  events: Evento[]
  searchQuery: string
  categoryFilter: string
  sortByDate: 'asc' | 'desc'
  isLoading: boolean
  
  // Acciones
  setSearchQuery: (query: string) => void
  setCategoryFilter: (category: string) => void
  setSortByDate: (order: 'asc' | 'desc') => void
  loadEvents: () => Promise<void>
  createEvent: (eventData: Omit<Evento, 'id' | 'organizador_id' | 'organizador_nombre' | 'cupos_disponibles' | 'creado_en'>, organizer: { id: string; nombre: string }) => Promise<{ success: boolean; error?: string }>
  enrollInEvent: (eventId: string, userId: string) => Promise<{ success: boolean; error?: string }>
  cancelEnrollment: (eventId: string, userId: string) => Promise<{ success: boolean; error?: string }>
  getUserEnrollments: (userId: string) => Evento[]
  isUserEnrolled: (eventId: string, userId: string) => boolean
}

// Cargar eventos locales del localStorage
const getLocalEvents = (): Evento[] => {
  const events = localStorage.getItem('eventhub_events')
  if (events) {
    return JSON.parse(events)
  } else {
    localStorage.setItem('eventhub_events', JSON.stringify(INITIAL_MOCK_EVENTS))
    return INITIAL_MOCK_EVENTS
  }
}

// Cargar inscripciones locales del localStorage
const getLocalEnrollments = (): Record<string, string[]> => {
  // Estructura: { userId: [eventId1, eventId2] }
  const enrollments = localStorage.getItem('eventhub_enrollments')
  return enrollments ? JSON.parse(enrollments) : {}
}

const saveLocalEnrollments = (enrollments: Record<string, string[]>) => {
  localStorage.setItem('eventhub_enrollments', JSON.stringify(enrollments))
}

const saveLocalEvents = (events: Evento[]) => {
  localStorage.setItem('eventhub_events', JSON.stringify(events))
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  events: [],
  searchQuery: '',
  categoryFilter: 'Todos',
  sortByDate: 'asc',
  isLoading: true,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setSortByDate: (order) => set({ sortByDate: order }),

  loadEvents: async () => {
    set({ isLoading: true })
    
    // MODO REAL SUPABASE
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .order('fecha', { ascending: get().sortByDate === 'asc' })
        
        if (error) throw error
        
        if (data) {
          set({ events: data as Evento[], isLoading: false })
          return
        }
      } catch (err: any) {
        console.error("Error cargando eventos de Supabase, recurriendo a local:", err.message)
      }
    }

    // MODO SIMULADO LOCAL
    await new Promise((resolve) => setTimeout(resolve, 600)) // Simular latencia
    set({ events: getLocalEvents(), isLoading: false })
  },

  createEvent: async (eventData, organizer) => {
    set({ isLoading: true })

    const newEvent: Evento = {
      ...eventData,
      id: `evt-${Date.now()}`,
      organizador_id: organizer.id,
      organizador_nombre: organizer.nombre,
      cupos_disponibles: eventData.cupos_totales,
      creado_en: new Date().toISOString(),
      imagen: eventData.imagen || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"
    }

    // MODO REAL SUPABASE
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('eventos')
          .insert([newEvent])
        
        if (error) throw error
        
        // Recargar eventos
        await get().loadEvents()
        return { success: true }
      } catch (err: any) {
        set({ isLoading: false })
        return { success: false, error: err.message || 'Error al guardar el evento en Supabase.' }
      }
    }

    // MODO SIMULADO LOCAL
    await new Promise((resolve) => setTimeout(resolve, 500))
    const currentEvents = getLocalEvents()
    const updatedEvents = [newEvent, ...currentEvents]
    saveLocalEvents(updatedEvents)
    set({ events: updatedEvents, isLoading: false })
    return { success: true }
  },

  enrollInEvent: async (eventId, userId) => {
    // MODO REAL SUPABASE
    if (isSupabaseConfigured) {
      try {
        // En Supabase, insertaríamos en una tabla intermedia 'inscripciones'
        const { error } = await supabase
          .from('inscripciones')
          .insert([{ event_id: eventId, user_id: userId }])
        
        if (error) throw error
        
        // También restar un cupo en el evento
        const targetEvent = get().events.find(e => e.id === eventId)
        if (targetEvent) {
          await supabase
            .from('eventos')
            .update({ cupos_disponibles: Math.max(0, targetEvent.cupos_disponibles - 1) })
            .eq('id', eventId)
        }

        await get().loadEvents()
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message || 'Error al registrar la inscripción en Supabase.' }
      }
    }

    // MODO SIMULADO LOCAL
    await new Promise((resolve) => setTimeout(resolve, 400))
    const enrollments = getLocalEnrollments()
    const userEvents = enrollments[userId] || []

    if (userEvents.includes(eventId)) {
      return { success: false, error: 'Ya te encuentras registrado en este evento.' }
    }

    // Modificar cupos en el evento
    const currentEvents = getLocalEvents()
    const updatedEvents = currentEvents.map(event => {
      if (event.id === eventId) {
        if (event.cupos_disponibles <= 0) {
          throw new Error('No quedan cupos disponibles para este evento.')
        }
        return { ...event, cupos_disponibles: event.cupos_disponibles - 1 }
      }
      return event
    })

    userEvents.push(eventId)
    enrollments[userId] = userEvents
    
    saveLocalEnrollments(enrollments)
    saveLocalEvents(updatedEvents)
    
    set({ events: updatedEvents })
    return { success: true }
  },

  cancelEnrollment: async (eventId, userId) => {
    // MODO REAL SUPABASE
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('inscripciones')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId)
        
        if (error) throw error

        // Devolver un cupo
        const targetEvent = get().events.find(e => e.id === eventId)
        if (targetEvent) {
          await supabase
            .from('eventos')
            .update({ cupos_disponibles: targetEvent.cupos_disponibles + 1 })
            .eq('id', eventId)
        }

        await get().loadEvents()
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message || 'Error al cancelar la inscripción en Supabase.' }
      }
    }

    // MODO SIMULADO LOCAL
    await new Promise((resolve) => setTimeout(resolve, 400))
    const enrollments = getLocalEnrollments()
    const userEvents = enrollments[userId] || []

    if (!userEvents.includes(eventId)) {
      return { success: false, error: 'No estás registrado en este evento.' }
    }

    // Devolver cupo en el evento
    const currentEvents = getLocalEvents()
    const updatedEvents = currentEvents.map(event => {
      if (event.id === eventId) {
        return { ...event, cupos_disponibles: Math.min(event.cupos_totales, event.cupos_disponibles + 1) }
      }
      return event
    })

    const updatedUserEvents = userEvents.filter(id => id !== eventId)
    enrollments[userId] = updatedUserEvents
    
    saveLocalEnrollments(enrollments)
    saveLocalEvents(updatedEvents)
    
    set({ events: updatedEvents })
    return { success: true }
  },

  getUserEnrollments: (userId) => {
    const enrollments = getLocalEnrollments()
    const userEvents = enrollments[userId] || []
    return get().events.filter(event => userEvents.includes(event.id))
  },

  isUserEnrolled: (eventId, userId) => {
    const enrollments = getLocalEnrollments()
    const userEvents = enrollments[userId] || []
    return userEvents.includes(eventId)
  }
}))
