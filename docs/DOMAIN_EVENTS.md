# ⚡ DOMAIN EVENTS — Consistência Temporal

**Data:** 19/02/2026  
**Status:** Implementado | 12 eventos | Event bus | Snapshot cache reativo  
**Total acumulado:** 26 arquivos | 5.267 linhas

---

## 1. O PROBLEMA QUE RESOLVE

Sem eventos:
```
evento acontece → ninguém abre tela → sistema desatualizado
```

Com eventos:
```
evento acontece → cache invalida → hook reage → UI atualiza
```

O sistema passa de **reativo sob demanda** para **reativo por natureza**.

---

## 2. O CICLO REATIVO COMPLETO

```
┌──────────────────────────────────────────────────────┐
│  AÇÃO DO USUÁRIO                                      │
│  (professor promove aluno, aluno faz check-in)        │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  COMMAND (write use case)                             │
│  promoteParticipant() / recordAttendance()           │
│                                                      │
│  1. Grava no legado                                  │
│  2. eventBus.publish(PromotionGranted)               │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  EVENT BUS (in-process pub/sub)                      │
│                                                      │
│  Distribui para todos os listeners registrados       │
└───────┬────────────────┬────────────────┬────────────┘
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Snapshot     │ │ Notification │ │ Event Log    │
│ Cache        │ │ Handler      │ │ (audit)      │
│              │ │              │ │              │
│ invalidate() │ │ (futuro)     │ │ (futuro)     │
└──────┬───────┘ └──────────────┘ └──────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  SNAPSHOT CACHE                                       │
│                                                      │
│  invalidate(participantId) → notifyChange()          │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  REACT HOOK (useStudentProgress, etc.)               │
│                                                      │
│  onChange callback → setTrigger() → re-fetch         │
│  → getOrBuild() → projector → ViewModel → UI        │
└──────────────────────────────────────────────────────┘
```

---

## 3. OS 12 DOMAIN EVENTS

| Evento | Contexto | Payload principal |
|--------|----------|-------------------|
| **PromotionGranted** | Progressão | from/to milestone, grantedBy |
| **SublevelAwarded** | Progressão | milestoneId, newCount, awardedBy |
| **CompetencyScoreUpdated** | Progressão | competencyId, previous/new score |
| **PromotionEligibilityReached** | Progressão | current/target milestone |
| **EvaluationScheduled** | Avaliação | targetMilestone, date, evaluator |
| **EvaluationCompleted** | Avaliação | passed, score, feedback |
| **AttendanceRecorded** | Presença | sessionId, method, group/track |
| **SessionCompleted** | Sessão | instructorId, attendeeCount, duration |
| **AchievementUnlocked** | Reconhecimento | achievementName, points, trigger |
| **StreakMilestoneReached** | Reconhecimento | streakDays, isPersonalBest |
| **ParticipantEnrolled** | Participante | trackId, audience, initialMilestone |
| **TrackChanged** | Participante | previous/new track, reason |

Todos os 12 invalidam o snapshot do participante afetado.

---

## 4. EVENT BUS

Lightweight, in-process, síncrono. Zero dependências externas.

```typescript
// Publicar
eventBus.publish(createEvent<PromotionGranted>('PromotionGranted', participantId, payload));

// Subscrever (tipo específico)
const unsub = eventBus.on('AttendanceRecorded', (event) => { ... });

// Subscrever (múltiplos tipos)
eventBus.onMany(['PromotionGranted', 'SublevelAwarded'], handler);

// Subscrever (todos — para logging)
eventBus.onAny((event) => console.log(event.type, event.occurredAt));

// Diagnóstico
eventBus.getHandlerCount();  // { PromotionGranted: 1, '*': 1 }
eventBus.getLog();           // últimos N eventos (se logging ativo)
```

---

## 5. SNAPSHOT CACHE

Duas estratégias de invalidação:

| Estratégia | Mecanismo | Quando |
|-----------|-----------|--------|
| **TTL** | Expira após 60s | Safety net — garante frescor mesmo sem eventos |
| **Event** | `invalidate(pid)` chamado pelo bus | Imediato — quando algo relevante muda |

```typescript
// Get or build (de-duplica builds concorrentes)
const snapshot = await snapshotCache.getOrBuild(pid, () =>
  buildDevelopmentSnapshot(pid)
);

// Subscribe a mudanças (usado pelos hooks React)
const unsub = snapshotCache.onChange(pid, () => {
  // re-fetch snapshot
});

// Diagnóstico
snapshotCache.getStats();
// { size: 42, valid: 38, invalidated: 3, expired: 1, listeners: 12 }
```

---

## 6. HOOKS REATIVOS

Os hooks agora:

1. **Tentam cache primeiro** (`getOrBuild`)
2. **Subscrevem em `onChange`** para invalidação por evento
3. **Re-fetcham automaticamente** quando evento relevante é publicado

```typescript
// Dentro de useSnapshot (interno):
useEffect(() => {
  const unsub = snapshotCache.onChange(pid, () => setTrigger(t => t + 1));
  return () => unsub();
}, [pid]);
```

Resultado: professor promove aluno → evento publicado → cache invalida → hook reage → UI atualiza. **Sem refresh manual.**

---

## 7. WRITE COMMANDS (Fase B)

Três commands demonstram o padrão:

```typescript
// Promoção
await promoteParticipant({
  participantId, fromMilestoneName, toMilestoneName, grantedBy, trackId
});
// → grava legado + publica PromotionGranted

// Subnível
await awardSublevel({
  participantId, milestoneId, newSublevelCount, maxSublevels, awardedBy, trackId
});
// → grava legado + publica SublevelAwarded

// Presença
await recordAttendance({
  participantId, sessionId, method, groupId, trackId
});
// → grava legado + publica AttendanceRecorded
```

---

## 8. O QUE EVENTOS DESBLOQUEIAM (sem mais código)

| Feature futura | Implementação |
|---|---|
| **Notificações automáticas** | `eventBus.on('PromotionGranted', sendPushNotification)` |
| **Ranking em tempo real** | `eventBus.on('AttendanceRecorded', recalculateRanking)` |
| **Auditoria** | `eventBus.onAny(writeToAuditLog)` |
| **Analytics** | `eventBus.onAny(trackEvent)` |
| **IA Pedagógica** | `eventBus.on('CompetencyScoreUpdated', analyzePattern)` |
| **Webhook** | `eventBus.on('PromotionGranted', callExternalWebhook)` |
| **Certificado automático** | `eventBus.on('PromotionGranted', generateCertificate)` |
| **Email de parabéns** | `eventBus.on('AchievementUnlocked', sendCongratulationsEmail)` |

Cada feature = 1 handler. Zero mudança na arquitetura existente.

---

## 9. INVENTÁRIO FINAL

```
lib/
├── domain/                              ← PURE (0 imports externos)
│   ├── shared/kernel.ts                     119L
│   ├── events/domain-events.ts              267L  ← NOVO
│   ├── segment/segment.ts                   259L
│   ├── segment/presets.ts                   597L
│   ├── development/track.ts                 370L
│   ├── participant/participant.ts           211L
│   ├── unit/unit.ts                         186L
│   ├── scheduling/scheduling.ts             242L
│   ├── recognition/recognition.ts           140L
│   └── index.ts                              96L
│
├── acl/                                 ← BRIDGE
│   ├── mappers/progression.mapper.ts        230L
│   ├── segment-resolver.ts                  138L
│   └── index.ts                              34L
│
├── application/                         ← ORCHESTRATION
│   ├── events/
│   │   ├── event-bus.ts                     194L  ← NOVO
│   │   ├── snapshot-cache.ts                228L  ← NOVO
│   │   └── index.ts                           8L
│   ├── progression/
│   │   ├── state/snapshot.ts                183L
│   │   ├── state/build-snapshot.ts          302L
│   │   ├── projectors/student-...           139L
│   │   ├── projectors/instructor-...        183L
│   │   ├── projectors/index.ts              283L
│   │   ├── commands.ts                      122L  ← NOVO
│   │   ├── get-participant-progress.ts      359L  (legado — será removido)
│   │   └── index.ts                          64L
│   └── index.ts                              25L
│
├── hooks/index.ts                           288L  (reescrito c/ cache + onChange)
└── ARCHITECTURE_RULES.ts                     80L

Total: 26 arquivos | 5.267 linhas
```

---

## 10. TRANSIÇÃO COMPLETA

| O que era | O que é agora |
|-----------|---------------|
| App que calcula quando olham | Sistema que sabe continuamente |
| Refresh manual para ver mudanças | UI reage automaticamente a eventos |
| Cada feature reinventa atualização | `eventBus.on(type, handler)` — 1 linha |
| Cache sem invalidação inteligente | TTL + event-driven invalidation |
| Write sem efeitos colaterais | Write → Event → Cache → UI (reativo) |
