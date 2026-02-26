import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const body = await req.json();
    const { alunoId, timestamp, hash } = body;

    if (!alunoId || !timestamp || !hash) {
      return apiError('QR code inválido', 'VALIDATION');
    }

    // Validate QR freshness (5 minutes)
    const age = Date.now() - timestamp;
    if (age > 5 * 60 * 1000) {
      return apiOk({ success: false, error: 'QR code expirado. Gere um novo.' });
    }

    const { data: studentMember } = await supabase
      .from('memberships' as any)
      .select('id, profile_id, status, belt_rank')
      .eq('profile_id', alunoId)
      .eq('academy_id', membership.academy_id)
      .single();

    if (!studentMember) {
      return apiOk({ success: false, error: 'Aluno não encontrado nesta academia' });
    }

    const { data: profile } = await supabase
      .from('profiles' as any)
      .select('full_name, avatar_url')
      .eq('id', alunoId)
      .single();

    if (studentMember.status !== 'active') {
      return apiOk({ success: false, error: `Aluno com status: ${studentMember.status}` });
    }

    // Get any active schedule for session creation
    const today = new Date().toISOString().split('T')[0];
    const { data: anySchedule } = await supabase
      .from('class_schedules' as any)
      .select('id, instructor_id')
      .eq('academy_id', membership.academy_id)
      .eq('active', true)
      .limit(1)
      .single();

    if (!anySchedule) {
      return apiError('Nenhuma turma ativa', 'NO_CLASS');
    }

    // Find or create session
    const { data: session } = await supabase
      .from('class_sessions' as any)
      .select('id')
      .eq('schedule_id', anySchedule.id)
      .eq('date', today)
      .maybeSingle();

    let sessionId: string;
    if (session) {
      sessionId = session.id;
    } else {
      const { data: newSession } = await supabase
        .from('class_sessions' as any)
        .insert({
          schedule_id: anySchedule.id,
          academy_id: membership.academy_id,
          date: today,
          status: 'scheduled',
          instructor_id: anySchedule.instructor_id,
        })
        .select('id')
        .single();
      sessionId = newSession!.id;
    }

    const { data: attendance, error: attErr } = await supabase
      .from('attendances' as any)
      .insert({
        session_id: sessionId,
        membership_id: studentMember.id,
        academy_id: membership.academy_id,
        checkin_method: 'QR',
      })
      .select()
      .single();

    if (attErr) throw attErr;

    // Gamification (fire-and-forget)
    supabase.from('points_ledger' as any).insert({
      membership_id: studentMember.id,
      academy_id: membership.academy_id,
      points: 15,
      reason: 'Check-in via QR Code',
      reference_type: 'attendance',
      reference_id: attendance.id,
    }).then(() => {});

    return apiOk({
      success: true,
      checkIn: {
        id: attendance.id,
        alunoId: studentMember.profile_id,
        alunoNome: profile?.full_name || '',
        turmaId: '',
        turmaNome: '',
        dataHora: attendance.checked_in_at,
        status: 'confirmado',
        method: 'QR',
      },
      aluno: {
        id: studentMember.profile_id,
        nome: profile?.full_name || '',
        avatar: profile?.avatar_url,
        graduacao: studentMember.belt_rank,
        status: 'ATIVO',
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
