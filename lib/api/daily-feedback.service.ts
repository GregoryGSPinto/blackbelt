/**
 * Daily Feedback Service — Caixa de Dúvidas Pós-Sessão
 *
 * Fluxo:
 * 1. Sessão termina → sistema marca presença
 * 2. Antes do próximo check-in, se aluno não respondeu feedback:
 *    exibir caixa obrigatória
 * 3. Se dúvida marcada: IA classifica → professor recebe alerta → IA sugere reforço
 *
 * TODO(BE-046): POST /feedback/submit
 * TODO(BE-047): GET  /feedback/pending
 * TODO(BE-048): GET  /feedback/student/:id/history
 * TODO(BE-049): POST /feedback/ai-classify
 */

import { useMock } from '@/lib/env';

// ============================================================
// DTOs
// ============================================================

export type FeedbackOption = 'DUVIDA' | 'ENTENDI_TUDO' | 'QUERO_REVISAR';

export interface DailyFeedback {
  id: string;
  studentId: string;
  classId: string;
  classDate: string;
  className: string;
  response: FeedbackOption;
  doubtDescription?: string;
  submittedAt: string;
}

export interface PendingFeedback {
  classId: string;
  classDate: string;
  className: string;
  professorName: string;
}

export interface FeedbackAIClassification {
  category: string;
  suggestedAction: string;
  suggestedVideo?: { id: string; title: string };
  confidence: number;
}

export interface FeedbackSubmission {
  classId: string;
  response: FeedbackOption;
  doubtDescription?: string;
}

export interface FeedbackAlert {
  id: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  classDate: string;
  response: FeedbackOption;
  doubtDescription?: string;
  aiClassification?: FeedbackAIClassification;
  read: boolean;
}

// ============================================================
// API
// ============================================================

export async function getPendingFeedback(): Promise<PendingFeedback | null> {
  if (useMock()) {
    const { mockGetPendingFeedback } = await import('./daily-feedback.mock');
    return mockGetPendingFeedback();
  }
  // TODO(BBOS-Phase-2): implement real backend — POST /feedback/pending
  throw new Error('Backend not connected');
}

export async function submitFeedback(data: FeedbackSubmission): Promise<DailyFeedback> {
  if (useMock()) {
    const { mockSubmitFeedback } = await import('./daily-feedback.mock');
    return mockSubmitFeedback(data);
  }
  // TODO(BBOS-Phase-2): implement real backend — POST /feedback/submit
  throw new Error('Backend not connected');
}

export async function getFeedbackHistory(studentId: string): Promise<DailyFeedback[]> {
  if (useMock()) {
    const { mockGetFeedbackHistory } = await import('./daily-feedback.mock');
    return mockGetFeedbackHistory(studentId);
  }
  // TODO(BBOS-Phase-2): implement real backend — GET /feedback/student/:id/history
  throw new Error('Backend not connected');
}

export async function getProfessorFeedbackAlerts(): Promise<FeedbackAlert[]> {
  if (useMock()) {
    const { mockGetProfessorAlerts } = await import('./daily-feedback.mock');
    return mockGetProfessorAlerts();
  }
  // TODO(BBOS-Phase-2): implement real backend — GET /feedback/alerts
  throw new Error('Backend not connected');
}
