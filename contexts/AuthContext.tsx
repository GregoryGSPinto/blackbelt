'use client';

/**
 * TODO(SEC-001): MIGRAÇÃO DE SEGURANÇA — AuthContext → TokenStore
 *
 * ESTADO ATUAL: AuthContext usa localStorage para tokens (legado).
 * DESTINO:      Migrar para lib/security/token-store.ts (memória + httpOnly cookies).
 *
 * PLANO DE MIGRAÇÃO:
 * 1. Substituir localStorage.getItem(TOKEN_KEY) → tokenStore.getAccessToken()
 * 2. Substituir persistSession() → tokenStore.setAuth() + mockPersistSession()
 * 3. Substituir clearSession() → tokenStore.clearAuth() + mockClearSession()
 * 4. Substituir login flow → authService.secureLogin() (rate limit + audit)
 * 5. Substituir logout → authService.secureLogout()
 * 6. Remover todas as referências a localStorage
 *
 * DEPENDÊNCIAS: Todas as páginas que usam useAuth() — testar cada fluxo.
 * RISCO: Alto — qualquer erro quebra TODA autenticação.
 * ESTRATÉGIA: Feature flag (NEXT_PUBLIC_USE_SECURE_AUTH=true) para rollout gradual.
 *
 * NOVA INFRAESTRUTURA DISPONÍVEL:
 * - lib/security/token-store.ts   → Token em memória (sem localStorage)
 * - lib/security/rbac.ts          → RBAC + Policy Engine
 * - lib/security/audit.ts         → Audit log imutável
 * - lib/security/session.ts       → Gerenciamento de sessões
 * - lib/security/rate-limiter.ts  → Rate limiting no login
 * - lib/security/device-fingerprint.ts → Device fingerprint
 * - lib/api/auth.service.ts       → secureLogin() / secureLogout()
 * - middleware.ts                  → Proteção de rotas server-side
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { TipoPerfil, User, CategoriaRegistro } from '@/lib/api/contracts';
import type { Session } from '@supabase/supabase-js';

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Re-export para backward compatibility (consumidores existentes)
export type { TipoPerfil, User } from '@/lib/api/contracts';

// ============================================================
// CONSTANTES DE PERMISSÕES
// ============================================================

export const PERMISSOES = {
  VALIDAR_CHECKIN: 'validar_checkin',
  BLOQUEAR_ALUNO: 'bloquear_aluno',
  EDITAR_TURMAS: 'editar_turmas',
  ACESSAR_FINANCEIRO: 'acessar_financeiro',
  ACESSAR_CONFIGURACOES: 'acessar_configuracoes',
  GERENCIAR_USUARIOS: 'gerenciar_usuarios',
  VER_RELATORIOS: 'ver_relatorios',
  EDITAR_PAGAMENTOS: 'editar_pagamentos',
} as const;

export const PERMISSOES_POR_PERFIL: Record<TipoPerfil, string[]> = {
  ALUNO_ADULTO: [],
  ALUNO_KIDS: [],
  ALUNO_TEEN: [],
  RESPONSAVEL: [],
  INSTRUTOR: [PERMISSOES.VALIDAR_CHECKIN],
  GESTOR: [
    PERMISSOES.VALIDAR_CHECKIN,
    PERMISSOES.BLOQUEAR_ALUNO,
    PERMISSOES.EDITAR_TURMAS,
    PERMISSOES.ACESSAR_FINANCEIRO,
    PERMISSOES.VER_RELATORIOS,
    PERMISSOES.EDITAR_PAGAMENTOS,
  ],
  ADMINISTRADOR: [
    PERMISSOES.VALIDAR_CHECKIN,
    PERMISSOES.BLOQUEAR_ALUNO,
    PERMISSOES.EDITAR_TURMAS,
    PERMISSOES.ACESSAR_FINANCEIRO,
    PERMISSOES.ACESSAR_CONFIGURACOES,
    PERMISSOES.GERENCIAR_USUARIOS,
    PERMISSOES.VER_RELATORIOS,
    PERMISSOES.EDITAR_PAGAMENTOS,
  ],
  SUPER_ADMIN: Object.values(PERMISSOES),
  SUPPORT: [],
  UNIT_OWNER: [
    PERMISSOES.VALIDAR_CHECKIN,
    PERMISSOES.BLOQUEAR_ALUNO,
    PERMISSOES.EDITAR_TURMAS,
    PERMISSOES.ACESSAR_FINANCEIRO,
    PERMISSOES.ACESSAR_CONFIGURACOES,
    PERMISSOES.GERENCIAR_USUARIOS,
    PERMISSOES.VER_RELATORIOS,
    PERMISSOES.EDITAR_PAGAMENTOS,
  ],
  SYS_AUDITOR: [],
};

/** Informações visuais de um perfil (UI metadata — não é dados mock) */
export interface PerfilInfoUI {
  label: string;
  cor: string;
  icone: string;
  descricao: string;
  nome: string;
}

/** Mapa de perfis → metadata visual */
export const PERFIL_INFO: Record<TipoPerfil, PerfilInfoUI> = {
  ALUNO_ADULTO: {
    label: 'Aluno',
    cor: 'from-blue-600 to-blue-800',
    icone: '👤',
    descricao: 'Acesso ao app de treinos e conteúdo',
    nome: 'Aluno Adulto',
  },
  ALUNO_KIDS: {
    label: 'Kids',
    cor: 'from-pink-600 to-pink-800',
    icone: '👶',
    descricao: 'Acesso infantil com controle parental',
    nome: 'Aluno Kids (4-11 anos)',
  },
  ALUNO_TEEN: {
    label: 'Teen',
    cor: 'from-purple-600 to-purple-800',
    icone: '🧑',
    descricao: 'Acesso adolescente com autonomia guiada',
    nome: 'Aluno Teen (12-17 anos)',
  },
  RESPONSAVEL: {
    label: 'Pai / Responsável',
    cor: 'from-green-600 to-green-800',
    icone: '👨‍👩‍👧',
    descricao: 'Gerenciar check-in dos filhos',
    nome: 'Responsável',
  },
  INSTRUTOR: {
    label: 'Instrutor',
    cor: 'from-indigo-600 to-indigo-800',
    icone: '👨‍🏫',
    descricao: 'Gerenciar turmas e alunos',
    nome: 'Instrutor',
  },
  GESTOR: {
    label: 'Gestor',
    cor: 'from-purple-600 to-purple-800',
    icone: '🏢',
    descricao: 'Gestão completa da unidade',
    nome: 'Gestor',
  },
  ADMINISTRADOR: {
    label: 'Administrador',
    cor: 'from-orange-600 to-orange-800',
    icone: '🛠️',
    descricao: 'Administração do sistema',
    nome: 'Administrador',
  },
  SUPER_ADMIN: {
    label: 'Super Admin',
    cor: 'from-indigo-600 to-violet-700',
    icone: '⚡',
    descricao: 'Acesso total à plataforma',
    nome: 'Super Administrador',
  },
  SUPPORT: {
    label: 'Suporte',
    cor: 'from-emerald-600 to-emerald-800',
    icone: '🔧',
    descricao: 'Operador da plataforma — acesso técnico',
    nome: 'Suporte Técnico',
  },
  UNIT_OWNER: {
    label: 'Dono da Unidade',
    cor: 'from-amber-600 to-amber-800',
    icone: '🏛️',
    descricao: 'Controlador da unidade — gestão completa',
    nome: 'Proprietário',
  },
  SYS_AUDITOR: {
    label: 'Developer',
    cor: 'from-emerald-600 to-emerald-800',
    icone: '🔧',
    descricao: 'Auditoria técnica e monitoramento',
    nome: 'System Auditor',
  },
};

// ============================================================
// ROTAS POR PERFIL
// ============================================================

const REDIRECT_MAP: Record<TipoPerfil, string> = {
  ALUNO_ADULTO: '/inicio',
  ALUNO_TEEN: '/teen-inicio',
  ALUNO_KIDS: '/kids-inicio',
  RESPONSAVEL: '/painel-responsavel',
  INSTRUTOR: '/professor-dashboard',
  // Corporativo → dashboard (admin layout wraps it)
  SUPPORT: '/developer',
  UNIT_OWNER: '/dashboard',
  // Legacy
  GESTOR: '/dashboard',
  ADMINISTRADOR: '/dashboard',
  SUPER_ADMIN: '/super-admin',
  SYS_AUDITOR: '/developer',
};

export function getRedirectForProfile(tipo: TipoPerfil): string {
  return REDIRECT_MAP[tipo] || '/inicio';
}

/** Rota de configurações por tipo de perfil */
const CONFIG_MAP: Record<TipoPerfil, string> = {
  ALUNO_ADULTO: '/perfil/configuracoes',
  ALUNO_TEEN: '/teen-perfil',
  ALUNO_KIDS: '/kids-inicio',
  RESPONSAVEL: '/painel-responsavel',
  INSTRUTOR: '/professor-perfil',
  GESTOR: '/configuracoes',
  ADMINISTRADOR: '/configuracoes',
  SUPER_ADMIN: '/super-admin',
  UNIT_OWNER: '/configuracoes',
  SUPPORT: '/configuracoes',
  SYS_AUDITOR: '/configuracoes',
};

export function getConfigRouteForProfile(tipo: TipoPerfil): string {
  return CONFIG_MAP[tipo] || '/configuracoes';
}

// ============================================================
// STORAGE KEYS (Token-based)
// ============================================================

const TOKEN_KEY = 'blackbelt_token';
const REFRESH_TOKEN_KEY = 'blackbelt_refresh_token';
const SESSION_KEY = 'blackbelt_session';
const PROFILES_KEY = 'blackbelt_profiles';

// ============================================================
// TYPE GUARDS & HELPERS
// ============================================================

const VALID_PERFIS: ReadonlySet<string> = new Set<TipoPerfil>([
  'ALUNO_ADULTO', 'ALUNO_KIDS', 'ALUNO_TEEN',
  'RESPONSAVEL', 'INSTRUTOR', 'GESTOR',
  'ADMINISTRADOR', 'SUPER_ADMIN',
  'SUPPORT', 'UNIT_OWNER', 'SYS_AUDITOR',
]);

/** Type guard: string é um TipoPerfil válido */
function isValidTipoPerfil(value: unknown): value is TipoPerfil {
  return typeof value === 'string' && VALID_PERFIS.has(value);
}

/** Converte valor para TipoPerfil com fallback seguro */
function safeTipoPerfil(value: unknown): TipoPerfil {
  return isValidTipoPerfil(value) ? value : 'ALUNO_ADULTO';
}

/** Type guard: objeto tem estrutura mínima de User */
function isValidUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    isValidTipoPerfil(obj.tipo)
  );
}

/** Verifica se JWT está expirado (retorna true se expirado ou inválido) */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false; // Não é JWT, assumir válido (mock)
    const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>;
    if (typeof payload.exp !== 'number') return false; // Sem exp, assumir válido
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Não decodificável = inválido
  }
}

/** Limpa toda a sessão do storage */
function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PROFILES_KEY);
  localStorage.removeItem('blackbelt_login_email');
}

// ============================================================
// CONTEXT DEFINITION
// ============================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  /** Perfis disponíveis para troca (vinculados ao email) */
  availableProfiles: User[];

  login: (email: string, password: string) => Promise<TipoPerfil | null>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;

  setPerfil: (perfil: User) => void;

  hasPermission: (permissao: string) => boolean;
  isAdmin: () => boolean;
  isSupport: () => boolean;
  isUnitOwner: () => boolean;
  isInstrutor: () => boolean;
  isAluno: () => boolean;

  /** Verifica se a senha está correta (para troca de perfil) */
  verifyPassword: (password: string) => Promise<boolean>;
}

interface RegisterData {
  nome: string;
  email: string;
  password: string;
  idade?: number;
  categoria?: CategoriaRegistro;
  graduacao?: string;
  instrutor?: string;
  turno?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

/** Map Supabase role to BlackBelt TipoPerfil */
function mapSupabaseRoleToTipoPerfil(role: string): TipoPerfil {
  const map: Record<string, TipoPerfil> = {
    student: 'ALUNO_ADULTO',
    professor: 'INSTRUTOR',
    admin: 'ADMINISTRADOR',
    owner: 'UNIT_OWNER',
    parent: 'RESPONSAVEL',
  };
  return map[role] || 'ALUNO_ADULTO';
}

/** Build a User object from Supabase session + profile/membership data */
function buildUserFromSupabase(
  session: Session,
  profile: { full_name: string; display_name?: string | null; avatar_url?: string | null } | null,
  membership: { role: string; academy_id: string; belt_rank?: string | null } | null,
): User {
  const tipo = membership ? mapSupabaseRoleToTipoPerfil(membership.role) : 'ALUNO_ADULTO';
  return {
    id: session.user.id,
    nome: profile?.full_name || session.user.email || '',
    email: session.user.email || '',
    tipo,
    avatar: profile?.avatar_url || undefined,
    unidadeId: membership?.academy_id,
    graduacao: membership?.belt_rank || undefined,
    permissoes: PERMISSOES_POR_PERFIL[tipo] || [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (IS_MOCK) {
      loadSession();
    } else {
      loadSupabaseSession();
    }
  }, []);

  /** Load session from Supabase (non-mock mode) */
  async function loadSupabaseSession() {
    try {
      const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch profile and membership
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, display_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      const { data: memberships } = await supabase
        .from('memberships')
        .select('role, academy_id, belt_rank')
        .eq('profile_id', session.user.id);

      const primaryMembership = memberships?.[0] || null;
      const builtUser = buildUserFromSupabase(session, profile, primaryMembership);
      setUser(builtUser);

      // Build available profiles from all memberships
      if (memberships && memberships.length > 1) {
        const profiles = memberships.map(m =>
          buildUserFromSupabase(session, profile, m)
        );
        setAvailableProfiles(profiles);
      } else {
        setAvailableProfiles([builtUser]);
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        if (!newSession) {
          setUser(null);
          setAvailableProfiles([]);
        }
      });

      setLoading(false);
    } catch (err) {
      logger.error('[Auth]', 'Error loading Supabase session', err);
      setUser(null);
      setLoading(false);
    }
  }

  /**
   * Carrega sessão do storage.
   * Sessão só é válida se TOKEN existir e não estiver expirado.
   * Sem token = não autenticado.
   */
  // Versão da app (deve coincidir com CURRENT_SEED_VERSION no auth.service)
  const APP_VERSION = '2';
  const APP_VERSION_KEY = 'blackbelt_app_version';

  function loadSession() {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // Se versão da app mudou, limpar sessão antiga (força re-login com seed novo)
      const savedVersion = localStorage.getItem(APP_VERSION_KEY);
      if (savedVersion !== APP_VERSION) {
        clearStorage();
        localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
        setUser(null);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Verificar expiração do JWT
      if (isTokenExpired(token)) {
        logger.info('[Auth]', 'Token expirado, limpando sessão');
        clearStorage();
        setUser(null);
        setLoading(false);
        return;
      }

      // Carregar e validar dados do usuário
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) {
        logger.warn('[Auth]', 'Token sem sessão, limpando');
        clearStorage();
        setUser(null);
        setLoading(false);
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(sessionStr);
      } catch {
        logger.warn('[Auth]', 'Sessão JSON inválido, limpando');
        clearStorage();
        setUser(null);
        setLoading(false);
        return;
      }

      if (!isValidUser(parsed)) {
        logger.warn('[Auth]', 'Sessão sem campos obrigatórios, limpando');
        clearStorage();
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(parsed);

      // Restaurar email original de login
      const savedLoginEmail = localStorage.getItem('blackbelt_login_email');
      if (savedLoginEmail) setLoginEmail(savedLoginEmail);

      // Restaurar perfis disponíveis
      const profilesStr = localStorage.getItem(PROFILES_KEY);
      if (profilesStr) {
        try {
          const profilesParsed: unknown = JSON.parse(profilesStr);
          if (Array.isArray(profilesParsed) && profilesParsed.every(isValidUser)) {
            setAvailableProfiles(profilesParsed);
          } else {
            setAvailableProfiles([parsed]);
          }
        } catch {
          setAvailableProfiles([parsed]);
        }
      } else {
        setAvailableProfiles([parsed]);
      }

      setLoading(false);
    } catch (err) {
      logger.error('[Auth]', 'Erro ao carregar sessão', err);
      clearStorage();
      setUser(null);
      setLoading(false);
    }
  }

  /**
   * Persiste sessão: token + refreshToken + dados do usuário + perfis.
   */
  function persistSession(
    token: string,
    userData: User,
    profiles?: User[],
    refreshToken?: string,
  ) {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      if (profiles) {
        setAvailableProfiles(profiles);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      }
    }
  }

  /**
   * Login: envia credenciais para o serviço → recebe token + user.
   * O front-end NUNCA valida a senha.
   */
  const login = async (email: string, password: string): Promise<TipoPerfil | null> => {
    if (!IS_MOCK) {
      // Supabase auth
      try {
        const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) return null;

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, display_name, avatar_url')
          .eq('id', data.session.user.id)
          .single();

        const { data: memberships } = await supabase
          .from('memberships')
          .select('role, academy_id, belt_rank')
          .eq('profile_id', data.session.user.id);

        const primaryMembership = memberships?.[0] || null;
        const builtUser = buildUserFromSupabase(data.session, profile, primaryMembership);
        setUser(builtUser);

        if (memberships && memberships.length > 1) {
          setAvailableProfiles(memberships.map(m =>
            buildUserFromSupabase(data.session!, profile, m)
          ));
        } else {
          setAvailableProfiles([builtUser]);
        }

        return builtUser.tipo;
      } catch {
        return null;
      }
    }

    // Mock auth
    const result = await authService.login({ email, password });
    if (!result) return null;

    // Guardar email original de login (para verificação de senha na troca de perfil)
    setLoginEmail(email);
    try { localStorage.setItem('blackbelt_login_email', email); } catch {}

    const { user: userDTO, token, refreshToken } = result;
    const tipo = safeTipoPerfil(userDTO.tipo);
    const authenticatedUser: User = {
      ...userDTO,
      tipo,
      permissoes: userDTO.permissoes?.length ? userDTO.permissoes : PERMISSOES_POR_PERFIL[tipo] || [],
    };

    // Converter perfis disponíveis (se multi-perfil)
    const profiles: User[] = result.availableProfiles
      ? result.availableProfiles.map(p => {
          const pTipo = safeTipoPerfil(p.tipo);
          return {
            ...p,
            tipo: pTipo,
            permissoes: p.permissoes?.length ? p.permissoes : PERMISSOES_POR_PERFIL[pTipo] || [],
          };
        })
      : [authenticatedUser];

    persistSession(token, authenticatedUser, profiles, refreshToken);
    return authenticatedUser.tipo;
  };

  /**
   * Logout: remove token + sessão → redireciona para login.
   * Ordem: limpar storage → navegar → limpar state
   * (garante que navegação acontece antes do component desmontar)
   */
  const logout = async () => {
    if (!IS_MOCK) {
      try {
        const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch {}
    }

    clearStorage();
    // Navegar ANTES de limpar state (evita race condition com ProtectedRoute)
    // CRÍTICO: usar replace() em vez de push() para evitar loop de navegação
    try {
      router.replace('/landing');
    } catch {
      // Fallback se router falhar
      if (typeof window !== 'undefined') window.location.href = '/landing';
    }
    setUser(null);
    setAvailableProfiles([]);
    setLoginEmail(null);
  };

  /**
   * Registro: envia dados para o serviço → recebe token + user.
   */
  const register = async (userData: RegisterData): Promise<boolean> => {
    if (!IS_MOCK) {
      try {
        const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: { full_name: userData.nome },
          },
        });
        if (error || !data.user) return false;

        // Create profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('profiles').insert({
          id: data.user.id,
          full_name: userData.nome,
        });

        const builtUser: User = {
          id: data.user.id,
          nome: userData.nome,
          email: userData.email,
          tipo: 'ALUNO_ADULTO',
          idade: userData.idade,
          graduacao: userData.graduacao,
          categoria: userData.categoria,
          permissoes: [],
        };

        setUser(builtUser);
        setAvailableProfiles([builtUser]);
        return true;
      } catch {
        return false;
      }
    }

    // Mock register
    const result = await authService.register({
      nome: userData.nome,
      email: userData.email,
      password: userData.password,
      idade: userData.idade,
      categoria: userData.categoria,
    });

    if (!result) return false;

    const authenticatedUser: User = {
      id: result.user.id,
      nome: result.user.nome,
      email: result.user.email,
      tipo: 'ALUNO_ADULTO',
      idade: result.user.idade,
      graduacao: userData.graduacao,
      instrutor: userData.instrutor,
      turno: userData.turno,
      categoria: userData.categoria,
      permissoes: [],
    };

    persistSession(result.token, authenticatedUser);
    return true;
  };

  /**
   * Troca de perfil (para usuários com múltiplos perfis).
   * Em produção, o back-end pode retornar novo token para o perfil selecionado.
   */
  const setPerfil = (perfil: User) => {
    // Mantém o token atual, atualiza apenas os dados do usuário
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (currentToken) {
      persistSession(currentToken, perfil);
    }
  };

  const hasPermission = (permissao: string): boolean => {
    if (!user) return false;
    return user.permissoes.includes(permissao);
  };

  const isAdmin = (): boolean => {
    return user?.tipo === 'ADMINISTRADOR' || user?.tipo === 'SUPER_ADMIN'
      || user?.tipo === 'GESTOR' || user?.tipo === 'UNIT_OWNER';
  };

  const isSupport = (): boolean => {
    return user?.tipo === 'SUPPORT' || user?.tipo === 'SYS_AUDITOR';
  };

  const isUnitOwner = (): boolean => {
    return user?.tipo === 'UNIT_OWNER' || user?.tipo === 'ADMINISTRADOR'
      || user?.tipo === 'SUPER_ADMIN' || user?.tipo === 'GESTOR';
  };

  const isInstrutor = (): boolean => {
    return user?.tipo === 'INSTRUTOR';
  };

  const isAluno = (): boolean => {
    return user?.tipo === 'ALUNO_ADULTO' || user?.tipo === 'ALUNO_KIDS' || user?.tipo === 'ALUNO_TEEN';
  };

  /**
   * Verifica se a senha está correta — usado para troca de perfil.
   * Tenta login com o email da sessão atual + senha fornecida.
   * Não altera o estado da sessão.
   */
  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!user) return false;
    try {
      // Usa email ORIGINAL de login (não o email do perfil atual)
      const emailToVerify = loginEmail
        || localStorage.getItem('blackbelt_login_email')
        || user.email;
      const result = await authService.login({ email: emailToVerify, password });
      return result !== null;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        availableProfiles,
        login,
        logout,
        register,
        setPerfil,
        hasPermission,
        isAdmin,
        isSupport,
        isUnitOwner,
        isInstrutor,
        isAluno,
        verifyPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOKS
// ============================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export function useUserProfile() {
  const auth = useAuth();
  return {
    perfil: auth.user,
    setPerfil: auth.setPerfil,
    logout: auth.logout,
    hasPermission: auth.hasPermission,
    isAdmin: auth.isAdmin,
    isSupport: auth.isSupport,
    isUnitOwner: auth.isUnitOwner,
    isInstrutor: auth.isInstrutor,
    isAluno: auth.isAluno,
  };
}


