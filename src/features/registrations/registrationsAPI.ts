import { supabase } from '../../services/supabase'

export async function enrollUser(eventId: string, userId: string) {
  const { data, error } = await supabase
    .from('inscripciones')
    .insert([{ event_id: eventId, user_id: userId }])
    .select()
  if (error) throw error
  return data
}

export async function cancelEnrollment(eventId: string, userId: string) {
  const { error } = await supabase
    .from('inscripciones')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('inscripciones')
    .select('event_id')
    .eq('user_id', userId)
  if (error) throw error
  return data.map((item: any) => item.event_id) as string[]
}
