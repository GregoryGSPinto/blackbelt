import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ turmaId: string }> }
) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin', 'professor'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const { turmaId } = await params;
    const body = await req.json();
    const { data: dateStr, presencas, observacao } = body;

    const { data: schedule, error: scheduleError } = await supabase
      .from('class_schedules' as any)
      .select('id, name, academy_id, instructor_id, active')
      .eq('id', turmaId)
      .eq('academy_id', membership.academy_id)
      .maybeSingle();

    if (scheduleError) throw scheduleError;
    if (!schedule) return apiError('Turma não encontrada', 'NOT_FOUND', 404);
    if (!schedule.active) return apiError('Turma não está ativa', 'INACTIVE_CLASS', 400);
    if (membership.role === 'professor' && schedule.instructor_id !== membership.id) {
      return apiError('Sem permissão para salvar chamada desta turma', 'FORBIDDEN', 403);
    }

    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('class_enrollments' as any)
      .select('membership_id')
      .eq('schedule_id', turmaId)
      .eq('status', 'active');

    if (enrollmentsError) throw enrollmentsError;

    const allowedMembershipIds = new Set(
      (enrollments || []).map((row: any) => row.membership_id).filter(Boolean)
    );

    if ((presencas || []).some((p: any) => !allowedMembershipIds.has(p.alunoId))) {
      return apiError('A lista de presença contém alunos fora da turma.', 'INVALID_ENROLLMENT', 400);
    }

    const { data: existingSession, error: existingSessionError } = await supabase
      .from('class_sessions' as any)
      .select('id')
      .eq('schedule_id', turmaId)
      .eq('date', targetDate)
      .maybeSingle();

    if (existingSessionError) throw existingSessionError;

    let sessionId = existingSession?.id as string | undefined;
    if (!sessionId) {
      const { data: createdSession, error: createSessionError } = await supabase
        .from('class_sessions' as any)
        .insert({
          schedule_id: turmaId,
          academy_id: membership.academy_id,
          date: targetDate,
          status: 'completed',
          instructor_id: schedule.instructor_id,
          notes: observacao || null,
        })
        .select('id')
        .single();

      if (createSessionError) throw createSessionError;
      sessionId = createdSession.id;
    }

    const presentStudentIds = (presencas || [])
      .filter((p: any) => p.status === 'presente')
      .map((p: any) => p.alunoId);
    const absentStudentIds = (presencas || [])
      .filter((p: any) => p.status === 'falta')
      .map((p: any) => p.alunoId);

    // Persist only confirmed presences; absences are represented by the absence
    // of an attendance record for the session.
    const records = presentStudentIds.map((studentId: string) => ({
      academy_id: membership.academy_id,
      session_id: sessionId,
      membership_id: studentId,
      checked_in_at: new Date(`${targetDate}T00:00:00.000Z`).toISOString(),
      checked_in_by: membership.id,
      checkin_method: 'manual',
      notes: observacao || null,
    }));

    if (records.length > 0) {
      const { error } = await supabase
        .from('attendances' as any)
        .upsert(records, { onConflict: 'session_id,membership_id' });
      if (error) throw error;
    }

    if (absentStudentIds.length > 0) {
      const { error } = await supabase
        .from('attendances' as any)
        .delete()
        .eq('session_id', sessionId)
        .in('membership_id', absentStudentIds);

      if (error) throw error;
    }

    const presentes = presencas.filter((p: any) => p.status === 'presente').length;
    const faltas = presencas.filter((p: any) => p.status === 'falta').length;
    const total = presentes + faltas;

    return apiOk({
      turmaId,
      turmaNome: schedule.name,
      data: targetDate,
      totalAlunos: total,
      presentes,
      faltas,
      total,
      percentual: total > 0 ? Math.round((presentes / total) * 100) : 0,
      observacao: observacao || undefined,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
