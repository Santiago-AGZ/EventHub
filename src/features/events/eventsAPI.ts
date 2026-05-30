import { supabase } from '../../services/supabase'
import { Evento } from '../../lib/constants'

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: true })
  if (error) throw error
  return data as Evento[]
}

export async function createEvent(event: Omit<Evento, 'id' | 'creado_en'>) {
  const { data, error } = await supabase
    .from('eventos')
    .insert([event])
    .select()
  if (error) throw error
  return data?.[0] as Evento
}

export async function updateEvent(id: string, eventData: Partial<Evento>) {
  const { data, error } = await supabase
    .from('eventos')
    .update(eventData)
    .eq('id', id)
    .select()
  if (error) throw error
  return data?.[0] as Evento
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
