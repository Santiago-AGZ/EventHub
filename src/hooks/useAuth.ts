import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)
  const checkSession = useAuthStore((s) => s.checkSession)

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isOrganizer: user?.rol === 'Organizador' || user?.rol === 'Empresa',
    isStudent: user?.rol === 'Estudiante',
    login,
    register,
    logout,
    checkSession,
  }
}
