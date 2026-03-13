import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'
import { getOptionalEnv, getRequiredEnv } from '@/lib/env'
import { logger } from '@/lib/logger'

export async function getSupabaseServerClient() {
  try {
    const cookieStore = await cookies()
    const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
    const anonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    return createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll is called from Server Component where cookies can't be set.
            // This can be safely ignored if middleware refreshes sessions.
          }
        },
      },
    })
  } catch (error) {
    logger.error('[Supabase] Failed to create server client', error)
    throw error
  }
}

export async function getSupabaseServerClientSafe() {
  try {
    const cookieStore = await cookies()
    const url = getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL')
    const anonKey = getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    if (!url || !anonKey) {
      logger.error(
        '[Supabase] Missing required environment variables',
        new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
      )
      return null
    }

    return createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll is called from Server Component where cookies can't be set.
            // This can be safely ignored if middleware refreshes sessions.
          }
        },
      },
    })
  } catch (error) {
    logger.error('[Supabase] Safe server client fallback failed', error)
    return null
  }
}
