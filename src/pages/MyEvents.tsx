import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { toast } from 'sonner'
import { useEventStore } from '../stores/eventStore'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/utils'

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  'Tecnología': 'primary', 'Educación': 'success', 'Deportes': 'warning', 'Música': 'error',
}

export function MyEvents() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { events, loadEvents, cancelEnrollment, getUserEnrollments } = useEventStore()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (events.length === 0) loadEvents()
  }, [events, loadEvents])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">🔐</p>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500 mb-6">Inicia sesión para ver tus inscripciones.</p>
        <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
      </div>
    )
  }

  const myEnrolledEvents = getUserEnrollments(user.id)

  const handleCancel = async (eventId: string) => {
    setIsProcessing(true)
    const result = await cancelEnrollment(eventId, user.id)
    setIsProcessing(false)
    setConfirmId(null)
    if (result.success) {
      toast.info('Inscripción cancelada correctamente.')
    } else {
      toast.error(result.error || 'Error al cancelar')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Cabecera */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-1">Panel del Estudiante</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Mis Inscripciones</h1>
          <p className="text-slate-500 mt-2">Lleva el seguimiento de todos los eventos en los que estás registrado.</p>
        </div>
        {/* Avatar del usuario */}
        <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.nombre}`}
            alt=""
            className="w-10 h-10 rounded-full border"
          />
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">{user.nombre}</p>
            <p className="text-xs text-slate-500">{user.rol}</p>
          </div>
        </div>
      </div>

      {/* Contador de inscripciones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-extrabold text-primary">{myEnrolledEvents.length}</p>
          <p className="text-sm text-slate-500 font-medium">Eventos registrados</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-extrabold text-emerald-600">
            {myEnrolledEvents.filter(e => new Date(e.fecha) >= new Date()).length}
          </p>
          <p className="text-sm text-slate-500 font-medium">Próximos</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-extrabold text-slate-400">
            {myEnrolledEvents.filter(e => new Date(e.fecha) < new Date()).length}
          </p>
          <p className="text-sm text-slate-500 font-medium">Ya realizados</p>
        </div>
      </div>

      {/* Lista de eventos inscritos */}
      {myEnrolledEvents.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-6xl mb-4">📋</p>
          <p className="text-slate-600 text-lg font-semibold mb-2">No tienes inscripciones todavía</p>
          <p className="text-slate-400 text-sm mb-6">Explora el catálogo y únete a los eventos que más te interesen.</p>
          <Button onClick={() => navigate('/eventos')} id="go-explore-btn">
            Explorar Eventos →
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {myEnrolledEvents.map((evento) => {
            const eventDate = new Date(evento.fecha + 'T00:00:00')
            const isPast = eventDate < new Date()
            const formatted = eventDate.toLocaleDateString('es-CO', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
            })

            return (
              <article
                key={evento.id}
                className={cn(
                  "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow",
                  isPast && "opacity-60"
                )}
              >
                {/* Imagen */}
                <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={evento.imagen}
                    alt={evento.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={categoryColors[evento.categoria] ?? 'neutral'}>{evento.categoria}</Badge>
                      {isPast && <Badge variant="neutral">Finalizado</Badge>}
                      {!isPast && <Badge variant="success">Próximo</Badge>}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1">{evento.titulo}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatted}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {evento.hora} hrs</span>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {evento.ubicacion}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex sm:flex-col gap-2 items-center sm:items-end justify-end shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                    id={`view-event-${evento.id}-btn`}
                  >
                    Ver Detalles
                  </Button>
                  {!isPast && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmId(evento.id)}
                      id={`cancel-${evento.id}-btn`}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {confirmId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-cancel-title"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 id="confirm-cancel-title" className="font-bold text-slate-900 text-lg">Cancelar Inscripción</h2>
              <button onClick={() => setConfirmId(null)} className="text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              ¿Estás seguro de que deseas cancelar tu inscripción en <strong>"{myEnrolledEvents.find(e => e.id === confirmId)?.titulo}"</strong>?
              <br /><span className="text-slate-400 text-xs mt-1 block">Podrás volver a inscribirte si hay cupos disponibles.</span>
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setConfirmId(null)} id="cancel-modal-no-btn">
                No, mantener
              </Button>
              <Button variant="danger" size="md" className="flex-1" id="cancel-modal-yes-btn" isLoading={isProcessing} onClick={() => handleCancel(confirmId)}>
                Sí, cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
