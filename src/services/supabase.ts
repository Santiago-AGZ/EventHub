import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Verificamos si Supabase está configurado de forma real por el usuario
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('xxxxx') &&
  supabaseUrl.startsWith('https://')
)

// Inicializamos el cliente de forma segura para evitar excepciones de inicialización inmediatas
const url = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co'
const key = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient(url, key)
