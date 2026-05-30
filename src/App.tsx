import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Events } from './pages/Events'
import { EventDetail } from './pages/EventDetail'
import { CreateEvent } from './pages/CreateEvent'
import { MyEvents } from './pages/MyEvents'
import { Contact } from './pages/Contact'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Profile } from './pages/Profile'

// Rutas que tienen su propio layout (sin Navbar/Footer)
const AUTH_ROUTES = ['/login', '/register']

function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl mb-6 select-none">🗺️</p>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Página no encontrada</h1>
      <p className="text-slate-500 mb-8 max-w-sm">
        La dirección que buscas no existe o fue movida. Vuelve al inicio para seguir navegando.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
      >
        ← Volver al Inicio
      </a>
    </div>
  )
}

export default function App() {
  const { checkSession } = useAuthStore()
  const location = useLocation()

  // Comprobar sesión activa al montar la aplicación
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Scroll al inicio en cada cambio de ruta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const isAuthRoute = AUTH_ROUTES.includes(location.pathname)

  return (
    <>
      {/* Rutas de autenticación: layout completo propio, sin Navbar ni Footer */}
      {isAuthRoute ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        /* Layout principal con Navbar + contenido + Footer */
        <div className="flex flex-col min-h-screen bg-slate-50">
          <Navbar />

          <main className="flex-1" id="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/eventos/:id" element={<EventDetail />} />
              <Route path="/crear-evento" element={<CreateEvent />} />
              <Route path="/mis-inscripciones" element={<MyEvents />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/contacto" element={<Contact />} />
              {/* Fallback para rutas desconocidas */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      )}
    </>
  )
}
