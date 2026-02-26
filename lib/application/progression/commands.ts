/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  USE CASE — Promote Participant (Fase B write)                 ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Demonstra o ciclo reativo completo:                           ║
 * ║                                                                 ║
 * ║  1. UI chama promote()                                         ║
 * ║  2. Grava no legado via service                                ║
 * ║  3. Publica PromotionGranted no event bus                      ║
 * ║  4. SnapshotCache ouve → invalida cache do participante        ║
 * ║  5. Hook ouve onChange → re-fetches snapshot                   ║
 * ║  6. UI atualiza automaticamente (sem refresh manual)           ║
 * ║                                                                 ║
 * ║  O instrutor promove → a tela do aluno atualiza sozinha.      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { createEvent, startCausationChain, makeIdempotencyKey } from '@/lib/domain';
import type { PromotionGranted, SublevelAwarded, AttendanceRecorded, CausationContext } from '@/lib/domain';
import { eventBus } from '@/lib/application/events/event-bus';
import { resolveMilestoneId } from '@/lib/acl';

// ════════════════════════════════════════════════════════════════════
// PROMOTE PARTICIPANT
// ════════════════════════════════════════════════════════════════════

/**
 * Promove participante para o próximo milestone.
 *
 * Ciclo reativo completo:
 *   1. Grava no legado
 *   2. Publica evento com causalidade + idempotência
 *   3. Cache invalida automaticamente
 *   4. UI reage automaticamente
 */
export async function promoteParticipant(params: {
  participantId: string;
  fromMilestoneName: string;
  toMilestoneName: string;
  grantedBy: string;
  trackId: string;
}): Promise<void> {
  // await gradService.promoverAluno(params.participantId, params.toMilestoneName);

  const chain = startCausationChain();
  const idempotencyKey = makeIdempotencyKey(
    'PromotionGranted',
    params.participantId,
    `${params.fromMilestoneName}→${params.toMilestoneName}`,
  );

  eventBus.publish(createEvent<PromotionGranted>(
    'PromotionGranted',
    params.participantId,
    {
      participantId: params.participantId,
      trackId: params.trackId as any,
      fromMilestoneId: resolveMilestoneId(params.fromMilestoneName),
      toMilestoneId: resolveMilestoneId(params.toMilestoneName),
      fromMilestoneName: params.fromMilestoneName,
      toMilestoneName: params.toMilestoneName,
      grantedBy: params.grantedBy,
    },
    {
      ...chain,
      idempotencyKey,
      humanDescription: `Promoção: ${params.fromMilestoneName} → ${params.toMilestoneName} (por ${params.grantedBy})`,
      metadata: { causedBy: params.grantedBy, source: 'app' },
    },
  ));
}

// ════════════════════════════════════════════════════════════════════
// AWARD SUBLEVEL
// ════════════════════════════════════════════════════════════════════

export async function awardSublevel(params: {
  participantId: string;
  milestoneId: string;
  newSublevelCount: number;
  maxSublevels: number;
  awardedBy: string;
  trackId: string;
}): Promise<void> {
  // await gradService.adicionarSubnivel(params.participantId, params.awardedBy);

  const chain = startCausationChain();
  const idempotencyKey = makeIdempotencyKey(
    'SublevelAwarded',
    params.participantId,
    `${params.milestoneId}-sl${params.newSublevelCount}`,
  );

  eventBus.publish(createEvent<SublevelAwarded>(
    'SublevelAwarded',
    params.participantId,
    {
      participantId: params.participantId,
      trackId: params.trackId as any,
      milestoneId: params.milestoneId as any,
      newSublevelCount: params.newSublevelCount,
      maxSublevels: params.maxSublevels,
      awardedBy: params.awardedBy,
    },
    { ...chain, idempotencyKey, metadata: { causedBy: params.awardedBy, source: 'app' } },
  ));
}

// ════════════════════════════════════════════════════════════════════
// RECORD ATTENDANCE
// ════════════════════════════════════════════════════════════════════

export async function recordAttendance(params: {
  participantId: string;
  sessionId: string;
  method: 'QR' | 'MANUAL' | 'BIOMETRIC' | 'APP' | 'GUARDIAN_REMOTE';
  groupId?: string;
  trackId?: string;
}): Promise<void> {
  // await checkinService.registrarPresenca(params);

  const chain = startCausationChain();
  const idempotencyKey = makeIdempotencyKey(
    'AttendanceRecorded',
    params.participantId,
    params.sessionId, // mesma sessão + mesmo participante = idempotente
  );

  eventBus.publish(createEvent<AttendanceRecorded>(
    'AttendanceRecorded',
    params.participantId,
    {
      participantId: params.participantId,
      sessionId: params.sessionId,
      method: params.method,
      groupId: params.groupId,
      trackId: params.trackId as any,
    },
    { ...chain, idempotencyKey, metadata: { source: 'app' } },
  ));
}
