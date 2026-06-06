import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, Users, Image as ImageIcon, Eye, Upload } from 'lucide-react'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/services/supabase'
import { STORAGE_BUCKET } from '@/lib/constants'

import type { EventoFormData } from '@/lib/types'

const eventFormSchema = z.object({
  titulo: z
    .string()
    .min(5, { message: 'El titulo debe tener al menos 5 caracteres.' })
    .max(80, { message: 'El titulo no debe exceder los 80 caracteres.' }),
  descripcion: z
    .string()
    .min(15, { message: 'La descripcion debe tener al menos 15 caracteres.' }),
  fecha: z
    .string()
    .min(1, { message: 'La fecha del evento es requerida.' }),
  hora: z
    .string()
    .min(1, { message: 'La hora es requerida.' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'La hora debe estar en formato HH:MM (24 horas).',
    }),
  ubicacion: z
    .string()
    .min(5, { message: 'La ubicacion debe tener al menos 5 caracteres.' }),
  categoria_id: z.string().optional(),
  max_inscritos: z.number().int().positive({ message: 'Los cupos deben ser un numero positivo.' }),
  imagen_url: z
    .string()
    .url({ message: 'Ingrese una URL valida.' })
    .or(z.literal('')),
})

type EventFormData = z.infer<typeof eventFormSchema>

export function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createEvent, categories, loadCategories } = useEventStore()
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.nombre])), [categories])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      ubicacion: '',
      categoria_id: '',
      max_inscritos: 50,
      imagen_url: '',
    },
  })

  const watched = watch()

  useEffect(() => { loadCategories() }, [loadCategories])

  if (!user) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center animate-fade-in-up">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Acceso Restringido</h1>
        <p className="mb-6 text-muted-foreground">Debes iniciar sesion para crear un evento.</p>
        <Button onClick={() => navigate('/login')} className="btn-press">Iniciar Sesion</Button>
      </div>
    )
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const MAX_SIZE = 5 * 1024 * 1024

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Formato no valido. Usa JPG, PNG, WebP o GIF.')
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error('La imagen no debe superar los 5 MB.')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      setValue('imagen_url', publicUrl)
    } catch (err) {
      toast.error('Error al subir imagen: ' + (err instanceof Error ? err.message : 'Intentalo de nuevo'))
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    const submitData: EventoFormData = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_inicio: `${data.fecha}T${data.hora}:00`,
      ubicacion: data.ubicacion,
      categoria_id: (data.categoria_id ? data.categoria_id : null),
      max_inscritos: data.max_inscritos || null,
      imagen_url: data.imagen_url || null,
    }
    const result = await createEvent(submitData)
    setIsSubmitting(false)
    if (result.success) {
      toast.success('Evento creado exitosamente')
      navigate('/eventos')
    } else {
      toast.error(result.error || 'Error al crear el evento')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 animate-fade-in-up">
        <p className="mb-1 text-sm font-bold uppercase tracking-widest text-primary">Nuevo Evento</p>
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Crear Evento</h1>
        <p className="mt-2 text-muted-foreground">Completa el formulario y el evento quedara publicado de inmediato.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 animate-stagger">
          <div className="animate-fade-in-up">
            <label htmlFor="titulo" className="mb-1.5 block text-sm font-medium text-foreground">Titulo del evento</label>
            <Input id="titulo" {...register('titulo')} placeholder="Hackathon de IA 2026" aria-invalid={!!errors.titulo} aria-describedby={errors.titulo ? 'titulo-error' : undefined} className="transition-[color,background-color,box-shadow,border-color] duration-200" />
            {errors.titulo && <p id="titulo-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.titulo.message}</p>}
          </div>

          <div className="animate-fade-in-up">
            <label htmlFor="descripcion" className="mb-1.5 block text-sm font-medium text-foreground">Descripcion</label>
            <textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Describe tu evento en detalle..."
              rows={4}
              aria-invalid={!!errors.descripcion}
              aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.descripcion && <p id="descripcion-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.descripcion.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 animate-stagger">
            <div className="animate-fade-in-up">
              <label htmlFor="fecha" className="mb-1.5 block text-sm font-medium text-foreground">Fecha</label>
              <Input id="fecha" type="date" {...register('fecha')} aria-invalid={!!errors.fecha} aria-describedby={errors.fecha ? 'fecha-error' : undefined} className="transition-[color,background-color,box-shadow,border-color] duration-200" />
              {errors.fecha && <p id="fecha-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.fecha.message}</p>}
            </div>
            <div className="animate-fade-in-up">
              <label htmlFor="hora" className="mb-1.5 block text-sm font-medium text-foreground">Hora</label>
              <Input id="hora" type="time" {...register('hora')} aria-invalid={!!errors.hora} aria-describedby={errors.hora ? 'hora-error' : undefined} className="transition-[color,background-color,box-shadow,border-color] duration-200" />
              {errors.hora && <p id="hora-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.hora.message}</p>}
            </div>
          </div>

          <div className="animate-fade-in-up">
            <label htmlFor="ubicacion" className="mb-1.5 block text-sm font-medium text-foreground">Ubicacion</label>
            <Input id="ubicacion" {...register('ubicacion')} placeholder="Auditorio Principal" aria-invalid={!!errors.ubicacion} aria-describedby={errors.ubicacion ? 'ubicacion-error' : undefined} className="transition-[color,background-color,box-shadow,border-color] duration-200" />
            {errors.ubicacion && <p id="ubicacion-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.ubicacion.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 animate-stagger">
            <div className="animate-fade-in-up">
              <label htmlFor="categoria" className="mb-1.5 block text-sm font-medium text-foreground">Categoria</label>
              <select
                id="categoria"
                {...register('categoria_id')}
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Seleccionar categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div className="animate-fade-in-up">
              <label htmlFor="max_inscritos" className="mb-1.5 block text-sm font-medium text-foreground">Cupos maximos</label>
              <Input id="max_inscritos" type="number" {...register('max_inscritos', { valueAsNumber: true })} min={1} aria-invalid={!!errors.max_inscritos} aria-describedby={errors.max_inscritos ? 'max_inscritos-error' : undefined} className="transition-[color,background-color,box-shadow,border-color] duration-200" />
              {errors.max_inscritos && <p id="max_inscritos-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.max_inscritos.message}</p>}
            </div>
          </div>

          <div className="animate-fade-in-up">
            <label htmlFor="imagen_url" className="mb-1.5 block text-sm font-medium text-foreground">Imagen del evento</label>
            <div className="flex gap-3">
              <Input id="imagen_url" {...register('imagen_url')} placeholder="https://..." aria-invalid={!!errors.imagen_url} aria-describedby={errors.imagen_url ? 'imagen_url-error' : undefined} className="transition-[color,background-color,box-shadow,border-color] duration-200" />
              <label
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.currentTarget.querySelector('input') as HTMLInputElement)?.click() } }}
                className="btn-press flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Upload size={16} />
                Subir
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            {errors.imagen_url && <p id="imagen_url-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.imagen_url.message}</p>}
            {uploading && <p className="mt-1 text-xs text-muted-foreground">Subiendo imagen...</p>}
          </div>

          <Button type="submit" className="btn-press w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Publicar Evento'}
          </Button>
        </form>

        <div className="hidden lg:block animate-fade-in-up" aria-live="polite">
          <div className="sticky top-24">
            <div className="mb-4 flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Vista Previa</h2>
            </div>
            <Card className="card-hover overflow-hidden border-2 border-dashed border-primary/30 animate-[pulse_3s_ease-in-out_infinite]">
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                {watched.imagen_url ? (
                  <img src={watched.imagen_url} alt="Preview" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(el) => { (el.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                    <ImageIcon size={32} className="opacity-40" />
                    <span>Imagen del evento</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                <div className="absolute left-3 top-3">
                  <Badge variant="secondary">{categoryMap.get(watched.categoria_id ?? '') || 'Categoria'}</Badge>
                </div>
              </div>

              <CardContent className="flex flex-col gap-3 p-5">
                <h3 className="line-clamp-2 text-lg font-bold leading-tight text-foreground">
                  {watched.titulo || <span className="font-normal text-muted-foreground">Titulo del evento</span>}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {watched.descripcion || <span>La descripcion del evento aparecera aqui...</span>}
                </p>

                <div className="flex flex-col gap-1.5 border-t border-border pt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-primary" />
                    <span>{watched.fecha ? new Date(watched.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha del evento'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-primary" />
                    <span>{watched.hora || 'Hora del evento'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-primary" />
                    <span className="truncate">{watched.ubicacion || 'Ubicacion del evento'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-primary" />
                    <span>{watched.max_inscritos || 0} cupos totales</span>
                  </div>
                </div>

                <p className="pt-1 text-xs text-muted-foreground">Por: <strong className="text-foreground">{user.nombre}</strong></p>

                <Button size="sm" className="btn-press mt-2 w-full" disabled>Inscribirme al Evento</Button>
              </CardContent>
            </Card>
            <p className="mt-3 text-center text-xs text-muted-foreground">Asi veran tu evento los estudiantes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
