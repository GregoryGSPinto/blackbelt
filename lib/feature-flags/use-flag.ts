'use client';

/**
 * useFlag — React hook for checking feature flags.
 *
 * Usage:
 *   const enabled = useFlag('social_feed');
 *   if (enabled) { <SocialFeed /> }
 */

import { useContext } from 'react';
import { FeatureFlagContext } from './provider';
import { FLAG_REGISTRY } from './flags';
import { evaluateFlag } from './evaluate';

export function useFlag(flagId: string): boolean {
  const { flags, isLoaded, context } = useContext(FeatureFlagContext);

  if (!isLoaded) {
    return FLAG_REGISTRY[flagId]?.defaultEnabled ?? false;
  }

  const flag = flags[flagId];
  if (!flag) {
    return FLAG_REGISTRY[flagId]?.defaultEnabled ?? false;
  }

  return evaluateFlag(flag, context);
}
