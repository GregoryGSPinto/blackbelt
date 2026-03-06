'use client';

/**
 * FeatureFlagProvider — React context that loads flags from Supabase.
 *
 * Wraps the app and provides flag state to useFlag() hook.
 */

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { FeatureFlagRow } from './flags';
import type { FlagContext } from './evaluate';

interface FeatureFlagContextValue {
  flags: Record<string, FeatureFlagRow>;
  isLoaded: boolean;
  context: FlagContext;
  setContext: (ctx: FlagContext) => void;
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: {},
  isLoaded: false,
  context: {},
  setContext: () => {},
});

interface FeatureFlagProviderProps {
  children: React.ReactNode;
  initialContext?: FlagContext;
}

export function FeatureFlagProvider({
  children,
  initialContext = {},
}: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Record<string, FeatureFlagRow>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [context, setContext] = useState<FlagContext>(initialContext);

  const loadFlags = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*');

      if (error || !data) {
        setIsLoaded(true);
        return;
      }

      const flagMap: Record<string, FeatureFlagRow> = {};
      const rows = data as unknown as FeatureFlagRow[];
      for (const row of rows) {
        flagMap[row.id] = row;
      }
      setFlags(flagMap);
    } catch {
      // Silently fail — defaults will be used
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  return (
    <FeatureFlagContext.Provider value={{ flags, isLoaded, context, setContext }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
