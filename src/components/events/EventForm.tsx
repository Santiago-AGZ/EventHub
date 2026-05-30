import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Clock, MapPin, Users, Tag, Image } from 'lucide-react'
import { eventSchema, EventFormData } from '../../schemas/eventSchema'
import { EVENT_CATEGORIES } from '../../lib/constants'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

interface EventFormProps {
  onSubmit: (data: EventFormData) => void
  isLoading: boolean
  defaultValues?: Partial<EventFormData>
  watchCallback?: (values: EventFormData) => void
}

export function EventForm({ onSubmit, isLoading, defaultValues, watchCallback }: EventFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      ubicacion: '',
      categoria: 'Tecnología',
      cupos_totales: 50,
      imagen: '',
      ...defaultValues,
    },
  })

  // Watch values and call callback to sync live preview
  const watchedValues = watch()
  React.useEffect(() => {
    if (watchCallback) {
      watchCallback(watchedValues)
    }
  }, [watchedValues, watchCallback])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Tag size={16} className="text-primary" /> Información General
        </h2>

        <Input
          label="Título del evento *"
          id="event-titulo"
          placeholder="Ej. Hackathon de Inteligencia Artificial"
          error={errors.titulo?.message}
          {...register('titulo')}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="event-descripcion" className="text-sm font-medium text-slate-700">
            Descripción *
          </label>
          <textarea
            id="event-descripcion"
            rows={4}
            placeholder="Describe el evento, actividades, requisitos y qué aprenderán los asistentes..."
            className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-800 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-400 transition-colors ${errors.descripcion ? 'border-error' : 'border-slate-300'}`}
            {...register('descripcion')}
          />
          {errors.descripcion && (
            <span className="text-xs text-error font-medium">{errors.descripcion.message}</span>
          )}
        </div>

        <Select
          label="Categoría *"
          id="event-categoria"
          error={errors.categoria?.message}
          options={EVENT_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
          {...register('categoria')}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Calendar size={16} className="text-primary" /> Fecha y Lugar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha del evento *"
            id="event-fecha"
            type="date"
            error={errors.fecha?.message}
            icon={<Calendar size={14} />}
            {...register('fecha')}
          />
          <Input
            label="Hora *"
            id="event-hora"
            type="time"
            error={errors.hora?.message}
            icon={<Clock size={14} />}
            {...register('hora')}
          />
        </div>

        <Input
          label="Ubicación *"
          id="event-ubicacion"
          placeholder="Ej. Auditorio Principal, Edificio A-2"
          error={errors.ubicacion?.message}
          icon={<MapPin size={14} />}
          {...register('ubicacion')}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Users size={16} className="text-primary" /> Capacidad e Imagen
        </h2>

        <Input
          label="Cupos disponibles *"
          id="event-cupos"
          type="number"
          min={1}
          max={5000}
          placeholder="50"
          error={errors.cupos_totales?.message}
          icon={<Users size={14} />}
          {...register('cupos_totales', { valueAsNumber: true })}
        />

        <Input
          label="URL de imagen (opcional)"
          id="event-imagen"
          type="url"
          placeholder="https://images.unsplash.com/..."
          error={errors.imagen?.message}
          icon={<Image size={14} />}
          {...register('imagen')}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        id="create-event-submit-btn"
        isLoading={isLoading}
      >
        Publicar Evento 🚀
      </Button>
    </form>
  )
}
