import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Menu, X, Calendar, User, LogOut, Award, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [dropdownOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        mobileToggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/')
  }, [logout, navigate])

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && !dropdownOpen) {
      e.preventDefault()
      setDropdownOpen(true)
    }
  }

  const handleMenuKeyDown = (e: React.KeyboardEvent, index: number, items: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (index + 1) % items
      const el = dropdownRef.current?.querySelectorAll('[role="menuitem"]')[next] as HTMLElement
      el?.focus()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (index - 1 + items) % items
      const el = dropdownRef.current?.querySelectorAll('[role="menuitem"]')[prev] as HTMLElement
      el?.focus()
    }
  }

  const linkClass = (path: string) =>
    location.pathname === path
      ? 'rounded-md px-2 py-1 text-sm font-semibold text-primary focus-visible:ring-2 focus-visible:ring-ring'
      : 'rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'

  const mobileLinkClass = (path: string) =>
    location.pathname === path
      ? 'rounded-lg px-3 py-2.5 text-base font-semibold bg-primary/10 text-primary focus-visible:ring-2 focus-visible:ring-ring'
      : 'rounded-lg px-3 py-2.5 text-base font-semibold text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl" role="banner">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link to="/" className="flex items-center gap-2.5 rounded-lg px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex items-center justify-center rounded-xl bg-primary p-2 text-primary-foreground shadow-md">
            <Calendar size={22} />
          </div>
          <span className="text-2xl font-black tracking-tight">EventHub</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegacion principal">
          <Link to="/" className={linkClass('/')} aria-current={location.pathname === '/' ? 'page' : undefined}>Inicio</Link>
          <Link to="/eventos" className={linkClass('/eventos')} aria-current={location.pathname === '/eventos' ? 'page' : undefined}>Eventos</Link>
          {user?.rol === 'Organizador' && (
            <Link to="/crear-evento" className={linkClass('/crear-evento')} aria-current={location.pathname === '/crear-evento' ? 'page' : undefined}>Crear Evento</Link>
          )}
          <Link to="/contacto" className={linkClass('/contacto')} aria-current={location.pathname === '/contacto' ? 'page' : undefined}>Contacto</Link>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  ref={toggleRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onKeyDown={handleDropdownKeyDown}
                  className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-1.5 font-medium transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.nombre}`}
                    alt={`Avatar de ${user.nombre}`}
                    className="size-7 rounded-full border border-border object-cover"
                  />
                  <span className="text-sm font-semibold">{user.nombre.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 animate-scale-in rounded-xl border border-border bg-card py-1.5 shadow-xl"
                    role="menu"
                    aria-label="Menu de usuario"
                  >
                    <div className="px-4 py-2" aria-hidden="true">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{user.rol}</p>
                      <p className="truncate text-sm font-semibold">{user.email}</p>
                    </div>
                    <Separator />
                    <Link
                      to="/perfil"
                      role="menuitem"
                      onKeyDown={(e) => handleMenuKeyDown(e, 0, 3)}
                      className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <User size={16} data-icon="inline-start" />
                      Mi Perfil
                    </Link>
                    <Link
                      to="/mis-inscripciones"
                      role="menuitem"
                      onKeyDown={(e) => handleMenuKeyDown(e, 1, 3)}
                      className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Award size={16} data-icon="inline-start" />
                      Mis Eventos
                    </Link>
                    <Separator />
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      onKeyDown={(e) => handleMenuKeyDown(e, 2, 3)}
                      className="flex w-full items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <LogOut size={16} data-icon="inline-start" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>Iniciar Sesión</Button>
                <Button onClick={() => navigate('/register')}>Registrarse</Button>
              </div>
            )}
          </div>

          <button
            ref={mobileToggleRef}
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label={isOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div ref={mobileMenuRef} className="animate-fade-in border-t border-border bg-background px-4 pb-6 pt-2 shadow-lg md:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegacion">
          <nav className="flex flex-col gap-1">
            <Link to="/" className={mobileLinkClass('/')} onClick={() => setIsOpen(false)}>Inicio</Link>
            <Link to="/eventos" className={mobileLinkClass('/eventos')} onClick={() => setIsOpen(false)}>Eventos</Link>
            {user?.rol === 'Organizador' && (
              <Link to="/crear-evento" className={mobileLinkClass('/crear-evento')} onClick={() => setIsOpen(false)}>Crear Evento</Link>
            )}
            <Link to="/contacto" className={mobileLinkClass('/contacto')} onClick={() => setIsOpen(false)}>Contacto</Link>
          </nav>

          <Separator />

          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-3">
                  <img src={user.avatar_url} alt={`Foto de perfil de ${user.nombre}`} className="size-10 rounded-full border border-border object-cover" />
                  <div>
                    <p className="text-sm font-bold leading-none">{user.nombre}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{user.email}</p>
                    <Badge variant="default" className="mt-1">{user.rol}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-center" onClick={() => navigate('/perfil')}>Ver Perfil</Button>
                  <Button variant="destructive" className="justify-center" onClick={handleLogout}>Salir</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-center" onClick={() => navigate('/login')}>Login</Button>
                <Button className="justify-center" onClick={() => navigate('/register')}>Registro</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
