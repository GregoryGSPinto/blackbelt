/**
 * GET /api/me — Retorna dados do usuário logado
 *
 * Este endpoint NUNCA retorna erro 500.
 * Se não houver sessão ou der erro, retorna dados vazios com status 200.
 */

import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { logServerError } from '@/lib/server/error-handler';

// Dados vazios de fallback
const emptyUser = {
  id: null,
  email: null,
  memberId: null,
  nome: null,
  perfil: null,
  academiaId: null,
};

export async function GET() {
  try {
    const authSupabase = await getSupabaseServerClient();
    const supabase = getSupabaseAdminClient();
    const { data: { user }, error } = await authSupabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ data: emptyUser });
    }

    // Buscar perfil do usuário na academia
    const { data: profile } = await supabase
      .from('usuarios_academia')
      .select('academia_id, perfil')
      .eq('usuario_id', user.id)
      .single();

    // Buscar dados do profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        memberId: profile?.academia_id || null,
        nome: userProfile?.full_name || user.email?.split('@')[0] || 'Usuário',
        perfil: profile?.perfil || null,
        academiaId: profile?.academia_id || null,
      }
    });

  } catch (err) {
    logServerError('API /me', err);
    // NUNCA retornar erro 500 — sempre dados vazios
    return NextResponse.json({ data: emptyUser });
  }
}
