import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// SECURITY: service role key bypasses RLS - use with caution
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/leads/metrics - Get dashboard metrics
export async function GET(request: Request) {
  try {
    // Verify super admin access
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('role')
      .eq('profile_id', user.id)
      .single();

    if (membership?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get current month start
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Fetch metrics
    const [
      { count: totalLeads },
      { count: newLeadsThisMonth },
      { count: qualifiedLeads },
      { count: convertedLeads },
      { count: newLeadsLastMonth },
      { count: convertedLastMonth },
    ] = await Promise.all([
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'qualified'),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted').gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd),
    ]);

    // Calculate conversion rate
    const conversionRate = totalLeads ? ((convertedLeads || 0) / (totalLeads || 1)) * 100 : 0;

    // Calculate trends
    const leadsTrend = newLeadsLastMonth ? 
      (((newLeadsThisMonth || 0) - (newLeadsLastMonth || 0)) / (newLeadsLastMonth || 1)) * 100 : 0;
    
    const conversionTrend = convertedLastMonth ?
      (((convertedLeads || 0) - (convertedLastMonth || 0)) / (convertedLastMonth || 1)) * 100 : 0;

    // Get status distribution
    const { data: statusData } = await supabaseAdmin
      .from('leads')
      .select('status');

    const statusDistribution = statusData?.reduce((acc: Record<string, number>, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get source distribution
    const { data: sourceData } = await supabaseAdmin
      .from('leads')
      .select('source');

    const sourceDistribution = sourceData?.reduce((acc: Record<string, number>, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get monthly data for chart
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
    const { data: monthlyData } = await supabaseAdmin
      .from('leads')
      .select('created_at, status')
      .gte('created_at', sixMonthsAgo)
      .order('created_at', { ascending: true });

    const monthlyStats = monthlyData?.reduce((acc: Record<string, any>, lead) => {
      const month = new Date(lead.created_at).toLocaleString('pt-BR', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { leads: 0, qualified: 0, converted: 0 };
      }
      acc[month].leads++;
      if (lead.status === 'qualified') acc[month].qualified++;
      if (lead.status === 'converted') acc[month].converted++;
      return acc;
    }, {}) || {};

    // Calculate potential revenue
    const { data: revenueData } = await supabaseAdmin
      .from('leads')
      .select('monthly_revenue, status')
      .eq('status', 'converted');

    const totalRevenue = revenueData?.reduce((sum, lead) => sum + (lead.monthly_revenue || 0), 0) || 0;

    // Get hot leads (score >= 80)
    const { data: hotLeads } = await supabaseAdmin
      .from('leads')
      .select('id, academy_name, city, score')
      .gte('score', 80)
      .in('status', ['new', 'qualified'])
      .order('score', { ascending: false })
      .limit(5);

    return NextResponse.json({
      summary: {
        totalLeads: totalLeads || 0,
        newLeadsThisMonth: newLeadsThisMonth || 0,
        qualifiedLeads: qualifiedLeads || 0,
        convertedLeads: convertedLeads || 0,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        leadsTrend: parseFloat(leadsTrend.toFixed(1)),
        conversionTrend: parseFloat(conversionTrend.toFixed(1)),
        totalRevenue,
      },
      distributions: {
        status: statusDistribution,
        source: sourceDistribution,
      },
      monthly: Object.entries(monthlyStats).map(([month, data]) => ({
        month,
        ...data,
      })),
      hotLeads: hotLeads || [],
    });
  } catch (error) {
    console.error('[Leads Metrics API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
