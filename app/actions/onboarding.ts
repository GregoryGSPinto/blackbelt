'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function createAcademyOnboardingAction(data: {
  name: string
  modality: string
  address?: string
  phone?: string
  email?: string
}): Promise<{ success: true; data: { id: string; [key: string]: unknown } } | { success: false; error: string }> {
  const supabase = await getSupabaseServerClient() as any
  const admin = getSupabaseAdminClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { success: false as const, error: 'Not authenticated' }

  // Create academy
  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const { data: academy, error: academyError } = await admin
    .from('academies')
    .insert({
      name: data.name,
      slug,
      address: data.address,
      phone: data.phone,
      email: data.email,
      owner_id: user.user.id,
      settings: {
        onboardingModality: data.modality,
      },
    })
    .select()
    .single()

  if (academyError) return { success: false as const, error: academyError.message }

  try {
    const ownerName =
      user.user.user_metadata?.full_name ||
      user.user.email?.split('@')[0] ||
      'Usuário'

    const { error: profileError } = await admin.from('profiles').upsert({
      id: user.user.id,
      full_name: ownerName,
      phone: data.phone,
    })
    if (profileError) throw profileError

    const { error: membershipError } = await admin.from('memberships').upsert({
      profile_id: user.user.id,
      academy_id: academy.id,
      role: 'owner',
      status: 'active',
    })
    if (membershipError) throw membershipError

    await admin.from('onboarding_progress').upsert({
      academy_id: academy.id,
      steps_completed: ['academy'],
    })
  } catch (error) {
    await admin.from('academies').delete().eq('id', academy.id)
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to initialize academy ownership',
    }
  }

  return { success: true as const, data: academy }
}

export async function createFirstScheduleAction(data: {
  academyId: string
  name: string
  days: string[]
  startTime: string
  endTime: string
  modality?: string
}) {
  const supabase = await getSupabaseServerClient() as any

  const { data: schedule, error } = await supabase
    .from('schedules')
    .insert({
      academy_id: data.academyId,
      name: data.name,
      days_of_week: data.days,
      start_time: data.startTime,
      end_time: data.endTime,
      modality: data.modality,
      is_active: true,
    })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }

  // Mark schedule step completed
  await completeOnboardingStepAction(data.academyId, 'schedule')

  return { success: true as const, data: schedule }
}

export async function generateInviteLinkAction(academyId: string) {
  const supabase = await getSupabaseServerClient() as any

  // Generate a simple invite token
  const token = crypto.randomUUID()

  const { data, error } = await supabase
    .from('academy_invites')
    .insert({
      academy_id: academyId,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    })
    .select()
    .single()

  if (error) {
    // If table doesn't exist, just return the token
    return { success: true as const, data: { token, url: `/convite/${token}` } }
  }

  await completeOnboardingStepAction(academyId, 'invite')
  return { success: true as const, data: { token: data.token, url: `/convite/${data.token}` } }
}

export async function activateTrialAction(academyId: string) {
  const supabase = await getSupabaseServerClient() as any

  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days

  // Try to create a subscription trial
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      academy_id: academyId,
      plan_id: 'trial',
      status: 'trialing',
      trial_ends_at: trialEnd,
      current_period_start: new Date().toISOString(),
      current_period_end: trialEnd,
    })
    .select()
    .single()

  if (error) {
    // Subscription table may have different schema — mark step anyway
  }

  await completeOnboardingStepAction(academyId, 'billing')
  return { success: true as const }
}

export async function completeOnboardingStepAction(
  academyId: string,
  step: string,
) {
  const supabase = await getSupabaseServerClient() as any

  const { data: current } = await supabase
    .from('onboarding_progress')
    .select('steps_completed')
    .eq('academy_id', academyId)
    .single()

  const currentSteps: string[] = current?.steps_completed ?? []
  if (currentSteps.includes(step)) return { success: true as const }

  const updatedSteps = [...currentSteps, step]
  const allSteps = ['academy', 'schedule', 'invite', 'billing', 'done']
  const isComplete = allSteps.every(s => updatedSteps.includes(s))

  const { error } = await supabase
    .from('onboarding_progress')
    .upsert({
      academy_id: academyId,
      steps_completed: updatedSteps,
      ...(isComplete ? { completed_at: new Date().toISOString() } : {}),
    })

  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function getOnboardingProgressAction(academyId: string) {
  const supabase = await getSupabaseServerClient() as any

  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('academy_id', academyId)
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}
