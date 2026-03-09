// ============================================================
// GET /api/addons - List available and active addons
// POST /api/addons - Toggle addon activation
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addonManagement } from '@/lib/subscription/services';
import type { AddonType } from '@/lib/subscription/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// SECURITY: service role key bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List available and active addons
export async function GET(request: Request) {
  try {
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('academia_id')
      .eq('usuario_id', user.id)
      .single();

    if (!userAcademy) {
      return NextResponse.json({ error: 'No academy found' }, { status: 404 });
    }

    const academyId = userAcademy.academia_id;

    // Get all available addons
    const available = await addonManagement.getAvailableAddons();

    // Get active addons for this academy
    const active = await addonManagement.getActiveAddons(academyId);

    // Merge to show status
    const addons = available.map(addon => ({
      ...addon,
      active: active.some(a => a.addon_type === addon.addonType),
      activeSince: active.find(a => a.addon_type === addon.addonType)?.active_since
    }));

    return NextResponse.json({ addons });
  } catch (error) {
    console.error('[Addons GET API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Toggle addon activation
export async function POST(request: Request) {
  try {
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('academia_id, perfil')
      .eq('usuario_id', user.id)
      .single();

    if (!userAcademy) {
      return NextResponse.json({ error: 'No academy found' }, { status: 404 });
    }

    // Only admins can manage addons
    const allowedProfiles = ['ADMINISTRADOR', 'OWNER', 'SUPER_ADMIN'];
    if (!allowedProfiles.includes(userAcademy.perfil)) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { addonType, active } = body;

    if (!addonType) {
      return NextResponse.json(
        { error: 'addonType required' },
        { status: 400 }
      );
    }

    const academyId = userAcademy.academia_id;

    // Toggle addon
    const result = active 
      ? await addonManagement.activateAddon(academyId, addonType as AddonType)
      : await addonManagement.deactivateAddon(academyId, addonType as AddonType).then(() => ({ activated: false }));

    return NextResponse.json({
      success: true,
      activated: active,
      addon: 'addon' in result ? result : undefined
    });
  } catch (error) {
    console.error('[Addons POST API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
