'use client';

/**
 * SEC-001: MIGRADO — Tokens agora usam httpOnly cookies via /api/auth/session.
 * localStorage foi removido. In-memory fallback para quando cookie API nao esta disponivel.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { TipoPerfil, User, CategoriaRegistro } from '@/lib/api/contracts';
import type { Session } from '@supabase/supabase-js';
import { hasRequiredSupabaseEnv } from '@/src/config/env';
import type { AuthSessionData, AuthSessionResponse } from '@/features/auth/session-contract';

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
let hasLoggedMissingSupabaseEnv = false;

function handleMissingSupabaseEnv(): void {
  if (hasLoggedMissingSupabaseEnv) return;
  hasLoggedMissingSupabaseEnv = true;

  logger.info(
    '[Auth]',
    'Supabase environment variables are not configured. Public routes will run without authenticated session support.',
  );
}

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
// SESSION API (httpOnly cookies — replaces localStorage)
// ============================================================

async function fetchSession(): Promise<AuthSessionData | null> {
  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    const { session } = await res.json() as AuthSessionResponse;
    return session;
  } catch {
    return null;
  }
}

async function saveSession(session: AuthSessionData): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ session }),
    });
  } catch {
    // fallback: keep in-memory only
  }
}

async function clearSession(): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
  } catch {
    // ignore
  }
}

// In-memory fallback (used when cookie API unavailable)
let _inMemoryUser: User | null = null;
let _inMemoryProfiles: User[] = [];
let _inMemoryLoginEmail: string | null = null;

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

/** Limpa toda a sessao (httpOnly cookie + in-memory) */
function clearStorage(): void {
  _inMemoryUser = null;
  _inMemoryProfiles = [];
  _inMemoryLoginEmail = null;
  if (typeof window !== 'undefined') {
    clearSession();
  }
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
    super_admin: 'SUPER_ADMIN',
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
    if (!IS_MOCK && !hasRequiredSupabaseEnv()) {
      handleMissingSupabaseEnv();
    }

    if (IS_MOCK) {
      loadSession();
    } else {
      loadSupabaseSession();
    }
  }, []);

  /** Load session from Supabase (non-mock mode) */
  async function loadSupabaseSession() {
    try {
      const { getSupabaseBrowserClientSafe } = await import('@/lib/supabase/client');
      const supabase = getSupabaseBrowserClientSafe();
      if (!supabase) {
        handleMissingSupabaseEnv();
        setUser(null);
        setAvailableProfiles([]);
        setLoading(false);
        return;
      }
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
        const profiles = memberships.map((m: any) =>
          buildUserFromSupabase(session, profile, m)
        );
        setAvailableProfiles(profiles);
      } else {
        setAvailableProfiles([builtUser]);
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
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
   * Carrega sessao do httpOnly cookie via API.
   * Fallback para in-memory se cookie nao disponivel.
   */
  async function loadSession() {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // Try to restore from httpOnly cookie via API
      const session = await fetchSession();
      if (session && isValidUser(session.user)) {
        _inMemoryUser = session.user;
        setUser(session.user);
        const nextLoginEmail = session.loginEmail || session.user.email;
        setLoginEmail(nextLoginEmail);
        _inMemoryLoginEmail = nextLoginEmail;

        if (Array.isArray(session.profiles) && session.profiles.every(isValidUser)) {
          setAvailableProfiles(session.profiles);
          _inMemoryProfiles = session.profiles;
        } else {
          setAvailableProfiles([session.user]);
        }

        setLoading(false);
        return;
      }

      // Fallback: check in-memory
      if (_inMemoryUser) {
        setUser(_inMemoryUser);
        setAvailableProfiles(_inMemoryProfiles.length ? _inMemoryProfiles : [_inMemoryUser]);
        setLoginEmail(_inMemoryLoginEmail || _inMemoryUser.email);
        setLoading(false);
        return;
      }

      setUser(null);
      setLoading(false);
    } catch (err) {
      logger.error('[Auth]', 'Erro ao carregar sessao', err);
      clearStorage();
      setUser(null);
      setLoading(false);
    }
  }

  /**
   * Persiste sessao via httpOnly cookie + in-memory fallback.
   */
  function persistSession(
    userData: User,
    profiles?: User[],
    nextLoginEmail?: string | null,
  ) {
    _inMemoryUser = userData;
    setUser(userData);
    const nextProfiles = profiles?.length ? profiles : [userData];
    setAvailableProfiles(nextProfiles);
    _inMemoryProfiles = nextProfiles;
    const resolvedLoginEmail = nextLoginEmail || userData.email;
    setLoginEmail(resolvedLoginEmail);
    _inMemoryLoginEmail = resolvedLoginEmail;
    if (typeof window !== 'undefined') {
      saveSession({
        mode: 'mock',
        user: userData,
        profiles: nextProfiles,
        loginEmail: resolvedLoginEmail,
      });
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
        const { getSupabaseBrowserClientSafe } = await import('@/lib/supabase/client');
        const supabase = getSupabaseBrowserClientSafe();
        if (!supabase) {
          handleMissingSupabaseEnv();
          setUser(null);
          setAvailableProfiles([]);
          return null;
        }
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
          setAvailableProfiles(memberships.map((m: any) =>
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

    // Guardar email original de login (in-memory para troca de perfil)
    setLoginEmail(email);
    _inMemoryLoginEmail = email;

    const { user: userDTO } = result;
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

    persistSession(authenticatedUser, profiles, email);
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
        const { getSupabaseBrowserClientSafe } = await import('@/lib/supabase/client');
        const supabase = getSupabaseBrowserClientSafe();
        if (supabase) {
          await supabase.auth.signOut();
        }
      } catch {}
    }

    clearStorage();
    // Navegar ANTES de limpar state (evita race condition com ProtectedRoute)
    // CRÍTICO: usar replace() em vez de push() para evitar loop de navegação
    try {
      router.replace('/login');
    } catch {
      // Fallback se router falhar
      if (typeof window !== 'undefined') window.location.href = '/login';
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
        const { getSupabaseBrowserClientSafe } = await import('@/lib/supabase/client');
        const supabase = getSupabaseBrowserClientSafe();
        if (!supabase) {
          handleMissingSupabaseEnv();
          return false;
        }
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

    persistSession(authenticatedUser, [authenticatedUser], userData.email);
    return true;
  };

  /**
   * Troca de perfil (para usuarios com multiplos perfis).
   */
  const setPerfil = (perfil: User) => {
    persistSession(
      perfil,
      _inMemoryProfiles.length ? _inMemoryProfiles : [perfil],
      loginEmail || _inMemoryLoginEmail || perfil.email,
    );
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
      // Usa email ORIGINAL de login (in-memory)
      const emailToVerify = loginEmail
        || _inMemoryLoginEmail
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
