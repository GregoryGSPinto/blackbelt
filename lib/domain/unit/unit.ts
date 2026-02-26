/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  UNIT — A unidade de negócio (tenant)                          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  A unidade é o container de tudo. Cada unidade pertence a um   ║
 * ║  segmento e configura como o sistema se comporta para ela.     ║
 * ║                                                                 ║
 * ║  A unidade NÃO é uma "academia". É qualquer negócio baseado   ║
 * ║  em evolução humana: escola de dança, estúdio de pilates,     ║
 * ║  centro de treinamento, escola de música.                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  UnitId, SegmentId, VisualIdentity, LocalizedText,
  Auditable, ISODate, HexColor,
} from '../shared/kernel';
import type { SegmentType, SegmentDefinition } from '../segment/segment';
import type { GamificationConfig } from '../recognition/recognition';

// ════════════════════════════════════════════════════════════════════
// UNIT — Entidade principal (tenant)
// ════════════════════════════════════════════════════════════════════

export type UnitPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type UnitStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL';

export interface Unit extends Auditable {
  id: UnitId;

  /** Nome da unidade ("Academia BlackBelt Centro", "Studio Flow") */
  name: string;

  /** Slug para URL (blackbelt-centro, studio-flow) */
  slug: string;

  /** Segmento de negócio */
  segmentType: SegmentType;

  /**
   * Configuração de segmento efetiva.
   *
   * Começa como cópia do preset padrão do segmento.
   * O admin pode customizar vocabulário, módulos, audiências, etc.
   * Cada customização sobrescreve apenas o campo alterado.
   */
  segmentConfig: SegmentDefinition;

  /** Plano da unidade */
  plan: UnitPlan;

  /** Status */
  status: UnitStatus;

  /** Branding da unidade */
  branding: UnitBranding;

  /** Endereço */
  address?: UnitAddress;

  /** Horário de funcionamento */
  operatingHours?: OperatingHours[];

  /** Configuração de gamificação */
  gamification: GamificationConfig;

  /** Configurações gerais */
  settings: UnitSettings;

  /** Estatísticas (calculadas) */
  stats?: UnitStats;
}

// ════════════════════════════════════════════════════════════════════
// BRANDING — Identidade visual da unidade
// ════════════════════════════════════════════════════════════════════

export interface UnitBranding {
  /** Logo principal (URL) */
  logoUrl?: string;
  /** Logo para fundo escuro */
  logoDarkUrl?: string;
  /** Logo para fundo claro */
  logoLightUrl?: string;
  /** Favicon */
  faviconUrl?: string;
  /** Cor primária */
  primaryColor: HexColor;
  /** Cor secundária */
  secondaryColor?: HexColor;
  /** Background image (login, landing) */
  backgroundImageUrl?: string;
}

// ════════════════════════════════════════════════════════════════════
// ADDRESS & HOURS
// ════════════════════════════════════════════════════════════════════

export interface UnitAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

export interface OperatingHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  openTime: string;  // "06:00"
  closeTime: string; // "22:00"
  closed: boolean;
}

// ════════════════════════════════════════════════════════════════════
// SETTINGS — Configurações gerais da unidade
// ════════════════════════════════════════════════════════════════════

export interface UnitSettings {
  /** Fuso horário */
  timezone: string;

  /** Idioma padrão */
  defaultLocale: string;

  /** Moeda */
  currency: string;

  /** Métodos de check-in habilitados */
  checkinMethods: CheckinMethodConfig[];

  /** Requer atestado médico? */
  requiresMedicalClearance: boolean;

  /** Requer termo de responsabilidade? */
  requiresLiabilityWaiver: boolean;

  /** Requer termo de imagem? */
  requiresImageConsent: boolean;

  /** Permitir perfil público de participantes? */
  allowPublicProfiles: boolean;

  /** Permitir auto-inscrição em eventos? */
  allowSelfEventRegistration: boolean;
}

export interface CheckinMethodConfig {
  method: 'QR' | 'MANUAL' | 'BIOMETRIC' | 'APP' | 'GUARDIAN_REMOTE';
  enabled: boolean;
}

// ════════════════════════════════════════════════════════════════════
// SPACE — Espaço físico dentro da unidade
// ════════════════════════════════════════════════════════════════════

/**
 * Espaço — Sala, tatame, estúdio, pista.
 *
 * O nome vem do vocabulário do segmento:
 * BJJ → "Tatame", Dança → "Sala", Pilates → "Estúdio"
 */
export interface Space {
  id: string;
  unitId: UnitId;
  name: string;
  capacity: number;
  description?: string;
  active: boolean;
}

// ════════════════════════════════════════════════════════════════════
// STATS (read model)
// ════════════════════════════════════════════════════════════════════

export interface UnitStats {
  totalActiveParticipants: number;
  totalInstructors: number;
  totalActiveTracks: number;
  monthlyCheckins: number;
  monthlyRevenue?: number;
  retentionRate?: number;
}
