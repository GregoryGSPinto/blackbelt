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
    if (!['owner', 'admin', 'instructor'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const { turmaId } = await params;
    const body = await req.json();
    const { data: dateStr, presencas, observacao } = body;

    // Insert attendance records
    const records = (presencas || []).map((p: any) => ({
      academy_id: membership.academy_id,
      class_id: turmaId,
      student_id: p.alunoId,
      date: dateStr,
      status: p.status === 'presente' ? 'present' : 'absent',
      recorded_by: membership.id,
      observation: observacao || null,
    }));

    if (records.length > 0) {
      const { error } = await supabase
        .from('attendance' as any)
        .upsert(records, { onConflict: 'class_id,student_id,date' });
      if (error) throw error;
    }

    const presentes = presencas.filter((p: any) => p.status === 'presente').length;
    const faltas = presencas.filter((p: any) => p.status === 'falta').length;
    const total = presentes + faltas;

    return apiOk({
      turmaId,
      turmaNome: turmaId,
      data: dateStr,
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
