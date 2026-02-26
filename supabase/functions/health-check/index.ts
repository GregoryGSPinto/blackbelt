import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  const start = Date.now()

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Check database connectivity
    const { error } = await supabase.from('academies').select('id').limit(1)
    const dbLatency = Date.now() - start

    if (error) {
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          database: 'error',
          error: error.message,
          latency_ms: dbLatency,
          timestamp: new Date().toISOString(),
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        status: 'healthy',
        database: 'connected',
        latency_ms: dbLatency,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: err instanceof Error ? err.message : 'Unknown error',
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
