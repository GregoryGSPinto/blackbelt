import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * cron-cleanup — Cleans up expired tokens, old sessions, and stale data.
 * Scheduled via pg_cron: daily at 02:00 UTC.
 */
Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const results: Record<string, number | string> = {}
  const now = new Date()

  try {
    // 1. Clean expired push tokens (older than 90 days without activity)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const { count: expiredTokens } = await supabase
      .from('push_tokens')
      .delete({ count: 'exact' })
      .lt('updated_at', ninetyDaysAgo.toISOString())
    results.expired_push_tokens = expiredTokens ?? 0

    // 2. Clean old notifications (read, older than 90 days)
    const { count: oldNotifications } = await supabase
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('read', true)
      .lt('created_at', ninetyDaysAgo.toISOString())
    results.old_notifications = oldNotifications ?? 0

    // 3. Clean old request logs (older than 90 days)
    const { count: oldLogs } = await supabase
      .from('request_logs')
      .delete({ count: 'exact' })
      .lt('created_at', ninetyDaysAgo.toISOString())
    results.old_request_logs = oldLogs ?? 0

    return new Response(
      JSON.stringify({
        success: true,
        cleaned: results,
        timestamp: now.toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        partial_results: results,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
