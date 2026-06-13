import { Link } from 'react-router-dom'
import { Calendar, Mail, ExternalLink } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          <div className="md:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2.5 rounded focus-visible:ring-2 focus-visible:ring-ring">
              <div className="rounded-xl bg-primary p-2 text-primary-foreground">
                <Calendar size={20} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-foreground">Evora</span>
            </Link>
            <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
              La plataforma centralizada de eventos universitarios. Descubre, crea y participa.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Plataforma</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li><Link to="/" className="rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Inicio</Link></li>
              <li><Link to="/eventos" className="rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Explorar Eventos</Link></li>
              <li><Link to="/crear-evento" className="rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Crear Evento</Link></li>
              <li><Link to="/mis-inscripciones" className="rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Mis Inscripciónes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Recursos</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li><Link to="/contacto" className="rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">FAQ</Link></li>
              <li><Link to="/contacto" className="rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Ayuda</Link></li>
              <li><span className="text-muted-foreground">Privacidad</span></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Contacto</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/contacto" className="flex items-center gap-2 rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                  <Mail size={14} />
                  Enviar mensaje
                </Link>
              </li>
              <li>
                <a href="https://github.com/Santiago-AGZ/EventHub.git" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                  <ExternalLink size={14} />
                  Repositorio GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {currentYear} Evora. Todos los derechos reservados.</p>
          <p>Para la comunidad universitaria</p>
        </div>
      </div>
    </footer>
  )
}
