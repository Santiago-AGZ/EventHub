import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'

const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    email: z
      .string()
      .min(1, { message: "El correo electrónico es requerido." })
      .email({ message: "Ingrese un correo electrónico válido." }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Por favor, confirme su contraseña." }),
    rol: z.enum(["Estudiante", "Organizador", "Empresa"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const ROLES = ['Estudiante', 'Organizador', 'Empresa'] as const

export function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      rol: 'Estudiante',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    const result = await registerUser(data.nombre, data.email, data.password, data.rol)
    setIsLoading(false)
    if (result.success) {
      toast.success('Cuenta creada exitosamente')
      navigate('/')
    } else {
      toast.error(result.error || 'Error al registrarse')
      if (result.error?.toLowerCase().includes('email')) {
        setError('email', { message: result.error })
      }
      if (result.error?.toLowerCase().includes('nombre')) {
        setError('nombre', { message: result.error })
      }
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background px-4 py-10">
      <a href="#register-form" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg">
        Saltar al formulario de registro
      </a>
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <div className="animate-float mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Calendar size={28} />
          </div>
          <h1 className="animate-fade-in-up text-3xl font-extrabold tracking-tight" style={{ animationDelay: '0ms' }}>Evora</h1>
          <p className="animate-fade-in-up mt-2 text-muted-foreground" style={{ animationDelay: '100ms' }}>Crea tu cuenta y empieza a descubrir eventos</p>
        </div>

        <Card className="animate-fade-in-scale border-border" style={{ animationDelay: '200ms' }} id="register-form">
          <CardHeader>
            <h2 className="text-base leading-snug font-medium">Crear Cuenta</h2>
            <CardDescription>Completa tus datos para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" aria-live="polite">
              <div>
                <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium">Nombre completo</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="nombre" className="pl-10 transition-shadow duration-300 focus:shadow-md focus:shadow-primary/5" placeholder="Tu nombre" aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? 'nombre-error' : undefined} {...register('nombre')} />
                </div>
                {errors.nombre && (
                  <p id="nombre-error" className="mt-1 text-sm text-destructive" role="alert">{errors.nombre.message}</p>
                )}
              </div>
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
                  <Input id="password" type={showPassword ? "text" : "password"} className="pl-10 pr-10 transition-shadow duration-300 focus:shadow-md focus:shadow-primary/5" placeholder="Minimo 6 caracteres" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} tabIndex={-1}>
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-destructive" role="alert">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} className="pl-10 pr-10 transition-shadow duration-300 focus:shadow-md focus:shadow-primary/5" placeholder="Repite tu contraseña" aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} {...register('confirmPassword')} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"} tabIndex={-1}>
                    {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1 text-sm text-destructive" role="alert">{errors.confirmPassword.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="rol" className="mb-1.5 block text-sm font-medium">Rol</label>
                <select
                  id="rol"
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:shadow-md focus:shadow-primary/5"
                  aria-invalid={!!errors.rol}
                  aria-describedby={errors.rol ? 'rol-error' : undefined}
                  {...register('rol')}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.rol && (
                  <p id="rol-error" className="mt-1 text-sm text-destructive" role="alert">{errors.rol.message}</p>
                )}
              </div>
              <Button type="submit" className="btn-press w-full" disabled={isLoading}>
                {isLoading ? 'Creando cuenta...' : (
                  <>Crear Cuenta <ArrowRight size={16} data-icon="inline-end" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
