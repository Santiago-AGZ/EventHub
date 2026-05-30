import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Mail, Code, Heart } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="bg-primary p-2 rounded-xl">
                <Calendar size={20} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">EventHub</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              La plataforma centralizada de eventos universitarios. Descubre, crea y participa.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-4">Plataforma</h3>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/eventos" className="hover:text-white transition-colors">Explorar Eventos</Link></li>
              <li><Link to="/crear-evento" className="hover:text-white transition-colors">Crear Evento</Link></li>
              <li><Link to="/mis-inscripciones" className="hover:text-white transition-colors">Mis Inscripciones</Link></li>
            </ul>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-4">Categorías</h3>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              <li><Link to="/eventos?cat=Tecnología" className="hover:text-white transition-colors">⚙️ Tecnología</Link></li>
              <li><Link to="/eventos?cat=Educación" className="hover:text-white transition-colors">📚 Educación</Link></li>
              <li><Link to="/eventos?cat=Deportes" className="hover:text-white transition-colors">⚽ Deportes</Link></li>
              <li><Link to="/eventos?cat=Música" className="hover:text-white transition-colors">🎵 Música</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-4">Contacto</h3>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              <li>
                <Link to="/contacto" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={14} />
                  Enviar mensaje
                </Link>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Code size={14} />
                  Repositorio GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© {currentYear} EventHub. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart size={13} className="text-red-400 fill-red-400" /> para la comunidad universitaria
          </p>
        </div>
      </div>
    </footer>
  )
}
