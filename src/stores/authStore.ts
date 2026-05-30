import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../services/supabase'

export interface UserProfile {
  id: string
  nombre: string
  email: string
  rol: 'Estudiante' | 'Organizador' | 'Empresa'
  avatar_url?: string
}

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  isMockMode: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (nombre: string, email: string, password: string, rol: 'Estudiante' | 'Organizador' | 'Empresa') => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

// Cargar cuentas mock del localStorage para el modo fallback
const getMockAccounts = (): Record<string, any> => {
  const accounts = localStorage.getItem('eventhub_mock_accounts')
  return accounts ? JSON.parse(accounts) : {
    'estudiante@universidad.edu': {
      id: 'usr-stud-1',
      nombre: 'Sofía Rodríguez',
      email: 'estudiante@universidad.edu',
      password: 'password123',
      rol: 'Estudiante',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    'organizador@universidad.edu': {
      id: 'usr-org-1',
      nombre: 'Dr. Alejandro Silva',
      email: 'organizador@universidad.edu',
      password: 'password123',
      rol: 'Organizador',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  }
}

const saveMockAccount = (account: any) => {
  const accounts = getMockAccounts()
  accounts[account.email] = account
  localStorage.setItem('eventhub_mock_accounts', JSON.stringify(accounts))
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isMockMode: !isSupabaseConfigured,

  login: async (email, password) => {
    set({ isLoading: true })
    
    // MODO REAL SUPABASE
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        if (data?.user) {
          // Consultar el rol y datos extras en base de datos o usar metadata de auth
          const meta = data.user.user_metadata
          const profile: UserProfile = {
            id: data.user.id,
            nombre: meta.nombre || data.user.email?.split('@')[0] || 'Usuario',
            email: data.user.email || '',
            rol: meta.rol || 'Estudiante',
            avatar_url: meta.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.user.id}`
          }
          set({ user: profile, isLoading: false })
          return { success: true }
        }
        throw new Error("No se pudo iniciar sesión.")
      } catch (err: any) {
        set({ isLoading: false })
        return { success: false, error: err.message || 'Error al iniciar sesión en Supabase.' }
      }
    }

    // MODO SIMULADO LOCAL
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simular latencia de red
    const accounts = getMockAccounts()
    const account = accounts[email.toLowerCase().trim()]

    if (account && account.password === password) {
      const profile: UserProfile = {
        id: account.id,
        nombre: account.nombre,
        email: account.email,
        rol: account.rol,
        avatar_url: account.avatar_url
      }
      set({ user: profile, isLoading: false })
      localStorage.setItem('eventhub_current_session', JSON.stringify(profile))
      return { success: true }
    } else {
      set({ isLoading: false })
      return { success: false, error: 'Credenciales inválidas. Cuenta no registrada o contraseña incorrecta.' }
    }
  },

  register: async (nombre, email, password, rol) => {
    set({ isLoading: true })

    // MODO REAL SUPABASE
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre, rol }
          }
        })
        if (error) throw error

        if (data?.user) {
          // Intentar insertar en la tabla pública de perfiles
          const { error: profileError } = await supabase
            .from('perfiles')
            .insert([{ id: data.user.id, nombre, email }])
          
          if (profileError) {
            console.error("Error al registrar perfil en tabla 'perfiles':", profileError.message)
          }

          const profile: UserProfile = {
            id: data.user.id,
            nombre,
            email,
            rol,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.user.id}`
          }
          // Nota: Supabase puede requerir confirmación por correo electrónico
          set({ isLoading: false })
          return { success: true }
        }
        throw new Error("Error en el registro.")
      } catch (err: any) {
        set({ isLoading: false })
        return { success: false, error: err.message || 'Error al registrarse en Supabase.' }
      }
    }

    // MODO SIMULADO LOCAL
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simular latencia de red
    const accounts = getMockAccounts()
    const emailKey = email.toLowerCase().trim()

    if (accounts[emailKey]) {
      set({ isLoading: false })
      return { success: false, error: 'El correo electrónico ya está registrado.' }
    }

    const newUser = {
      id: `usr-mock-${Date.now()}`,
      nombre,
      email: emailKey,
      password,
      rol,
      avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${nombre}`
    }

    saveMockAccount(newUser)
    
    const profile: UserProfile = {
      id: newUser.id,
      nombre: newUser.nombre,
      email: newUser.email,
      rol: newUser.rol,
      avatar_url: newUser.avatar_url
    }
    
    set({ user: profile, isLoading: false })
    localStorage.setItem('eventhub_current_session', JSON.stringify(profile))
    return { success: true }
  },

  logout: async () => {
    set({ isLoading: true })

    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem('eventhub_current_session')
    }

    set({ user: null, isLoading: false })
  },

  checkSession: async () => {
    set({ isLoading: true })

    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const meta = session.user.user_metadata
        set({
          user: {
            id: session.user.id,
            nombre: meta.nombre || session.user.email?.split('@')[0] || 'Usuario',
            email: session.user.email || '',
            rol: meta.rol || 'Estudiante',
            avatar_url: meta.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${session.user.id}`
          },
          isLoading: false
        })
        return
      }
    } else {
      const session = localStorage.getItem('eventhub_current_session')
      if (session) {
        set({ user: JSON.parse(session), isLoading: false })
        return
      }
    }

    set({ user: null, isLoading: false })
  }
}))
