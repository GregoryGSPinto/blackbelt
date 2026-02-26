/**
 * Mock Data — Perfil Estendido (modalidade, peso, atestado, termo)
 * TODO(BE-068): Substituir por endpoints reais
 */
import type { PerfilEstendido, Modalidade, CategoriaCompetidor, StatusDocumento } from '@/lib/api/contracts';

export const MODALIDADES_INFO: Record<Modalidade, { label: string; emoji: string }> = {
  pratica_gi: { label: 'Prática Gi', emoji: '🥋' },
  pratica_nogi: { label: 'Prática No-Gi', emoji: '💪' },
  mma: { label: 'MMA', emoji: '🥊' },
  muay_thai: { label: 'Muay Thai', emoji: '🦵' },
  wrestling: { label: 'Wrestling', emoji: '🤼' },
  judo: { label: 'Judô', emoji: '🏋️' },
};

export const CATEGORIAS_PESO: Record<CategoriaCompetidor, { label: string; pesoMax: string }> = {
  galo: { label: 'Galo', pesoMax: '57.5 kg' },
  pluma: { label: 'Pluma', pesoMax: '64 kg' },
  pena: { label: 'Pena', pesoMax: '70 kg' },
  leve: { label: 'Leve', pesoMax: '76 kg' },
  medio: { label: 'Médio', pesoMax: '82.3 kg' },
  meio_pesado: { label: 'Meio-Pesado', pesoMax: '88.3 kg' },
  pesado: { label: 'Pesado', pesoMax: '94.3 kg' },
  super_pesado: { label: 'Super-Pesado', pesoMax: '100.5 kg' },
  pesadissimo: { label: 'Pesadíssimo', pesoMax: 'Sem limite' },
};

export const STATUS_DOC_STYLE: Record<StatusDocumento, { label: string; color: string; bg: string }> = {
  pendente: { label: 'Pendente', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  enviado: { label: 'Enviado', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  aprovado: { label: 'Aprovado', color: 'text-green-400', bg: 'bg-green-500/10' },
  vencido: { label: 'Vencido', color: 'text-red-400', bg: 'bg-red-500/10' },
  rejeitado: { label: 'Rejeitado', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export const PERFIL_MOCK: PerfilEstendido = {
  modalidades: ['pratica_gi', 'pratica_nogi'],
  peso: 82,
  categoriaCompetidor: 'medio',
  atestadoMedico: { status: 'aprovado', dataEnvio: '2026-01-10', dataValidade: '2026-07-10' },
  termoResponsabilidade: { aceito: true, dataAceite: '2025-11-15', versao: 'v2.1' },
  termoImagem: { aceito: true, dataAceite: '2025-11-15' },
  objetivos: 'Competir no Campeonato Mineiro 2026',
  lesoes: 'Lesão no ombro esquerdo (2024) - recuperado',
  experienciaPrevia: '3 anos de treinamento especializado, nível básico',
};
