import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar, Users, Zap, Shield, Smartphone, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const features = [
  { icon: Zap, title: 'Inscripción en 1 Click', description: 'Regístrate a cualquier evento en menos de 30 segundos.' },
  { icon: Calendar, title: 'Todo Centralizado', description: 'Tecnología, deportes, música y más en un solo lugar.' },
  { icon: Smartphone, title: '100% Responsivo', description: 'Funciona en celular, tablet o computadora.' },
  { icon: Shield, title: 'Seguro y Confiable', description: 'Sin spam, sin inscripciones duplicadas.' },
]

export function Home() {
  const { events, categories, loadEvents, loadCategories, isLoading } = useEventStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadEvents()
    loadCategories()
  }, [loadEvents, loadCategories])

  const featuredEvents = useMemo(() => events.filter(e => e.estado === 'activo').slice(0, 4), [events])

  const realStats = useMemo(() => [
    { value: events.filter(e => e.estado === 'activo').length, label: 'Eventos Disponibles', icon: Calendar },
    { value: categories.length || 4, label: 'Categorías', icon: CheckCircle2 },
    { value: '30s', label: 'Para Inscribirse', icon: Zap },
    { value: new Set(events.map(e => e.creador_id)).size || '—', label: 'Organizadores', icon: Users },
  ], [events, categories])

  return (
    <main className="flex flex-col">
      <section className="relative min-h-[88dvh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div className="flex flex-col gap-8 py-20 lg:py-32">
            <span className="animate-fade-in-up inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-sm" style={{ animationDelay: '0ms' }}>
              <Sparkles size={14} />
              Plataforma Universitaria 2026
            </span>

            <h1 className="animate-fade-in-up text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl" style={{ animationDelay: '80ms' }}>
              Todos los Eventos de tu{' '}
              <span className="text-primary">Universidad</span>
              <br />
              en un Solo Lugar
            </h1>

            <p className="animate-fade-in-up max-w-[50ch] text-lg leading-relaxed text-muted-foreground sm:text-xl" style={{ animationDelay: '160ms' }}>
              Descubre eventos de tecnología, deportes, música y más. 
              Inscríbete en segundos y no te pierdas nada de lo que pasa en tu campus.
            </p>

            <div className="animate-fade-in-up flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '240ms' }}>
              <Button size="lg" className="btn-press h-12 px-6 text-base" onClick={() => navigate('/eventos')}>
                Explorar Eventos <ArrowRight size={18} data-icon="inline-end" />
              </Button>
              {!user && (
                <Button size="lg" variant="outline" className="btn-press h-12 px-6 text-base" onClick={() => navigate('/register')}>
                  Crear Cuenta Gratis
                </Button>
              )}
            </div>
          </div>

          <div className="animate-fade-in-scale hidden lg:flex items-center justify-center" style={{ animationDelay: '320ms' }}>
            <div className="relative">
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {featuredEvents.slice(0, 4).map((evento, i) => (
                  <div
                    key={evento.id}
                    className={`rounded-2xl border border-border bg-card overflow-hidden shadow-lg ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                    style={{ aspectRatio: i === 0 ? '16/10' : '1' }}
                  >
                    <img
                      src={evento.imagenes[0]?.url || evento.imagen_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'}
                      alt=""
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-xs font-bold leading-tight line-clamp-1 text-white">{evento.titulo}</p>
                      <p className="text-[10px] text-white/70">
                        {new Date(evento.fecha_inicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card px-4 py-16" aria-label="Estadísticas de la plataforma">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {realStats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon size={22} className="text-primary" />
                </div>
              </div>
              <p className="mb-1 text-3xl font-extrabold">{value}</p>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="animate-fade-in-up mb-1 text-sm font-bold uppercase tracking-widest text-primary" style={{ animationDelay: '0ms' }}>Lo mas popular</p>
              <h2 id="featured-heading" className="animate-fade-in-up text-3xl font-extrabold sm:text-4xl" style={{ animationDelay: '80ms' }}>Próximos Eventos</h2>
            </div>
            <Link to="/eventos" className="animate-fade-in-up btn-press hidden items-center gap-2 rounded text-sm font-bold text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring sm:flex" style={{ animationDelay: '160ms' }}>
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : (
            <div className="animate-stagger grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
              {featuredEvents.map((evento) => (
                <article key={evento.id} className="rounded-2xl">
                  <Link to={`/eventos/${evento.id}`} className="block rounded-2xl focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]" aria-label={`Ver detalles de ${evento.titulo}`}>
                    <Card className="card-hover group h-full overflow-hidden">
                      <div className="relative h-44 overflow-hidden bg-muted">
                        <img
                          src={evento.imagenes[0]?.url || evento.imagen_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'}
                          alt={evento.titulo}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="text-xs">
                            {evento.categoria?.nombre || 'Sin categoria'}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-1 line-clamp-2 font-bold leading-tight">{evento.titulo}</h3>
                        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{evento.descripcion}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar size={12} />
                            <span>{new Date(evento.fecha_inicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users size={12} />
                            <span>{evento.cupos_disponibles !== undefined && evento.max_inscritos ? `${evento.cupos_disponibles}/${evento.max_inscritos}` : 'Ilimitado'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </article>
              ))}
            </div>
          )}

          <div className="animate-fade-in-up mt-10 text-center sm:hidden" style={{ animationDelay: '240ms' }}>
            <Button variant="outline" className="btn-press" onClick={() => navigate('/eventos')}>
              Ver todos los eventos <ArrowRight size={16} data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card px-4 py-20" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="animate-fade-in-up mb-2 text-sm font-bold uppercase tracking-widest text-primary" style={{ animationDelay: '0ms' }}>Por que Evora?</p>
            <h2 id="features-heading" className="animate-fade-in-up text-3xl font-extrabold sm:text-4xl" style={{ animationDelay: '80ms' }}>La Forma Mas Inteligente de Vivir tu Universidad</h2>
            <p className="animate-fade-in-up mx-auto mt-4 max-w-[65ch] text-muted-foreground" style={{ animationDelay: '160ms' }}>
              Todo lo que necesitas saber esta aqui, sin dispersion de informacion.
            </p>
          </div>

          <div className="animate-stagger grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }, index) => {
              if (index === 0) {
                return (
                  <Card key={title} className="card-hover active:scale-[0.96]">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2 font-bold">{title}</h3>
                          <p className="text-sm leading-relaxed text-muted-foreground max-w-[65ch]">{description}</p>
                        </div>
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                          <Icon size={22} className="text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              }
              if (index === 1) {
                return (
                  <Card key={title} className="card-hover active:scale-[0.96]">
                    <CardContent className="p-6">
                      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon size={22} className="text-primary" />
                      </div>
                      <h3 className="mb-2 font-bold">{title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground max-w-[65ch]">{description}</p>
                    </CardContent>
                  </Card>
                )
              }
              if (index === 2) {
                return (
                  <div key={title} className="card-hover active:scale-[0.96] rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
                        <Icon size={20} className="text-primary-foreground" />
                      </div>
                      <h3 className="font-bold">{title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground max-w-[65ch]">{description}</p>
                  </div>
                )
              }
              return (
                <Card key={title} className="card-hover active:scale-[0.96]">
                  <CardContent className="p-6 flex flex-col">
                    <h3 className="mb-2 font-bold">{title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground max-w-[65ch]">{description}</p>
                    <div className="mt-auto flex size-12 items-center justify-center self-end rounded-2xl bg-primary/10">
                      <Icon size={22} className="text-primary" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20" aria-labelledby="comparison-heading">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 id="comparison-heading" className="animate-fade-in-up mb-4 text-3xl font-extrabold sm:text-4xl" style={{ animationDelay: '0ms' }}>El Antes y el Despues</h2>
          </div>
          <div className="animate-stagger grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="card-hover active:scale-[0.96] border-destructive/30 bg-destructive/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-destructive">
                <XCircle size={20} /> Sin Evora
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                {['Revisar 4 apps diferentes', 'Inscripción por correo (5+ minutos)', 'Perder eventos por no enterarse', 'Excel para gestionar inscritos', 'Confirmaciones perdidas en el correo'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <XCircle size={14} className="mt-0.5 shrink-0 text-destructive" /> {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="card-hover active:scale-[0.96] border-primary/30 bg-primary/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-primary">
                <CheckCircle2 size={20} /> Con Evora
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                {['1 sola plataforma para todo', 'Inscripción en 1 click (30 segundos)', 'Catálogo siempre actualizado', 'Dashboard automatico de inscritos', 'Panel "Mis Inscripciónes" centralizado'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {!user && (
        <section className="border-t border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-20 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="animate-fade-in-up mb-4 text-3xl font-extrabold sm:text-4xl" style={{ animationDelay: '0ms' }}>Listo para No Perderte Mas Nada?</h2>
            <p className="animate-fade-in-up mx-auto mb-8 max-w-[65ch] text-lg text-muted-foreground" style={{ animationDelay: '150ms' }}>
              Unete a los estudiantes que ya estan aprovechando al maximo su vida universitaria con Evora.
            </p>
            <div className="animate-fade-in-up flex flex-col justify-center gap-4 sm:flex-row" style={{ animationDelay: '300ms' }}>
              <Button size="lg" className="btn-press" onClick={() => navigate('/register')}>Crear Cuenta Gratis</Button>
              <Button size="lg" variant="outline" className="btn-press" onClick={() => navigate('/eventos')}>Ver Eventos</Button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

