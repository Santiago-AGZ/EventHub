import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido." })
    .email({ message: "Ingrese un correo electrónico válido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
})

type LoginFormData = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    const result = await login(data.email, data.password)
    setIsLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      toast.error(result.error || 'Error al iniciar sesión')
      if (result.error?.toLowerCase().includes('email')) {
        setError('email', { message: result.error })
      }
      if (result.error?.toLowerCase().includes('contraseña') || result.error?.toLowerCase().includes('password')) {
        setError('password', { message: result.error })
      }
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background px-4">
      <a href="#login-form" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg">
        Saltar al formulario de inicio de sesión
      </a>
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <div className="animate-float mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Calendar size={28} />
          </div>
          <h1 className="animate-fade-in-up text-3xl font-extrabold tracking-tight" style={{ animationDelay: '0ms' }}>EventHub</h1>
          <p className="animate-fade-in-up mt-2 text-muted-foreground" style={{ animationDelay: '100ms' }}>Inicia sesión para gestionar tus eventos</p>
        </div>

        <Card className="animate-fade-in-scale border-border" style={{ animationDelay: '200ms' }} id="login-form">
          <CardHeader>
            <h2 className="text-base leading-snug font-medium">Iniciar Sesión</h2>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" aria-live="polite">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" className="pl-10 transition-shadow duration-300 focus:shadow-md focus:shadow-primary/5" placeholder="tu@email.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-destructive" role="alert">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-10 transition-shadow duration-300 focus:shadow-md focus:shadow-primary/5" placeholder="Tu contraseña" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-destructive" role="alert">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="btn-press w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : (
                  <>Iniciar Sesión <ArrowRight size={16} data-icon="inline-end" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm">Registrate</Link>
        </p>
      </div>
    </div>
  )
}
