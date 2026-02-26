// ============================================================
// Instrutor Profile Mock — Bio, Certifications, Specialties
// ============================================================

export interface Certificacao {
  id: string;
  titulo: string;
  instituicao: string;
  ano: number;
}

export interface ProfessorPerfil {
  bio: string;
  anoInicioArtesMarciais: number;
  especialidades: string[];
  certificacoes: Certificacao[];
  redesSociais: { instagram?: string; youtube?: string; facebook?: string };
  totalSessõesMinistradas: number;
  alunosGraduados: number;
  turmasAtivas: number;
}

const PROFILE: ProfessorPerfil = {
  bio: 'Praticante de treinamento especializado desde 2005. Nível Máximo 3º subnível com foco em desenvolvimento técnico e formação de competidores. Acredito que o ambiente transforma vidas.',
  anoInicioArtesMarciais: 2005,
  especialidades: ['Guard', 'Leg Lock', 'Takedown', 'Half Guard'],
  certificacoes: [
    { id: 'cert-1', titulo: 'Nível Máximo 3º Subnível', instituicao: 'Federação', ano: 2020 },
    { id: 'cert-2', titulo: 'Curso de Pedagógia Esportiva', instituicao: 'CREF/MG', ano: 2018 },
    { id: 'cert-3', titulo: 'First Aid & CPR', instituicao: 'Cruz Vermelha', ano: 2022 },
  ],
  redesSociais: { instagram: '@mestrejoao_blackbelt', youtube: '', facebook: '' },
  totalSessõesMinistradas: 847,
  alunosGraduados: 23,
  turmasAtivas: 3,
};

export function getProfessorPerfil(): ProfessorPerfil {
  return { ...PROFILE, certificacoes: PROFILE.certificacoes.map(c => ({ ...c })) };
}

export function updateProfessorPerfil(data: Partial<ProfessorPerfil>): ProfessorPerfil {
  if (data.bio !== undefined) PROFILE.bio = data.bio;
  if (data.anoInicioArtesMarciais) PROFILE.anoInicioArtesMarciais = data.anoInicioArtesMarciais;
  if (data.especialidades) PROFILE.especialidades = data.especialidades;
  if (data.certificacoes) PROFILE.certificacoes = data.certificacoes;
  if (data.redesSociais) PROFILE.redesSociais = { ...PROFILE.redesSociais, ...data.redesSociais };
  return getProfessorPerfil();
}
