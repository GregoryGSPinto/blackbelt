import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from './types'
import { getOptionalEnv } from '@/lib/env'
import { logger } from '@/lib/logger'

export async function updateSupabaseSession(
  request: NextRequest,
  response: NextResponse
) {
  try {
    const url = getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL')
    const anonKey = getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    if (!url || !anonKey) {
      return response
    }

    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    // Refresh the session — this is required for Server Components
    await supabase.auth.getUser()

    return response
  } catch (error) {
    logger.error('[Auth] Failed to refresh Supabase session in middleware', error)
    return NextResponse.next({
      request: { headers: request.headers },
    })
  }
}
