import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isMockMode = useAuthStore((state) => state.isMockMode)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const checkSession = useAuthStore((state) => state.checkSession)

  return {
    user,
    isLoading,
    isMockMode,
    isAuthenticated: !!user,
    isOrganizer: user?.rol === 'Organizador' || user?.rol === 'Empresa',
    isStudent: user?.rol === 'Estudiante',
    login,
    register,
    logout,
    checkSession,
  }
}
