// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>

export async function getOnboardingProgress(client: Client, academyId: string) {
  return client
    .from('onboarding_progress')
    .select('*')
    .eq('academy_id', academyId)
    .single()
}

export async function createOnboardingProgress(client: Client, academyId: string) {
  return client
    .from('onboarding_progress')
    .insert({ academy_id: academyId })
    .select()
    .single()
}

export async function completeOnboardingStep(
  client: Client,
  academyId: string,
  step: string,
) {
  // First get current progress
  const { data: current } = await client
    .from('onboarding_progress')
    .select('steps_completed')
    .eq('academy_id', academyId)
    .single()

  const currentSteps: string[] = current?.steps_completed ?? []

  if (currentSteps.includes(step)) {
    return { data: current, error: null }
  }

  const updatedSteps = [...currentSteps, step]
  const allSteps = ['academy', 'schedule', 'invite', 'billing', 'done']
  const isComplete = allSteps.every(s => updatedSteps.includes(s))

  return client
    .from('onboarding_progress')
    .update({
      steps_completed: updatedSteps,
      ...(isComplete ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('academy_id', academyId)
    .select()
    .single()
}

export async function isOnboardingComplete(client: Client, academyId: string) {
  const { data } = await client
    .from('onboarding_progress')
    .select('completed_at')
    .eq('academy_id', academyId)
    .single()

  return !!data?.completed_at
}
