import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const { data, error } = await supabase
      .from('academy_settings' as any)
      .select('*')
      .eq('academy_id', membership.academy_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Return defaults if no settings exist
    const config = data || {
      limiteAtrasoPermitido: 5,
      diasParaBloqueio: 15,
      mensagemBloqueio: 'Sua matrícula está bloqueada. Procure a recepção para regularizar.',
      horarioFuncionamento: { abertura: '06:00', fechamento: '22:00' },
      permitirCheckInAntecipado: true,
      minutosAntecedencia: 15,
    };

    return apiOk(config);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const body = await req.json();

    const { data, error } = await supabase
      .from('academy_settings' as any)
      .upsert({
        academy_id: membership.academy_id,
        ...body,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'academy_id' })
      .select()
      .single();

    if (error) throw error;

    return apiOk(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
