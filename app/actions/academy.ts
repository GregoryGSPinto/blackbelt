'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/types'

export async function getAcademyAction(academyId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('academies')
    .select('*')
    .eq('id', academyId)
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}

export async function updateAcademyAction(
  academyId: string,
  updates: {
    name?: string
    settings?: Json
    phone?: string
    email?: string
  }
) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('academies')
    .update(updates)
    .eq('id', academyId)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}
