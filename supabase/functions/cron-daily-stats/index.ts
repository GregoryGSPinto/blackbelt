import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * cron-daily-stats — Recalculates rm_academy_stats for all academies.
 * Scheduled via pg_cron: daily at 03:00 UTC.
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

  try {
    // Get all academies
    const { data: academies, error: academiesError } = await supabase
      .from('academies')
      .select('id')

    if (academiesError) throw academiesError

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    let updated = 0

    for (const academy of academies ?? []) {
      // Count total members
      const { count: totalMembers } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academy.id)

      // Count active members (checked in within 30 days)
      const { count: activeMembers } = await supabase
        .from('attendance')
        .select('membership_id', { count: 'exact', head: true })
        .eq('academy_id', academy.id)
        .gte('checked_in_at', thirtyDaysAgo.toISOString())

      // Count total checkins in last 30 days
      const { count: totalCheckins } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academy.id)
        .gte('checked_in_at', thirtyDaysAgo.toISOString())

      // Upsert stats
      const { error: upsertError } = await supabase
        .from('rm_academy_stats')
        .upsert({
          academy_id: academy.id,
          total_members: totalMembers ?? 0,
          active_members: activeMembers ?? 0,
          total_checkins_30d: totalCheckins ?? 0,
          avg_attendance_pct:
            totalMembers && totalMembers > 0
              ? Math.round(((activeMembers ?? 0) / totalMembers) * 100 * 100) / 100
              : 0,
          last_computed_at: now.toISOString(),
        })

      if (!upsertError) updated++
    }

    return new Response(
      JSON.stringify({
        success: true,
        academies_updated: updated,
        timestamp: now.toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
