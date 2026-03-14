import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'
import { getOptionalEnv, getRequiredEnv } from '@/lib/env'
import { env } from '@/src/config/env'
import { logger } from '@/lib/logger'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  if (!env.SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!env.SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
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
}

export async function getSupabaseServerClientSafe() {
  const cookieStore = await cookies()
  const url = env.SUPABASE_URL || getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = env.SUPABASE_ANON_KEY || getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    logger.error(
      '[Supabase] Missing required environment variables',
      new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'),
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
}
