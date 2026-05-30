import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { RegisterForm } from '../features/auth/RegisterForm'
import type { RegisterFormData } from '../schemas/authSchema'

type Rol = 'Estudiante' | 'Organizador' | 'Empresa'

export function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: RegisterFormData, rol: Rol) => {
    setIsSubmitting(true)
    const result = await registerUser(data.nombre, data.email, data.password, rol)
    setIsSubmitting(false)
    if (result.success) {
      toast.success('¡Cuenta creada exitosamente! 🎉', {
        description: 'Bienvenido a EventHub.',
      })
      navigate('/')
    } else {
      toast.error(result.error || 'Error al crear la cuenta')
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Panel decorativo izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-white text-center max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary p-4 rounded-2xl shadow-xl">
              <Calendar size={40} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold">Únete a <span className="text-blue-400">EventHub</span></h2>
          <p className="text-slate-300 leading-relaxed">
            Crea tu cuenta gratis y comienza a ser parte de la vida universitaria. Miles de eventos te esperan.
          </p>
          {[
            '✓ Registro gratuito sin tarjeta',
            '✓ Inscripción en 1 click',
            '✓ Notificaciones de nuevos eventos',
            '✓ Panel de inscripciones centralizado',
          ].map((item) => (
            <p key={item} className="text-sm text-slate-300 text-left">{item}</p>
          ))}
        </div>
      </div>

      {/* Formulario de registro */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="bg-primary text-white p-2 rounded-xl">
              <Calendar size={22} />
            </div>
            <span className="text-2xl font-extrabold text-primary">EventHub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            Crear Cuenta
          </h1>
          <p className="text-slate-500 mb-6 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>

          <RegisterForm onSubmit={onSubmit} isLoading={isSubmitting} />

          <p className="text-xs text-center text-slate-400 mt-5">
            Al registrarte, aceptas nuestros{' '}
            <a href="#terminos" className="text-primary hover:underline">Términos de Uso</a> y{' '}
            <a href="#privacidad" className="text-primary hover:underline">Política de Privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
