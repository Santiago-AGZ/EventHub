import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Menu, X, Calendar, User, LogOut, Award, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Cierra menús cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-blue-400 font-bold border-b-2 border-blue-400 pb-1"
      : "text-slate-300 hover:text-white transition-all font-medium pb-1"
  }

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-900 sticky top-0 z-50 w-full shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y Nombre */}
          <Link to="/" className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg px-2 py-1">
            <div className="bg-primary text-white p-2 rounded-xl shadow-md flex items-center justify-center">
              <Calendar size={22} className="animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-450 via-indigo-205 to-white bg-clip-text text-transparent hover:opacity-90 transition-opacity">
              EventHub
            </span>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex gap-8 items-center" aria-label="Navegación principal">
            <Link to="/" className={isActive('/')}>
              Inicio
            </Link>
            <Link to="/eventos" className={isActive('/eventos')}>
              Eventos
            </Link>
            {user?.rol === 'Organizador' && (
              <Link to="/crear-evento" className={isActive('/crear-evento')}>
                Crear Evento
              </Link>
            )}
            {user && (
              <Link to="/mis-inscripciones" className={isActive('/mis-inscripciones')}>
                Mis Inscripciones
              </Link>
            )}
            <Link to="/contacto" className={isActive('/contacto')}>
              Contacto
            </Link>
          </nav>

          {/* Sesión e Interacciones */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all font-medium text-slate-200"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.nombre}`}
                    alt={`Avatar de ${user.nombre}`}
                    className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                  />
                  <span className="text-sm font-semibold">{user.nombre.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 animate-scale-in">
                    <div className="px-4 py-2 border-b border-slate-850">
                      <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">{user.rol}</p>
                      <p className="text-sm text-slate-200 font-semibold truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-350 hover:bg-slate-800 hover:text-white font-medium"
                    >
                      <User size={16} className="text-slate-400" />
                      Mi Perfil
                    </Link>
                    <Link
                      to="/mis-inscripciones"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-350 hover:bg-slate-800 hover:text-white font-medium"
                    >
                      <Award size={16} className="text-slate-400" />
                      Mis Eventos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 font-semibold"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="text-slate-300 hover:text-white hover:bg-slate-900 border-none"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 border-none text-white shadow-md shadow-blue-600/20"
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>

          {/* Botón de Menú Móvil */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-900 bg-slate-950 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-fade-in">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              className={`px-3 py-2.5 rounded-lg text-base font-semibold ${location.pathname === '/' ? 'bg-blue-950/40 text-blue-400' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
            >
              Inicio
            </Link>
            <Link
              to="/eventos"
              className={`px-3 py-2.5 rounded-lg text-base font-semibold ${location.pathname === '/eventos' ? 'bg-blue-950/40 text-blue-400' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
            >
              Eventos
            </Link>
            {user?.rol === 'Organizador' && (
              <Link
                to="/crear-evento"
                className={`px-3 py-2.5 rounded-lg text-base font-semibold ${location.pathname === '/crear-evento' ? 'bg-blue-950/40 text-blue-400' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
              >
                Crear Evento
              </Link>
            )}
            {user && (
              <Link
                to="/mis-inscripciones"
                className={`px-3 py-2.5 rounded-lg text-base font-semibold ${location.pathname === '/mis-inscripciones' ? 'bg-blue-950/40 text-blue-400' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
              >
                Mis Inscripciones
              </Link>
            )}
            <Link
              to="/contacto"
              className={`px-3 py-2.5 rounded-lg text-base font-semibold ${location.pathname === '/contacto' ? 'bg-blue-950/40 text-blue-400' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
            >
              Contacto
            </Link>
          </nav>

          <hr className="border-slate-900" />

          {/* Botones de sesión móvil */}
          <div className="px-3 pt-2">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full border border-slate-800 object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-200 leading-none">{user.nombre}</p>
                    <p className="text-xs text-slate-450 font-semibold">{user.email}</p>
                    <Badge variant="primary" className="mt-1 bg-blue-600 border-none">{user.rol}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="md" className="justify-center border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white" onClick={() => navigate('/perfil')}>
                    Ver Perfil
                  </Button>
                  <Button variant="danger" size="md" className="justify-center" onClick={handleLogout}>
                    Salir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="md" className="justify-center border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="md" className="justify-center" onClick={() => navigate('/register')}>
                  Registro
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
