import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, ArrowLeft, User } from 'lucide-react'
import { toast } from 'sonner'
import { useEventStore } from '../stores/eventStore'
import { useAuthStore } from '../stores/authStore'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  'Tecnología': 'primary',
  'Educación': 'success',
  'Deportes': 'warning',
  'Música': 'error',
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { events, loadEvents, enrollInEvent, cancelEnrollment, isUserEnrolled } = useEventStore()
  const { user } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (events.length === 0) loadEvents()
  }, [events, loadEvents])

  const evento = events.find((e) => e.id === id)
  const enrolled = user && id ? isUserEnrolled(id, user.id) : false

  if (!evento) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">📭</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Evento no encontrado</h1>
        <p className="text-slate-500 mb-6">Este evento no existe o fue eliminado.</p>
        <Button onClick={() => navigate('/eventos')}>
          <ArrowLeft size={16} className="mr-2" /> Volver al Catálogo
        </Button>
      </div>
    )
  }

  const eventDate = new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const spotsPercent = Math.round((evento.cupos_disponibles / evento.cupos_totales) * 100)
  const isFull = evento.cupos_disponibles === 0
  const isAlmostFull = spotsPercent < 25 && !isFull

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    setIsProcessing(true)
    const result = await enrollInEvent(evento.id, user.id)
    setIsProcessing(false)
    if (result.success) {
      toast.success('¡Inscripción exitosa! 🎉', {
        description: `Te has registrado en "${evento.titulo}"`,
      })
    } else {
      toast.error(result.error || 'Error al inscribirse')
    }
  }

  const handleCancel = async () => {
    if (!user) return
    setIsProcessing(true)
    const result = await cancelEnrollment(evento.id, user.id)
    setIsProcessing(false)
    if (result.success) {
      toast.info('Inscripción cancelada', { description: 'Puedes volver a inscribirte cuando quieras.' })
    } else {
      toast.error(result.error || 'Error al cancelar')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary font-semibold mb-6 transition-colors"
        id="back-btn"
      >
        <ArrowLeft size={16} /> Volver al catálogo
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagen hero */}
          <div className="relative rounded-2xl overflow-hidden h-72 sm:h-96 bg-slate-200 shadow-lg">
            <img
              src={evento.imagen}
              alt={evento.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <Badge variant={categoryColors[evento.categoria] ?? 'neutral'} className="text-sm px-3 py-1">
                {evento.categoria}
              </Badge>
            </div>
          </div>

          {/* Título y organizer */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
              {evento.titulo}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <User size={15} className="text-primary" />
              <span>Organizado por <strong className="text-slate-700">{evento.organizador_nombre}</strong></span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3">Sobre este evento</h2>
            <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
              {evento.descripcion}
            </p>
          </div>
        </div>

        {/* Panel lateral */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Detalles del Evento</h2>

            {/* Info */}
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Fecha</p>
                  <p className="capitalize">{eventDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Hora</p>
                  <p>{evento.hora} hrs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Ubicación</p>
                  <p>{evento.ubicacion}</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Cupos */}
            <div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Users size={14} /> Cupos disponibles
                </span>
                <span className={cn(
                  "font-bold text-base",
                  isFull ? "text-error" : isAlmostFull ? "text-amber-600" : "text-emerald-600"
                )}>
                  {evento.cupos_disponibles} / {evento.cupos_totales}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isFull ? "bg-error" : isAlmostFull ? "bg-amber-400" : "bg-emerald-500"
                  )}
                  style={{ width: `${100 - spotsPercent}%` }}
                />
              </div>
              {isAlmostFull && !isFull && (
                <p className="text-xs text-amber-600 font-semibold mt-1">¡Últimos cupos disponibles!</p>
              )}
              {isFull && (
                <p className="text-xs text-error font-semibold mt-1">Evento con cupo completo</p>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Acción inscripción */}
            {enrolled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-600 text-lg">✓</span>
                  <p className="text-sm font-semibold text-emerald-700">¡Estás inscrito en este evento!</p>
                </div>
                <Button
                  variant="danger"
                  size="md"
                  className="w-full"
                  id="cancel-enrollment-btn"
                  isLoading={isProcessing}
                  onClick={handleCancel}
                >
                  Cancelar Inscripción
                </Button>
              </div>
            ) : isFull ? (
              <Button variant="secondary" size="lg" className="w-full cursor-not-allowed" disabled>
                Evento Agotado
              </Button>
            ) : !user ? (
              <div className="space-y-2">
                <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/login')} id="login-to-enroll-btn">
                  Iniciar Sesión para Inscribirse
                </Button>
                <p className="text-xs text-center text-slate-400">¿No tienes cuenta? <button onClick={() => navigate('/register')} className="text-primary font-semibold hover:underline">Regístrate gratis</button></p>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                id="enroll-btn"
                isLoading={isProcessing}
                onClick={handleEnroll}
              >
                Inscribirme al Evento 🎟️
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
