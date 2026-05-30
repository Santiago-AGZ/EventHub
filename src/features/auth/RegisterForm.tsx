import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, User } from 'lucide-react'
import { registerSchema } from '../../schemas/authSchema'
import type { RegisterFormData } from '../../schemas/authSchema'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'

type Rol = 'Estudiante' | 'Organizador' | 'Empresa'

const roles: { value: Rol; label: string; desc: string; emoji: string }[] = [
  { value: 'Estudiante', label: 'Estudiante', desc: 'Descubrir e inscribirse a eventos', emoji: '🎓' },
  { value: 'Organizador', label: 'Organizador', desc: 'Crear y gestionar eventos', emoji: '📋' },
  { value: 'Empresa', label: 'Empresa', desc: 'Promover ferias y oportunidades', emoji: '🏢' },
]

interface RegisterFormProps {
  readonly onSubmit: (data: RegisterFormData, rol: Rol) => void
  readonly isLoading: boolean
}

export function RegisterForm({ onSubmit, isLoading }: Readonly<RegisterFormProps>) {
  const [selectedRol, setSelectedRol] = useState<Rol>('Estudiante')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  return (
    <div className="space-y-4">
      {/* Selección de rol */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Soy un...</p>
        <div className="grid grid-cols-3 gap-2">
          {roles.map(({ value, label, desc, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedRol(value)}
              id={`rol-${value}-btn`}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all text-sm focus-visible:ring-2 focus-visible:ring-primary",
                selectedRol === value
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
              aria-pressed={selectedRol === value}
            >
              <span className="text-xl">{emoji}</span>
              <span className="font-semibold text-xs">{label}</span>
              <span className="text-xs text-slate-400 leading-tight hidden sm:block">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => onSubmit(data, selectedRol))}
        noValidate
        className="space-y-4"
        aria-label="Formulario de registro"
      >
        <Input
          label="Nombre completo"
          id="register-nombre"
          type="text"
          placeholder="Tu nombre"
          autoComplete="name"
          error={errors.nombre?.message}
          icon={<User size={14} />}
          {...register('nombre')}
        />

        <Input
          label="Correo electrónico"
          id="register-email"
          type="email"
          placeholder="tu@universidad.edu"
          autoComplete="email"
          error={errors.email?.message}
          icon={<Mail size={14} />}
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Contraseña"
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            icon={<Lock size={14} />}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-slate-400 hover:text-slate-700 text-xs font-medium"
            tabIndex={-1}
          >
            {showPassword ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        <Input
          label="Confirmar contraseña"
          id="register-confirm-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          icon={<Lock size={14} />}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          id="register-submit-btn"
          isLoading={isLoading}
        >
          Crear Cuenta Gratis 🚀
        </Button>
      </form>
    </div>
  )
}
