export const ROUTES = {
  HOME: '/',
  EVENTS: '/eventos',
  EVENT_DETAIL: '/eventos/:id',
  CREATE_EVENT: '/crear-evento',
  MY_ENROLLMENTS: '/mis-inscripciones',
  PROFILE: '/perfil',
  CONTACT: '/contacto',
  LOGIN: '/login',
  REGISTER: '/register',
} as const

export function buildRoute(route: string, params: Record<string, string | number>): string {
  let path = route
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)))
  })
  return path
}
