import React, { useEffect, useState, useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { EventCard } from '../components/events/EventCard'
import { useAuthStore } from '../stores/authStore'
import { Input } from '../components/ui/Input'
import { cn } from '../lib/utils'
import { CategoryFilter } from '../components/events/CategoryFilter'

const CATEGORIES = ['Todos', 'Tecnología', 'Educación', 'Deportes', 'Música']

export function Events() {
  const { events, loadEvents, isLoading, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter } = useEventStore()
  const { user } = useAuthStore()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Filtrado y búsqueda en tiempo real
  const filteredEvents = useMemo(() => {
    let result = [...events]

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.titulo.toLowerCase().includes(q) ||
          e.descripcion.toLowerCase().includes(q) ||
          e.ubicacion.toLowerCase().includes(q) ||
          e.organizador_nombre.toLowerCase().includes(q)
      )
    }

    // Filtro por categoría
    if (categoryFilter !== 'Todos') {
      result = result.filter((e) => e.categoria === categoryFilter)
    }

    // Ordenamiento por fecha
    result.sort((a, b) => {
      const diff = new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      return sortOrder === 'asc' ? diff : -diff
    })

    return result
  }, [events, searchQuery, categoryFilter, sortOrder])

  const enrolledIds = useMemo(() => {
    if (!user) return new Set<string>()
    const raw = localStorage.getItem('eventhub_enrollments')
    if (!raw) return new Set<string>()
    const enrollments: Record<string, string[]> = JSON.parse(raw)
    return new Set(enrollments[user.id] || [])
  }, [user, events])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabecera */}
      <div className="mb-8">
        <p className="text-primary font-bold text-sm uppercase tracking-widest mb-1">Catálogo completo</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Explorar Eventos</h1>
        <p className="text-slate-500 mt-2">Encuentra el evento perfecto para ti</p>
      </div>

      {/* Barra de búsqueda + ordenamiento */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            id="search-events"
            placeholder="Buscar por nombre, categoría, lugar..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar eventos"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-400 shrink-0" />
          <select
            id="sort-events"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Ordenar por fecha"
          >
            <option value="asc">Más próximos primero</option>
            <option value="desc">Más lejanos primero</option>
          </select>
        </div>
      </div>

      {/* Tabs de categorías */}
      <CategoryFilter
        categories={CATEGORIES}
        activeCategory={categoryFilter}
        onSelect={setCategoryFilter}
        showClear={!!(searchQuery || categoryFilter !== 'Todos')}
        onClear={() => {
          setSearchQuery('')
          setCategoryFilter('Todos')
        }}
      />

      {/* Contador de resultados */}
      <p className="text-sm text-slate-500 mb-6 font-medium" aria-live="polite">
        {isLoading ? 'Cargando eventos...' : (
          <>
            <span className="text-slate-800 font-bold">{filteredEvents.length}</span>{' '}
            evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
            {searchQuery && <> para <em className="text-primary">"{searchQuery}"</em></>}
          </>
        )}
      </p>

      {/* Grid de eventos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-slate-600 text-lg font-semibold mb-2">Sin resultados</p>
          <p className="text-slate-400 text-sm">Intenta buscar con otras palabras o cambia la categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((evento) => (
            <EventCard
              key={evento.id}
              evento={evento}
              isEnrolled={enrolledIds.has(evento.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
