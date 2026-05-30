import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar, Users, Zap, Shield, Smartphone, CheckCircle2 } from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { useAuthStore } from '../stores/authStore'
import { EventCard } from '../components/events/EventCard'
import { Button } from '../components/ui/Button'

const stats = [
  { value: '500+', label: 'Estudiantes Activos', icon: Users },
  { value: '200+', label: 'Eventos al Año', icon: Calendar },
  { value: '30s', label: 'Para Inscribirse', icon: Zap },
  { value: '4', label: 'Categorías de Eventos', icon: CheckCircle2 },
]

const features = [
  {
    icon: Zap,
    title: 'Inscripción en 1 Click',
    description: 'Olvídate de formularios por correo. Regístrate a cualquier evento en menos de 30 segundos.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Calendar,
    title: 'Todo Centralizado',
    description: 'Tecnología, deportes, música y más — todos los eventos universitarios en un solo lugar.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Smartphone,
    title: '100% Responsivo',
    description: 'Funciona perfecto en tu celular, tablet o computadora. Diseñado primero para móvil.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Shield,
    title: 'Seguro y Confiable',
    description: 'Tus datos están protegidos. Sin spam, sin duplicados de inscripción.',
    color: 'bg-purple-50 text-purple-600',
  },
]

export function Home() {
  const { events, loadEvents, isLoading } = useEventStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const featuredEvents = events.slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900"
      >
        {/* Orbes decorativos */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 text-center text-white py-24 animate-slide-up">
          {/* Pill Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/40 bg-blue-400/10 text-blue-300 text-sm font-semibold mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Plataforma Universitaria 2026
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Todos los Eventos de tu{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Universidad
            </span>{' '}
            en un Solo Lugar
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Descubre eventos de tecnología, deportes, música y más. Inscríbete en segundos y no te pierdas nada de lo que pasa en tu campus.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/eventos')}
              className="bg-white text-primary hover:bg-slate-100 shadow-xl shadow-black/20 font-bold"
              id="hero-explore-btn"
            >
              Explorar Eventos <ArrowRight size={18} className="ml-1" />
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/register')}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                id="hero-register-btn"
              >
                Crear Cuenta Gratis
              </Button>
            )}
          </div>
        </div>

        {/* Ola decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80H1440V40C1200 0 960 60 720 40C480 20 240 70 0 40V80Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ─── ESTADÍSTICAS ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-4" aria-label="Estadísticas de la plataforma">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Icon size={22} className="text-primary" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-1">{value}</p>
              <p className="text-sm text-slate-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── EVENTOS DESTACADOS ───────────────────────────────── */}
      <section className="py-20 px-4 bg-white" aria-labelledby="featured-heading">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary font-bold text-sm uppercase tracking-widest mb-1">Lo más popular</p>
              <h2 id="featured-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Próximos Eventos
              </h2>
            </div>
            <Link
              to="/eventos"
              className="hidden sm:flex items-center gap-2 text-primary font-bold hover:underline underline-offset-4 text-sm"
            >
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((evento) => (
                <EventCard key={evento.id} evento={evento} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Button variant="outline" onClick={() => navigate('/eventos')}>
              Ver todos los eventos <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── CARACTERÍSTICAS ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">¿Por qué EventHub?</p>
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              La Forma Más Inteligente de Vivir tu Universidad
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
              Acabamos con la dispersión de información. Todo lo que necesitas saber está aquí.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANTES / DESPUÉS ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-white" aria-labelledby="comparison-heading">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="comparison-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              El Antes y el Después
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sin EventHub */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="font-extrabold text-red-700 text-lg mb-4 flex items-center gap-2">
                ❌ Sin EventHub
              </h3>
              <ul className="space-y-3 text-sm text-red-800">
                {[
                  'Revisar 4 apps diferentes',
                  'Inscripción por correo (5+ minutos)',
                  'Perder eventos por no enterarse',
                  'Excel para gestionar inscritos',
                  'Confirmaciones perdidas en el correo',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Con EventHub */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="font-extrabold text-emerald-700 text-lg mb-4 flex items-center gap-2">
                ✅ Con EventHub
              </h3>
              <ul className="space-y-3 text-sm text-emerald-800">
                {[
                  '1 sola plataforma para todo',
                  'Inscripción en 1 click (30 segundos)',
                  'Catálogo siempre actualizado',
                  'Dashboard automático de inscritos',
                  'Panel "Mis Inscripciones" centralizado',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────── */}
      {!user && (
        <section className="py-20 px-4 bg-gradient-to-br from-primary to-blue-800 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              ¿Listo para No Perderte Más Nada?
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Únete a los estudiantes que ya están aprovechando al máximo su vida universitaria con EventHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-slate-100 font-bold shadow-xl shadow-black/20"
                onClick={() => navigate('/register')}
                id="cta-register-btn"
              >
                Crear Cuenta Gratis
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/eventos')}
                id="cta-explore-btn"
              >
                Ver Eventos →
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
