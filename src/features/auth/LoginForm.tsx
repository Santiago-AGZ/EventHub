import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock } from 'lucide-react'
import { loginSchema } from '../../schemas/authSchema'
import type { LoginFormData } from '../../schemas/authSchema'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

interface LoginFormProps {
  readonly onSubmit: (data: LoginFormData) => void
  readonly isLoading: boolean
}

export function LoginForm({ onSubmit, isLoading }: Readonly<LoginFormProps>) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
      aria-label="Formulario de inicio de sesión"
    >
      <Input
        label="Correo electrónico"
        id="login-email"
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
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Tu contraseña"
          autoComplete="current-password"
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

      <Button
        type="submit"
        size="lg"
        className="w-full mt-2"
        id="login-submit-btn"
        isLoading={isLoading}
      >
        Iniciar Sesión
      </Button>
    </form>
  )
}
