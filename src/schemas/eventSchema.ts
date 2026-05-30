import { z } from 'zod'
import { eventSchema } from './validationSchemas'

export { eventSchema }
export type EventFormData = z.infer<typeof eventSchema>
