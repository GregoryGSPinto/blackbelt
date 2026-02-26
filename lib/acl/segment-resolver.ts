/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ACL — SEGMENT RESOLVER                                        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Resolve a configuração de segmento efetiva para a unidade.    ║
 * ║                                                                 ║
 * ║  Durante a migração:                                            ║
 * ║  • Se a unidade não tem segmentConfig → usa preset padrão      ║
 * ║  • Se tem → usa a config da unidade (pode ser customizada)     ║
 * ║                                                                 ║
 * ║  Isto garante backward compat: unidades sem config              ║
 * ║  recebem o preset 'martial_arts' automaticamente.              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  SegmentDefinition, SegmentVocabulary, SegmentModuleConfig,
  AudienceProfile, SegmentType, ModuleAvailability,
} from '@/lib/domain';
import { getSegmentPreset, PRESET_MARTIAL_ARTS } from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// RESOLVER
// ════════════════════════════════════════════════════════════════════

/**
 * Resolve a configuração efetiva de segmento.
 *
 * Prioridade:
 * 1. unitConfig (customização da unidade) — se existir
 * 2. Preset do segmento — se unitConfig não existir
 * 3. PRESET_MARTIAL_ARTS — fallback absoluto (backward compat)
 */
export function resolveSegmentConfig(
  segmentType?: SegmentType,
  unitConfig?: Partial<SegmentDefinition>,
): SegmentDefinition {
  const preset = segmentType
    ? getSegmentPreset(segmentType) ?? PRESET_MARTIAL_ARTS
    : PRESET_MARTIAL_ARTS;

  if (!unitConfig) return preset;

  // Merge: unit overrides prevalecem sobre preset
  return {
    ...preset,
    ...unitConfig,
    // Deep merge para objetos aninhados
    enabledModules: { ...preset.enabledModules, ...unitConfig.enabledModules },
    vocabulary: { ...preset.vocabulary, ...unitConfig.vocabulary },
    profileFields: unitConfig.profileFields ?? preset.profileFields,
    audienceProfiles: unitConfig.audienceProfiles ?? preset.audienceProfiles,
    eventTypes: unitConfig.eventTypes ?? preset.eventTypes,
  } as SegmentDefinition;
}

// ════════════════════════════════════════════════════════════════════
// VOCABULARY HELPER
// ════════════════════════════════════════════════════════════════════

/**
 * Cria uma função de tradução de vocabulário a partir de um SegmentVocabulary.
 *
 * Uso: const t = createVocabularyTranslator(vocab);
 *      t('session')  → "Aula" (martial) | "Ensaio" (dance) | "Sessão" (pilates)
 */
export function createVocabularyTranslator(
  vocab: SegmentVocabulary,
  locale?: string,
): (key: keyof SegmentVocabulary) => string {
  return (key) => {
    const entry = vocab[key];
    if (typeof entry === 'string') return entry; // emoji
    if (!entry) return key;
    if (locale && entry.translations?.[locale]) return entry.translations[locale];
    return entry.default;
  };
}

// ════════════════════════════════════════════════════════════════════
// MODULE CHECK
// ════════════════════════════════════════════════════════════════════

/**
 * Verifica se um módulo está habilitado na config efetiva.
 * 'enabled' → true
 * 'optional' → depende de unitOverride (default true)
 * 'disabled' → false
 */
export function isModuleEnabled(
  modules: SegmentModuleConfig,
  moduleKey: keyof SegmentModuleConfig,
  unitOverrides?: Partial<Record<keyof SegmentModuleConfig, boolean>>,
): boolean {
  const availability = modules[moduleKey];
  if (availability === 'enabled') return true;
  if (availability === 'disabled') return false;
  // optional → check unit override, default to true
  return unitOverrides?.[moduleKey] ?? true;
}

/**
 * Resolve todos os módulos ativos de uma vez.
 */
export function resolveEnabledModules(
  modules: SegmentModuleConfig,
  unitOverrides?: Partial<Record<keyof SegmentModuleConfig, boolean>>,
): Record<keyof SegmentModuleConfig, boolean> {
  const keys = Object.keys(modules) as (keyof SegmentModuleConfig)[];
  const result: Record<string, boolean> = {};
  for (const key of keys) {
    result[key] = isModuleEnabled(modules, key, unitOverrides);
  }
  return result as Record<keyof SegmentModuleConfig, boolean>;
}

// ════════════════════════════════════════════════════════════════════
// AUDIENCE RESOLVER
// ════════════════════════════════════════════════════════════════════

/**
 * Resolve o audience profile adequado com base na idade ou ID direto.
 */
export function resolveAudienceProfile(
  config: SegmentDefinition,
  criteria: { audienceId?: string; age?: number },
): AudienceProfile | undefined {
  if (criteria.audienceId) {
    return config.audienceProfiles.find(a => a.id === criteria.audienceId);
  }
  if (criteria.age !== undefined) {
    return config.audienceProfiles.find(a => {
      if (!a.ageRange) return false;
      return criteria.age! >= a.ageRange.min && criteria.age! <= a.ageRange.max;
    }) ?? config.audienceProfiles[0];
  }
  return config.audienceProfiles[0];
}
