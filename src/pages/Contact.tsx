import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ExternalLink, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { supabase } from '@/services/supabase'
import { toast } from 'sonner'

const contactSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().min(1, { message: 'El email es requerido.' }).email({ message: 'Ingrese un email valido.' }),
  mensaje: z.string().min(10, { message: 'El mensaje debe tener al menos 10 caracteres.' }),
})

type ContactFormData = z.infer<typeof contactSchema>

export function Contact() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })
  const [sending, setSending] = useState(false)

  const onSubmit = async (data: ContactFormData) => {
    setSending(true)
    try {
      const { error } = await supabase.from('contact_messages').insert([{
        nombre: data.nombre.trim(),
        email: data.email.trim(),
        mensaje: data.mensaje.trim(),
      }])
      if (error) throw error
      toast.success('Mensaje enviado con exito. Te responderemos pronto.')
      reset()
    } catch {
      toast.error('Error al enviar el mensaje. Intentalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 animate-fade-in-up">
        <p className="mb-1 text-sm font-bold uppercase tracking-widest text-primary">Contacto</p>
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Contactanos</h1>
        <p className="mt-2 text-muted-foreground">Tienes preguntas, sugerencias o necesitas ayuda? Escribenos.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-4 animate-stagger">
          <Card className="card-hover animate-fade-in-up border-border">
            <CardContent className="flex items-start gap-3 p-5">
              <Mail size={20} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Email</h2>
                <p className="text-sm text-muted-foreground">contacto@eventhub.co</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in-up border-border">
            <CardContent className="flex items-start gap-3 p-5">
              <MapPin size={20} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Ubicacion</h2>
                <p className="text-sm text-muted-foreground">Universidad del Valle, Yumbo, Valle del Cauca</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in-up border-border">
            <CardContent className="flex items-start gap-3 p-5">
              <ExternalLink size={20} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">GitHub</h2>
                <p className="text-sm text-muted-foreground">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="rounded-sm hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Repositorio del proyecto</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up card-hover border-border md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <h2 className="text-base font-medium leading-snug text-foreground">Envia un mensaje</h2>
              <CardDescription>Te responderemos lo antes posible.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
                  <Input id="nombre" {...register('nombre')} placeholder="Tu nombre" aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? 'nombre-error' : undefined} className="transition-[color,background-color,box-shadow,border-color] duration-200" />
                  {errors.nombre && <p id="nombre-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.nombre.message}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                  <Input id="email" type="email" {...register('email')} placeholder="tu@email.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} className="transition-[color,background-color,box-shadow,border-color] duration-200" />
                  {errors.email && <p id="email-error" className="mt-1 text-xs font-medium text-destructive" role="alert">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-foreground">Mensaje</label>
                  <textarea
                    id="mensaje"
                    {...register('mensaje')}
                    placeholder="Escribe tu mensaje aqui..."
                    rows={5}
                    aria-invalid={!!errors.mensaje}
                    aria-describedby={errors.mensaje ? 'mensaje-error' : undefined}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  {errors.mensaje && <p id="mensaje-error" className="text-xs font-medium text-destructive" role="alert">{errors.mensaje.message}</p>}
              </div>
              <Button type="submit" className="btn-press hover:ring-2 hover:ring-primary/50" disabled={sending}>
                <Send size={16} data-icon="inline-start" /> {sending ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
