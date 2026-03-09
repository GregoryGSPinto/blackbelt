export const FEATURE_FLAGS = {
  NEW_CHECKIN_FLOW: 'NEW_CHECKIN_FLOW',
  EXPERIMENTAL_AI_COACH: 'EXPERIMENTAL_AI_COACH',
  ADVANCED_ANALYTICS: 'ADVANCED_ANALYTICS',
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

type RuntimeContext = {
  academyId?: string | null;
  userId?: string | null;
  userRole?: string | null;
};

type FeatureFlagConfig = {
  defaultEnabled: boolean;
  envVar: string;
  rolloutPercentage?: number;
  allowedRoles?: readonly string[];
};

const FEATURE_FLAG_CONFIG: Record<FeatureFlagName, FeatureFlagConfig> = {
  NEW_CHECKIN_FLOW: {
    defaultEnabled: false,
    envVar: 'NEXT_PUBLIC_FLAG_NEW_CHECKIN_FLOW',
    rolloutPercentage: 0,
  },
  EXPERIMENTAL_AI_COACH: {
    defaultEnabled: false,
    envVar: 'NEXT_PUBLIC_FLAG_EXPERIMENTAL_AI_COACH',
    rolloutPercentage: 0,
    allowedRoles: ['ADMINISTRADOR', 'SUPER_ADMIN', 'INSTRUTOR'],
  },
  ADVANCED_ANALYTICS: {
    defaultEnabled: false,
    envVar: 'NEXT_PUBLIC_FLAG_ADVANCED_ANALYTICS',
    rolloutPercentage: 0,
    allowedRoles: ['ADMINISTRADOR', 'SUPER_ADMIN'],
  },
};

function parseBoolean(value: string | undefined): boolean | null {
  if (!value) return null;
  if (value === '1' || value.toLowerCase() === 'true') return true;
  if (value === '0' || value.toLowerCase() === 'false') return false;
  return null;
}

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

export function isFeatureFlagEnabled(flag: FeatureFlagName, context: RuntimeContext = {}): boolean {
  const config = FEATURE_FLAG_CONFIG[flag];
  const envValue = parseBoolean(process.env[config.envVar]);
  const enabled = envValue ?? config.defaultEnabled;

  if (!enabled) return false;

  if (config.allowedRoles?.length && context.userRole && !config.allowedRoles.includes(context.userRole)) {
    return false;
  }

  if (config.rolloutPercentage && config.rolloutPercentage > 0) {
    const rolloutKey = context.userId ?? context.academyId;
    if (!rolloutKey) return false;
    return stableHash(`${flag}:${rolloutKey}`) < config.rolloutPercentage;
  }

  return true;
}
