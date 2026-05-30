import { z } from 'zod'

export const profileSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  avatar_url: z.string().url({ message: "Ingrese una URL de avatar válida." }).or(z.literal(''))
})

export type ProfileFormData = z.infer<typeof profileSchema>
