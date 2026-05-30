import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { LoginForm } from '../features/auth/LoginForm'
import { Button } from '../components/ui/Button'
import type { LoginFormData } from '../schemas/authSchema'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    const result = await login(data.email, data.password)
    setIsSubmitting(false)
    if (result.success) {
      toast.success('¡Bienvenido de vuelta! 👋')
      navigate('/')
    } else {
      toast.error(result.error || 'Credenciales inválidas')
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-white text-center max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="bg-primary p-4 rounded-2xl shadow-xl">
              <Calendar size={40} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold mb-4">
            Bienvenido a <span className="text-blue-400">EventHub</span>
          </h2>
          <p className="text-slate-300 leading-relaxed mb-8">
            Tu plataforma centralizada de eventos universitarios. Inicia sesión y no te pierdas nada.
          </p>
          {/* Credenciales de prueba */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left border border-white/20">
            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mb-2">Credenciales de prueba</p>
            <div className="space-y-2 text-xs text-slate-200">
              <div>
                <span className="text-blue-300 font-semibold">Estudiante:</span><br />
                estudiante@universidad.edu / password123
              </div>
              <div>
                <span className="text-blue-300 font-semibold">Organizador:</span><br />
                organizador@universidad.edu / password123
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-primary text-white p-2 rounded-xl">
              <Calendar size={22} />
            </div>
            <span className="text-2xl font-extrabold text-primary">EventHub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Regístrate gratis
            </Link>
          </p>

          <LoginForm onSubmit={onSubmit} isLoading={isSubmitting} />

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">O continúa con</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            id="guest-btn"
            onClick={() => navigate('/eventos')}
          >
            Explorar sin iniciar sesión →
          </Button>

          <p className="text-xs text-center text-slate-400 mt-6">
            Al continuar, aceptas nuestros{' '}
            <a href="#terminos" className="text-primary hover:underline">Términos de Uso</a> y{' '}
            <a href="#privacidad" className="text-primary hover:underline">Política de Privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
