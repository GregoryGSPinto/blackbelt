// ============================================================
// GET /api/addons - List available and active addons
// POST /api/addons - Toggle addon activation
// ============================================================

import { NextResponse } from 'next/server';
import { addonManagement } from '@/lib/subscription/services';
import type { AddonType } from '@/lib/subscription/types';
import { withBillingManagerAccess } from '@/lib/api/access-context';

// GET - List available and active addons
export async function GET(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);
    const academyId = membership.academy_id;

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
    if (error instanceof Response) {
      return error as NextResponse;
    }
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
    const { membership } = await withBillingManagerAccess(request);

    const body = await request.json();
    const { addonType, active } = body;

    if (!addonType) {
      return NextResponse.json(
        { error: 'addonType required' },
        { status: 400 }
      );
    }

    const academyId = membership.academy_id;

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
    if (error instanceof Response) {
      return error as NextResponse;
    }
    console.error('[Addons POST API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
