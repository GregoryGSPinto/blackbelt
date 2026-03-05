/**
 * Daily Feedback Mock — Caixa de Dúvidas Pós-Sessão
 */

import { mockDelay } from '@/lib/env';
import type {
  PendingFeedback, DailyFeedback, FeedbackSubmission,
  FeedbackAlert,
} from '@/lib/api/daily-feedback.service';

// 50% chance of having pending feedback
const HAS_PENDING = Math.random() > 0.5;

export async function mockGetPendingFeedback(): Promise<PendingFeedback | null> {
  await mockDelay(200);
  if (!HAS_PENDING) return null;
  return {
    classId: 'CLASS_001',
    classDate: new Date(Date.now() - 86400000).toISOString(),
    className: 'Fundamentos — Guard Pass',
    professorName: 'Prof. Ricardo Almeida',
  };
}

export async function mockSubmitFeedback(data: FeedbackSubmission): Promise<DailyFeedback> {
  await mockDelay(400);
  return {
    id: `FB_${Date.now()}`,
    studentId: 'USR_ADULTO_01',
    classId: data.classId,
    classDate: new Date(Date.now() - 86400000).toISOString(),
    className: 'Fundamentos — Guard Pass',
    response: data.response,
    doubtDescription: data.doubtDescription,
    submittedAt: new Date().toISOString(),
  };
}

export async function mockGetFeedbackHistory(studentId: string): Promise<DailyFeedback[]> {
  await mockDelay(300);
  const responses: DailyFeedback['response'][] = ['ENTENDI_TUDO', 'DUVIDA', 'ENTENDI_TUDO', 'QUERO_REVISAR', 'ENTENDI_TUDO'];
  return responses.map((r, i) => ({
    id: `FB_HIST_${i}`,
    studentId,
    classId: `CLASS_${i}`,
    classDate: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    className: ['Guard Pass', 'Mount Escape', 'Armbar', 'Triangle', 'Sweep'][i],
    response: r,
    doubtDescription: r === 'DUVIDA' ? 'Não entendi a transição para as costas' : undefined,
    submittedAt: new Date(Date.now() - (i + 1) * 86400000 + 3600000).toISOString(),
  }));
}

const AI_CATEGORIES = ['Transição', 'Finalização', 'Defesa', 'Posicionamento', 'Raspagem'];
const AI_ACTIONS = [
  'Revisar vídeo de transição de guarda',
  'Praticar drill de hip escape',
  'Rever conceito de base e postura',
  'Agendar treino particular para reforço',
  'Assistir série "Fundamentos do Sweep"',
];

export async function mockGetProfessorAlerts(): Promise<FeedbackAlert[]> {
  await mockDelay(350);
  return [
    {
      id: 'ALERT_1',
      studentName: 'Carlos Ribeiro',
      studentAvatar: '🥋',
      className: 'Fundamentos — Guard Pass',
      classDate: new Date(Date.now() - 86400000).toISOString(),
      response: 'DUVIDA',
      doubtDescription: 'Não entendi a transição para as costas',
      aiClassification: {
        category: 'Transição',
        suggestedAction: 'Revisar vídeo "Transição Guarda → Costas"',
        suggestedVideo: { id: 'VID_023', title: 'Transição Guarda → Costas (Detalhe)' },
        confidence: 0.87,
      },
      read: false,
    },
    {
      id: 'ALERT_2',
      studentName: 'Marina Santos',
      studentAvatar: '🥋',
      className: 'Avançado — Leg Lock',
      classDate: new Date(Date.now() - 86400000).toISOString(),
      response: 'QUERO_REVISAR',
      read: false,
    },
    {
      id: 'ALERT_3',
      studentName: 'Pedro Lima',
      studentAvatar: '🥋',
      className: 'Fundamentos — Mount Escape',
      classDate: new Date(Date.now() - 172800000).toISOString(),
      response: 'DUVIDA',
      doubtDescription: 'Hip escape não funciona quando o oponente é mais pesado',
      aiClassification: {
        category: 'Defesa',
        suggestedAction: 'Praticar drill de hip escape com pressão',
        confidence: 0.92,
      },
      read: true,
    },
  ];
}
