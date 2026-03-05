# BLACKBELT — Scan Arquitetural para IA/ML
Data: 2026-02-27

---

## 1. ESTRUTURA DO PROJETO

```
blackbelt/
├── app/
│   ├── (admin)/          # Admin dashboard (16 módulos: agenda, alertas, analytics, check-in, comissões, etc.)
│   ├── (auth)/           # Autenticação (login, cadastro, esqueci-senha, seleção de perfil)
│   ├── (developer)/      # Dev tools (AI, audit, danger, logins, observability, permissões, segurança)
│   ├── (kids)/           # Área Kids (aulas, checkin, desafios, medalhas, mestres)
│   ├── (main)/           # Área Aluno Adulto (aulas, graduação, ranking, evolução, perfil, shop, etc.)
│   ├── (parent)/         # Painel Responsável
│   ├── (professor)/      # Área Professor (chamada, alunos, avaliações, cronômetro, plano-aula, vídeos)
│   ├── (super-admin)/    # Super Admin (multi-academia SaaS)
│   ├── (teen)/           # Área Teen (aulas, checkin, conquistas, progresso)
│   ├── actions/          # Server Actions (academy, checkin, classes, lgpd, members, progression)
│   └── api/              # API Routes (~40 endpoints: checkin, members, progression, financial, etc.)
├── components/
│   ├── admin/            # ExecutiveDashboard, ModuleGuard, AutomacaoCard, ReengagementRules
│   ├── aluno/            # CarteirinhaDigital, EvolutionTimeline, FrequencyBar, TrainingHeatmap
│   ├── auth/             # MFA, ProfileSelection, RoleGuard, SocialLogin
│   ├── checkin/          # QRGenerator, QRScanner, FABCheckin
│   ├── gamification/     # LeaderboardCard, PointsBadge
│   ├── kids/             # KidsCard, MascotCard, ProgressBar, StarRating
│   ├── professor/        # ActiveClassMode, QuickProgressUpdate, FeedbackAlerts, VideoDropZone
│   ├── shared/           # ErrorBoundary, OfflineBanner, OnboardingTour, ProactiveAlert, etc.
│   ├── shell/            # AppShell, BottomNav, Sidebar, Headers (multi-layout system)
│   ├── shop/             # ProductCard, SizeGuide, ColorSelector
│   ├── teen/             # ProgressCircle, StatCard, TeenCard
│   ├── ui/               # NotificationBell, ThemeToggle, VideoCard, SearchOverlay
│   └── video/            # PremiumPlayer, VideoModal, VideoHoverPreview
├── contexts/             # AuthContext, NotificationContext, ActiveClassContext, ParentContext, etc.
├── hooks/                # 15 hooks (useAutoSave, useOfflineCheckin, useNetworkStatus, etc.)
├── lib/
│   ├── __mocks__/        # 40+ mock files (dados para dev sem backend)
│   ├── acl/              # Anti-Corruption Layer (mappers legacy → domain)
│   ├── api/              # 30+ service files + contracts.ts + types.ts
│   ├── application/      # Use cases, projectors, event bus, snapshot builder, commands
│   ├── domain/           # DDD: development, participant, unit, segment, scheduling, recognition, events
│   ├── event-store/      # Event store (Supabase), projector runner, event types
│   ├── hooks/            # Domain hooks (useStudentProgress, useVocabulary, etc.)
│   ├── monitoring/       # Metrics, anomaly detector, web vitals, structured logger, dashboard
│   ├── persistence/      # Repository, audit, concurrency, soft-delete, tenant isolation, LGPD
│   ├── security/         # RBAC, rate limiter, MFA, session, device fingerprint, RLS middleware
│   ├── supabase/         # Client, server, admin, storage, middleware, types
│   └── utils/            # Cache, prefetch, retry, whatsapp
├── server/
│   ├── migrations/       # 001_initial_schema.sql (event_log, snapshot_cache, account)
│   └── src/              # Bootstrap, PostgresEventStoreAdapter, tenant scope, replay policy, health
├── supabase/
│   ├── migrations/       # 10 migrations (foundation → audit_monitoring)
│   └── seed.sql          # Belt systems + achievements
├── tests/                # Vitest (security, services, auth, responsive)
├── android/              # Capacitor Android
├── ios/                  # Capacitor iOS
└── docs/                 # 40+ documentation files
```

---

## 2. DOMAIN ENGINE

### 2.1 Entidades e Value Objects

**Arquivo:** `lib/domain/development/track.ts`

| Entidade / VO | Campos Principais | Descrição |
|---|---|---|
| `DevelopmentTrack` | `id, segmentId, name, progressionModel, status, milestones[], competencies[], sublevelConfig, promotionRules[], applicableAudiences[]` | Agregado raiz — trilha de desenvolvimento (ex: faixa BJJ) |
| `Milestone` | `id, name, order, visual, isFinal, expectedCompetencies[]` | Marco de progressão (ex: faixa branca, amarela) |
| `Competency` | `id, name, description?, icon?, category?` | Habilidade mensurável dentro da trilha |
| `PromotionRule` | `fromMilestoneId, toMilestoneId, criteria[], requiresEvaluation, requiresInstructorApproval` | Regras para avançar entre milestones |
| `PromotionCriterion` | Discriminated union com 10 variantes: `min_time_months, min_attendance_pct, min_sessions, min_hours, min_competency_score, min_overall_score, completed_items, passed_evaluation, min_sublevels, custom` | Critério individual de promoção |
| `ProgressState` | `participantId, trackId, currentMilestoneId, currentSublevels, milestoneStartDate, competencyScores[], overallScore, promotionStatus, history[], accumulatedMetrics` | Estado de progressão do participante |
| `AccumulatedMetrics` | `totalSessions, totalHours, attendancePercentage, monthsInCurrentMilestone, itemsCompleted, evaluationsPassed, currentStreak, bestStreak` | Métricas acumuladas por milestone |
| `Evaluation` | `id, trackId, participantId, evaluatorId, type, status, scheduledDate, result?` | Avaliação formal (promoção, certificação, periódica) |
| `SublevelConfig` | `enabled, maxCount, displayMode, indicatorColor?, label, labelPlural` | Config de sub-níveis (graus/stripes) |

**Arquivo:** `lib/domain/participant/participant.ts`

| Entidade / VO | Campos Principais | Descrição |
|---|---|---|
| `Participant` | `id, profile, roles[], status, audienceProfileId, progressStates[], achievements[], familyLinks[], preferences` | Participante completo |
| `ParticipantProfile` | `name, email?, phone?, avatar?, birthDate?, document?` | Dados pessoais |
| `ParticipantRole` | `type (learner\|instructor\|guardian\|manager\|owner\|platform_admin), since, active, metadata?` | Papel com metadados por tipo |
| `LearnerMetadata` | `groupIds[], enrollmentDate, subscriptionId?` | Dados específicos do aluno |
| `InstructorMetadata` | `specialties[], commissionRate?, managedTrackIds[]` | Dados do instrutor |
| `PublicProfile` | `id, name, avatar?, unitName, tracks[], totalSessions, totalAchievements, memberSince, publicUrl` | Perfil público |

**Arquivo:** `lib/domain/participant/person.ts`

| Entidade / VO | Campos Principais | Descrição |
|---|---|---|
| `PersonIdentity` | `id, fullName, email?, phone?, document?, birthDate?, participantIds[], dataStatus, anonymizedAt?` | Identidade LGPD-aware com `anonymizePerson()` funcional |

**Arquivo:** `lib/domain/segment/segment.ts` + `presets.ts`

| Entidade / VO | Campos Principais | Descrição |
|---|---|---|
| `SegmentDefinition` | `id, type, displayName, defaultProgressionModel, enabledModules, vocabulary, profileFields[], audienceProfiles[], eventTypes[]` | Definição completa de segmento |
| `SegmentVocabulary` | 21 campos traduzíveis (session, milestone, instructor, participant, etc.) | Vocabulário específico do segmento |
| `AudienceProfile` | `id, name, ageRange?, requiresGuardian, themeOverride?, progressModules[]` | Perfil de audiência (kids, teen, adulto) |

**Arquivo:** `lib/domain/unit/unit.ts`

| Entidade / VO | Campos Principais | Descrição |
|---|---|---|
| `Unit` | `id, name, slug, segmentType, segmentConfig, plan, status, branding, address?, operatingHours?, gamification, settings, stats?` | Unidade/academia (tenant root) |
| `UnitStats` | `totalActiveParticipants, totalInstructors, totalActiveTracks, monthlyCheckins, monthlyRevenue?, retentionRate?` | Estatísticas da unidade |
| `Space` | `id, unitId, name, capacity, description?, active` | Sala/espaço físico |

**Arquivo:** `lib/domain/scheduling/scheduling.ts`

| Entidade / VO | Campos Principais | Descrição |
|---|---|---|
| `Group` | `id, name, status, trackId?, audienceProfileId, instructorIds[], schedule[], maxCapacity, enrolledParticipantIds[]` | Turma recorrente |
| `Session` | `id, groupId?, trackId?, instructorId, startDateTime, durationMinutes, type, status, plan?, attendance[]` | Sessão de treino |
| `AttendanceRecord` | `participantId, participantName, method, status, checkinTime, validatedBy?` | Registro de presença |
| `SessionPlan` | `phases[], notes?, targetCompetencyIds[]` | Plano de aula estruturado |

**Arquivo:** `lib/domain/recognition/recognition.ts`

| Entidade / VO | Campos Principais | Descrição |
|---|---|---|
| `AchievementDefinition` | `id, name, description, visual, category, trigger (11 variantes), pointsAwarded, active` | Definição de conquista |
| `GamificationConfig` | `enabled, pointRules[], rankingEnabled, rankingPeriods[]` | Config de gamificação por unidade |
| `RankingEntry` | `participantId, participantName, points, position, positionChange, currentStreak, audience` | Entrada do leaderboard |
| `PointRule` | `id, name, points, trigger (checkin\|session_complete\|achievement\|milestone_promotion\|...), active` | Regra de pontuação |

**Arquivo:** `lib/domain/shared/kernel.ts`

| Value Object | Tipo | Descrição |
|---|---|---|
| `EntityId<T>` | Branded string | IDs tipados: UnitId, ParticipantId, TrackId, MilestoneId, SessionId, etc. |
| `NormalizedScore` | Branded number (0-100) | Score normalizado |
| `Percentage` | Branded number (0-100) | Percentual |
| `ISODate / ISODateTime` | Branded string | Timestamps tipados |
| `VisualIdentity` | Interface | `color, contrastColor?, gradient?, icon?` |
| `LifecycleStatus` | Union | `ACTIVE \| PAUSED \| ARCHIVED \| DRAFT` |
| `OperationalStatus` | Union | `ACTIVE \| AT_RISK \| BLOCKED \| FROZEN \| INACTIVE` |

### 2.2 Domain Events

**Arquivo:** `lib/domain/events/domain-events.ts` — Todos version 1, congelados em 2026-02-19.

| Evento | Payload Resumido | Categoria |
|---|---|---|
| `PromotionGranted` | `participantId, trackId, fromMilestoneId, toMilestoneId, grantedBy` | Progressão |
| `SublevelAwarded` | `participantId, trackId, milestoneId, newSublevelCount, maxSublevels, awardedBy` | Progressão |
| `CompetencyScoreUpdated` | `participantId, trackId, competencyId, previousScore, newScore, evaluatedBy` | Progressão |
| `PromotionEligibilityReached` | `participantId, trackId, currentMilestoneId, targetMilestoneId` | Progressão |
| `EvaluationScheduled` | `evaluationId, participantId, trackId, targetMilestoneId, scheduledDate, evaluatorId` | Avaliação |
| `EvaluationCompleted` | `evaluationId, participantId, trackId, passed, overallScore, feedback?` | Avaliação |
| `AttendanceRecorded` | `participantId, sessionId, method, groupId?, trackId?` | Presença |
| `SessionCompleted` | `sessionId, instructorId, groupId?, trackId?, attendeeCount, durationMinutes` | Presença |
| `AchievementUnlocked` | `participantId, achievementId, achievementName, pointsAwarded, trigger` | Reconhecimento |
| `StreakMilestoneReached` | `participantId, streakDays, isPersonalBest` | Reconhecimento |
| `ParticipantEnrolled` | `participantId, trackId, audienceProfileId, initialMilestoneId` | Participante |
| `TrackChanged` | `participantId, previousTrackId?, newTrackId, reason` | Participante |

**Base de todos os eventos:** `type, version, occurredAt, aggregateId, causationId, correlationId, idempotencyKey?, metadata?, humanDescription?`

**Persistência:** Todos os 12 eventos são persistidos via `eventBus.onAny → eventStore.persist()` (auto-wired no bootstrap). Dual store: tabela `domain_events` (Supabase legacy) e `event_log` (PostgreSQL direto).

### 2.3 Modelos de Progressão

| Modelo | Tipo | Status | Preset Default |
|---|---|---|---|
| `hierarchical` | Union literal | **Tipo definido + critérios mapeados** (`min_time_months`, `min_attendance_pct`, `min_sessions`) | Artes Marciais |
| `accumulative` | Union literal | **Tipo definido + critérios mapeados** (`min_hours`, `min_sessions`) | Pilates, Fitness |
| `competency` | Union literal | **Tipo definido + critérios mapeados** (`min_competency_score`, `min_overall_score`) | — |
| `repertoire` | Union literal | **Tipo definido + critérios mapeados** (`completed_items`) | Dança |
| `evaluation` | Union literal | **Tipo definido + critérios mapeados** (`passed_evaluation`) | Música |

**Status real:** Os 5 modelos são **labels de tipo** (union `ProgressionModel`). NÃO há classe/strategy/behavioral logic por modelo no domain layer. A seleção do modelo determina quais `PromotionCriterion` são configurados na `PromotionRule`. O `AccumulatedMetrics` rastreia métricas de todos os 5 modelos simultaneamente. A lógica de elegibilidade é resolvida no `buildDevelopmentSnapshot` (application layer), que compara métricas contra critérios genéricos.

---

## 3. EVENT STORE & DADOS

### 3.1 Schema do Event Store

**Tabela `event_log` (PostgreSQL direto — server/migrations/001):**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | TEXT | ID único do evento (`evt_<timestamp_base36>_<random>`) |
| `sequence` | BIGSERIAL PK | Ordenação global |
| `unit_id` | TEXT FK→account | Partition key (tenant) |
| `participant_id` | TEXT nullable | Partition secundário |
| `event_type` | TEXT | Tipo do evento |
| `event_version` | INTEGER (default 1) | Versão do schema |
| `causation_id` | TEXT | Comando que causou o evento |
| `correlation_id` | TEXT | Agrupamento causal |
| `idempotency_key` | TEXT (unique partial) | Deduplicação |
| `occurred_at` | TIMESTAMPTZ | Quando ocorreu no domínio |
| `stored_at` | TIMESTAMPTZ | Quando foi persistido |
| `payload` | JSONB | Evento completo serializado |

**Índices:** `(unit_id, id)` unique, `(idempotency_key)` unique partial, `(unit_id, participant_id, sequence)`, `(unit_id, event_type, sequence)`, `(correlation_id, sequence)`, `(unit_id, occurred_at)`

**Tabela `domain_events` (Supabase — supabase/migrations/00005):**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | ID do evento |
| `aggregate_id` | TEXT | ID do agregado |
| `aggregate_type` | TEXT | Tipo do agregado |
| `event_type` | TEXT | Tipo do evento |
| `version` | INT | Versão |
| `payload` | JSONB | Payload |
| `metadata` | JSONB nullable | Metadados extras |
| `occurred_at` | TIMESTAMPTZ | Timestamp |
| `causation_id` | TEXT nullable | Causação |
| `correlation_id` | TEXT nullable | Correlação |
| `idempotency_key` | TEXT unique | Deduplicação |

**Tabelas auxiliares:** `snapshot_cache` (PostgreSQL), `snapshots` (Supabase), `event_subscriptions` (Supabase — checkpoint de projectors)

### 3.2 Dados Acumulados (métricas existentes)

| Métrica | Onde é calculada | Onde é armazenada | Granularidade |
|---|---|---|---|
| `totalSessions` | `buildDevelopmentSnapshot` via ACL | `ProgressState.accumulatedMetrics` | por milestone |
| `totalHours` | `buildDevelopmentSnapshot` via ACL | `ProgressState.accumulatedMetrics` | por milestone |
| `attendancePercentage` | `buildDevelopmentSnapshot` via ACL | `ProgressState.accumulatedMetrics` | por milestone |
| `monthsInCurrentMilestone` | calculado por diff de datas | `ProgressState.accumulatedMetrics` | por milestone |
| `itemsCompleted` | `buildDevelopmentSnapshot` | `ProgressState.accumulatedMetrics` | por milestone |
| `evaluationsPassed` | `buildDevelopmentSnapshot` | `ProgressState.accumulatedMetrics` | por milestone |
| `currentStreak` | trigger `on_attendance_insert()` + `streaks` table | DB `streaks.current_streak` | por membro/academia |
| `bestStreak` | trigger `on_attendance_insert()` | DB `streaks.longest_streak` | por membro/academia |
| `totalPoints` | DB trigger + `points_ledger` insert | `points_ledger` (append-only) | por membro |
| `weeklyPoints` | computado em runtime do `points_ledger` | não armazenado | por membro |
| `monthlyPoints` | computado em runtime do `points_ledger` | não armazenado | por membro |
| `overallScore` | `buildDevelopmentSnapshot` | `ProgressState.overallScore` | por participante |
| `competencyScores[]` | via CompetencyScoreUpdated events | `ProgressState.competencyScores` | por competência |
| `positionChange` | computado em runtime do `leaderboard_view` | não armazenado | por ranking |
| `retentionRate` | `GET /api/analytics` (% ativos/total) | computado em runtime | por academia |
| `checkinsHoje` | query `attendances WHERE date = today` | DB `attendances` | por academia/dia |
| `mediaTecnica/Comportamento/Fisico` | `progresso.service.ts` (mock) | mock apenas | por aluno |
| LCP, FCP, CLS, TTFB | `web-vitals.ts` via PerformanceObserver | in-memory buffer | por sessão browser |
| `errorRate` | `metrics.ts` ring buffer | in-memory (10k entries) | 5-min window |
| `healthScore` | `dashboard-service.ts` | computado em runtime | por polling 10s |

### 3.3 Snapshot / Estado Derivado

**`ParticipantDevelopmentSnapshot`** (construído por `buildDevelopmentSnapshot`):

| Campo | Tipo | Estático/Calculado |
|---|---|---|
| `participantId` | string | estático |
| `participantName` | string | estático |
| `participantAvatar` | string? | estático |
| `currentMilestone` | `{ id, name, order, visual, isFinal }` | calculado (from legacy) |
| `currentSublevels` | number | calculado (from legacy) |
| `maxSublevels` | number | configuração |
| `sublevelDisplayMode` | string | configuração |
| `sublevelLabel` | string | configuração |
| `milestoneStartDate` | ISODate | calculado |
| `timeInMilestone` | `{ months, formatted }` | calculado |
| `allMilestones` | `ResolvedMilestone[]` | calculado (merge legacy + defaults) |
| `promotionEligibility` | `{ isEligible, targetMilestone, criteria[], overallProgress }` | **calculado** (core ML feature) |
| `accumulatedMetrics` | `AccumulatedMetrics` | **calculado** (8 métricas) |
| `overallScore` | NormalizedScore | calculado |
| `competencyScores` | `CompetencyScore[]` | calculado |
| `history` | `ResolvedHistoryEntry[]` | calculado (from legacy + dates formatadas) |
| `evaluations` | `ResolvedEvaluation[]` | calculado |
| `promotionStatus` | `NOT_READY \| ELIGIBLE \| IN_EVALUATION \| APPROVED` | calculado |

**8 Projectors (pure functions, sem side effects):**

| Projector | Output | Uso |
|---|---|---|
| `projectStudentProgress` | `StudentProgressVM` (milestone visual, next milestone, requirements, motivational msg) | Tela graduação aluno |
| `projectInstructorProgress` | `InstructorProgressVM` (métricas numéricas, eligibility detail, pedagogical alerts) | Professor → detalhe aluno |
| `projectAdminRow` | `AdminParticipantRowVM` (row tabular + alert count) | Admin → lista alunos |
| `projectRanking` | `RankingParticipantVM` (sortableScore = order×1000 + sublevels×100 + sessions) | Leaderboard |
| `projectEligibility` | `EligibilityVM` (canEnterEventAtLevel predicate) | Inscrição eventos |
| `projectNotifications` | `ProgressNotificationVM[]` (auto-generated: promo ready, almost, streak) | Sistema notificações |
| `projectDigitalCard` | `DigitalCardVM` (QR payload, visual) | Carteirinha digital |
| `projectDashboardCard` | `DashboardProgressCardVM` (widget compacto) | Dashboard aluno |

---

## 4. APPLICATION LAYER

### 4.1 Use Cases existentes

| Use Case | Arquivo | Input | Output |
|---|---|---|---|
| `buildDevelopmentSnapshot` | `lib/application/progression/state/build-snapshot.ts` | `participantId, name?, avatar?` | `ParticipantDevelopmentSnapshot` |
| `getParticipantProgress` | `lib/application/progression/get-participant-progress.ts` | `participantId` | `ProgressViewModel` |
| `getEvaluations` | `lib/application/progression/get-participant-progress.ts` | — | `EvaluationVM[]` |
| `promoteParticipant` | `lib/application/progression/commands.ts` | `{ participantId, from, to, grantedBy, trackId }` | publishes `PromotionGranted` event |
| `awardSublevel` | `lib/application/progression/commands.ts` | `{ participantId, milestoneId, newSublevelCount, maxSublevels, awardedBy, trackId }` | publishes `SublevelAwarded` event |
| `recordAttendance` | `lib/application/progression/commands.ts` | `{ participantId, sessionId, method, groupId?, trackId? }` | publishes `AttendanceRecorded` event |
| `initializeEventSystem` | `lib/application/events/event-wiring.ts` | `{ unitId?, debug? }` | wires bus→store→cache |
| `executeFullReplay` | `server/src/infrastructure/replay-policy.ts` | `store, snapshotBuilder, snapshotWriter, options` | `ReplayResult` |

### 4.2 Hooks e APIs

**Hooks de domínio (lib/hooks/index.tsx):**

| Hook | Retorna | Tela que consome |
|---|---|---|
| `useStudentProgress(id?)` | `StudentProgressVM` | graduacao/page |
| `useInstructorProgress(id)` | `InstructorProgressVM` | professor-aluno-detalhe |
| `useAdminParticipantRow(id)` | `AdminParticipantRowVM` | admin/graduacoes |
| `useDashboardProgressCard(id?)` | `DashboardProgressCardVM` | inicio/page |
| `useDigitalCard(id?)` | `DigitalCardVM` | carteirinha/page |
| `useEventEligibility(id?)` | `EligibilityVM` | eventos |
| `useProgressNotifications(id?)` | `ProgressNotificationVM[]` | notificações |
| `useRawSnapshot(id?)` | `ParticipantDevelopmentSnapshot` | dev tools |
| `useVocabulary()` | `t(key) → string` | todas as telas (traduz termos do segmento) |
| `useModules()` | `isEnabled(module) → boolean` | todas as telas |
| `useSegmentConfig()` | `SegmentDefinition` | configurações |

**Endpoints de API (principais para dados de progressão/ML):**

| Endpoint | Método | Dados retornados |
|---|---|---|
| `/api/checkin/today` | GET | Check-ins do dia da academia |
| `/api/checkin/register` | POST | Registra check-in + 10 pontos |
| `/api/checkin/validate-qr` | POST | Valida QR + 15 pontos |
| `/api/checkin/history` | GET | Histórico de check-ins filtrado |
| `/api/progression` | GET | Promoções, assessments, milestones |
| `/api/progression` | POST | Concede promoção + 100 pontos |
| `/api/graduacao` | GET | Graduação do aluno, requisitos, exames |
| `/api/aluno/home` | GET | Streak, check-ins hoje, conquistas |
| `/api/aluno/evolucao` | GET | Histórico completo de evolução |
| `/api/ranking` | GET | Leaderboard top 50 |
| `/api/gamification` | GET | Pontos, streak, achievements |
| `/api/analytics` | GET | Retenção, membros ativos/total |
| `/api/members` | GET | Lista paginada de membros |
| `/api/professor/dashboard` | GET | Turmas, alunos, check-ins do professor |
| `/api/professor/alunos-progresso` | GET | Alunos ativos com belt rank |
| `/api/admin/dashboard` | GET | Totais: membros, alunos, instrutores, check-ins, turmas |
| `/api/admin/alertas` | GET | Alertas inteligentes (inadimplência, inatividade) |
| `/api/financial` | GET | Planos, assinaturas, faturas |
| `/api/health` | GET | Health check do sistema |
| `/api/health/db` | GET | Health check do banco |

---

## 5. INFRAESTRUTURA

### 5.1 Banco de Dados

**PostgreSQL via Supabase — 27 tabelas + 1 view:**

| Tabela | Migration | Relações-chave | Descrição |
|---|---|---|---|
| `academies` | 00001 | owner→auth.users | Academias (tenant root) |
| `profiles` | 00001 | 1:1 auth.users | Perfis de usuário |
| `memberships` | 00001 | profile→profiles, academy→academies | Vínculo perfil↔academia com role |
| `parent_child_links` | 00001 | parent→profiles, child→profiles | Links familiares |
| `class_schedules` | 00002 | academy, instructor→memberships | Turmas recorrentes |
| `class_sessions` | 00002 | schedule→class_schedules | Sessões individuais |
| `class_enrollments` | 00002 | schedule, membership | Matrículas em turmas |
| `attendances` | 00002 | session, membership, academy | Check-ins (trigger gamificação) |
| `belt_systems` | 00003 | — | Sistemas de faixa (ranks em JSONB) |
| `promotions` | 00003 | membership, academy, belt_system, promoted_by | Promoções de faixa |
| `skill_tracks` | 00003 | academy | Trilhas de habilidades (skills em JSONB) |
| `skill_assessments` | 00003 | membership, skill_track, assessed_by | Avaliações de habilidade (score 0-100) |
| `milestones` | 00003 | membership, academy | Marcos alcançados |
| `domain_events` | 00005 | — | Event store (append-only, service-only) |
| `snapshots` | 00005 | — | Cache de snapshots (service-only) |
| `event_subscriptions` | 00005 | last_event→domain_events | Checkpoint de projectors |
| `plans` | 00006 | academy | Planos financeiros |
| `subscriptions` | 00006 | membership, plan, academy | Assinaturas |
| `invoices` | 00006 | subscription, academy | Faturas |
| `payments` | 00006 | invoice, academy | Pagamentos |
| `points_ledger` | 00007 | membership, academy | Pontos (append-only) |
| `streaks` | 00007 | membership, academy | Sequências de presença |
| `achievements` | 00007 | — | Definições de conquistas |
| `member_achievements` | 00007 | membership, achievement | Conquistas desbloqueadas |
| `notifications` | 00008 | profile, academy | Notificações (realtime) |
| `audit_log` | 00009 | user→auth.users, academy | Log de auditoria |
| `lgpd_consent_log` | 00009 | profile | Consentimentos LGPD |
| `data_export_requests` | 00009 | profile | Requisições de exportação |
| `data_deletion_requests` | 00009 | profile | Requisições de anonimização |
| `rate_limit_log` | 00010 | — | Rate limiting |
| `leaderboard_view` | 00007 | VIEW: memberships + points_ledger + streaks + member_achievements | Ranking agregado |

**Triggers automáticos:**
- `on_attendance_insert()` — Insere 10 pontos no `points_ledger` e atualiza `streaks` (incrementa se ontem, mantém se hoje, reseta para 1 se gap)
- `audit_trigger_function()` — Audita INSERT/UPDATE/DELETE em: memberships, promotions, subscriptions, invoices, payments
- `update_updated_at_column()` — Auto-update de timestamps em 10 tabelas

**Stored procedures LGPD:**
- `export_user_data(profile_id)` → JSONB completo (profile, memberships, attendances, promotions, assessments, points, achievements, notifications, consents)
- `anonymize_user_data(profile_id)` → Anonimiza PII preservando histórico pedagógico
- `get_data_retention_report()` → Estatísticas de retenção de dados

**RLS:** 50+ políticas de Row Level Security. Event store (`domain_events`, `snapshots`, `event_subscriptions`) é locked para service role only.

### 5.2 Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 14.2.35 | Framework full-stack |
| React | ^18 | UI |
| TypeScript | ^5 | Tipagem |
| Node.js | >=18.17.0 | Runtime |
| Supabase | 2.76.15 (CLI) / 2.97.0 (JS) | BaaS (Auth, DB, Realtime, Storage) |
| PostgreSQL | via Supabase | Banco principal |
| pg | ^8.13.0 | Driver PostgreSQL direto (event store) |
| Tailwind CSS | ^3.4.1 | Estilização |
| Vitest | ^3.0.0 | Testes |
| Recharts | ^2.12.0 | Gráficos |
| Capacitor | 8.1.0 | Mobile (Android + iOS) |
| Lucide React | ^0.365.0 | Ícones |
| pnpm | >=9.0.0 | Package manager |

**Dependências para ML:** `[NÃO EXISTEM]` — Nenhuma lib de ML/AI instalada (sem TensorFlow, PyTorch, scikit-learn, ou similar).

---

## 6. INVENTÁRIO DE DADOS PARA ML

### 6.1 Features disponíveis hoje (por participante)

| Feature | Tipo | Fonte | Granularidade |
|---|---|---|---|
| `totalSessions` | number | `accumulatedMetrics` / `attendances` COUNT | por milestone / global |
| `totalHours` | number | `accumulatedMetrics` | por milestone |
| `attendancePercentage` | number (0-100) | `accumulatedMetrics` | por milestone |
| `monthsInCurrentMilestone` | number | calculado (diff datas) | por milestone |
| `itemsCompleted` | number | `accumulatedMetrics` | por milestone |
| `evaluationsPassed` | number | `accumulatedMetrics` | por milestone |
| `currentStreak` | number | DB `streaks` | global |
| `bestStreak` | number | DB `streaks` | global |
| `overallScore` | number (0-100) | `ProgressState` | por participante |
| `competencyScores[]` | number[] (0-100) | `ProgressState` / `skill_assessments` | por competência |
| `totalPoints` | number | SUM(`points_ledger`) | global |
| `weeklyPoints` | number | SUM(`points_ledger` WHERE last 7d) | semanal |
| `monthlyPoints` | number | SUM(`points_ledger` WHERE last 30d) | mensal |
| `currentMilestoneOrder` | number (0-8) | `ProgressState` | por trilha |
| `currentSublevels` | number (0-4) | `ProgressState` | por milestone |
| `promotionStatus` | enum | `ProgressState` | por participante |
| `achievementCount` | number | COUNT(`member_achievements`) | global |
| `role` | enum | `memberships.role` | por academia |
| `membershipStatus` | enum | `memberships.status` | por academia |
| `beltRank` | string | `memberships.belt_rank` | por academia |
| `joinedAt` | timestamp | `memberships.joined_at` | por academia |
| `birthDate` | date | `profiles.birth_date` | global |
| `checkinMethod` | enum | `attendances.checkin_method` | por check-in |
| `subscriptionStatus` | enum | `subscriptions.status` | por assinatura |
| `planPriceCents` | number | `plans.price_cents` | por plano |
| `invoiceStatus` | enum | `invoices.status` | por fatura |
| `sortableScore` | number | `order×1000 + sublevels×100 + sessions` | ranking |

### 6.2 Features temporais (série temporal)

| Feature | Timestamps disponíveis | Tabela | Granularidade temporal |
|---|---|---|---|
| Check-ins | `checked_in_at` (TIMESTAMPTZ) | `attendances` | por sessão (minutos) |
| Promoções | `promoted_at` (TIMESTAMPTZ) | `promotions` | por evento |
| Avaliações de skill | `assessed_at` (TIMESTAMPTZ) | `skill_assessments` | por avaliação |
| Milestones alcançados | `achieved_at` (TIMESTAMPTZ) | `milestones` | por evento |
| Pontos ganhos | `created_at` (TIMESTAMPTZ) | `points_ledger` | por transação |
| Conquistas desbloqueadas | `unlocked_at` (TIMESTAMPTZ) | `member_achievements` | por evento |
| Streak histórico | `last_activity_date` (DATE) | `streaks` | por dia |
| Sessões de aula | `date` (DATE) + `status` | `class_sessions` | por dia |
| Domain Events | `occurred_at` (TIMESTAMPTZ) | `domain_events` / `event_log` | por evento |
| Pagamentos | `paid_at` (TIMESTAMPTZ) | `payments` | por transação |
| Faturas | `due_date` (DATE) | `invoices` | por mês |
| Notificações | `created_at` (TIMESTAMPTZ) | `notifications` | por evento |
| Audit log | `created_at` (TIMESTAMPTZ) | `audit_log` | por operação |
| Consent log | `created_at` (TIMESTAMPTZ) | `lgpd_consent_log` | por evento |

### 6.3 Features de contexto

| Feature | Tipo | Fonte | Descrição |
|---|---|---|---|
| `academy.segmentType` | enum | `academies.segment_type` | Tipo de segmento (bjj, judo, karate, etc.) |
| `academy.plan` | enum | `academies.status` / `account.plan` | Plano da academia (free/starter/pro/enterprise) |
| `academy.settings` | JSONB | `academies.settings` | Configurações (timezone, checkin methods, etc.) |
| `class.martialArt` | enum | `class_schedules.martial_art` | Arte marcial da turma |
| `class.level` | enum | `class_schedules.level` | Nível da turma (beginner-advanced, kids, teens) |
| `class.dayOfWeek` | number | `class_schedules.day_of_week` | Dia da semana |
| `class.timeSlot` | time | `class_schedules.start_time/end_time` | Horário |
| `class.maxCapacity` | number | `class_schedules.max_capacity` | Capacidade |
| `instructor.specialties` | string[] | `InstructorMetadata` (domain) | Especialidades |
| `instructor.commissionRate` | number | `InstructorMetadata` (domain) | Taxa de comissão |
| `beltSystem.ranks` | JSONB | `belt_systems.ranks` | Hierarquia de faixas |
| `audienceProfile` | object | `SegmentDefinition.audienceProfiles` | Perfil de público (kids, teen, adulto) |
| `unitOperatingHours` | array | `Unit.operatingHours` (domain) | Horário de funcionamento |
| `unitAddress.coordinates` | lat/lng | `Unit.address` (domain) | Geolocalização |

### 6.4 Gaps identificados

| Dado que falta | Por que é útil para ML | Impacto |
|---|---|---|
| **Histórico de streaks** (série temporal completa) | Prever abandono — streak quebrado é sinal forte de churn | ALTO |
| **Motivo de ausência** | Diferenciar ausência planejada vs abandono | ALTO |
| **Tempo na sessão** (duração real vs planejada) | Engajamento real do aluno na aula | ALTO |
| **Feedback pós-aula** (DailyFeedback) | Sentimento do aluno — modelo `daily-feedback.service.ts` existe mas é **mock-only** | ALTO |
| **Interações com conteúdo** (vídeos assistidos, duração) | Engajamento fora da academia | MÉDIO |
| **Dados de comunicação** (mensagens professor↔aluno) | Indicador de suporte/engajamento | MÉDIO |
| **Tentativas de check-in falhas** | Detectar problemas técnicos ou fraude | MÉDIO |
| **Peso/medidas do aluno** (para fitness/pilates) | Tracking de resultados físicos | MÉDIO (segmento-específico) |
| **Clima/temperatura** (externa) | Correlação com frequência | BAIXO |
| **Histórico de preços/promoções** | Correlação entre desconto e retenção | BAIXO |
| **NPS/satisfação** | Sentimento geral | ALTO |
| **Dados de competições/eventos** | Performance competitiva | MÉDIO |
| **Session plan adherence** (plano vs executado) | Qualidade da aula | MÉDIO |
| **Dados de grupo/social** (amigos na mesma turma) | Efeito social na retenção | MÉDIO |
| **Device/platform analytics** | Engagement digital | BAIXO |

---

## 7. PONTOS DE INTEGRAÇÃO PARA IA

| Ponto de integração | Viabilidade | Complexidade | Descrição |
|---|---|---|---|
| **Subscriber no Event Bus** | ✅ Pronto | Baixa | `eventBus.on('EventType', handler)` — já funciona. IA pode ouvir AttendanceRecorded, PromotionGranted, etc. em tempo real |
| **Novo Projector** | ✅ Pronto | Baixa | Adicionar `projectAIInsights(snapshot)` como pure function — segue o padrão dos 8 projectors existentes |
| **Novo Hook React** | ✅ Pronto | Baixa | `useAIInsights(participantId)` seguindo `useStudentProgress` — consome snapshot + projector |
| **Endpoint de API separado** | ✅ Pronto | Média | `/api/ai/predict-churn`, `/api/ai/recommend`, etc. — segue o padrão dos 40+ endpoints existentes |
| **Background job / cron** | ⚠️ Parcial | Média | `executeFullReplay` existe como batch job. Não há cron nativo — precisa de Supabase Edge Functions ou Vercel Cron |
| **Supabase Edge Function** | ⚠️ Parcial | Média | Pasta `supabase/functions/` existe com `health-check`. Pode hospedar modelos leves |
| **Novo Projector no Event Store** | ✅ Pronto | Média | `registerProjector({ name, handles, process })` — sistema de checkpoint já implementado |
| **WebSocket/Realtime** | ✅ Pronto | Baixa | Supabase Realtime já ativo para `notifications`. Pode adicionar canal para insights de IA |
| **Anti-Corruption Layer (ACL)** | ✅ Pronto | Baixa | Novo mapper em `lib/acl/mappers/` para traduzir dados ML ↔ domínio |
| **Anomaly Detector expansion** | ✅ Pronto | Baixa | `anomaly-detector.ts` já detecta 8 tipos de anomalia. Pode adicionar regras ML-driven |
| **Daily Feedback pipeline** | ⚠️ Stub | Média | `daily-feedback.service.ts` + `FeedbackAIClassification` type existem mas são mock. Conectar a backend + classificador real |
| **Dashboard service expansion** | ✅ Pronto | Baixa | `dashboard-service.ts` já agrega métricas. Pode adicionar health score baseado em ML |

---

## 8. OBSERVAÇÕES

### Arquitetura
- **Dual Event Store:** O projeto tem DOIS event stores paralelos (Supabase `domain_events` via `lib/event-store/` e PostgreSQL `event_log` via `server/src/infrastructure/`). Ambos persistem os mesmos eventos. Precisa consolidar antes de usar como fonte para ML.
- **Mock-heavy:** ~40 arquivos mock em `lib/__mocks__/`. Muitos services usam `useMock()` toggle. O DailyFeedback (que seria ideal para ML) é 100% mock.
- **ACL como ponte:** A Anti-Corruption Layer (`lib/acl/`) é o único caminho entre dados legacy (contracts.ts) e o Domain Engine. ML deve respeitar esta fronteira.

### Tech Debt relevante
- `getParticipantProgress` (359 linhas, `lib/application/progression/get-participant-progress.ts`) é marcado para remoção — foi substituído por `buildDevelopmentSnapshot` + projectors.
- Auth ainda usa `localStorage` para tokens. TODO SEC-001 planeja migração para `TokenStore` + httpOnly cookies.
- Super-admin é 100% mock — nenhuma query real.
- Vídeos/conteúdo são stubs ou dependem de YouTube — sem tracking de visualização real.

### Oportunidades para IA
1. **Predição de Churn:** Dados de streak, attendance, pagamentos e tempo-no-milestone estão todos disponíveis com timestamps. Feature set forte.
2. **Recomendação de Promoção:** `PromotionEligibility` com critérios individuais já é calculada. IA pode adicionar "confiança" e "tempo estimado".
3. **Classificação de Feedback:** `FeedbackAIClassification` type já existe no código — `{ category, suggestedAction, suggestedVideo, confidence }`. Falta apenas o classificador real.
4. **Alertas Pedagógicos:** `InstructorAlert` já gera 4 tipos (attendance_drop, long_plateau, ready_for_promotion, sublevel_due). IA pode refinar e adicionar novos.
5. **Detecção de Anomalias:** 8 regras de detecção já implementadas. ML pode substituir thresholds fixos por detecção adaptativa.
6. **Otimização de Turmas:** Dados de capacity, enrollment, attendance por dia/horário permitem sugerir melhores grades.
7. **Segment-specific insights:** 5 presets de segmento com vocabulário e módulos diferentes. Modelos de ML podem ser especializados por segmento.
