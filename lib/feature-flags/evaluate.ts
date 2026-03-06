/**
 * Server-side feature flag evaluation — BBOS
 *
 * Usage:
 *   if (await isEnabled('social_feed', { academyId, role })) { ... }
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { FLAG_REGISTRY, type FeatureFlagRow } from './flags';

export interface FlagContext {
  academyId?: string;
  role?: string;
  userId?: string;
}

/**
 * Evaluate whether a feature flag is enabled for a given context.
 *
 * Evaluation order:
 * 1. enabled_globally → true for everyone
 * 2. enabled_for_academies → true if academyId matches
 * 3. enabled_for_roles → true if role matches
 * 4. enabled_percentage → percentage-based rollout (deterministic by userId)
 * 5. Falls back to FLAG_REGISTRY default
 */
export async function isEnabled(
  flagId: string,
  ctx: FlagContext = {}
): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', flagId)
      .single();

    if (error || !data) {
      return FLAG_REGISTRY[flagId]?.defaultEnabled ?? false;
    }

    return evaluateFlag(data as FeatureFlagRow, ctx);
  } catch {
    return FLAG_REGISTRY[flagId]?.defaultEnabled ?? false;
  }
}

export function evaluateFlag(flag: FeatureFlagRow, ctx: FlagContext): boolean {
  if (flag.enabled_globally) return true;

  if (
    ctx.academyId &&
    flag.enabled_for_academies?.includes(ctx.academyId)
  ) {
    return true;
  }

  if (ctx.role && flag.enabled_for_roles?.includes(ctx.role)) {
    return true;
  }

  if (flag.enabled_percentage > 0 && ctx.userId) {
    const hash = simpleHash(ctx.userId + flag.id);
    const bucket = hash % 100;
    if (bucket < flag.enabled_percentage) return true;
  }

  return false;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
