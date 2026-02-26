/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EVENT GOVERNANCE — Critério de admissão e classificação       ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  REGRA DE ADMISSÃO:                                             ║
 * ║  Um Domain Event só pode existir se alterar a                  ║
 * ║  VERDADE PEDAGÓGICA do participante.                           ║
 * ║                                                                 ║
 * ║  Deve mudar pelo menos UM destes:                              ║
 * ║  1. Elegibilidade (pode/não pode avançar)                      ║
 * ║  2. Posição relativa (ranking, nível, competência)             ║
 * ║  3. Reconhecimento (conquista, certificação)                   ║
 * ║  4. Histórico permanente (registro irreversível)               ║
 * ║                                                                 ║
 * ║  Se não muda nenhum dos quatro → NÃO é Domain Event.          ║
 * ║                                                                 ║
 * ║  CLASSIFICAÇÃO (3 categorias — NUNCA misturar):                ║
 * ║                                                                 ║
 * ║  1. Domain Events                                               ║
 * ║     Mudam estado educacional.                                   ║
 * ║     Vivem em lib/domain/events.                                ║
 * ║     Invalidam snapshot. Versão controlada.                     ║
 * ║     Ex: PromotionGranted, AttendanceRecorded                   ║
 * ║                                                                 ║
 * ║  2. Application Events (futuro)                                 ║
 * ║     Mudam funcionamento do sistema.                            ║
 * ║     Vivem em lib/application/events.                           ║
 * ║     NÃO invalidam snapshot. Sem versionamento.                 ║
 * ║     Ex: NotificationDispatched, SnapshotRebuilt                ║
 * ║                                                                 ║
 * ║  3. Analytics Events (fora do core)                            ║
 * ║     Mudam só métricas de produto.                              ║
 * ║     Vivem fora de lib/ (ex: analytics/).                       ║
 * ║     Não afetam nada do domínio.                                ║
 * ║     Ex: PageViewed, FeatureUsed, ButtonClicked                 ║
 * ║                                                                 ║
 * ║  Misturar categorias é o erro #1 em plataformas evolutivas.   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ════════════════════════════════════════════════════════════════════
// ADMISSION GATE — Checklist antes de criar novo Domain Event
// ════════════════════════════════════════════════════════════════════

/**
 * Checklist de admissão para novos Domain Events.
 *
 * Antes de adicionar um evento, confirme:
 *
 * □ Muda elegibilidade?         (pode/não pode avançar de nível)
 * □ Muda posição relativa?      (ranking, score, competência)
 * □ Muda reconhecimento?        (conquista, certificado, badge)
 * □ Cria histórico permanente?  (registro que nunca será apagado)
 *
 * Se NENHUM checkbox marcado → NÃO é Domain Event.
 *
 * Exemplos de coisas que NÃO são Domain Events:
 *   ❌ SessionViewed         → não muda verdade pedagógica
 *   ❌ CardOpened             → é analytics
 *   ❌ TabChanged             → é UI
 *   ❌ NotificationSent       → é application event
 *   ❌ SnapshotCacheExpired   → é infra
 *   ❌ UserLoggedIn           → é auth, não pedagogia
 *   ❌ ProfilePhotoChanged    → é perfil, não evolução
 */

// ════════════════════════════════════════════════════════════════════
// VERSIONING RULES
// ════════════════════════════════════════════════════════════════════

/**
 * REGRAS DE VERSIONAMENTO DE EVENTOS:
 *
 * 1. NUNCA alterar payload de uma versão existente.
 *    Eventos são fatos imutáveis. O passado não muda.
 *
 * 2. Para adicionar campo → incrementar versão.
 *    Campos novos em v(N+1) são SEMPRE opcionais.
 *
 * 3. Handlers devem aceitar qualquer versão >= a mínima.
 *    Usar `if (event.version >= N)` para campos novos.
 *
 * 4. Snapshots reconstruídos de eventos antigos são corretos.
 *    v1 é subconjunto válido de v2.
 *
 * 5. CURRENT_EVENT_VERSIONS é a fonte de verdade.
 *    Vive em domain-events.ts, exportado pelo barrel.
 *
 * Exemplo prático:
 *
 * ```ts
 * // Hoje (v1):
 * PromotionGranted.payload = {
 *   participantId, trackId,
 *   fromMilestoneId, toMilestoneId,
 *   fromMilestoneName, toMilestoneName,
 *   grantedBy
 * }
 *
 * // Futuro (v2 — quando avaliação prática for obrigatória):
 * PromotionGranted.payload = {
 *   ...v1,
 *   evaluationId?: string,          // ← novo, opcional
 *   criteriaSnapshot?: Criterion[], // ← novo, opcional
 * }
 *
 * // No handler:
 * function handlePromotion(event: PromotionGranted) {
 *   // Campos v1 sempre existem
 *   const { participantId, toMilestoneName, grantedBy } = event.payload;
 *
 *   // Campos v2 só existem se version >= 2
 *   if (event.version >= 2) {
 *     const { evaluationId } = event.payload as any;
 *     if (evaluationId) { // ... }
 *   }
 * }
 * ```
 */

// ════════════════════════════════════════════════════════════════════
// CURRENT EVENT CONTRACTS — Congelados
// ════════════════════════════════════════════════════════════════════

/**
 * CONTRATOS CONGELADOS v1 (19/02/2026)
 *
 * Os payloads abaixo são IMUTÁVEIS.
 * Nunca remover ou alterar campos em eventos v1.
 * Só adicionar campos opcionais em v2+.
 *
 * ┌─────────────────────────────┬──────┬─────────────────────────┐
 * │ Evento                      │ Ver. │ Payload congelado       │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ PromotionGranted            │ v1   │ pid, track, from, to,   │
 * │                             │      │ fromName, toName, by    │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ SublevelAwarded             │ v1   │ pid, track, milestone,  │
 * │                             │      │ newCount, max, by       │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ CompetencyScoreUpdated      │ v1   │ pid, track, competency, │
 * │                             │      │ prevScore, newScore, by │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ PromotionEligibilityReached │ v1   │ pid, track, current,    │
 * │                             │      │ target                  │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ EvaluationScheduled         │ v1   │ evalId, pid, track,     │
 * │                             │      │ target, date, evaluator │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ EvaluationCompleted         │ v1   │ evalId, pid, track,     │
 * │                             │      │ passed, score, feedback │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ AttendanceRecorded          │ v1   │ pid, session, method,   │
 * │                             │      │ group?, track?          │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ SessionCompleted            │ v1   │ session, instructor,    │
 * │                             │      │ group?, track?, count,  │
 * │                             │      │ duration                │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ AchievementUnlocked         │ v1   │ pid, achievement, name, │
 * │                             │      │ points, trigger         │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ StreakMilestoneReached       │ v1   │ pid, days, isPB        │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ ParticipantEnrolled         │ v1   │ pid, track, audience,   │
 * │                             │      │ initialMilestone        │
 * ├─────────────────────────────┼──────┼─────────────────────────┤
 * │ TrackChanged                │ v1   │ pid, prevTrack?,        │
 * │                             │      │ newTrack, reason        │
 * └─────────────────────────────┴──────┴─────────────────────────┘
 *
 * Data de congelamento: 19 de fevereiro de 2026
 * Assinatura: Domain Engine v1.0
 */

export {};
