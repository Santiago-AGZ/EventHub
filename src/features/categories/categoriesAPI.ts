import { supabase } from '../../services/supabase'
import { EVENT_CATEGORIES } from '../../lib/constants'

export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('value, label')
    if (error) throw error
    if (data && data.length > 0) return data
  } catch (err) {
    console.log("Tabla 'categorias' no configurada en Supabase, usando locales.")
  }
  return EVENT_CATEGORIES
}
