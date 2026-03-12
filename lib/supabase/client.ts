import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'
import { getRequiredEnv } from '@/lib/env'
import { logger } from '@/lib/logger'
import { env, getMissingEnvVariables, hasRequiredSupabaseEnv } from '@/src/config/env'

let client: any = null
let hasLoggedMissingEnv = false

function reportMissingSupabaseEnv(): void {
  if (hasLoggedMissingEnv) return
  hasLoggedMissingEnv = true

  logger.info(
    '[Auth]',
    `Supabase browser client unavailable: missing ${getMissingEnvVariables().join(', ')}`
  )
}

export function getSupabaseBrowserClient(): any {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your environment variables.'
    )
  }

  if (!env.SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  client = createBrowserClient<Database>(url, anonKey)
  return client
}

export function getSupabaseBrowserClientSafe(): any | null {
  if (!hasRequiredSupabaseEnv()) {
    reportMissingSupabaseEnv()
    return null
  }

  try {
    return getSupabaseBrowserClient()
  } catch (error) {
    logger.warn('[Auth]', 'Supabase browser client creation failed', error)
    return null
  }
}
