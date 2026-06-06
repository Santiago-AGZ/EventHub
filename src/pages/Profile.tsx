import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Edit3, LogOut, Shield, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/services/supabase'

export function Profile() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, isAuthenticated, isOrganizer, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [nombre, setNombre] = useState(user?.nombre || '')

  if (authLoading) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <Skeleton className="size-12 rounded-full animate-pulse" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    navigate('/login')
    return null
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: { nombre } })
      if (error) throw error

      await supabase.from('perfiles').update({ nombre }).eq('id', user.id)

      useAuthStore.setState({ user: { ...user, nombre } })
      toast.success('¡Perfil actualizado con éxito! Tus cambios ya están visibles.')
      setIsEditing(false)
    } catch (err) {
      toast.error('No se pudo actualizar tu perfil. ' + (err instanceof Error ? err.message : 'Intenta de nuevo más tarde.'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Card className="animate-fade-in-scale card-hover overflow-hidden border-0 bg-gradient-to-r from-primary/20 via-primary/10 to-background p-8">
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`}
            alt={user.nombre}
            className="size-28 rounded-full border-4 border-background object-cover shadow-lg transition-transform duration-500 hover:scale-105"
          />

          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 flex flex-col items-center gap-2 md:flex-row">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{user.nombre}</h1>
              <Badge variant={isOrganizer ? 'default' : 'secondary'} className="font-bold">
                {user.rol}
              </Badge>
            </div>
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start">
              <Mail size={14} /> {user.email}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <Shield size={12} className="inline" /> ID: <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground">{user.id}</code>
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="btn-press">
              <Edit3 size={16} data-icon="inline-start" /> {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
            <Button variant="destructive" onClick={() => { logout(); toast.success('Sesión cerrada correctamente. ¡Hasta pronto!'); navigate('/') }} className="btn-press">
              <LogOut size={16} data-icon="inline-start" /> Salir
            </Button>
          </div>
        </div>
      </Card>

      {isEditing && (
        <Card className="animate-slide-up card-hover mt-8 border-border" aria-live="polite">
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="text-lg font-bold text-foreground">Editar Perfil</h2>
            <div>
              <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo" className="transition-[color,background-color,box-shadow,border-color] duration-200" />
            </div>
            <Button onClick={handleUpdate} disabled={isUpdating} className="btn-press">
              {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 animate-stagger">
        <Card className="card-hover animate-fade-in-up border-border">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Informacion de la cuenta</h2>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Nombre</p>
                <p className="font-semibold text-foreground">{user.nombre}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Rol</p>
                <Badge variant="outline">{user.rol}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

