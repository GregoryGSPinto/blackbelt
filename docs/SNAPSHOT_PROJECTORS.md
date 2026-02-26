# 📸 SNAPSHOT + PROJECTORS — CQRS Leve

**Data:** 19/02/2026  
**Status:** Implementado | 8 projectors | 12 hooks | Boundaries verificadas  
**Total acumulado:** 22 arquivos | 4.420 linhas | 4 camadas

---

## 1. O PROBLEMA QUE RESOLVE

Sem snapshot, o sistema cresce assim:

```
useParticipantProgress       ← calcula tudo
useParticipantRankingProgress ← recalcula parte
useInstructorStudentProgress ← recalcula outra parte
useEventEligibilityProgress  ← copia lógica
usePromotionPreviewProgress  ← diverge silenciosamente
```

5 hooks. 5 cálculos. 5 oportunidades de divergência.

Com snapshot, o sistema cresce assim:

```
buildDevelopmentSnapshot()   ← calcula UMA vez
    ↓
    ├→ projectStudentProgress()      → StudentProgressVM
    ├→ projectInstructorProgress()   → InstructorProgressVM
    ├→ projectAdminRow()             → AdminParticipantRowVM
    ├→ projectRanking()              → RankingParticipantVM
    ├→ projectEligibility()          → EligibilityVM
    ├→ projectNotifications()        → ProgressNotificationVM[]
    ├→ projectDigitalCard()          → DigitalCardVM
    └→ projectDashboardCard()        → DashboardProgressCardVM
```

1 construção. 8 projeções. 0 divergência.

---

## 2. FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                        REACT UI                              │
│                                                              │
│  useStudentProgress()        → StudentProgressVM            │
│  useInstructorProgress()     → InstructorProgressVM         │
│  useAdminParticipantRow()    → AdminParticipantRowVM        │
│  useDashboardProgressCard()  → DashboardProgressCardVM      │
│  useDigitalCard()            → DigitalCardVM                │
│  useEventEligibility()       → EligibilityVM                │
│  useProgressNotifications()  → ProgressNotificationVM[]     │
│  useRawSnapshot()            → ParticipantDevelopmentSnapshot│
└──────────────────────┬──────────────────────────────────────┘
                       │ (todos chamam useSnapshot internamente)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SNAPSHOT (construído UMA vez)                    │
│                                                              │
│  buildDevelopmentSnapshot()                                  │
│    → Legacy services (4 chamadas paralelas)                 │
│    → ACL mappers (tradução)                                 │
│    → Cálculos (elegibilidade, tempo, alertas)               │
│    → ParticipantDevelopmentSnapshot                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            PROJECTORS (funções puras)                        │
│                                                              │
│  projectStudentProgress(snapshot)   → motivação, simplifica │
│  projectInstructorProgress(snap.)   → detalha, alerta       │
│  projectAdminRow(snapshot)          → tabular, contagem     │
│  projectRanking(snapshot)           → sortableScore         │
│  projectEligibility(snapshot)       → canEnter, canTake     │
│  projectNotifications(snapshot)     → tipo, prioridade      │
│  projectDigitalCard(snapshot)       → QR, visual            │
│  projectDashboardCard(snapshot)     → compacto              │
│                                                              │
│  Regra: ZERO fetch. ZERO efeito colateral. ZERO estado.    │
│  Entrada: snapshot. Saída: ViewModel. Puro.                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. O QUE CADA PROJECTOR FAZ

| Projector | Consume | Produz | Lógica especial |
|-----------|---------|--------|-----------------|
| **Student** | Snapshot inteiro | `StudentProgressVM` | Mensagem motivacional baseada em progresso, streaks, elegibilidade |
| **Instructor** | Snapshot inteiro | `InstructorProgressVM` | Alertas pedagógicos (presença baixa, plateau, pronto para promoção) |
| **Admin** | Snapshot inteiro | `AdminParticipantRowVM` | Contagem de alertas, dados tabulares para listagem |
| **Ranking** | Snapshot inteiro | `RankingParticipantVM` | `sortableScore` composto (milestone × 1000 + sublevels × 100 + sessions) |
| **Eligibility** | Snapshot inteiro | `EligibilityVM` | `canEnterEventAtLevel(n)` — função que valida inscrição |
| **Notifications** | Snapshot inteiro | `ProgressNotificationVM[]` | Gera notificações automáticas baseadas no estado |
| **Digital Card** | Snapshot inteiro | `DigitalCardVM` | Payload QR com dados de identificação |
| **Dashboard** | Snapshot inteiro | `DashboardProgressCardVM` | Dados compactos para mini widget |

---

## 4. SNAPSHOT — ANATOMIA

```typescript
ParticipantDevelopmentSnapshot {
  // Identidade
  participantId, participantName, participantAvatar, trackId

  // Milestone (tudo já resolvido com nome e visual)
  currentMilestone: ResolvedMilestone
  nextMilestone: ResolvedMilestone | null

  // Subníveis
  sublevels: { current, max, displayMode }

  // Tempo (pré-formatado)
  time: { monthsInCurrentMilestone, displayText, milestoneStartDate }

  // Atividade
  activity: { totalSessions, totalHours, attendancePercentage, currentStreak, bestStreak }

  // Competências com scores
  competencies: ResolvedCompetencyScore[]
  overallScore: NormalizedScore

  // Elegibilidade (pré-computada com cada critério)
  promotion: PromotionEligibility {
    eligible, status, overallProgress
    criteria: ResolvedCriterion[]
    requiresEvaluation, requiresInstructorApproval
  }

  // Timeline e milestones
  history: ResolvedHistoryEntry[]
  allMilestones: ResolvedMilestone[]

  // Avaliações
  evaluations: ResolvedEvaluation[]

  // Metadata
  computedAt: ISODateTime
}
```

Tudo já resolvido. Nomes, cores, labels, datas formatadas.
Projectors não precisam de nenhum lookup adicional.

---

## 5. ALERTAS PEDAGÓGICOS DO INSTRUTOR

O `InstructorProgressVM` inclui `alerts: InstructorAlert[]`:

| Tipo | Severity | Trigger |
|------|----------|---------|
| `ready_for_promotion` | success | Todos os critérios atendidos |
| `attendance_drop` | warning | Presença < 60% após 2+ meses |
| `long_plateau` | warning | 24+ meses no mesmo nível sem elegibilidade |
| `sublevel_due` | info | Subníveis no máximo, próximo passo é promoção |

Alertas são gerados automaticamente a partir do snapshot — sem lógica extra.

---

## 6. INVENTÁRIO FINAL DE HOOKS

| Hook | Para quem | ViewModel | Tela |
|------|-----------|-----------|------|
| `useStudentProgress()` | Aluno | `StudentProgressVM` | graduacao/page.tsx |
| `useInstructorProgress(id)` | Professor | `InstructorProgressVM` | professor-aluno/[id] |
| `useAdminParticipantRow(id)` | Admin | `AdminParticipantRowVM` | admin/atletas |
| `useDashboardProgressCard()` | Aluno | `DashboardProgressCardVM` | inicio/page.tsx |
| `useDigitalCard()` | Aluno | `DigitalCardVM` | carteirinha/page.tsx |
| `useEventEligibility()` | Aluno/Admin | `EligibilityVM` | eventos/inscricao |
| `useProgressNotifications()` | Sistema | `ProgressNotificationVM[]` | notificações |
| `useRawSnapshot()` | Debug | `Snapshot` | dev tools |
| `useVocabulary()` | Todos | `{ t }` | qualquer tela |
| `useModules()` | Todos | `{ isEnabled }` | qualquer tela |
| `useSegmentConfig()` | Admin | `SegmentDefinition` | admin/configuracao |
| `useParticipantProgress()` | — | *(alias para useStudentProgress)* | backward compat |

---

## 7. ESTRUTURA DE ARQUIVOS FINAL

```
lib/
├── domain/                           ← PURE (0 imports externos)
│   ├── shared/kernel.ts                  119L
│   ├── segment/segment.ts                259L
│   ├── segment/presets.ts                597L
│   ├── development/track.ts              370L
│   ├── participant/participant.ts        211L
│   ├── unit/unit.ts                      186L
│   ├── scheduling/scheduling.ts          242L
│   ├── recognition/recognition.ts        140L
│   └── index.ts                           85L
│
├── acl/                              ← BRIDGE (import domain + api)
│   ├── mappers/progression.mapper.ts     230L
│   ├── segment-resolver.ts               138L
│   └── index.ts                           34L
│
├── application/                      ← ORCHESTRATION
│   ├── progression/
│   │   ├── state/
│   │   │   ├── snapshot.ts               183L  ← O tipo canônico
│   │   │   └── build-snapshot.ts         302L  ← O construtor
│   │   ├── projectors/
│   │   │   ├── student-progress.projector.ts   139L
│   │   │   ├── instructor-progress.projector.ts 183L
│   │   │   └── index.ts                 283L  ← admin, ranking, eligibility,
│   │   │                                        notification, card, dashboard
│   │   ├── get-participant-progress.ts   359L  ← legado (será removido)
│   │   └── index.ts                       64L
│   └── index.ts                           25L
│
├── hooks/                            ← REACT INTERFACE
│   └── index.ts                          271L
│
└── ARCHITECTURE_RULES.ts                  80L  ← ESLint boundaries
```

**Total: 22 arquivos | 4.420 linhas | 8 projectors | 12 hooks**

---

## 8. O LEGADO QUE SERÁ REMOVIDO

`lib/application/progression/get-participant-progress.ts` (359L) é o monolítico original. Agora é redundante — substituído por snapshot + projectors. Será removido quando todos os consumers migrarem.

---

## 9. O CICLO ESTÁ FECHADO

```
      ANTES                              AGORA
                                    
  Legacy → VM (monolítico)          Legacy → Snapshot → Projectors → VM
  1 tela = 1 cálculo                1 snapshot = N projeções
  Nova tela = copiar lógica          Nova tela = novo projector (puro)
  Divergência inevitável            Divergência impossível
```

Quando Ranking, Certificados, IA Pedagógica, ou qualquer feature futura precisar de dados de progressão, vai importar um projector e receber um ViewModel limpo. Sem recalcular. Sem divergir. Sem quebrar.
