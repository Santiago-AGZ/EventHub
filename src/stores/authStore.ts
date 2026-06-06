import { create } from 'zustand'
import { supabase } from '../services/supabase'
import type { UserProfile } from '../lib/types'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>
  register: (nombre: string, email: string, password: string, rol: UserProfile['rol']) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    nombre?: string
    rol?: UserProfile['rol']
    avatar_url?: string
  }
}

function buildProfile(user: AuthUser): UserProfile {
  const meta = user.user_metadata || {}
  return {
    id: user.id,
    nombre: meta.nombre || user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
    rol: meta.rol || 'Estudiante',
    avatar_url: meta.avatar_url,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const msg = error.message || ''
        if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
          set({ isLoading: false })
          return { success: false, error: 'Revisa tu bandeja de entrada. Enviamos un enlace de confirmación. Si no lo encuentras, revisa la carpeta de spam.', needsEmailConfirmation: true }
        }
        if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
          set({ isLoading: false })
          return { success: false, error: 'El correo o la contraseña no son correctos. Verifica tus credenciales e intenta de nuevo.' }
        }
        throw error
      }

      if (data?.user) {
        set({ user: buildProfile(data.user), isLoading: false })
        return { success: true }
      }
      throw new Error('No se pudo iniciar sesión')
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err instanceof Error ? err.message : 'Error al iniciar sesión' }
    }
  },

  register: async (nombre, email, password, rol) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre, rol } },
      })

      if (error) {
        const msg = error.message || ''
        if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) {
          set({ isLoading: false })
          return { success: false, error: 'Ya existe una cuenta con este correo. Inicia sesión o usa otro correo electrónico.' }
        }
        if (msg.includes('password') || msg.includes('Password')) {
          set({ isLoading: false })
          return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' }
        }
        throw error
      }

      if (data?.user) {
        await supabase.from('perfiles').upsert(
          { id: data.user.id, nombre, email, created_at: new Date().toISOString() },
          { onConflict: 'id', ignoreDuplicates: true }
        )

        if (data.session) {
          set({ user: buildProfile(data.user), isLoading: false })
          return { success: true }
        }

        set({ isLoading: false })
        return {
          success: false,
          error: 'Cuenta creada. Revisa tu bandeja de entrada para confirmar tu correo electrónico. Si no ves el mensaje, revisa la carpeta de spam.',
          needsEmailConfirmation: true,
        }
      }

      throw new Error('Error en el registro')
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err instanceof Error ? err.message : 'Error al registrarse' }
    }
  },

  logout: async () => {
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({ user: null, isLoading: false })
  },

  checkSession: async () => {
    set({ isLoading: true })
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: buildProfile(session.user), isLoading: false })
      return
    }
    set({ user: null, isLoading: false })
  },
}))
