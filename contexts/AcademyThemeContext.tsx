'use client';

/**
 * AcademyThemeContext — White-label theming per academy
 *
 * Loads the academy's theme from Supabase (or mock) and injects
 * CSS variables into :root so all components can use them.
 *
 * CSS Variables injected:
 *   --academy-primary
 *   --academy-secondary
 *   --academy-logo
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useMock, mockDelay } from '@/lib/env';

export interface AcademyTheme {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  customCSS: string | null;
}

interface AcademyThemeContextValue {
  theme: AcademyTheme;
  loading: boolean;
  updateTheme: (updates: Partial<AcademyTheme>) => Promise<void>;
}

const DEFAULT_THEME: AcademyTheme = {
  primaryColor: '#C9A227',
  secondaryColor: '#1A1A2E',
  logoUrl: null,
  faviconUrl: null,
  customCSS: null,
};

const AcademyThemeContext = createContext<AcademyThemeContextValue>({
  theme: DEFAULT_THEME,
  loading: false,
  updateTheme: async () => {},
});

function injectCSSVariables(theme: AcademyTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--academy-primary', theme.primaryColor);
  root.style.setProperty('--academy-secondary', theme.secondaryColor);
  if (theme.logoUrl) {
    root.style.setProperty('--academy-logo', `url(${theme.logoUrl})`);
  } else {
    root.style.removeProperty('--academy-logo');
  }
}

export function AcademyThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<AcademyTheme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(false);

  // Load theme when academy changes
  useEffect(() => {
    const academyId = user?.unidadeId;
    if (!academyId) {
      setTheme(DEFAULT_THEME);
      injectCSSVariables(DEFAULT_THEME);
      return;
    }

    let cancelled = false;

    async function loadTheme() {
      setLoading(true);
      try {
        if (useMock()) {
          await mockDelay(100);
          // Mock: use default theme
          if (!cancelled) {
            setTheme(DEFAULT_THEME);
            injectCSSVariables(DEFAULT_THEME);
          }
        } else {
          // TODO(BE-072): Load from Supabase
          // const { createClient } = await import('@/lib/supabase/client');
          // const supabase = createClient();
          // const { data } = await supabase
          //   .from('academies')
          //   .select('theme')
          //   .eq('id', academyId)
          //   .single();
          // if (!cancelled && data?.theme) {
          //   const loaded = { ...DEFAULT_THEME, ...data.theme };
          //   setTheme(loaded);
          //   injectCSSVariables(loaded);
          // }

          // Fallback until Supabase integration
          if (!cancelled) {
            setTheme(DEFAULT_THEME);
            injectCSSVariables(DEFAULT_THEME);
          }
        }
      } catch {
        if (!cancelled) {
          setTheme(DEFAULT_THEME);
          injectCSSVariables(DEFAULT_THEME);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTheme();
    return () => { cancelled = true; };
  }, [user?.unidadeId]);

  const updateTheme = useCallback(async (updates: Partial<AcademyTheme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    injectCSSVariables(newTheme);

    if (useMock()) {
      await mockDelay(200);
      return;
    }

    // TODO(BE-073): Persist to Supabase
    // const academyId = user?.unidadeId;
    // if (!academyId) return;
    // const { createClient } = await import('@/lib/supabase/client');
    // const supabase = createClient();
    // await supabase
    //   .from('academies')
    //   .update({ theme: newTheme })
    //   .eq('id', academyId);
  }, [theme]);

  return (
    <AcademyThemeContext.Provider value={{ theme, loading, updateTheme }}>
      {children}
    </AcademyThemeContext.Provider>
  );
}

export function useAcademyTheme() {
  return useContext(AcademyThemeContext);
}
