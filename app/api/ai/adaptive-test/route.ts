/**
 * POST /api/ai/adaptive-test — Gera prova adaptativa personalizada
 *
 * Auth: admin ou professor
 * Body: { participantId, trackId, targetMilestoneId, testType, maxQuestions? }
 * Returns: AdaptiveTest com seções, questões e curva de dificuldade
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError, apiForbidden } from '@/lib/api/route-helpers';

export async function POST(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);

    if (!membership || !['admin', 'owner', 'professor'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a administradores e instrutores');
    }

    const body = await req.json();
    const {
      participantId,
      trackId,
      targetMilestoneId,
      testType,
      maxQuestions = 15,
    } = body;

    // Validate required fields
    if (!participantId || !trackId || !targetMilestoneId || !testType) {
      return apiError(
        'Campos obrigatórios: participantId, trackId, targetMilestoneId, testType',
        'VALIDATION_ERROR',
        400,
      );
    }

    if (!['promotion', 'periodic', 'diagnostic'].includes(testType)) {
      return apiError(
        'testType deve ser: promotion, periodic ou diagnostic',
        'VALIDATION_ERROR',
        400,
      );
    }

    // Verify participant belongs to same academy
    const { data: member } = await supabase
      .from('memberships')
      .select('id, profile_id, profiles(full_name, avatar_url)')
      .eq('id', participantId)
      .eq('academy_id', membership.academy_id)
      .single();

    if (!member) {
      return apiError('Participante não encontrado nesta academia', 'NOT_FOUND', 404);
    }

    const { generateAdaptiveTest } = await import('@/lib/domain/intelligence/engines/adaptive-difficulty');
    const { computeStudentDNA } = await import('@/lib/domain/intelligence/engines/student-dna');
    const { extractStudentDNAInput } = await import('@/lib/acl/mappers/intelligence-mapper');
    const { buildDevelopmentSnapshot } = await import('@/lib/application/progression/state/build-snapshot');

    // Build DNA for the participant (may be null for new students)
    let dna = null;
    try {
      const profile = (member as any).profiles;
      const snapshot = await buildDevelopmentSnapshot(
        participantId,
        profile?.full_name,
        profile?.avatar_url,
      );

      const dnaInput = await extractStudentDNAInput(
        snapshot,
        participantId,
        membership.academy_id,
        supabase,
      );

      dna = computeStudentDNA(dnaInput);
    } catch {
      // DNA is optional — continue without it for new students
    }

    // Fetch question bank for the track/milestone
    const { data: questions } = await supabase
      .from('question_bank')
      .select('*')
      .eq('track_id', trackId)
      .eq('milestone_id', targetMilestoneId)
      .eq('active', true);

    const questionBank = (questions ?? []).map((q: any) => ({
      id: q.id,
      competencyId: q.competency_id,
      competencyName: q.competency_name ?? q.competency_id,
      difficulty: q.difficulty,
      type: q.type ?? 'practical',
      tags: q.tags ?? [],
      estimatedTimeMinutes: q.estimated_time_minutes ?? 3,
      content: {
        title: q.title,
        description: q.description,
        criteria: q.criteria ?? [],
        referenceVideo: q.reference_video,
        tips: q.tips ?? [],
      },
      points: q.points ?? 10,
    }));

    const config = {
      participantId,
      trackId,
      targetMilestoneId,
      testType: testType as 'promotion' | 'periodic' | 'diagnostic',
      maxQuestions: Math.min(Math.max(5, maxQuestions), 30),
    };

    const test = generateAdaptiveTest(config, dna, questionBank);

    return apiOk(test);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
