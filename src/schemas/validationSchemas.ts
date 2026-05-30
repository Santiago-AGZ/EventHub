import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido." })
    .email({ message: "Ingrese un correo electrónico válido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
})

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    email: z
      .string()
      .min(1, { message: "El correo electrónico es requerido." })
      .email({ message: "Ingrese un correo electrónico válido." })
      // Validamos opcionalmente correos universitarios (.edu)
      .refine(
        (val) => val.endsWith(".edu") || val.endsWith(".edu.co") || val.includes("@"), 
        { message: "Se recomienda usar un correo institucional universitario (.edu)." }
      ),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Por favor, confirme su contraseña." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

export const eventSchema = z.object({
  titulo: z
    .string()
    .min(5, { message: "El título debe tener al menos 5 caracteres." })
    .max(80, { message: "El título no debe exceder los 80 caracteres." }),
  descripcion: z
    .string()
    .min(15, { message: "La descripción debe tener al menos 15 caracteres." })
    .max(500, { message: "La descripción no debe exceder los 500 caracteres." }),
  fecha: z
    .string()
    .min(1, { message: "La fecha del evento es requerida." })
    .refine((val) => {
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, { message: "La fecha debe ser hoy o en el futuro." }),
  hora: z
    .string()
    .min(1, { message: "La hora es requerida." })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "La hora debe estar en formato HH:MM (24 horas).",
    }),
  ubicacion: z
    .string()
    .min(5, { message: "La ubicación debe detallar el salón, auditorio o enlace (mín. 5 letras)." }),
  categoria: z.enum(["Tecnología", "Educación", "Deportes", "Música"] as const, {
    error: () => ({ message: "Seleccione una categoría válida." }),
  }),
  cupos_totales: z
    .number({ message: "Ingrese un número válido de cupos." })
    .int()
    .positive({ message: "Los cupos deben ser un número positivo mayor a 0." })
    .max(5000, { message: "El aforo máximo recomendado es de 5000 asistentes." }),
  imagen: z
    .string()
    .url({ message: "Ingrese una URL válida para la imagen." })
    .or(z.literal("")),
})

export const contactSchema = z.object({
  nombre: z
    .string()
    .min(3, { message: "El nombre es requerido." }),
  email: z
    .string()
    .min(1, { message: "El correo es requerido." })
    .email({ message: "Ingrese un correo electrónico válido." }),
  asunto: z
    .string()
    .min(5, { message: "El asunto debe tener al menos 5 caracteres." }),
  mensaje: z
    .string()
    .min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
})
