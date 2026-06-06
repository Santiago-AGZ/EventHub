import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, ArrowLeft, User, Check } from 'lucide-react'
import { GalleryCarousel } from '@/components/GalleryCarousel'
import { toast } from 'sonner'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { Evento } from '@/lib/types'

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { events, loadEvents, enrollInEvent, cancelEnrollment, isUserEnrolled, isLoading } = useEventStore()
  const { user } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const evento = useMemo(() => events.find(e => e.id === id), [events, id])

  useEffect(() => {
    if (events.length === 0) loadEvents()
  }, [loadEvents, events.length])

  if (isLoading && !evento) {
    return (
      <div className="mx-auto max-w-5xl flex flex-col gap-6 px-4 py-10">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="animate-fade-in-up flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center" style={{ animationDelay: '0ms' }}>
        <h1 className="mb-2 text-2xl font-bold">Evento no encontrado</h1>
        <p className="mb-6 text-muted-foreground">Este evento no existe o fue eliminado.</p>
        <Button className="btn-press" onClick={() => navigate('/eventos')}>
          <ArrowLeft size={16} data-icon="inline-start" /> Volver al Catálogo
        </Button>
      </div>
    )
  }

  const enrolled = user ? isUserEnrolled(evento.id) : false
  const max = evento.max_inscritos ?? 0
  const cupos = evento.cupos_disponibles ?? max
  const spotsPercent = max > 0 ? Math.round((cupos / max) * 100) : 100
  const isFull = max > 0 && cupos <= 0
  const isAlmostFull = !isFull && max > 0 && spotsPercent < 25

  const fecha = new Date(evento.fecha_inicio)
  const eventDate = fecha.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const eventTime = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    setIsProcessing(true)
    const result = await enrollInEvent(evento.id)
    setIsProcessing(false)
    if (result.success) {
      toast.success('¡Inscripción confirmada!', { description: `Bienvenido a "${evento.titulo}". Te esperamos en el evento.` })
    } else {
      toast.error(result.error || 'No se pudo completar la inscripción. Revisa que haya cupos disponibles o inténtalo más tarde.')
    }
  }

  const handleCancel = async () => {
    if (!user) return
    setIsProcessing(true)
    const result = await cancelEnrollment(evento.id)
    setIsProcessing(false)
    if (result.success) {
      toast.success('Inscripción cancelada. Si cambias de opinión, puedes volver a inscribirte mientras haya cupo.')
    } else {
      toast.error(result.error || 'No se pudo cancelar la inscripción. Intenta de nuevo o contacta al organizador.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="btn-press mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground rounded-md focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft size={16} /> Volver al catálogo
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <GalleryCarousel
            images={evento.imagenes?.length ? evento.imagenes : evento.imagen_url ? [{ url: evento.imagen_url, orden: 0 }] : []}
            title={evento.titulo}
            categoria={evento.categoria?.nombre}
          />

          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h1 className="mb-3 text-2xl font-extrabold leading-tight sm:text-3xl">{evento.titulo}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User size={15} className="text-primary" />
              <span>Organizado por <strong className="text-foreground">{evento.creador?.nombre || 'Organizador'}</strong></span>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="mb-3 text-lg font-bold">Sobre este evento</h2>
            <p className="max-w-[65ch] whitespace-pre-wrap leading-relaxed text-muted-foreground">{evento.descripcion}</p>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <Card className="animate-fade-in-up sticky top-24 flex flex-col gap-5" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-6 pt-6">
              <h2 className="text-lg font-bold">Detalles del Evento</h2>

              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Fecha</p>
                    <p className="capitalize">{eventDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Hora</p>
                    <p>{eventTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Ubicacion</p>
                    <p>{evento.ubicacion}</p>
                  </div>
                </div>
              </div>

              {max > 0 && (
                <>
                  <Separator />
                  <div aria-live="polite">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <Users size={14} /> Cupos disponibles
                      </span>
                      <span className={cn(
                        "text-base font-bold",
                        isFull ? 'text-destructive' : isAlmostFull ? 'text-warning' : 'text-success'
                      )}>
                        {cupos} / {max}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className={cn(
                        "h-full rounded-full transition-[width,background-color]",
                        isFull ? 'bg-destructive' : isAlmostFull ? 'bg-warning' : 'bg-success'
                      )}
                        style={{ width: `${100 - spotsPercent}%` }}
                      />
                    </div>
                    {isAlmostFull && <p className="mt-1 text-xs font-semibold text-warning">Ultimos cupos disponibles</p>}
                    {isFull && <p className="mt-1 text-xs font-semibold text-destructive">Evento con cupo completo</p>}
                  </div>
                </>
              )}

              <Separator />

              {enrolled ? (
                <div className="flex flex-col gap-3" aria-live="polite">
                  <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3">
                    <Check size={18} className="text-success" />
                    <p className="text-sm font-semibold text-success">Estas inscrito en este evento</p>
                  </div>
                  <Button variant="destructive" className="btn-press w-full" disabled={isProcessing} onClick={() => setShowCancelDialog(true)}>
                    Cancelar Inscripción
                  </Button>
                  <AlertDialog
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                    title="Cancelar inscripción"
                    description="¿Estás seguro? Perderás tu cupo en este evento y podría estar ocupado por otro estudiante."
                    confirmLabel="Sí, cancelar"
                    cancelLabel="No, mantener"
                    onConfirm={handleCancel}
                    variant="destructive"
                  />
                </div>
              ) : isFull ? (
                <Button variant="secondary" className="w-full" disabled>Evento Agotado</Button>
              ) : !user ? (
                <div className="flex flex-col gap-2">
                  <Button className="btn-press w-full group relative overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-300" onClick={() => navigate('/login')}>
                    Iniciar Sesión para Inscribirse
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    No tienes cuenta?{' '}
                    <Link to="/register" className="rounded-sm font-semibold text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                      Registrate gratis
                    </Link>
                  </p>
                </div>
              ) : (
                <Button className="btn-press w-full group relative overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-300" disabled={isProcessing} onClick={handleEnroll}>
                  Inscribirme al Evento
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

