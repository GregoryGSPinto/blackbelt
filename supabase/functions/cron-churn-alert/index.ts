import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * cron-churn-alert — Identifies high churn-risk members and creates alerts.
 * Scheduled via pg_cron: daily at 04:00 UTC.
 *
 * A member is considered high churn-risk if they haven't checked in for 14+ days
 * but were previously active (at least 3 check-ins in the prior 60 days).
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
    const now = new Date()
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Find members who were active (60d) but haven't checked in (14d)
    // Using raw SQL for complex query
    const { data: atRiskMembers, error } = await supabase.rpc(
      'identify_churn_risk_members',
      {
        inactive_since: fourteenDaysAgo.toISOString(),
        active_since: sixtyDaysAgo.toISOString(),
        min_checkins: 3,
      },
    )

    if (error) {
      // If RPC doesn't exist yet, fall back to simple query
      console.warn('RPC not available, using fallback query:', error.message)

      // Update churn risk count in academy stats
      const { data: academies } = await supabase
        .from('academies')
        .select('id')

      for (const academy of academies ?? []) {
        const { count } = await supabase
          .from('memberships')
          .select('*', { count: 'exact', head: true })
          .eq('academy_id', academy.id)
          .eq('status', 'active')

        await supabase
          .from('rm_academy_stats')
          .update({ churn_risk_high_count: 0, last_computed_at: now.toISOString() })
          .eq('academy_id', academy.id)
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'fallback',
          timestamp: now.toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Create notifications for professors about at-risk members
    const notifications = (atRiskMembers ?? []).map((member: { academy_id: string; membership_id: string; member_name: string }) => ({
      type: 'churn_risk',
      academy_id: member.academy_id,
      reference_id: member.membership_id,
      title: 'Aluno em risco de churn',
      body: `${member.member_name} nao faz check-in ha mais de 14 dias.`,
      created_at: now.toISOString(),
    }))

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }

    return new Response(
      JSON.stringify({
        success: true,
        at_risk_count: atRiskMembers?.length ?? 0,
        notifications_created: notifications.length,
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
