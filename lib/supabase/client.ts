import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'
import { getRequiredEnv } from '@/lib/env'

let client: any = null

export function getSupabaseBrowserClient(): any {
  if (client) return client

  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  client = createBrowserClient<Database>(url, anonKey)
  return client
}
