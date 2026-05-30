import { create } from 'zustand'
import type { Evento } from '../lib/constants'
import { INITIAL_MOCK_EVENTS } from '../lib/constants'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { useAuthStore } from './authStore'

interface EventStoreState {
  events: Evento[]
  searchQuery: string
  categoryFilter: string
  sortByDate: 'asc' | 'desc'
  isLoading: boolean
  userEnrollments: string[]
  categoriesDb: { id: string; nombre: string; color: string }[]
  
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
  userEnrollments: [],
  categoriesDb: [],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setSortByDate: (order) => set({ sortByDate: order }),

  loadEvents: async () => {
    set({ isLoading: true })
    
    // MODO REAL SUPABASE
    if (isSupabaseConfigured) {
      try {
        // 1. Cargar Categorías
        const { data: catData } = await supabase
          .from('categorias')
          .select('*')

        if (catData) {
          set({ categoriesDb: catData })
        }

        // 2. Cargar Eventos con Relaciones
        const { data, error } = await supabase
          .from('eventos')
          .select(`
            *,
            creador:perfiles(id, nombre),
            categoria:categorias(id, nombre, color),
            inscripciones(usuario_id)
          `)
          .order('fecha_inicio', { ascending: get().sortByDate === 'asc' })
        
        if (error) throw error
        
        if (data) {
          const mappedEvents: Evento[] = data.map((evt: any) => {
            const fechaInicioStr = evt.fecha_inicio || ''
            const fecha = fechaInicioStr.split('T')[0] || ''
            const hora = (fechaInicioStr.split('T')[1] || '').substring(0, 5) || ''
            
            const enrollmentsCount = evt.inscripciones ? evt.inscripciones.length : 0
            const cuposDisponibles = Math.max(0, evt.max_inscritos - enrollmentsCount)

            return {
              id: evt.id,
              titulo: evt.titulo,
              descripcion: evt.descripcion,
              fecha,
              hora,
              ubicacion: evt.ubicacion,
              categoria: (evt.categoria?.nombre || 'Tecnología') as any,
              imagen: evt.imagen_url || '',
              organizador_id: evt.creador_id || '',
              organizador_nombre: evt.creador?.nombre || 'Organizador',
              cupos_totales: evt.max_inscritos || 0,
              cupos_disponibles: cuposDisponibles,
              creado_en: evt.created_at || '',
              creador_id: evt.creador_id,
              categoria_id: evt.categoria_id,
              estado: evt.estado
            }
          })

          // 3. Cargar Inscripciones del usuario activo
          const currentUser = useAuthStore.getState().user
          if (currentUser) {
            const { data: enrollmentsData } = await supabase
              .from('inscripciones')
              .select('evento_id')
              .eq('usuario_id', currentUser.id)
            
            if (enrollmentsData) {
              set({ userEnrollments: enrollmentsData.map((e: any) => e.evento_id) })
            }
          } else {
            set({ userEnrollments: [] })
          }

          set({ events: mappedEvents, isLoading: false })
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

    // MODO REAL SUPABASE
    if (isSupabaseConfigured) {
      try {
        let catObj = get().categoriesDb.find(c => c.nombre === eventData.categoria)
        if (!catObj) {
          const { data: catData } = await supabase
            .from('categorias')
            .select('*')
            .eq('nombre', eventData.categoria)
            .maybeSingle()
          if (catData) catObj = catData
        }

        const dbEvent = {
          creador_id: organizer.id,
          categoria_id: catObj?.id,
          titulo: eventData.titulo,
          descripcion: eventData.descripcion,
          fecha_inicio: `${eventData.fecha}T${eventData.hora}:00Z`,
          ubicacion: eventData.ubicacion,
          max_inscritos: eventData.cupos_totales,
          imagen_url: eventData.imagen || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
          estado: 'activo'
        }

        const { error } = await supabase
          .from('eventos')
          .insert([dbEvent])
        
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
    const newEvent: Evento = {
      ...eventData,
      id: `evt-${Date.now()}`,
      organizador_id: organizer.id,
      organizador_nombre: organizer.nombre,
      cupos_disponibles: eventData.cupos_totales,
      creado_en: new Date().toISOString(),
      imagen: eventData.imagen || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"
    }

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
        const { error } = await supabase
          .from('inscripciones')
          .insert([{ evento_id: eventId, usuario_id: userId }])
        
        if (error) throw error
        
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
          .eq('evento_id', eventId)
          .eq('usuario_id', userId)
        
        if (error) throw error

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
    if (isSupabaseConfigured) {
      return get().events.filter(event => get().userEnrollments.includes(event.id))
    }
    const enrollments = getLocalEnrollments()
    const userEvents = enrollments[userId] || []
    return get().events.filter(event => userEvents.includes(event.id))
  },

  isUserEnrolled: (eventId, userId) => {
    if (isSupabaseConfigured) {
      return get().userEnrollments.includes(eventId)
    }
    const enrollments = getLocalEnrollments()
    const userEvents = enrollments[userId] || []
    return userEvents.includes(eventId)
  }
}))
