/**
 * Anti-Corruption Layer — Public API
 *
 * This layer is the ONLY bridge between legacy (contracts.ts / services)
 * and the Domain Engine (lib/domain).
 *
 * Import rules:
 *   ✅ ACL can import from lib/domain and lib/api
 *   ✅ Application layer can import from ACL
 *   ❌ UI cannot import from ACL directly (use hooks)
 *   ❌ Domain cannot import from ACL
 *   ❌ Legacy services cannot import from ACL
 */

// Mappers
export {
  mapToProgressState,
  mapToPromotionRules,
  mapToEvaluation,
  mapToLegacyHistorico,
  mapToLegacySubniveis,
  resolveMilestoneId,
  resolveMilestoneVisual,
  getDefaultMilestones,
} from './mappers/progression.mapper';

// Segment resolver
export {
  resolveSegmentConfig,
  createVocabularyTranslator,
  isModuleEnabled,
  resolveEnabledModules,
  resolveAudienceProfile,
} from './segment-resolver';
