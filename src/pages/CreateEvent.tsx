import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, Users, Image, Eye } from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { useAuthStore } from '../stores/authStore'
import { EventForm } from '../components/events/EventForm'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EventFormData } from '../schemas/eventSchema'

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  'Tecnología': 'primary', 'Educación': 'success', 'Deportes': 'warning', 'Música': 'error',
}

export function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createEvent } = useEventStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [watchedValues, setWatchedValues] = useState<Partial<EventFormData>>({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    ubicacion: '',
    categoria: 'Tecnología',
    cupos_totales: 50,
    imagen: '',
  })

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">🔐</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Acceso Restringido</h1>
        <p className="text-slate-500 mb-6">Debes iniciar sesión para crear un evento.</p>
        <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
      </div>
    )
  }

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    const result = await createEvent(
      { ...data, imagen: data.imagen || '' },
      { id: user.id, nombre: user.nombre }
    )
    setIsSubmitting(false)
    if (result.success) {
      toast.success('¡Evento creado exitosamente! 🎉', {
        description: 'Tu evento ya es visible en el catálogo.',
      })
      navigate('/eventos')
    } else {
      toast.error(result.error || 'Error al crear el evento')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-primary font-bold text-sm uppercase tracking-widest mb-1">Nuevo Evento</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Crear Evento</h1>
        <p className="text-slate-500 mt-2">Completa el formulario y el evento quedará publicado de inmediato.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Formulario ── */}
        <EventForm
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          watchCallback={(values) => setWatchedValues(values)}
        />

        {/* ── Live Preview ── */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className="text-primary" />
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-widest">Vista Previa en Vivo</h2>
            </div>
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden shadow-sm">
              {/* Imagen preview */}
              <div className="relative h-52 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                {watchedValues.imagen ? (
                  <img src={watchedValues.imagen} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium flex-col gap-2">
                    <Image size={32} className="opacity-40" />
                    <span>Imagen del evento</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge variant={categoryColors[watchedValues.categoria || ''] ?? 'neutral'}>
                    {watchedValues.categoria || 'Categoría'}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                  {watchedValues.titulo || <span className="text-slate-300 font-normal">Título del evento</span>}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {watchedValues.descripcion || <span className="text-slate-300">La descripción del evento aparecerá aquí...</span>}
                </p>

                <div className="space-y-1.5 text-sm text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-primary" />
                    <span>{watchedValues.fecha ? new Date(watchedValues.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha del evento'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-primary" />
                    <span>{watchedValues.hora || 'Hora del evento'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-primary" />
                    <span className="truncate">{watchedValues.ubicacion || 'Ubicación del evento'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-primary" />
                    <span>{watchedValues.cupos_totales || 0} cupos totales</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 pt-1">Por: <strong className="text-slate-600">{user.nombre}</strong></p>

                <Button variant="primary" size="sm" className="w-full mt-2" disabled>
                  Inscribirme al Evento 🎟️
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">Así verán tu evento los estudiantes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
