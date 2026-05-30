import { supabase } from '../../services/supabase'

export async function enrollUser(eventId: string, userId: string) {
  const { data, error } = await supabase
    .from('inscripciones')
    .insert([{ evento_id: eventId, usuario_id: userId }])
    .select()
  if (error) throw error
  return data
}

export async function cancelEnrollment(eventId: string, userId: string) {
  const { error } = await supabase
    .from('inscripciones')
    .delete()
    .eq('evento_id', eventId)
    .eq('usuario_id', userId)
  if (error) throw error
}

export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('inscripciones')
    .select('evento_id')
    .eq('usuario_id', userId)
  if (error) throw error
  return data.map((item: any) => item.evento_id) as string[]
}
