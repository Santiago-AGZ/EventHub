import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function MyEvents() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { events, loadEvents, cancelEnrollment, getUserEnrollments, isLoading } = useEventStore()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  if (!user) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center animate-fade-in-up">
        <h2 className="mb-2 text-2xl font-bold">Acceso Restringido</h2>
        <p className="mb-6 text-muted-foreground">Inicia sesión para ver tus inscripciones.</p>
        <Button onClick={() => navigate('/login')} className="btn-press">Iniciar Sesión</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-8 h-12 w-72 rounded-lg" />
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const enrolledEvents = getUserEnrollments()
  const upcoming = enrolledEvents.filter(e => new Date(e.fecha_inicio) >= new Date()).length
  const past = enrolledEvents.length - upcoming

  const handleCancel = async (eventId: string) => {
    setIsProcessing(true)
    const result = await cancelEnrollment(eventId)
    setIsProcessing(false)
    if (result.success) {
      toast.info('Inscripción cancelada correctamente')
    } else {
      toast.error(result.error || 'Error al cancelar')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between animate-fade-in-up">
        <div>
          <p className="mb-1 text-sm font-bold uppercase tracking-widest text-primary">Panel del Estudiante</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Mis Inscripciónes</h1>
          <p className="mt-2 max-w-[65ch] text-muted-foreground">Lleva el seguimiento de todos los eventos en los que estas registrado.</p>
        </div>
        <div className="hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm sm:flex">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.nombre}`}
            alt={`Avatar de ${user.nombre}`}
            className="size-10 rounded-full border border-border"
          />
          <div>
            <p className="text-sm font-bold leading-none">{user.nombre}</p>
            <p className="text-xs text-muted-foreground">{user.rol}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 animate-stagger">
        {[{ value: enrolledEvents.length, label: 'Eventos registrados', color: 'text-primary' },
          { value: upcoming, label: 'Próximos', color: 'text-success' },
          { value: past, label: 'Ya realizados', color: 'text-muted-foreground' }].map(({ value, label, color }) => (
          <Card key={label} className="card-hover border-border text-center animate-fade-in-up">
            <CardContent className="p-5">
              <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {enrolledEvents.length === 0 ? (
        <Card className="card-hover animate-fade-in-up border-dashed text-center">
          <CardContent className="flex flex-col items-center py-24">
            <Users size={48} className="mb-4 text-muted-foreground/30" />
            <p className="mb-2 text-lg font-semibold">No tienes inscripciones todavia</p>
            <p className="mb-6 max-w-[65ch] text-sm text-muted-foreground">Explora el catálogo y unete a los eventos que mas te interesen.</p>
            <Button onClick={() => navigate('/eventos')} className="btn-press">Explorar Eventos</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4 animate-stagger" aria-live="polite">
          {enrolledEvents.map((evento) => {
            const eventDate = new Date(evento.fecha_inicio)
            const isPast = eventDate < new Date()
            return (
              <Card key={evento.id} className={cn("card-hover group border-border animate-fade-in-up", isPast && "opacity-50")}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-36">
                    <img
                      src={evento.imagen_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'}
                      alt={evento.titulo}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {evento.categoria && <Badge variant="secondary">{evento.categoria.nombre}</Badge>}
                      {isPast ? <Badge variant="outline">Finalizado</Badge> : <Badge>Proximo</Badge>}
                    </div>
                    <h3 className="mb-2 line-clamp-1 text-base font-bold">{evento.titulo}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {eventDate.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {eventDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {evento.ubicacion}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/eventos/${evento.id}`)} className="btn-press">Ver Detalles</Button>
                    {!isPast && (
                      <Button variant="destructive" size="sm" disabled={isProcessing} onClick={() => handleCancel(evento.id)} className="btn-press">Cancelar</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

