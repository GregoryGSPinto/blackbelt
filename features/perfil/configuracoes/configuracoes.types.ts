// ============================================================
// Configurações — Types, Constants & Mock Data
// ============================================================

import type { LucideIcon } from 'lucide-react';
import {
  Monitor, Activity, Zap, Shield, Eye, Palette, Globe, Sliders,
  UserCog, Lock, Camera, Bell, FileText, HelpCircle, Info,
} from 'lucide-react';

// ── Tab system ────────────────────────────────────────────────

export type Tab =
  | 'dispositivos'
  | 'reproducao'
  | 'ambiente'
  | 'membro'
  | 'acessibilidade'
  | 'visual'
  | 'idioma'
  | 'preferencias'
  | 'dados'
  | 'senha'
  | 'avatar'
  | 'notificacoes'
  | 'legal'
  | 'suporte'
  | 'sobre';

export interface TabDefinition {
  id: Tab;
  label: string;
  icon: LucideIcon;
}

export const TABS: TabDefinition[] = [
  { id: 'dados',          label: 'Meus Dados',        icon: UserCog },
  { id: 'avatar',         label: 'Foto',              icon: Camera },
  { id: 'senha',          label: 'Senha',             icon: Lock },
  { id: 'notificacoes',   label: 'Notificações',      icon: Bell },
  { id: 'dispositivos',   label: 'Dispositivos',      icon: Monitor },
  { id: 'reproducao',     label: 'Reprodução',        icon: Activity },
  { id: 'ambiente',         label: 'Modo Ambiente',       icon: Zap },
  { id: 'membro',         label: 'Minha Conta',       icon: Shield },
  { id: 'acessibilidade', label: 'Acessibilidade',    icon: Eye },
  { id: 'visual',         label: 'Visual / Tema',     icon: Palette },
  { id: 'idioma',         label: 'Idioma',            icon: Globe },
  { id: 'preferencias',   label: 'Preferências',      icon: Sliders },
  { id: 'legal',          label: 'Termos e Políticas', icon: FileText },
  { id: 'suporte',        label: 'Suporte',           icon: HelpCircle },
  { id: 'sobre',          label: 'Sobre o App',       icon: Info },
];

// ── Dispositivos ──────────────────────────────────────────────

export interface DeviceInfo {
  id: number;
  name: string;
  type: 'desktop' | 'smartphone' | 'tablet' | 'tv';
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const MOCK_DISPOSITIVOS: DeviceInfo[] = [
  { id: 1, name: 'Este dispositivo', type: 'desktop',     location: 'Belo Horizonte, MG', lastActive: 'Agora',      isCurrent: true },
  { id: 2, name: 'iPhone 13',        type: 'smartphone',  location: 'Belo Horizonte, MG', lastActive: 'Há 2 horas', isCurrent: false },
  { id: 3, name: 'iPad Pro',         type: 'tablet',      location: 'São Paulo, SP',      lastActive: 'Há 1 dia',   isCurrent: false },
  { id: 4, name: 'Smart TV LG',      type: 'tv',          location: 'Belo Horizonte, MG', lastActive: 'Há 3 dias',  isCurrent: false },
];

// ── Status de membro ──────────────────────────────────────────

export type MemberStatusType = 'ativa' | 'atencao' | 'bloqueada';

export interface MemberStatus {
  planType: string;
  status: MemberStatusType;
  nextRenewal: string;
  activeSince: string;
}

export const MOCK_MEMBER_STATUS: MemberStatus = {
  planType: 'Premium Família',
  status: 'ativa',
  nextRenewal: '15/03/2026',
  activeSince: '15/01/2024',
};

// ── Reprodução ────────────────────────────────────────────────

export type QualidadeId = 'auto' | 'economia' | 'maxima';

export interface QualidadeOption {
  id: QualidadeId;
  label: string;
  desc: string;
}

export const QUALIDADE_OPTIONS: QualidadeOption[] = [
  { id: 'auto',     label: 'Automático',        desc: 'Ajusta automaticamente baseado na conexão' },
  { id: 'economia', label: 'Economia de Dados',  desc: '480p - Ideal para dados móveis' },
  { id: 'maxima',   label: 'Máxima Qualidade',   desc: '1080p/4K - Requer banda larga' },
];

// ── Idioma ────────────────────────────────────────────────────

export interface IdiomaOption {
  code: string;
  name: string;
  flag: string;
}

export const IDIOMA_OPTIONS: IdiomaOption[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)',        flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español',             flag: '🇪🇸' },
];

// ── Configurações (state shape) ───────────────────────────────

export interface ConfigState {
  legendas: boolean;
  autoplay: boolean;
  qualidade: QualidadeId;
  tema: string;
  idioma: string;
  volume: number;
  downloadWifiOnly: boolean;
  modoAmbiente: boolean;
  telaAtiva: boolean;
  altoContrasteAmbiental: boolean;
}

export const DEFAULT_CONFIG: ConfigState = {
  legendas: true,
  autoplay: true,
  qualidade: 'auto',
  tema: 'escuro',
  idioma: 'pt-BR',
  volume: 80,
  downloadWifiOnly: true,
  modoAmbiente: false,
  telaAtiva: false,
  altoContrasteAmbiental: false,
};
