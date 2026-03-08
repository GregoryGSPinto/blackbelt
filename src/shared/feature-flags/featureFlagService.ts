import { isEnabled } from '@/lib/feature-flags/evaluate';
import type { FlagContext } from '@/lib/feature-flags/evaluate';
import type { FlagId } from '@/lib/feature-flags/flags';

export async function isFeatureEnabled(flagId: FlagId, tenantId: string, context: Partial<FlagContext> = {}) {
  return isEnabled(flagId, { academyId: tenantId, ...context });
}
