import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { User, Mail, Shield, Award, Edit3, Save, LogOut, Calendar, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'
import { profileSchema, ProfileFormData } from '../schemas/profileSchema'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { supabase } from '../services/supabase'

export function Profile() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, isAuthenticated, isOrganizer, logout, isMockMode } = useAuth()
  const { events, loadEvents, isLoading: eventsLoading } = useEvents()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    if (user) {
      setValue('nombre', user.nombre)
      setValue('avatar_url', user.avatar_url || '')
    }
  }, [user, setValue])

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Estadísticas del usuario
  const userEvents = isOrganizer
    ? events.filter(e => e.organizador_id === user.id)
    : events.filter(e => {
        // Inscripciones mock o de localStorage
        const raw = localStorage.getItem('eventhub_enrollments')
        if (!raw) return false
        const enrollments = JSON.parse(raw)
        const userEnrollments = enrollments[user.id] || []
        return userEnrollments.includes(e.id)
      })

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true)
    try {
      if (isMockMode) {
        // Guardar mock en local
        const session = localStorage.getItem('eventhub_current_session')
        if (session) {
          const profile = JSON.parse(session)
          const updatedProfile = { ...profile, nombre: data.nombre, avatar_url: data.avatar_url }
          localStorage.setItem('eventhub_current_session', JSON.stringify(updatedProfile))
          
          // Actualizar lista de cuentas mock
          const accountsRaw = localStorage.getItem('eventhub_mock_accounts')
          if (accountsRaw) {
            const accounts = JSON.parse(accountsRaw)
            if (accounts[profile.email]) {
              accounts[profile.email] = { ...accounts[profile.email], nombre: data.nombre, avatar_url: data.avatar_url }
              localStorage.setItem('eventhub_mock_accounts', JSON.stringify(accounts))
            }
          }
          
          // Actualizar estado Zustand
          useAuthStore.setState({ user: updatedProfile })
          toast.success('¡Perfil actualizado con éxito! (Modo Simulado)')
          setIsEditing(false)
        }
      } else {
        // Guardar en Supabase
        const { error } = await supabase.auth.updateUser({
          data: { nombre: data.nombre, avatar_url: data.avatar_url }
        })
        if (error) throw error

        const updatedProfile = { ...user, nombre: data.nombre, avatar_url: data.avatar_url }
        useAuthStore.setState({ user: updatedProfile })
        toast.success('¡Perfil actualizado con éxito en Supabase! 🎉')
        setIsEditing(false)
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el perfil')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada correctamente.')
    navigate('/')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Cabecera de perfil */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
          <div className="relative group">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`}
              alt={user.nombre}
              className="w-28 h-28 rounded-full border-4 border-white/30 object-cover shadow-lg bg-white/10 backdrop-blur-md"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer">
                Editar
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
              <h1 className="text-3xl font-extrabold tracking-tight">{user.nombre}</h1>
              <Badge variant={isOrganizer ? 'warning' : 'primary'} className="mt-1 md:mt-0 font-bold border border-white/20 bg-white/20 text-white">
                {user.rol}
              </Badge>
            </div>
            
            <p className="text-white/80 flex items-center gap-2 justify-center md:justify-start text-sm">
              <Mail size={14} /> {user.email}
            </p>
            <p className="text-white/70 flex items-center gap-2 justify-center md:justify-start text-xs mt-1">
              <Shield size={12} /> ID de Usuario: <code className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">{user.id}</code>
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="secondary"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 hover:bg-white/30 text-white border-none shadow-md backdrop-blur-md"
            >
              <Edit3 size={16} className="mr-2" />
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </Button>
            <Button
              variant="error"
              onClick={handleLogout}
              className="bg-red-500/80 hover:bg-red-600 text-white border-none shadow-md"
            >
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel Izquierdo / Edición de Perfil */}
        <div className="lg:col-span-1 space-y-6">
          {isEditing ? (
            <Card className="p-6 border-slate-200 shadow-lg bg-white/80 backdrop-blur-md">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-primary" /> Editar Mis Datos
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nombre Completo"
                  id="profile-nombre"
                  error={errors.nombre?.message}
                  {...register('nombre')}
                />
                <Input
                  label="URL del Avatar (Opcional)"
                  id="profile-avatar"
                  placeholder="https://images.unsplash.com/..."
                  error={errors.avatar_url?.message}
                  {...register('avatar_url')}
                />
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isUpdating}
                >
                  <Save size={16} className="mr-2" />
                  Guardar Cambios
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="p-6 border-slate-200 shadow-md">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Award size={18} className="text-primary" /> Información de Rol
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  Estás registrado como <strong className="text-slate-800">{user.rol}</strong>.
                </p>
                {isOrganizer ? (
                  <p className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 text-xs leading-relaxed">
                    🌟 Como Organizador, tienes el privilegio de publicar eventos en la plataforma, gestionar capacidades y consultar las listas de asistencia.
                  </p>
                ) : (
                  <p className="bg-indigo-50 text-indigo-800 p-3 rounded-xl border border-indigo-100 text-xs leading-relaxed">
                    🎓 Como Estudiante, puedes explorar todo el catálogo de eventos del campus, inscribirte con un clic y gestionar tu agenda personal de actividades.
                  </p>
                )}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span>Modo de conexión:</span>
                  <span className={`font-semibold ${isMockMode ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {isMockMode ? '🔌 Simulado (Local)' : '⚡ Supabase Activo'}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Tarjeta de Resumen */}
          <Card className="p-6 border-slate-200 shadow-md text-center bg-gradient-to-br from-slate-50 to-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total de Eventos</h3>
            <p className="text-5xl font-black text-slate-800 mb-2">{userEvents.length}</p>
            <p className="text-xs text-slate-500 font-medium">
              {isOrganizer ? 'Eventos creados por ti en el campus' : 'Eventos en los que te has inscrito'}
            </p>
          </Card>
        </div>

        {/* Panel Derecho / Actividades del Usuario */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-slate-200 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> 
                {isOrganizer ? 'Mis Eventos Creados' : 'Mis Inscripciones Activas'}
              </h2>
              {!isOrganizer && (
                <Button variant="secondary" size="sm" onClick={() => navigate('/mis-eventos')}>
                  Gestionar agenda
                </Button>
              )}
            </div>

            {eventsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : userEvents.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-slate-500 font-medium text-sm">
                  {isOrganizer ? 'Aún no has creado ningún evento.' : 'No estás inscrito en ningún evento todavía.'}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate(isOrganizer ? '/crear-evento' : '/eventos')}
                >
                  {isOrganizer ? 'Crear mi primer evento' : 'Explorar eventos'}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2 space-y-3">
                {userEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/eventos/${event.id}`)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-150 transition-all"
                  >
                    <img
                      src={event.imagen || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=150'}
                      alt={event.titulo}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{event.titulo}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{new Date(event.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                        <span>•</span>
                        <span className="truncate">{event.ubicacion}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <Badge variant={event.categoria === 'Tecnología' ? 'primary' : event.categoria === 'Educación' ? 'success' : event.categoria === 'Deportes' ? 'warning' : 'error'}>
                        {event.categoria}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle size={10} className="text-emerald-500" />
                        {isOrganizer ? 'Organizado' : 'Inscrito'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
