import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpDown, X } from 'lucide-react'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function Events() {
  const { events, loadEvents, isLoading, filters, setSearchQuery, setCategoryFilter, setSortByDate, categories, loadCategories, isUserEnrolled } = useEventStore()
  const { user } = useAuthStore()
  const sortByDate = filters.sortByDate

  useEffect(() => {
    loadEvents()
    loadCategories()
  }, [loadEvents, loadCategories])

  const filteredEvents = useMemo(() => {
    const q = filters.search.toLowerCase().trim()
    const cat = filters.categoria

    const result = events.reduce<typeof events>((acc, e) => {
      if (q && !e.titulo.toLowerCase().includes(q) && !e.descripcion.toLowerCase().includes(q) && !e.ubicacion.toLowerCase().includes(q)) {
        return acc
      }
      if (cat !== 'Todas' && e.categoria?.nombre !== cat) {
        return acc
      }
      return [...acc, e]
    }, [])

    result.sort((a, b) => {
      const diff = new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
      return sortByDate === 'asc' ? diff : -diff
    })
    return result
  }, [events, filters, sortByDate])

  const hasActiveFilters = filters.search || filters.categoria !== 'Todas'

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="animate-fade-in-up mb-1 text-sm font-bold uppercase tracking-widest text-primary" style={{ animationDelay: '0ms' }}>Catálogo completo</p>
        <h1 className="animate-fade-in-up text-3xl font-extrabold sm:text-4xl" style={{ animationDelay: '80ms' }}>Explorar Eventos</h1>
        <p className="animate-fade-in-up mt-2 max-w-[65ch] text-muted-foreground" style={{ animationDelay: '160ms' }}>Encuentra el evento perfecto para ti</p>
      </div>

      <div className="animate-fade-in-up mb-6 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '0ms' }}>
        <div className="flex-1">
          <label htmlFor="search-events" className="sr-only">Buscar eventos</label>
          <Input
            id="search-events"
            placeholder="Buscar por nombre, categoria, lugar..."
            value={filters.search}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="transition-shadow duration-300 focus:shadow-lg focus:shadow-primary/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="shrink-0 text-muted-foreground" />
          <label htmlFor="sort-events" className="sr-only">Ordenar por fecha</label>
          <select
            id="sort-events"
            value={sortByDate}
            onChange={(e) => setSortByDate(e.target.value as 'asc' | 'desc')}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:shadow-lg focus:shadow-primary/10"
          >
            <option value="asc">Mas próximos primero</option>
            <option value="desc">Mas lejanos primero</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button
          variant={filters.categoria === 'Todas' ? 'default' : 'outline'}
          size="sm"
          className="btn-press"
          onClick={() => setCategoryFilter('Todas')}
        >
          Todas
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={filters.categoria === cat.nombre ? 'default' : 'outline'}
            size="sm"
            className="btn-press"
            onClick={() => setCategoryFilter(cat.nombre)}
          >
            {cat.nombre}
          </Button>
        ))}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="btn-press"
            onClick={() => { setSearchQuery(''); setCategoryFilter('Todas') }}
          >
            <X size={14} data-icon="inline-start" /> Limpiar filtros
          </Button>
        )}
      </div>

      <p className="mb-6 text-sm font-medium text-muted-foreground" aria-live="polite">
        {isLoading ? 'Cargando eventos...' : (
          <><span className="font-bold text-foreground">{filteredEvents.length}</span> evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}</>
        )}
      </p>

      <div aria-live="polite">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="animate-fade-in-up flex flex-col items-center justify-center py-24 text-center" style={{ animationDelay: '0ms' }}>
            <h2 className="mb-2 text-lg font-semibold">Sin resultados</h2>
            <p className="text-sm text-muted-foreground">Intenta buscar con otras palabras o cambia la categoria.</p>
          </div>
        ) : (
          <div className="animate-stagger grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((evento) => {
              const enrolled = user ? isUserEnrolled(evento.id) : false
              return (
                <article key={evento.id} className="rounded-2xl">
                  <Link to={`/eventos/${evento.id}`} className="block rounded-2xl focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]" aria-label={`Ver detalles de ${evento.titulo}`}>
                    <Card className={cn(
                      "card-hover group h-full overflow-hidden",
                      enrolled && "ring-2 ring-primary/30"
                    )}>
                      <div className="relative h-44 overflow-hidden bg-muted">
                        <img
                          src={evento.imagenes[0]?.url || evento.imagen_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'}
                          alt={evento.titulo}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {evento.categoria && (
                            <Badge variant="secondary" className="text-xs">{evento.categoria.nombre}</Badge>
                          )}
                          {enrolled && <Badge className="text-xs">Inscrito</Badge>}
                        </div>
                        {evento.estado === 'cancelado' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                            <Badge variant="destructive">Cancelado</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-1 line-clamp-2 font-bold leading-tight">{evento.titulo}</h3>
                        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{evento.descripcion}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(evento.fecha_inicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: '2-digit' })}
                            {' '}&middot;{' '}
                            {new Date(evento.fecha_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {evento.cupos_disponibles !== undefined && evento.max_inscritos && (
                            <span className={cn(
                              "text-xs font-medium",
                              evento.cupos_disponibles === 0 ? 'text-destructive' : evento.cupos_disponibles < (evento.max_inscritos * 0.25) ? 'text-warning' : 'text-primary'
                            )}>
                              {evento.cupos_disponibles}/{evento.max_inscritos}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

