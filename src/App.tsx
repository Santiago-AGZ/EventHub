import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useEventStore } from '@/stores/eventStore'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Home } from '@/pages/Home'
import { Events } from '@/pages/Events'
import { EventDetail } from '@/pages/EventDetail'
import { CreateEvent } from '@/pages/CreateEvent'
import { MyEvents } from '@/pages/MyEvents'
import { Contact } from '@/pages/Contact'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Profile } from '@/pages/Profile'
import { Skeleton } from '@/components/ui/skeleton'

const AUTH_ROUTES = ['/login', '/register']

function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-6 text-8xl font-bold text-muted-foreground/20">404</p>
      <h1 className="mb-3 text-3xl font-extrabold">Pagina no encontrada</h1>
      <p className="mb-8 max-w-[65ch] text-muted-foreground">
        La direccion que buscas no existe o fue movida.
      </p>
      <a href="/" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring">
        Volver al Inicio
      </a>
    </div>
  )
}

export default function App() {
  const { checkSession, isLoading } = useAuthStore()
  const location = useLocation()

  useEffect(() => { checkSession() }, [checkSession])

  useEffect(() => {
    const unsubscribe = useEventStore.getState().subscribeToEvents()
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const isAuthRoute = AUTH_ROUTES.includes(location.pathname)

  if (isAuthRoute) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </ErrorBoundary>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-12 rounded-xl" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg">
        Saltar al contenido principal
      </a>
      <Navbar />
      <main className="flex-1" id="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/eventos/:id" element={<EventDetail />} />
            <Route path="/crear-evento" element={<CreateEvent />} />
            <Route path="/mis-inscripciones" element={<MyEvents />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
