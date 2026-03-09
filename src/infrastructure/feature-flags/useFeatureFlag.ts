'use client';

import { useMemo } from 'react';
import { FEATURE_FLAGS, type FeatureFlagName, isFeatureFlagEnabled } from './featureFlags';

type UseFeatureFlagContext = {
  academyId?: string | null;
  userId?: string | null;
  userRole?: string | null;
};

export function useFeatureFlag(flag: FeatureFlagName, context: UseFeatureFlagContext = {}) {
  return useMemo(
    () => isFeatureFlagEnabled(flag, context),
    [flag, context.academyId, context.userId, context.userRole]
  );
}

export { FEATURE_FLAGS };
