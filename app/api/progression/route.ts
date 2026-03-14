import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiCreated, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const url = new URL(req.url);
    const memberId = url.searchParams.get('memberId');

    if (memberId) {
      const isSelf = memberId === membership.id;
      const isPrivileged = ['owner', 'admin', 'professor'].includes(membership.role);

      if (!isSelf && !isPrivileged) {
        return apiError('Sem permissão para consultar progresso de outro membro', 'FORBIDDEN', 403);
      }

      const { data: targetMembership } = await supabase
        .from('memberships' as any)
        .select('id')
        .eq('id', memberId)
        .eq('academy_id', membership.academy_id)
        .maybeSingle();

      if (!targetMembership) {
        return apiError('Membro não encontrado nesta academia', 'NOT_FOUND', 404);
      }

      const [promotionsRes, assessmentsRes, milestonesRes] = await Promise.all([
        supabase.from('promotions' as any).select('*').eq('membership_id', memberId).order('promoted_at', { ascending: false }),
        supabase.from('skill_assessments' as any).select('*, skill_tracks(martial_art, skills)').eq('membership_id', memberId).order('assessed_at', { ascending: false }),
        supabase.from('milestones' as any).select('*').eq('membership_id', memberId).order('achieved_at', { ascending: false }),
      ]);

      return apiOk({
        promotions: promotionsRes.data || [],
        assessments: assessmentsRes.data || [],
        milestones: milestonesRes.data || [],
      });
    }

    const [beltSystemsRes, recentPromotionsRes] = await Promise.all([
      supabase.from('belt_systems' as any).select('*').order('martial_art'),
      supabase.from('promotions' as any).select('*').eq('academy_id', membership.academy_id).order('promoted_at', { ascending: false }).limit(20),
    ]);

    return apiOk({
      beltSystems: beltSystemsRes.data || [],
      recentPromotions: recentPromotionsRes.data || [],
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin', 'professor'].includes(membership.role)) {
      return apiError('Sem permissão para promover', 'FORBIDDEN', 403);
    }

    const body = await req.json();
    const { memberId, fromRank, toRank, beltSystemId, notes } = body;

    if (!memberId || !toRank || !beltSystemId) {
      return apiError('memberId, toRank e beltSystemId são obrigatórios', 'VALIDATION');
    }

    const { data: targetMembership } = await supabase
      .from('memberships' as any)
      .select('id')
      .eq('id', memberId)
      .eq('academy_id', membership.academy_id)
      .maybeSingle();

    if (!targetMembership) {
      return apiError('Membro não encontrado nesta academia', 'NOT_FOUND', 404);
    }

    const { data: promotion, error } = await supabase
      .from('promotions' as any)
      .insert({
        membership_id: memberId,
        academy_id: membership.academy_id,
        belt_system_id: beltSystemId,
        from_rank: fromRank || null,
        to_rank: toRank,
        promoted_by: membership.id,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update member's belt rank
    await supabase
      .from('memberships' as any)
      .update({ belt_rank: toRank })
      .eq('id', memberId);

    // Create milestone
    await supabase.from('milestones' as any).insert({
      membership_id: memberId,
      academy_id: membership.academy_id,
      type: 'promotion',
      title: `Promovido para ${toRank}`,
      metadata: { from: fromRank, to: toRank, promotedBy: membership.id },
    });

    // Award points (fire-and-forget)
    supabase.from('points_ledger' as any).insert({
      membership_id: memberId,
      academy_id: membership.academy_id,
      points: 100,
      reason: `Promoção: ${toRank}`,
      reference_type: 'promotion',
      reference_id: promotion.id,
    }).then(() => {});

    return apiCreated(promotion);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
