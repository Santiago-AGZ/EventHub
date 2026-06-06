import { create } from 'zustand'
import { supabase } from '../services/supabase'
import type { Evento, Categoria, EventoFormData, EventoFilters, EventoImagen } from '../lib/types'

interface RawEvento {
  id: string
  creador_id: string
  categoria_id: string | null
  titulo: string
  descripcion: string
  fecha_inicio: string
  ubicacion: string
  max_inscritos: number | null
  imagen_url: string | null
  imagenes: unknown
  estado: string
  created_at: string
  updated_at: string
  inscritos_count: number
  categoria: Categoria | null
  inscripciones: { usuario_id: string }[] | undefined
  creador?: { id: string; nombre: string }
}

interface EventStoreState {
  events: Evento[]
  categories: Categoria[]
  filters: EventoFilters
  userEnrollments: string[]
  isLoading: boolean

  setSearchQuery: (query: string) => void
  setCategoryFilter: (category: string) => void
  setSortByDate: (order: 'asc' | 'desc') => void
  loadEvents: () => Promise<void>
  loadCategories: () => Promise<void>
  createEvent: (data: EventoFormData) => Promise<{ success: boolean; error?: string }>
  enrollInEvent: (eventId: string) => Promise<{ success: boolean; error?: string }>
  cancelEnrollment: (eventId: string) => Promise<{ success: boolean; error?: string }>
  getUserEnrollments: () => Evento[]
  isUserEnrolled: (eventId: string) => boolean
  subscribeToEvents: () => () => void
  getCategoriesStats: () => { nombre: string; cantidad: number; color: string }[]
}

function parseImagenes(raw: unknown): EventoImagen[] {
  if (Array.isArray(raw)) return raw as EventoImagen[]
  return []
}

function mapEvento(evt: RawEvento): Evento {
  const inscritosCount = evt.inscritos_count ?? 0
  const max = evt.max_inscritos ?? 0
  return {
    ...evt,
    imagenes: parseImagenes(evt.imagenes),
    estado: evt.estado as Evento['estado'],
    categoria: evt.categoria ?? undefined,
    inscripciones: evt.inscripciones ?? undefined,
    inscritos_count: inscritosCount,
    cupos_disponibles: max > 0 ? Math.max(0, max - inscritosCount) : max,
  }
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  events: [],
  categories: [],
  filters: { search: '', categoria: 'Todas', sortByDate: 'asc' },
  userEnrollments: [],
  isLoading: true,

  setSearchQuery: (query) => set((s) => ({ filters: { ...s.filters, search: query } })),
  setCategoryFilter: (categoria) => set((s) => ({ filters: { ...s.filters, categoria } })),
  setSortByDate: (order) => set((s) => ({ filters: { ...s.filters, sortByDate: order } })),

  loadCategories: async () => {
    const { data } = await supabase.from('categorias').select('*').order('nombre')
    if (data) set({ categories: data })
  },

  loadEvents: async () => {
    set({ isLoading: true })
    try {
      const { sortByDate } = get().filters

      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          categoria:categorias(id, nombre, descripcion, color, created_at),
          inscripciones(usuario_id)
        `)
        .order('fecha_inicio', { ascending: sortByDate === 'asc' })

      if (error) throw error

      const rawEvents = (data || []) as RawEvento[]

      const creatorIds = [...new Set(rawEvents.map((e) => e.creador_id).filter(Boolean))]
      let creadorMap = new Map<string, { id: string; nombre: string }>()
      if (creatorIds.length > 0) {
        const { data: perfiles } = await supabase
          .from('perfiles')
          .select('id, nombre')
          .in('id', creatorIds)
        if (perfiles) {
          perfiles.forEach((p) => creadorMap.set(p.id, p))
        }
      }

      const eventsWithCreators = rawEvents.map((evt) => ({
        ...evt,
        creador: evt.creador_id ? creadorMap.get(evt.creador_id) ?? undefined : undefined,
      }))

      const events = eventsWithCreators.map(mapEvento)

      const enrolledIds: string[] = events
        .filter((evt) => evt.inscripciones && evt.inscripciones.length > 0)
        .map((evt) => evt.id)
      set({ events, userEnrollments: enrolledIds, isLoading: false })
    } catch (err) {
      console.error('Error loading events:', err instanceof Error ? err.message : String(err))
      set({ isLoading: false })
    }
  },

  getCategoriesStats: () => {
    const events = get().events
    const categories = get().categories
    return categories.reduce<{ nombre: string; cantidad: number; color: string }[]>((acc, cat) => {
      const cantidad = events.filter((e) => e.categoria?.nombre === cat.nombre).length
      if (cantidad > 0) acc.push({ nombre: cat.nombre, cantidad, color: cat.color })
      return acc
    }, [])
  },

  createEvent: async (formData) => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return { success: false, error: 'Para realizar esta acción debes iniciar sesión primero.' }

    const insertData: Record<string, unknown> = {
      creador_id: user.id,
      categoria_id: formData.categoria_id || null,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha_inicio: formData.fecha_inicio,
      ubicacion: formData.ubicacion,
      max_inscritos: formData.max_inscritos,
      imagen_url: formData.imagen_url,
      imagenes: formData.imagenes ?? (formData.imagen_url ? [{ url: formData.imagen_url, orden: 0 }] : []),
      estado: 'activo',
    }

    try {
      const { error } = await supabase.from('eventos').insert([insertData])

      if (error) throw error
      await get().loadEvents()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error al crear el evento' }
    }
  },

  enrollInEvent: async (eventId) => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return { success: false, error: 'Para realizar esta acción debes iniciar sesión primero.' }

    try {
      const { error } = await supabase
        .from('inscripciones')
        .insert([{ evento_id: eventId, usuario_id: user.id }])

      if (error) throw error

      set((s) => ({ userEnrollments: [...s.userEnrollments, eventId] }))
      await get().loadEvents()
      return { success: true }
    } catch (err) {
      console.error('Error al inscribirse:', err instanceof Error ? err.message : String(err))
      return { success: false, error: 'No pudimos completar la inscripción. Intenta de nuevo más tarde.' }
    }
  },

  cancelEnrollment: async (eventId) => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return { success: false, error: 'Para realizar esta acción debes iniciar sesión primero.' }

    try {
      const { error } = await supabase
        .from('inscripciones')
        .delete()
        .eq('evento_id', eventId)
        .eq('usuario_id', user.id)

      if (error) throw error

      set((s) => ({ userEnrollments: s.userEnrollments.filter((id) => id !== eventId) }))
      await get().loadEvents()
      return { success: true }
    } catch (err) {
      console.error('Error al cancelar inscripción:', err instanceof Error ? err.message : String(err))
      return { success: false, error: 'No pudimos cancelar tu inscripción. Intenta de nuevo más tarde.' }
    }
  },

  getUserEnrollments: () => {
    return get().events.filter((e) => get().userEnrollments.includes(e.id))
  },

  isUserEnrolled: (eventId) => {
    return get().userEnrollments.includes(eventId)
  },

  subscribeToEvents: () => {
    const channel = supabase
      .channel('eventos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos' },
        () => { get().loadEvents() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inscripciones' },
        () => { get().loadEvents() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  },
}))
