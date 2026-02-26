// @ts-nocheck
'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function exportUserDataAction() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false as const, error: 'User not authenticated' }
  }

  // Create an export request record
  const { data: exportRequest, error: requestError } = await supabase
    .from('data_export_requests')
    .insert({
      profile_id: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (requestError) return { success: false as const, error: requestError.message }

  // Call the database function to gather user data
  const { data: exportedData, error: exportError } = await supabase.rpc(
    'export_user_data',
    { _profile_id: user.id }
  )

  if (exportError) return { success: false as const, error: exportError.message }

  // Update the export request status to completed
  await supabase
    .from('data_export_requests')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', exportRequest.id)

  return { success: true as const, data: exportedData }
}

export async function requestAnonymizationAction(reason?: string) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false as const, error: 'User not authenticated' }
  }

  // Check for existing pending deletion request
  const { data: existingRequest } = await supabase
    .from('data_deletion_requests')
    .select('id')
    .eq('profile_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingRequest) {
    return { success: false as const, error: 'A pending anonymization request already exists' }
  }

  const { data: deletionRequest, error } = await supabase
    .from('data_deletion_requests')
    .insert({
      profile_id: user.id,
      status: 'pending',
      reason: reason ?? null,
    })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: deletionRequest }
}

export async function getConsentLogAction() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false as const, error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('lgpd_consent_log')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}
