/**
 * Auth Service Mock — APENAS DESENVOLVIMENTO
 * 
 * ⚠️ ESTE ARQUIVO NÃO DEVE SER INCLUÍDO NO BUILD DE PRODUÇÃO
 * 
 * Implementa simulação de autenticação JWT para desenvolvimento local.
 * Todo o código aqui é eliminado em produção via tree-shaking.
 */

import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/lib/api/types';
import type { TipoPerfil, KidRegistroData } from '@/lib/api/contracts';

// ============================================================
// TIPOS INTERNOS
// ============================================================

const DEV_REGISTRY_KEY = '__dev_blackbelt_registry';
const DEV_SEED_VERSION_KEY = '__dev_blackbelt_seed_version';
const CURRENT_SEED_VERSION = '7'; // Bumped: SUPER_ADMIN + Sofia login próprio

interface DevUser {
  id: string;
  email: string;
  passwordHash: string;
  nome: string;
  tipo: TipoPerfil;
  idade?: number;
  avatar?: string;
  graduacao?: string;
  instrutor?: string;
  turno?: string;
  unidadeId?: string;
  unidade?: string;
  categoria?: string;
  kids?: KidRegistroData[];
  parentEmail?: string;
  familyId?: string; // Identificador da família
}

// ============================================================
// HELPERS INTERNOS
// ============================================================

/** Hash simples para dev (simula bcrypt do server) */
function devHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `dev_hash_${Math.abs(hash).toString(36)}`;
}

/** Gera token base64 simulando JWT */
function devGenerateToken(user: Omit<DevUser, 'passwordHash'>): string {
  const payload = {
    sub: user.id,
    email: user.email,
    tipo: user.tipo,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const sig = btoa('dev-signature');
  return `${header}.${body}.${sig}`;
}

function devGetRegistry(): DevUser[] {
  try {
    const savedVersion = localStorage.getItem(DEV_SEED_VERSION_KEY);
    if (savedVersion !== CURRENT_SEED_VERSION) {
      localStorage.removeItem(DEV_REGISTRY_KEY);
      localStorage.removeItem('blackbelt_token');
      localStorage.removeItem('blackbelt_session');
      localStorage.removeItem('blackbelt_profiles');
      return devSeedRegistry();
    }
    const data = JSON.parse(localStorage.getItem(DEV_REGISTRY_KEY) || '[]');
    if (data.length === 0) return devSeedRegistry();
    return data;
  } catch {
    return devSeedRegistry();
  }
}

function devSaveRegistry(users: DevUser[]) {
  localStorage.setItem(DEV_REGISTRY_KEY, JSON.stringify(users));
}

/**
 * Seed — Usuários padrão para desenvolvimento.
 * Senha ÚNICA: blackbelt123
 * 
 * LOGINS DISPONÍVEIS:
 * ┌─────────────────────────────────┬──────────────────────────────┬────────────────┐
 * │ Perfil                          │ Email                        │ Senha          │
 * ├─────────────────────────────────┼──────────────────────────────┼────────────────┤
 * │ Aluno Adulto                    │ adulto@blackbelt.com         │ blackbelt123   │
 * │ Aluno Teen — Miguel Oliveira    │ miguel@blackbelt.com         │ blackbelt123   │
 * │ Aluno Teen — Beatriz Oliveira   │ beatriz@blackbelt.com        │ blackbelt123   │
 * │ Aluno Kids — Pedro Ferreira     │ kid@blackbelt.com            │ blackbelt123   │
 * │ Aluno Kids — Sofia Ferreira     │ sofia@blackbelt.com          │ blackbelt123   │
 * │ Pai/Responsável (Teen)          │ paiteen@blackbelt.com        │ blackbelt123   │
 * │ Pai/Responsável (Kids)          │ paikids@blackbelt.com        │ blackbelt123   │
 * │ Professor                       │ professor@blackbelt.com      │ blackbelt123   │
 * │ Administrador                   │ admin@blackbelt.com          │ blackbelt123   │
 * │ Super Admin                     │ superadmin@blackbelt.com     │ blackbelt123   │
 * └─────────────────────────────────┴──────────────────────────────┴────────────────┘
 * 
 * FAMÍLIAS:
 * ┌──────────────────┬──────────────────────────────────────────────────────────┐
 * │ Família Oliveira │ Roberto (pai) + Miguel (15) + Beatriz (14)              │
 * │ Família Ferreira │ Ana (mãe) + Pedro (8) + Sofia (6)                      │
 * └──────────────────┴──────────────────────────────────────────────────────────┘
 * 
 * Sistema de Família:
 * - Todos os membros compartilham o mesmo familyId
 * - Qualquer membro pode trocar para outro perfil da família (estilo Netflix)
 * - Login de qualquer membro descobre TODOS os perfis vinculados
 */
function devSeedRegistry(): DevUser[] {
  const senha = devHash('blackbelt123');

  const seeds: DevUser[] = [
    // ============================================================
    // ALUNO ADULTO (sem família)
    // ============================================================
    {
      id: 'USR_ADULTO_01',
      email: 'adulto@blackbelt.com',
      passwordHash: senha,
      nome: 'Carlos Silva',
      tipo: 'ALUNO_ADULTO',
      idade: 28,
      avatar: '🥋',
      graduacao: 'Nível Básico',
      instrutor: 'Prof. Ricardo',
      turno: 'Noite',
      unidade: 'BlackBelt Centro',
      categoria: 'Adulto',
    },

    // ============================================================
    // FAMÍLIA OLIVEIRA — Pai + 2 Adolescentes
    // familyId: 'FAM_OLIVEIRA'
    // ============================================================

    // Pai do Adolescente — Roberto Oliveira
    {
      id: 'USR_PAI_TEEN',
      email: 'paiteen@blackbelt.com',
      passwordHash: senha,
      nome: 'Roberto Oliveira',
      tipo: 'RESPONSAVEL',
      idade: 42,
      avatar: '👨',
      unidade: 'BlackBelt Centro',
      familyId: 'FAM_OLIVEIRA',
    },

    // Adolescente 1 — Miguel Oliveira (login próprio)
    {
      id: 'USR_TEEN_01',
      email: 'miguel@blackbelt.com',
      passwordHash: senha,
      nome: 'Miguel Oliveira',
      tipo: 'ALUNO_TEEN',
      idade: 15,
      avatar: '🤸',
      graduacao: 'Nível Iniciante',
      instrutor: 'Prof. Ricardo',
      turno: 'Tarde',
      unidade: 'BlackBelt Centro',
      categoria: 'Adolescente',
      parentEmail: 'paiteen@blackbelt.com',
      familyId: 'FAM_OLIVEIRA',
    },

    // Adolescente 2 — Beatriz Oliveira (login próprio)
    {
      id: 'USR_TEEN_02',
      email: 'beatriz@blackbelt.com',
      passwordHash: senha,
      nome: 'Beatriz Oliveira',
      tipo: 'ALUNO_TEEN',
      idade: 14,
      avatar: '💪',
      graduacao: 'Nível Cinza',
      instrutor: 'Prof. Ricardo',
      turno: 'Tarde',
      unidade: 'BlackBelt Centro',
      categoria: 'Adolescente',
      parentEmail: 'paiteen@blackbelt.com',
      familyId: 'FAM_OLIVEIRA',
    },

    // ============================================================
    // FAMÍLIA FERREIRA — Mãe + 2 Crianças
    // familyId: 'FAM_FERREIRA'
    // ============================================================

    // Mãe dos Kids — Ana Ferreira
    {
      id: 'USR_PAI_KIDS',
      email: 'paikids@blackbelt.com',
      passwordHash: senha,
      nome: 'Ana Ferreira',
      tipo: 'RESPONSAVEL',
      idade: 35,
      avatar: '👩',
      unidade: 'BlackBelt Centro',
      familyId: 'FAM_FERREIRA',
    },

    // Kid 1 — Pedro Ferreira (login próprio)
    {
      id: 'USR_KID_01',
      email: 'kid@blackbelt.com',
      passwordHash: senha,
      nome: 'Pedro Ferreira',
      tipo: 'ALUNO_KIDS',
      idade: 8,
      avatar: '👦',
      graduacao: 'Nível Iniciante',
      unidade: 'BlackBelt Centro',
      parentEmail: 'paikids@blackbelt.com',
      familyId: 'FAM_FERREIRA',
    },

    // Kid 2 — Sofia Ferreira (login próprio)
    {
      id: 'USR_KID_02',
      email: 'sofia@blackbelt.com',
      passwordHash: senha,
      nome: 'Sofia Ferreira',
      tipo: 'ALUNO_KIDS',
      idade: 6,
      avatar: '👧',
      graduacao: 'Nível Iniciante',
      unidade: 'BlackBelt Centro',
      parentEmail: 'paikids@blackbelt.com',
      familyId: 'FAM_FERREIRA',
    },

    // ============================================================
    // STAFF — Professor, Admin
    // ============================================================

    // Instrutor
    {
      id: 'USR_PROF_01',
      email: 'professor@blackbelt.com',
      passwordHash: senha,
      nome: 'Ricardo Almeida',
      tipo: 'INSTRUTOR',
      idade: 40,
      avatar: '🧔',
      graduacao: 'Nível Máximo 3º Subnível',
      unidade: 'BlackBelt Centro',
    },

    // Administrador
    {
      id: 'USR_ADMIN_01',
      email: 'admin@blackbelt.com',
      passwordHash: senha,
      nome: 'Marcos Costa',
      tipo: 'ADMINISTRADOR',
      idade: 45,
      avatar: '👨‍💼',
      graduacao: 'Nível Máximo',
      unidade: 'BlackBelt Centro',
    },

    // ============================================================
    // REVIEWER / DEMO — Conta para Apple/Google Store review
    // Tem perfil ADMINISTRADOR para acesso total
    // ============================================================
    {
      id: 'USR_REVIEWER_01',
      email: 'reviewer@blackbelt.com',
      passwordHash: devHash('BlackBelt@Review2026!'),
      nome: 'App Reviewer',
      tipo: 'ADMINISTRADOR',
      idade: 30,
      avatar: '🏆',
      graduacao: 'Nível Máximo',
      unidade: 'BlackBelt Demo',
    },
    // ── SUPPORT (Operador da Plataforma) ──
    {
      id: 'USR_SUPPORT_01',
      email: 'support@blackbelt.com',
      passwordHash: devHash('BlackBelt123'),
      nome: 'Suporte Técnico',
      tipo: 'SUPPORT',
      idade: 28,
      avatar: '🔧',
      graduacao: 'N/A',
      unidade: 'BlackBelt',
    },
    // ── UNIT_OWNER (Controlador da Unidade) ──
    {
      id: 'USR_OWNER_01',
      email: 'owner@blackbelt.com',
      passwordHash: devHash('BlackBelt123'),
      nome: 'Rafael BlackBelt',
      tipo: 'UNIT_OWNER',
      idade: 42,
      avatar: '🏛️',
      graduacao: 'Nível Máximo 3º Subnível',
      unidade: 'BlackBelt',
    },
    // ── SUPER_ADMIN (Acesso total ao sistema) ──
    {
      id: 'USR_SUPER_01',
      email: 'superadmin@blackbelt.com',
      passwordHash: senha,
      nome: 'Gregory Pinto',
      tipo: 'SUPER_ADMIN',
      idade: 30,
      avatar: '⚡',
      graduacao: 'Nível Máximo',
      unidade: 'BlackBelt',
    },
  ];

  devSaveRegistry(seeds);
  localStorage.setItem(DEV_SEED_VERSION_KEY, CURRENT_SEED_VERSION);
  return seeds;
}

function calcAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ============================================================
// DESCOBERTA DE FAMÍLIA
// ============================================================

/**
 * Dado um usuário, descobre TODOS os perfis da família.
 * 
 * Lógica Netflix/Disney+:
 * 1. Se o usuário tem familyId → todos com mesmo familyId
 * 2. Fallback: busca por parentEmail (pai encontra filhos, filho encontra irmãos)
 * 3. Sempre inclui o próprio usuário
 */
function discoverFamilyProfiles(user: DevUser, registry: DevUser[]): DevUser[] {
  const familyMembers = new Map<string, DevUser>();

  // Sempre incluir o próprio usuário
  familyMembers.set(user.id, user);

  // Método 1: familyId (mais confiável)
  if (user.familyId) {
    registry
      .filter(u => u.familyId === user.familyId)
      .forEach(u => familyMembers.set(u.id, u));
    return Array.from(familyMembers.values());
  }

  // Método 2: Fallback por parentEmail
  // Se é responsável → encontrar filhos
  if (user.tipo === 'RESPONSAVEL') {
    registry
      .filter(u => u.parentEmail === user.email)
      .forEach(u => familyMembers.set(u.id, u));
  }

  // Se é filho → encontrar pai e irmãos
  if (user.parentEmail) {
    // Encontrar o pai
    const parent = registry.find(u => u.email === user.parentEmail && u.tipo === 'RESPONSAVEL');
    if (parent) {
      familyMembers.set(parent.id, parent);
    }
    // Encontrar irmãos
    registry
      .filter(u => u.parentEmail === user.parentEmail)
      .forEach(u => familyMembers.set(u.id, u));
  }

  return Array.from(familyMembers.values());
}

// ============================================================
// API MOCK PÚBLICA
// ============================================================

export async function mockLogin(credentials: LoginRequest): Promise<LoginResponse | null> {
  await new Promise(r => setTimeout(r, 400));

  const registry = devGetRegistry();
  const hash = devHash(credentials.password);
  const found = registry.find(
    u => u.email === credentials.email && u.passwordHash === hash
  );

  if (!found) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userData } = found;

  // Descobrir TODOS os perfis da família
  const familyProfiles = discoverFamilyProfiles(found, registry);

  const linkedProfiles = familyProfiles.map(u => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ph, ...pd } = u;
    return {
      id: pd.id,
      nome: pd.nome,
      email: pd.email,
      tipo: pd.tipo || 'ALUNO_ADULTO',
      idade: pd.idade,
      avatar: pd.avatar,
      graduacao: pd.graduacao,
      instrutor: pd.instrutor,
      turno: pd.turno,
      unidadeId: pd.unidadeId,
      unidade: pd.unidade,
      permissoes: [],
    };
  });

  return {
    user: {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      tipo: userData.tipo || 'ALUNO_ADULTO',
      idade: userData.idade,
      avatar: userData.avatar,
      graduacao: userData.graduacao,
      instrutor: userData.instrutor,
      turno: userData.turno,
      unidadeId: userData.unidadeId,
      unidade: userData.unidade,
      permissoes: [],
    },
    token: devGenerateToken(userData),
    refreshToken: devGenerateToken({ ...userData, id: `refresh_${userData.id}` }),
    availableProfiles: linkedProfiles.length > 1 ? linkedProfiles : undefined,
  };
}

export async function mockRegister(data: RegisterRequest): Promise<RegisterResponse | null> {
  await new Promise(r => setTimeout(r, 400));

  const registry = devGetRegistry();
  if (registry.some(u => u.email === data.email)) return null;

  const newUser: DevUser = {
    id: `USR_${Date.now().toString(36)}`,
    email: data.email,
    passwordHash: devHash(data.password),
    nome: data.nome,
    tipo: 'ALUNO_ADULTO',
    idade: data.idade,
    categoria: data.categoria,
    graduacao: 'Nível Iniciante',
  };

  registry.push(newUser);
  devSaveRegistry(registry);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userData } = newUser;

  return {
    user: {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      tipo: 'ALUNO_ADULTO',
      idade: userData.idade,
      permissoes: [],
    },
    token: devGenerateToken(userData),
  };
}

export async function mockRegisterFull(data: {
  email: string;
  password: string;
  nome: string;
  idade?: number;
  categoria?: string;
  avatar?: string;
  tipo?: TipoPerfil;
  graduacao?: string;
  instrutor?: string;
  turno?: string;
  kids?: KidRegistroData[];
}): Promise<RegisterResponse | null> {
  await new Promise(r => setTimeout(r, 400));

  const registry = devGetRegistry();
  if (registry.some(u => u.email === data.email)) return null;

  const familyId = `FAM_${Date.now().toString(36)}`;

  const newUser: DevUser = {
    id: `USR_${Date.now().toString(36)}`,
    email: data.email,
    passwordHash: devHash(data.password),
    nome: data.nome,
    tipo: data.tipo || 'ALUNO_ADULTO',
    idade: data.idade,
    avatar: data.avatar,
    graduacao: data.graduacao || 'Nível Iniciante',
    instrutor: data.instrutor,
    turno: data.turno,
    categoria: data.categoria,
    kids: data.kids,
    familyId: data.kids && data.kids.length > 0 ? familyId : undefined,
  };

  registry.push(newUser);

  if (data.kids && Array.isArray(data.kids)) {
    const kidsAvatars = ['🧒', '👧', '👦', '🧒'];
    data.kids.forEach((k: KidRegistroData, index: number) => {
      if (k.nome) {
        const kidUser: DevUser = {
          id: `KID_${Date.now().toString(36)}_${index}`,
          email: `${data.email}`,
          passwordHash: '',
          nome: k.nome,
          tipo: 'ALUNO_KIDS',
          idade: k.dataNascimento ? calcAge(k.dataNascimento) : undefined,
          avatar: kidsAvatars[index % kidsAvatars.length],
          graduacao: 'Nível Iniciante',
          parentEmail: data.email,
          familyId,
        };
        registry.push(kidUser);
      }
    });
  }

  devSaveRegistry(registry);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userData } = newUser;

  return {
    user: {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      tipo: userData.tipo || 'ALUNO_ADULTO',
      idade: userData.idade,
      avatar: userData.avatar,
      permissoes: [],
    },
    token: devGenerateToken(userData),
  };
}

export function mockCheckEmailAvailable(email: string): boolean {
  const registry = devGetRegistry();
  return !registry.some(u => u.email === email);
}
