import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import type { Evento } from '../../lib/constants'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  'Tecnología': 'primary',
  'Educación': 'success',
  'Deportes': 'warning',
  'Música': 'error',
}

const categoryEmojis: Record<string, string> = {
  'Tecnología': '⚙️',
  'Educación': '📚',
  'Deportes': '⚽',
  'Música': '🎵',
}

interface EventCardProps {
  evento: Evento
  isEnrolled?: boolean
  className?: string
}

export function EventCard({ evento, isEnrolled = false, className }: EventCardProps) {
  const navigate = useNavigate()
  const eventDate = new Date(evento.fecha + 'T00:00:00')
  const formattedDate = eventDate.toLocaleDateString('es-CO', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })
  const spotsPercent = Math.round((evento.cupos_disponibles / evento.cupos_totales) * 100)
  const isFull = evento.cupos_disponibles === 0
  const isAlmostFull = spotsPercent < 25 && !isFull

  return (
    <article
      className={cn(
        "hover-scale group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full",
        className
      )}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden h-48 bg-slate-100">
        <img
          src={evento.imagen}
          alt={evento.titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Badges superpuestos */}
        <div className="absolute top-3 left-3">
          <Badge variant={categoryColors[evento.categoria] ?? 'neutral'}>
            {categoryEmojis[evento.categoria]} {evento.categoria}
          </Badge>
        </div>
        {isEnrolled && (
          <div className="absolute top-3 right-3">
            <Badge variant="success">✓ Inscrito</Badge>
          </div>
        )}
        {isFull && (
          <div className="absolute top-3 right-3">
            <Badge variant="error">Agotado</Badge>
          </div>
        )}
        {isAlmostFull && !isFull && (
          <div className="absolute top-3 right-3">
            <Badge variant="warning">¡Últimos cupos!</Badge>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-5">
        {/* Título */}
        <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {evento.titulo}
        </h3>

        {/* Descripción corta */}
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {evento.descripcion}
        </p>

        {/* Metadata */}
        <div className="space-y-1.5 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary shrink-0" />
            <span>{evento.hora}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary shrink-0" />
            <span className="truncate">{evento.ubicacion}</span>
          </div>
        </div>

        {/* Barra de cupos */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1"><Users size={11} /> Cupos disponibles</span>
            <span className={cn("font-semibold", isFull ? "text-error" : isAlmostFull ? "text-warning" : "text-success")}>
              {evento.cupos_disponibles} / {evento.cupos_totales}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isFull ? "bg-error" : isAlmostFull ? "bg-warning" : "bg-success"
              )}
              style={{ width: `${100 - spotsPercent}%` }}
            />
          </div>
        </div>

        {/* Organizador */}
        <p className="text-xs text-slate-400 mb-4 font-medium truncate">
          Por: <span className="text-slate-600">{evento.organizador_nombre}</span>
        </p>

        {/* Botón */}
        <div className="mt-auto">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => navigate(`/eventos/${evento.id}`)}
            aria-label={`Ver detalles de ${evento.titulo}`}
          >
            Ver Detalles →
          </Button>
        </div>
      </div>
    </article>
  )
}
