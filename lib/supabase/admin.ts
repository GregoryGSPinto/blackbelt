import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { getRequiredEnv } from '@/lib/env'

let adminClient: any = null

export function getSupabaseAdminClient(): any {
  if (adminClient) return adminClient

  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')

  adminClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
