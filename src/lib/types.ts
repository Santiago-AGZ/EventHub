export interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  color: string
  created_at: string
}

export interface EventoImagen {
  url: string
  alt?: string
  orden: number
}

export interface Evento {
  id: string
  creador_id: string
  categoria_id: string | null
  titulo: string
  descripcion: string
  fecha_inicio: string
  ubicacion: string
  max_inscritos: number | null
  imagen_url: string | null
  imagenes: EventoImagen[]
  estado: 'activo' | 'cancelado' | 'finalizado'
  created_at: string
  updated_at: string
  creador?: { id: string; nombre: string }
  categoria?: Categoria
  inscripciones?: { usuario_id: string }[]
  inscritos_count?: number
  cupos_disponibles?: number
}

export interface Inscripcion {
  id: string
  usuario_id: string
  evento_id: string
  created_at: string
}

export interface Perfil {
  id: string
  nombre: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  nombre: string
  email: string
  rol: 'Estudiante' | 'Organizador' | 'Empresa'
  avatar_url?: string
}

export type EventoFormData = {
  titulo: string
  descripcion: string
  fecha_inicio: string
  ubicacion: string
  categoria_id: string | null
  max_inscritos: number | null
  imagen_url: string | null
  imagenes?: EventoImagen[]
}

export type EventoFilters = {
  search: string
  categoria: string
  sortByDate: 'asc' | 'desc'
}
