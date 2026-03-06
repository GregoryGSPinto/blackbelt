/**
 * Feature Flags Registry — BBOS
 *
 * Central registry of all feature flags with their default values.
 * Flags are stored in Supabase `feature_flags` table and cached client-side.
 */

export interface FeatureFlag {
  id: string;
  description: string;
  defaultEnabled: boolean;
}

/** All known feature flags in the system */
export const FLAG_REGISTRY: Record<string, FeatureFlag> = {
  social_feed: {
    id: 'social_feed',
    description: 'Rede social com feed de posts',
    defaultEnabled: false,
  },
  video_platform: {
    id: 'video_platform',
    description: 'Plataforma de videos e cursos',
    defaultEnabled: false,
  },
  competitions: {
    id: 'competitions',
    description: 'Sistema de competicoes',
    defaultEnabled: false,
  },
  marketplace: {
    id: 'marketplace',
    description: 'Marketplace de produtos',
    defaultEnabled: false,
  },
  ai_coaching: {
    id: 'ai_coaching',
    description: 'Dicas de coaching por IA generativa',
    defaultEnabled: false,
  },
  offline_mode: {
    id: 'offline_mode',
    description: 'Modo offline para check-in',
    defaultEnabled: false,
  },
  live_scoring: {
    id: 'live_scoring',
    description: 'Placar ao vivo em competicoes',
    defaultEnabled: false,
  },
} as const;

export type FlagId = keyof typeof FLAG_REGISTRY;

export interface FeatureFlagRow {
  id: string;
  description: string | null;
  enabled_globally: boolean;
  enabled_for_academies: string[];
  enabled_for_roles: string[];
  enabled_percentage: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
