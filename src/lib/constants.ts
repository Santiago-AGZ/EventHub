export const EVENT_CATEGORIES = [
  { value: 'Tecnología', label: 'Tecnología' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Deportes', label: 'Deportes' },
  { value: 'Música', label: 'Música' },
] as const

export const EVENT_STATES = {
  activo: { label: 'Activo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  finalizado: { label: 'Finalizado', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
} as const

export const STORAGE_BUCKET = 'event-images'
