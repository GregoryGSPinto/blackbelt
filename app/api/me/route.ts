/**
 * GET /api/me — Retorna dados do usuário logado
 *
 * Este endpoint NUNCA retorna erro 500.
 * Se não houver sessão ou der erro, retorna dados vazios com status 200.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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
    // Verificar se Supabase está configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('[API /me] Supabase não configurado, retornando dados vazios');
      return NextResponse.json({ data: emptyUser });
    }

    // Pegar token do header Authorization
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ data: emptyUser });
    }

    // Verificar token e pegar usuário
    const { data: { user }, error } = await supabase.auth.getUser(token);

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
    console.error('[API /me] Error:', err);
    // NUNCA retornar erro 500 — sempre dados vazios
    return NextResponse.json({ data: emptyUser });
  }
}
