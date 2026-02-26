/**
 * Mock Data — Check-in QR — APENAS DESENVOLVIMENTO
 *
 * TODO(BE-060): Substituir por endpoints reais
 *   POST /checkin/register
 *   GET  /checkin/history/:alunoId
 *   POST /checkin/validate-qr
 */

import type { CheckIn, CheckInQR, CheckInResult, StatusOperacional } from '@/lib/api/contracts';

// ── Alunos mock (subset do admin.mock) ──
export const MOCK_ALUNOS_CHECKIN = [
  { id: 'u1', nome: 'Lucas Mendes', avatar: '🥋', graduacao: 'Nível Básico', status: 'ATIVO' as StatusOperacional },
  { id: 'u2', nome: 'Ana Carolina', avatar: '🥊', graduacao: 'Nível Intermediário', status: 'ATIVO' as StatusOperacional },
  { id: 'u3', nome: 'Pedro Santos', avatar: '💪', graduacao: 'Nível Iniciante', status: 'ATIVO' as StatusOperacional },
  { id: 'u4', nome: 'Julia Costa', avatar: '⭐', graduacao: 'Nível Básico', status: 'EM_ATRASO' as StatusOperacional },
  { id: 'u5', nome: 'Rafael Lima', avatar: '🔥', graduacao: 'Nível Avançado', status: 'ATIVO' as StatusOperacional },
  { id: 'u6', nome: 'Marcos Oliveira', avatar: '🛡️', graduacao: 'Nível Máximo', status: 'BLOQUEADO' as StatusOperacional },
  { id: 'u7', nome: 'Camila Souza', avatar: '💜', graduacao: 'Nível Intermediário', status: 'ATIVO' as StatusOperacional },
  { id: 'u8', nome: 'Thiago Ferreira', avatar: '🏆', graduacao: 'Nível Básico', status: 'ATIVO' as StatusOperacional },
];

// ── Check-ins recentes ──
const hoje = new Date().toISOString().split('T')[0];
const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const MOCK_CHECKINS: CheckIn[] = [
  { id: 'ck01', alunoId: 'u1', alunoNome: 'Lucas Mendes', turmaId: 't1', turmaNome: 'Adulto Manhã', dataHora: `${hoje}T07:05:00`, status: 'confirmado', method: 'QR' },
  { id: 'ck02', alunoId: 'u2', alunoNome: 'Ana Carolina', turmaId: 't1', turmaNome: 'Adulto Manhã', dataHora: `${hoje}T07:08:00`, status: 'confirmado', method: 'QR' },
  { id: 'ck03', alunoId: 'u5', alunoNome: 'Rafael Lima', turmaId: 't1', turmaNome: 'Adulto Manhã', dataHora: `${hoje}T07:12:00`, status: 'confirmado', method: 'MANUAL' },
  { id: 'ck04', alunoId: 'u7', alunoNome: 'Camila Souza', turmaId: 't2', turmaNome: 'Adulto Noite', dataHora: `${hoje}T19:02:00`, status: 'confirmado', method: 'QR' },
  { id: 'ck05', alunoId: 'u8', alunoNome: 'Thiago Ferreira', turmaId: 't2', turmaNome: 'Adulto Noite', dataHora: `${hoje}T19:05:00`, status: 'confirmado', method: 'QR' },
  { id: 'ck06', alunoId: 'u3', alunoNome: 'Pedro Santos', turmaId: 't3', turmaNome: 'Iniciantes', dataHora: `${hoje}T18:00:00`, status: 'confirmado', method: 'MANUAL' },
  { id: 'ck07', alunoId: 'u1', alunoNome: 'Lucas Mendes', turmaId: 't2', turmaNome: 'Adulto Noite', dataHora: `${ontem}T19:03:00`, status: 'confirmado', method: 'QR' },
  { id: 'ck08', alunoId: 'u2', alunoNome: 'Ana Carolina', turmaId: 't2', turmaNome: 'Adulto Noite', dataHora: `${ontem}T19:10:00`, status: 'confirmado', method: 'QR' },
  { id: 'ck09', alunoId: 'u5', alunoNome: 'Rafael Lima', turmaId: 't1', turmaNome: 'Adulto Manhã', dataHora: `${ontem}T07:00:00`, status: 'confirmado', method: 'MANUAL' },
  { id: 'ck10', alunoId: 'u7', alunoNome: 'Camila Souza', turmaId: 't1', turmaNome: 'Adulto Manhã', dataHora: `${ontem}T07:15:00`, status: 'confirmado', method: 'QR' },
  { id: 'ck11', alunoId: 'u8', alunoNome: 'Thiago Ferreira', turmaId: 't3', turmaNome: 'Iniciantes', dataHora: `${ontem}T18:05:00`, status: 'confirmado', method: 'QR' },
  { id: 'ck12', alunoId: 'u3', alunoNome: 'Pedro Santos', turmaId: 't3', turmaNome: 'Iniciantes', dataHora: `${ontem}T18:00:00`, status: 'confirmado', method: 'MANUAL' },
  // Older entries
  ...Array.from({ length: 8 }, (_, i) => {
    const d = new Date(Date.now() - (i + 2) * 86400000);
    const alunoIdx = i % MOCK_ALUNOS_CHECKIN.length;
    const a = MOCK_ALUNOS_CHECKIN[alunoIdx];
    return {
      id: `ck${13 + i}`,
      alunoId: a.id,
      alunoNome: a.nome,
      turmaId: i % 2 === 0 ? 't1' : 't2',
      turmaNome: i % 2 === 0 ? 'Adulto Manhã' : 'Adulto Noite',
      dataHora: `${d.toISOString().split('T')[0]}T${i % 2 === 0 ? '07' : '19'}:0${i}:00`,
      status: 'confirmado' as const,
      method: i % 3 === 0 ? 'MANUAL' as const : 'QR' as const,
    };
  }),
];

// ── QR Helpers ──

/** Generate a simple hash for QR anti-fraud */
export function generateQRHash(alunoId: string, timestamp: number): string {
  const raw = `${alunoId}:${timestamp}:blackbelt-secret`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(8, '0');
}

/** Validate a scanned QR code */
export function validateQR(qr: CheckInQR): CheckInResult {
  const aluno = MOCK_ALUNOS_CHECKIN.find(a => a.id === qr.alunoId);

  if (!aluno) {
    return { success: false, error: 'Aluno não encontrado' };
  }

  if (aluno.status === 'BLOQUEADO') {
    return {
      success: false,
      aluno,
      error: 'Aluno com acesso BLOQUEADO. Procure a administração.',
    };
  }

  if (aluno.status === 'CONGELADO') {
    return {
      success: false,
      aluno,
      error: 'Matrícula CONGELADA. Entre em contato com a recepção para reativar.',
    };
  }

  if (aluno.status === 'INATIVO') {
    return {
      success: false,
      aluno,
      error: 'Aluno INATIVO. É necessário reativar a matrícula na recepção.',
    };
  }

  // Check if QR is expired (> 90s)
  const age = Date.now() - qr.timestamp;
  if (age > 90000) {
    return { success: false, aluno, error: 'QR Code expirado. Peça ao aluno para gerar um novo.' };
  }

  // Validate hash
  const expectedHash = generateQRHash(qr.alunoId, qr.timestamp);
  if (qr.hash !== expectedHash) {
    return { success: false, error: 'QR Code inválido.' };
  }

  // Check duplicate today
  const today = new Date().toISOString().split('T')[0];
  const alreadyCheckedIn = MOCK_CHECKINS.some(
    c => c.alunoId === qr.alunoId && c.dataHora.startsWith(today)
  );

  const newCheckIn: CheckIn = {
    id: `ck_${Date.now()}`,
    alunoId: qr.alunoId,
    alunoNome: aluno.nome,
    turmaId: qr.turmaId || 't1',
    turmaNome: 'Adulto Manhã',
    dataHora: new Date().toISOString(),
    status: 'confirmado',
    method: 'QR',
  };

  return {
    success: true,
    checkIn: newCheckIn,
    aluno,
    error: alreadyCheckedIn ? 'Check-in já registrado hoje (duplicado permitido).' : undefined,
  };
}
