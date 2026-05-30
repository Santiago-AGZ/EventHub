import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, MessageSquare, User, Send, Phone, MapPin } from 'lucide-react'
import { contactSchema } from '../schemas/validationSchemas'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

type ContactFormData = z.infer<typeof contactSchema>

export function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (_data: ContactFormData) => {
    // Simular envío (en producción, usar Supabase o un servicio de email)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
    reset()
    toast.success('¡Mensaje enviado! 📧', {
      description: 'Nos pondremos en contacto contigo pronto.',
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-12">
        <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">¿Tienes preguntas?</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Contáctanos</h1>
        <p className="text-slate-500 mt-3 max-w-lg mx-auto">
          Estamos aquí para ayudarte. Completa el formulario o usa uno de nuestros canales de contacto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Información de contacto */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-blue-800 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-lg font-bold mb-4">Información de Contacto</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 opacity-80" />
                <div>
                  <p className="font-semibold">Correo Electrónico</p>
                  <p className="text-blue-200">soporte@eventhub.edu.co</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 opacity-80" />
                <div>
                  <p className="font-semibold">Teléfono</p>
                  <p className="text-blue-200">+57 (1) 234-5678</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 opacity-80" />
                <div>
                  <p className="font-semibold">Dirección</p>
                  <p className="text-blue-200">Oficina de Tecnología Educativa, Edificio Central, Campus Universitario</p>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Horarios de Atención</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Lunes – Viernes</span>
                <span className="font-semibold text-slate-800">8:00 – 17:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sábado</span>
                <span className="font-semibold text-slate-800">9:00 – 13:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo</span>
                <span className="font-semibold text-red-500">Cerrado</span>
              </div>
            </div>
          </div>

          {/* FAQ rápido */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Preguntas Frecuentes</h3>
            <div className="space-y-3 text-xs text-slate-600">
              {[
                { q: '¿Cómo me inscribo?', a: 'Entra a un evento y haz clic en "Inscribirme".' },
                { q: '¿Puedo cancelar?', a: 'Sí, desde "Mis Inscripciones" en cualquier momento.' },
                { q: '¿Cómo creo un evento?', a: 'Necesitas cuenta de Organizador. Ve a "Crear Evento".' },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="font-semibold text-slate-700">{q}</p>
                  <p className="text-slate-500">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulario de contacto */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-64">
              <p className="text-6xl mb-4">✅</p>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Mensaje enviado!</h2>
              <p className="text-slate-500 mb-6 max-w-sm">
                Gracias por contactarnos. Te responderemos en un máximo de 2 días hábiles.
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)} id="send-another-btn">
                Enviar otro mensaje
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
              aria-label="Formulario de contacto"
            >
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Envíanos un Mensaje
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tu nombre *"
                  id="contact-nombre"
                  placeholder="Nombre completo"
                  error={errors.nombre?.message}
                  icon={<User size={14} />}
                  {...register('nombre')}
                />
                <Input
                  label="Correo electrónico *"
                  id="contact-email"
                  type="email"
                  placeholder="tu@universidad.edu"
                  error={errors.email?.message}
                  icon={<Mail size={14} />}
                  {...register('email')}
                />
              </div>

              <Input
                label="Asunto *"
                id="contact-asunto"
                placeholder="¿En qué podemos ayudarte?"
                error={errors.asunto?.message}
                {...register('asunto')}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-mensaje" className="text-sm font-medium text-slate-700">
                  Mensaje *
                </label>
                <textarea
                  id="contact-mensaje"
                  rows={6}
                  placeholder="Describe tu consulta, reporte o sugerencia en detalle..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm bg-white text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-400 transition-colors ${errors.mensaje ? 'border-error' : 'border-slate-300'}`}
                  {...register('mensaje')}
                />
                {errors.mensaje && (
                  <span className="text-xs text-error font-medium">{errors.mensaje.message}</span>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                id="contact-submit-btn"
                isLoading={isSubmitting}
              >
                <Send size={16} className="mr-2" /> Enviar Mensaje
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
