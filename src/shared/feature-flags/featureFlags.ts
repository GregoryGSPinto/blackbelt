export { FLAG_REGISTRY, type FlagId, type FeatureFlag, type FeatureFlagRow } from '@/lib/feature-flags/flags';
export { isEnabled, evaluateFlag, type FlagContext } from '@/lib/feature-flags/evaluate';
export { FeatureFlagProvider, FeatureFlagContext } from '@/lib/feature-flags/provider';
export { useFlag } from '@/lib/feature-flags/use-flag';
