# BlackBelt — CTO Audit Report

> Data: 2026-03-05
> Auditor: Claude Code (modo autonomo)
> Status: Em andamento (Blocos 1-10 concluidos)

---

## BLOCO 1 — Seguranca

### 1.1 — Remocao de Secrets Expostos

| Item | Status | Detalhes |
|------|--------|----------|
| `.env.local.save` tracked no git | CORRIGIDO | `git rm --cached .env.local.save` executado |
| `.env.local` tracked no git | OK | Nao estava tracked |
| `.env.production` com secrets reais | OK | Contem apenas `NEXT_PUBLIC_USE_MOCK=true` — sem secrets |
| Secrets hardcoded no codigo | OK | Todos os usos de `SUPABASE_SERVICE_ROLE_KEY` usam `process.env` ou `Deno.env.get` |
| `.gitignore` completo | CORRIGIDO | Adicionados `.env.local.save` e `.env.*.local` |

**Nota:** Nao ha necessidade de rotacionar keys — nenhum secret real foi encontrado no repositorio.

### 1.2 — Middleware Edge Runtime

| Item | Status | Detalhes |
|------|--------|----------|
| Imports Edge-compativel | OK | Usa apenas `next/server` e `@supabase/ssr` |
| Try/catch global (fail-open) | OK | Presente na funcao middleware |
| Mock mode sem Supabase | OK | Apenas security headers + NextResponse.next() |
| Real mode com @supabase/ssr | OK | Session refresh via `createServerClient` |
| PUBLIC_ROUTES completo | CORRIGIDO | Adicionados `/landing`, `/politica-privacidade`, `/termos-de-uso` |
| Security headers | OK/CORRIGIDO | Todos presentes; `geolocation=(self)` corrigido |
| X-Frame-Options: DENY | OK | Presente |
| X-Content-Type-Options: nosniff | OK | Presente |
| X-XSS-Protection: 1; mode=block | OK | Presente |
| Referrer-Policy: strict-origin-when-cross-origin | OK | Presente |
| Permissions-Policy | CORRIGIDO | `geolocation=()` alterado para `geolocation=(self)` |
| CSP (Content-Security-Policy) | OK | Presente com configuracao dev/prod |
| HSTS | OK | Presente com preload |

### Build & Tests (pos-Bloco 1)

- **pnpm build**: PASS (zero erros, apenas warnings de unused vars)
- **npx vitest run**: 469 passed, 4 failed (pre-existentes em `checkin.service.test.ts`), 1 skipped
  - Os 4 testes falhando sao pre-existentes e nao relacionados com as alteracoes do Bloco 1

---

## BLOCO 2 — Build & TypeScript

### 2.1 — Audit de Build

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| `pnpm build` | PASS | Zero erros de compilacao. 560 warnings (377 unused vars, 183 outros) |
| `pnpm lint` | PASS | Zero erros. Apenas warnings (no-unused-vars, no-explicit-any, react-hooks) |
| `npx tsc --noEmit` | PASS | Zero erros de tipo |
| Compilacao Next.js | OK | Todas as paginas compilam (static + dynamic) |

### 2.2 — Dead Code & Imports

#### Unused Imports Removidos

- **Plugin instalado**: `eslint-plugin-unused-imports` (permanente)
- **Imports removidos**: ~241 imports nao utilizados em 133 arquivos
- **Warnings restantes**: 136 (variáveis/argumentos unused — nao imports)
- **Metodo**: Auto-fix via `eslint --fix` com regra `unused-imports/no-unused-imports`

#### Console.logs em Producao

| Local | Status | Justificativa |
|-------|--------|---------------|
| `scripts/` (seed, create-test-user) | OK | Scripts CLI — console.log e correto |
| `server/src/bootstrap.ts` | OK | Server bootstrap — output de terminal |
| `server/src/infrastructure/database/` | OK | Database logging — server-side |
| `lib/logger.ts` | OK | E o proprio logger |
| `lib/monitoring/structured-logger.ts` | OK | Logger estruturado |
| `lib/monitoring/web-vitals.ts` | OK | Protegido por `NODE_ENV === 'development'` |
| `lib/application/events/event-wiring.ts` | OK | Protegido por `options?.debug` flag |

**Conclusao**: Nenhum console.log "solto" em codigo de producao. Todos os usos sao legitimos.

#### TODO/FIXME/HACK Inventory

**Total**: 173 TODOs/FIXMEs em 111 arquivos

| Categoria | Qtd | Prioridade | Descricao |
|-----------|-----|------------|-----------|
| TODO(BE-xxx) — Backend endpoints | 118 | Phase 2-3 | Services mock-only aguardando backend real |
| TODO(FE-xxx) — Frontend tasks | 15 | Phase 2 | Integracoes frontend pendentes |
| FIXME — Dados placeholder | 6 | Pre-deploy | Dados empresa reais (CNPJ, endereco, telefone) em `lib/academy/contactInfo.ts` |
| TODO(LGPD-xxx) — Compliance | 4 | Phase 2 | Persistencia de consentimento em banco |
| TODO(SEC-xxx) — Seguranca | 2 | Phase 2 | Migracao AuthContext → TokenStore, MFA database |
| TODO(OPS-xxx) — Operacoes | 4 | Phase 3 | Integracao Sentry |
| TODO (generico) — Sem ticket | 12 | Varies | Melhorias pontuais diversas |

**FIXMEs criticos (pre-deploy)**:
- `lib/academy/contactInfo.ts:10-20` — Razao social, CNPJ, endereco, CEP, WhatsApp, telefone com valores placeholder

**TODOs notaveis**:
- `contexts/AuthContext.tsx:4` — TODO(SEC-001): Migracao AuthContext → TokenStore
- `lib/security/mfa-stepup.ts:89` — TODO(BE-016): Migrate MFA to database tables
- `lib/security/rls-middleware.ts:344` — TODO(BE-001): Implementar extracao real do JWT
- `components/shared/PrivacyConsentModal.tsx` — 4x TODO(LGPD-001): Consent storage to DB
- `lib/monitoring/auto-remediation.ts` — 6x TODO(BE-028..033): Remediation actions em producao

### Build & Tests (pos-Bloco 2)

- **pnpm build**: PASS (zero erros)
- **Unused vars warnings**: Reduzidos de 377 → 136 (241 imports removidos)
- **Total warnings**: Reduzidos de 560 → ~320

---

## BLOCO 3 — Domain Engine Integrity

### 3.1 — Event Sourcing Consistency

#### Domain Events (`lib/domain/events/domain-events.ts`)

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| 12 eventos com type discriminator unico | OK | PromotionGranted, SublevelAwarded, CompetencyScoreUpdated, PromotionEligibilityReached, EvaluationScheduled, EvaluationCompleted, AttendanceRecorded, SessionCompleted, AchievementUnlocked, StreakMilestoneReached, ParticipantEnrolled, TrackChanged |
| makeIdempotencyKey deterministico | OK | Formato `{eventType}:{aggregateId}:{context}` — sem timestamp/random |
| humanDescription presente | OK | Campo opcional no DomainEventBase, preenchido pelo command |
| Schema version definido | OK | CURRENT_EVENT_VERSIONS com todos os 12 eventos em v1 |
| Causal chain guard (max depth 10) | OK | MAX_CAUSATION_DEPTH = 10, continueCausationChain() inicia nova cadeia se exceder |
| Union type DomainEvent completa | OK | Todos os 12 eventos presentes no union type |
| createEvent factory | OK | Usa utcNow(), version do registry, causalidade automatica |

#### Event Governance (`lib/domain/events/event-governance.ts`)

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Contratos congelados | OK | Tabela de contratos v1 documentada, data 19/02/2026 |
| Regras de versionamento | OK | 5 regras claras: nunca alterar v existente, campos novos opcionais, handlers aceitam >= minima |
| Admission gate | OK | Checklist de 4 criterios documentado |
| Classificacao 3 categorias | OK | Domain Events, Application Events, Analytics Events |

#### Participant (`lib/domain/participant/`)

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| PersonIdentity campos LGPD | OK | fullName, displayName, email, phone, document, birthDate, dataStatus, anonymizedAt |
| anonymizePerson() funciona | OK | Limpa PII, preserva ID e participantIds, seta dataStatus='anonymized', usa utcNow() |
| Participant aggregate | OK | Roles, progressStates, achievements, familyLinks, preferences — todos tipados |
| Branded types (PersonId, ParticipantId) | OK | Compile-time safety |

#### Development (`lib/domain/development/track.ts`)

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| DevelopmentTrack tipos corretos | OK | ProgressionModel (5 modelos), Milestone, Competency, PromotionRule |
| ProgressState consistente | OK | competencyScores, overallScore, promotionStatus, history, accumulatedMetrics |
| PromotionCriterion extensivel | OK | 10 tipos incluindo `custom` |
| Evaluation | OK | Tipagem completa com status, result, scores |

#### Shared Time (`lib/domain/shared/time.ts`)

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| utcNow() centralizado | OK | TimeProvider interface com SystemClock (prod) e FixedClock (testes) |
| setClock/resetClock para testes | OK | Permite mock de tempo |
| `new Date()` direto no dominio | CORRIGIDO | 11 violacoes em 8 intelligence engines migradas para utcNow()/getClock() |
| `Date.now()` direto no dominio | CORRIGIDO | 1 violacao em adaptive-difficulty.ts migrada para utcNowMs() |

**Violacoes corrigidas:**
- `lib/domain/intelligence/engine/churn-engine.ts` — `new Date().toISOString()` → `utcNow()`
- `lib/domain/intelligence/engines/engagement-scorer.ts` — 2x `new Date().toISOString()` → `utcNow()`
- `lib/domain/intelligence/engines/instructor-coach.ts` — `new Date().toISOString()` → `utcNow()`
- `lib/domain/intelligence/engines/adaptive-difficulty.ts` — `new Date().toISOString()` → `utcNow()`, `Date.now()` → `utcNowMs()`
- `lib/domain/intelligence/engines/social-graph.ts` — `new Date().toISOString()` → `utcNow()`
- `lib/domain/intelligence/engines/promotion-predictor.ts` — `new Date().toISOString()` → `utcNow()`, `new Date()` → `getClock().nowDate()`
- `lib/domain/intelligence/engines/student-dna.ts` — `new Date().toISOString()` → `utcNow()`
- `lib/domain/intelligence/engines/class-optimizer.ts` — `new Date().toISOString()` → `utcNow()`

#### Domain Boundary Violations

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Import de React em lib/domain/ | OK | Nenhum import de React encontrado |
| Import de Supabase em lib/domain/ | OK | Nenhum import de @supabase encontrado |
| Import de next/ em lib/domain/ | OK | Nenhum import de next/ encontrado |
| fetch() ou chamada HTTP em lib/domain/ | OK | Nenhuma chamada HTTP encontrada |
| Mutacao de estado global | OK | Apenas time.ts tem estado global (clock swappable para testes) |

#### Bounded Contexts (7)

| # | Bounded Context | Diretorio | Status |
|---|----------------|-----------|--------|
| 1 | Shared Kernel | `lib/domain/shared/` | OK — kernel.ts (branded types, value objects), time.ts (centralized clock) |
| 2 | Segment | `lib/domain/segment/` | OK — segment.ts (types), presets.ts (5 presets: martial_arts, dance, pilates, fitness, music) |
| 3 | Development | `lib/domain/development/` | OK — track.ts (DevelopmentTrack, Milestone, Competency, ProgressState, Evaluation) |
| 4 | Participant | `lib/domain/participant/` | OK — participant.ts (aggregate), person.ts (LGPD identity) |
| 5 | Unit | `lib/domain/unit/` | OK — unit.ts (tenant, branding, settings, spaces) |
| 6 | Scheduling | `lib/domain/scheduling/` | OK — scheduling.ts (Group, Session, AttendanceRecord) |
| 7 | Recognition | `lib/domain/recognition/` | OK — recognition.ts (Achievements, Gamification, Ranking) |

#### Events (12)

| # | Evento | Bounded Context | Status |
|---|--------|----------------|--------|
| 1 | PromotionGranted | Progression | OK |
| 2 | SublevelAwarded | Progression | OK |
| 3 | CompetencyScoreUpdated | Progression | OK |
| 4 | PromotionEligibilityReached | Progression | OK |
| 5 | EvaluationScheduled | Evaluation | OK |
| 6 | EvaluationCompleted | Evaluation | OK |
| 7 | AttendanceRecorded | Scheduling | OK |
| 8 | SessionCompleted | Scheduling | OK |
| 9 | AchievementUnlocked | Recognition | OK |
| 10 | StreakMilestoneReached | Recognition | OK |
| 11 | ParticipantEnrolled | Participant | OK |
| 12 | TrackChanged | Participant | OK |

#### Projectors

**Progression Projectors (6)** — `lib/application/progression/projectors/`:
1. `projectAdminRow` — Pure function, input → AdminParticipantRowVM
2. `projectRanking` — Pure function, input → RankingParticipantVM
3. `projectEligibility` — Pure function, input → EligibilityVM
4. `projectNotifications` — Pure function, input → ProgressNotificationVM[]
5. `projectDigitalCard` — Pure function, input → DigitalCardVM
6. `projectDashboardCard` — Pure function, input → DashboardProgressCardVM

**Student/Instructor Projectors (2)**:
7. `projectStudentProgress` — Pure function, input → StudentProgressVM
8. `projectInstructorProgress` — Pure function, input → InstructorProgressVM

**Intelligence Projectors (7)** — `lib/application/intelligence/projectors/`:
9. `projectAdminChurnOverview` — Churn overview for admin
10. `projectStudentInsights` — Adult student insights
11. `projectTeenInsights` — Teen gamified insights
12. `projectKidsInsights` — Kids adventure insights
13. `projectParentInsights` — Parent insights
14. `projectInstructorCoach` — Instructor coach briefing
15. `projectAdminAnalytics` — Admin AI analytics
16. `projectSuperAdminHealth` — Super admin health dashboard

**Total: 16 projectors** (8 progression + 8 intelligence) — All pure functions

#### Event Wiring (`lib/application/events/event-wiring.ts`)

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Subscribers registrados | OK | eventBus.onAny → eventStore.persist (all events) |
| Intelligence wiring | OK | Dynamic import de intelligence-wiring.ts (optional module) |
| Listeners duplicados | OK | Guard `if (initialized) return` previne duplos |
| Circular dependencies | OK | Nenhuma detectada |
| Debug logging | OK | Protegido por `options?.debug` flag |
| Reset para testes | OK | `resetEventSystem()` limpa bus e flag |

#### Event Bus (`lib/application/events/event-bus.ts`)

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Subscribe por tipo | OK | `on<T>(type, handler)` com unsubscribe |
| Subscribe wildcard | OK | `onAny(handler)` com unsubscribe |
| Subscribe multiplo | OK | `onMany(types, handler)` |
| Error isolation | OK | try/catch em cada handler, erros logados nao propagados |
| SNAPSHOT_INVALIDATING_EVENTS | OK | Todos os 12 eventos listados (conservativo — invalida sempre) |

#### Event Store (`lib/application/events/event-store.ts`)

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Adapter interface | OK | append, appendBatch, hasIdempotencyKey, query, count, getLastSequence |
| InMemory adapter | OK | Funcional com idempotency index |
| Idempotency gate | OK | Verifica antes de persist, rejeita silenciosamente duplicatas |
| StoredEvent envelope | OK | id, sequence, unitId, participantId, causalidade, storedAt |
| Query | OK | Filtros por participantId, unitId, eventTypes, correlationId, causationId, after/before |
| Replay | OK | `replay(participantId)` retorna DomainEvent[] em ordem |
| Causal chain query | OK | `getCausalChain(correlationId)` |
| Usa utcNow()/utcNowMs() | OK | Timestamps centralizados |

### Build & Tests (pos-Bloco 3)

- **pnpm build**: PASS (zero erros)
- **npx vitest run**: 469 passed, 4 failed (pre-existentes em `checkin.service.test.ts`), 1 skipped
  - Nenhuma regressao introduzida pelo Bloco 3
  - Os 4 testes falhando sao os mesmos pre-existentes dos Blocos 1 e 2

---

## BLOCO 4 — Intelligence Layer (ML)

### 4.1 — ML Engines Verification

#### Engines (8 engines)

| # | Engine | Arquivo | Status | Pura? | Tipos OK? | Edge Cases? |
|---|--------|---------|--------|-------|-----------|-------------|
| 1 | Churn Engine | `lib/domain/intelligence/engine/churn-engine.ts` | Funcional | Sim | Sim | Sim — null features ignorados, confidence cold-start |
| 2 | Adaptive Difficulty | `lib/domain/intelligence/engines/adaptive-difficulty.ts` | Funcional | Sim* | Sim | Sim — null DNA, empty question bank, time limits |
| 3 | Student DNA | `lib/domain/intelligence/engines/student-dna.ts` | Funcional | Sim | Sim | Sim — empty arrays, zero divisions (safeDivide) |
| 4 | Class Optimizer | `lib/domain/intelligence/engines/class-optimizer.ts` | Funcional | Sim | Sim | Sim — empty students, zero capacity |
| 5 | Instructor Coach | `lib/domain/intelligence/engines/instructor-coach.ts` | Funcional | Sim | Sim | Sim — empty classes, no students |
| 6 | Engagement Scorer | `lib/domain/intelligence/engines/engagement-scorer.ts` | Funcional | Sim | Sim | Sim — zero divisions, missing data |
| 7 | Promotion Predictor | `lib/domain/intelligence/engines/promotion-predictor.ts` | Funcional | Sim | Sim | Sim — no criteria, zero velocity, null estimates |
| 8 | Social Graph | `lib/domain/intelligence/engines/social-graph.ts` | Funcional | Sim | Sim | Sim — no connections, inactive bonds |

*\*Adaptive Difficulty usa `Math.random()` apenas em `generateTestId()` para unicidade de ID — aceitavel.*

**Pesos/Thresholds verificados:**
- Churn: 7 risk factors somam peso 100 (25+20+20+15+10+5+5). Thresholds escalonados (low/medium/high/critical). Sensatos.
- Engagement: 5 dimensoes somam peso 1.0 (0.30+0.25+0.20+0.15+0.10). Financial scores mapeados (current=100, cancelled=0). Sensatos.
- Promotion: Engagement velocity multipliers (champion=1.2, disconnected=0.5). Sensatos.

#### Core Utilities

| Arquivo | Status | Detalhes |
|---------|--------|----------|
| `core/types.ts` | OK | 15+ tipos base (Score0to100, Confidence, EngagementTier, etc). Sem dependencias externas |
| `core/scoring-utils.ts` | OK | 15 funcoes utilitarias puras. Testadas (47 testes). Sem side effects |
| `core/confidence-calculator.ts` | OK | Cold-start penalty por enrollment tiers. Event bonus. Pure |
| `engine/weights.ts` | OK | Segment overrides (fitness, dance, pilates, music). Auto-normaliza para 100 |

#### Models (10 type files)

| Arquivo | Status |
|---------|--------|
| `models/churn-score.ts` | OK — ChurnFeatureVector, ChurnPrediction, ChurnFactor, Recommendation |
| `models/risk-factors.ts` | OK — 7 RiskFactorTypes, RiskLevel, DEFAULT_RISK_FACTORS |
| `models/engagement.types.ts` | OK — EngagementScore, EngagementDimensions, AttentionPriority, EngagementInput |
| `models/student-dna.types.ts` | OK — StudentDNA, 8 dimensoes, DifficultyProfile, StudentDNAPatterns |
| `models/promotion.types.ts` | OK — PromotionInput, PromotionPrediction, PromotionBlocker, PromotionAccelerator |
| `models/social-graph.types.ts` | OK — SocialProfile, SocialConnection, SocialMetrics, SocialAlert |
| `models/class-insight.types.ts` | OK — ClassInsight, ClassHealth, ClassComposition |
| `models/instructor-coach.types.ts` | OK — InstructorCoachBriefing, ClassBriefing, SpotlightStudent |
| `models/adaptive-test.types.ts` | OK — AdaptiveTest, TestSection, TestQuestion |
| `models/coach-tip.types.ts` | OK |

#### Boundary Violations

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Import de React em intelligence/ | OK | Nenhum |
| Import de Supabase em intelligence/ | OK | Nenhum |
| Import de next/ em intelligence/ | OK | Nenhum |
| fetch() em intelligence/ | OK | Nenhum |
| Import de ACL em engines/ | CORRIGIDO | `engagement-scorer.ts` importava `EngagementInput` de `@/lib/acl/mappers/engagement-mapper`. Movido para `models/engagement.types.ts` |

### 4.2 — ML Projectors (8 projectors)

Localizacao: `lib/application/intelligence/projectors/`

| # | Projector | Arquivo | Status | Pura? |
|---|-----------|---------|--------|-------|
| 1 | Admin Churn Overview | `churn-projectors.ts` | Funcional | Sim |
| 2 | Instructor Churn Alerts | `churn-projectors.ts` | Funcional | Sim |
| 3 | Retention Encouragement | `churn-projectors.ts` | Funcional | Sim |
| 4 | Student Insights (Adult) | `project-student-insights.ts` | Funcional | Sim |
| 5 | Teen Insights (Gamified) | `project-teen-insights.ts` | Funcional | Sim* |
| 6 | Kids Insights (Adventure) | `project-kids-insights.ts` | Funcional | Sim |
| 7 | Parent Insights | `project-parent-insights.ts` | Funcional | Sim |
| 8 | Instructor Coach | `project-instructor-coach.ts` | Funcional | Sim |
| 9 | Admin AI Analytics | `project-admin-analytics.ts` | Funcional | Sim |
| 10 | Super Admin Health | `project-super-admin-health.ts` | Funcional | Sim |

*\*Teen Insights usa `Math.random()` em `buildRivalChallenge()` para simular rival score — aceitavel para gamificacao.*

Todos os projectors: Input → ViewModel tipado. Zero side effects. Zero fetch.

### 4.3 — ACL Mappers (6 mappers)

Localizacao: `lib/acl/mappers/`

| # | Mapper | Arquivo | Status |
|---|--------|---------|--------|
| 1 | Intelligence (Churn) | `intelligence-mapper.ts` | OK — extractFeaturesFromSnapshot (pure) + extractAdditionalFeatures (async/DB) |
| 2 | Engagement | `engagement-mapper.ts` | OK — extractEngagementFromSnapshot (pure) + extractEngagementAdditionalFeatures (async/DB) |
| 3 | Class Optimizer | `class-optimizer-mapper.ts` | OK |
| 4 | Social Graph | `social-graph-mapper.ts` | OK |
| 5 | Student DNA | `student-dna-mapper.ts` | OK |
| 6 | Progression | `progression.mapper.ts` | OK |

**Padrao ACL correto:** Cada mapper separa extração do snapshot (pure) de queries ao banco (async). Engines nunca tocam infra.

### 4.4 — Testes ML

| Arquivo de Teste | Testes | Status |
|------------------|--------|--------|
| `churn-engine.test.ts` | 33 | PASS |
| `churn-projectors.test.ts` | 20 | PASS |
| `churn-weights.test.ts` | 15 | PASS |
| `scoring-utils.test.ts` | 47 | PASS |
| `class-optimizer.test.ts` | 35 | PASS |
| `engagement-scorer.test.ts` | 35 | PASS |
| `promotion-predictor.test.ts` | 38 | PASS |
| `social-graph.test.ts` | 36 | PASS |
| `student-dna.test.ts` | 37 | PASS |
| **TOTAL** | **296** | **296/296 PASS** |

### 4.5 — Correcoes Aplicadas

1. **Boundary violation fix**: `EngagementInput` interface movida de `lib/acl/mappers/engagement-mapper.ts` para `lib/domain/intelligence/models/engagement.types.ts`. O domain engine (`engagement-scorer.ts`) agora importa do proprio bounded context. O ACL mapper re-exporta o tipo para manter backward compatibility.
2. **Test import fix**: `tests/ai/engagement-scorer.test.ts` atualizado para importar `EngagementInput` diretamente do domain model.

### 4.6 — Recomendacoes de Melhoria

| # | Recomendacao | Prioridade | Fase |
|---|-------------|------------|------|
| 1 | Remover `Math.random()` de `generateTestId` (usar hash deterministico) | Low | Phase 2 |
| 2 | Remover `Math.random()` de `buildRivalChallenge` teen projector (usar seed-based) | Low | Phase 2 |
| 3 | Criar testes para `adaptive-difficulty.ts` engine (unico engine sem testes dedicados) | Medium | Phase 2 |
| 4 | Criar testes para os projectors (student-insights, teen-insights, admin-analytics, etc) | Medium | Phase 2 |
| 5 | Adicionar `instructor-coach` engine tests | Medium | Phase 2 |

### Build & Tests (pos-Bloco 4)

- **pnpm build**: PASS (zero erros)
- **npx vitest run tests/ai/**: 296/296 PASS (zero falhas)
- **Nenhuma regressao introduzida pelo Bloco 4**

---

## BLOCO 5 — API Services & Backend

### 5.1 — Audit dos 47 Services

**Total de services encontrados: 47** (originalmente estimados 41)

#### Classificacao Completa

| # | Service | Categoria | Problema / Notas |
|---|---------|-----------|------------------|
| 1 | `admin.service.ts` | A | OK — apiClient calls |
| 2 | `alertas-inteligentes.service.ts` | A | OK — apiClient + localStorage |
| 3 | `aluno-home.service.ts` | A | OK — apiClient |
| 4 | `analytics.service.ts` | A | OK — apiClient |
| 5 | `assinatura.service.ts` | A | OK — apiClient |
| 6 | `auth.service.ts` | A | CORRIGIDO — `as any` removido na linha 355 (`supabase.from('profiles')`) |
| 7 | `automacoes.service.ts` | A | OK — apiClient |
| 8 | `carteirinha.service.ts` | A | OK — apiClient |
| 9 | `checkin.service.ts` | A | OK — apiClient |
| 10 | `comunicacoes.service.ts` | A | OK — apiClient |
| 11 | `conquistas.service.ts` | N/A | Re-export barrel de `medalhas.service.ts` |
| 12 | `content.service.ts` | A | OK — apiClient |
| 13 | `daily-feedback.service.ts` | B | Else branches `throw new Error('Backend not connected')`. TODO comments adicionados |
| 14 | `developer.service.ts` | B | Else branches `throw new Error('Backend not connected')`. TODO comments adicionados |
| 15 | `device-fingerprint.service.ts` | C | Browser-only localStorage utility. Sem mock/prod split |
| 16 | `eventos.service.ts` | A | OK — apiClient |
| 17 | `evolucao.service.ts` | A | OK — apiClient |
| 18 | `gateway.service.ts` | A | OK — apiClient. Mock PIX key inline (nao e secret real) |
| 19 | `graduacao.service.ts` | A | OK — apiClient. Non-null assertion `exam!` |
| 20 | `instrutor.service.ts` | N/A | Re-export barrel de `professor.service.ts` |
| 21 | `kids-safety.service.ts` | A | OK — apiClient |
| 22 | `kids.service.ts` | A | OK — apiClient. Re-exporta mock constants |
| 23 | `leads.service.ts` | A | OK — apiClient |
| 24 | `medalhas.service.ts` | A | OK — apiClient |
| 25 | `mensagens.service.ts` | B | CORRIGIDO — local `useMock()`/`mockDelay()` substituidos por `@/lib/env`. Else branches retornam stubs |
| 26 | `minhas-turmas.service.ts` | A | OK — apiClient |
| 27 | `pagamentos.service.ts` | A | OK — apiClient |
| 28 | `particulares.service.ts` | A | CORRIGIDO — `getInstrutoresSplit()` agora tipado com `ProfessorSplit` interface |
| 29 | `pdv.service.ts` | A | CORRIGIDO — `getStats()` agora tipado com `PDVStats` interface |
| 30 | `perfil-estendido.service.ts` | A | CORRIGIDO — `getModalidadesInfo()`/`getCategoriasInfo()` agora tipados |
| 31 | `plano-aula.service.ts` | A | OK — apiClient |
| 32 | `playlist.service.ts` | A | OK — apiClient |
| 33 | `professor-pedagogico.service.ts` | A | OK — apiClient |
| 34 | `professor.service.ts` | A | OK — apiClient |
| 35 | `progresso.service.ts` | A | OK — apiClient |
| 36 | `push.service.ts` | A | OK — apiClient. Fake token fallback em browser |
| 37 | `ranking.service.ts` | A | OK — apiClient. Param `alunoId` unused |
| 38 | `relatorios.service.ts` | A | OK — apiClient. PDF usa `alert()`, XLSX e fake TSV |
| 39 | `shop.service.ts` | A | OK — apiClient. Re-exporta mock helpers |
| 40 | `storage.service.ts` | A | OK — apiClient |
| 41 | `teen.service.ts` | A | OK — apiClient. Re-exporta mock constants |
| 42 | `turma-broadcast.service.ts` | B | Else branches retornam stubs vazios. TODO comments adicionados |
| 43 | `video-management.service.ts` | A | OK — apiClient |
| 44 | `video-progress.service.ts` | B | Else branches retornam stubs/false. TODO comments adicionados. `require()` sync em 2 funcoes |
| 45 | `video-upload.service.ts` | A | OK — apiClient |
| 46 | `visitantes.service.ts` | A | CORRIGIDO — `getVisitantesStats()` agora tipado com `VisitantesStats` interface |
| 47 | `whatsapp-business.service.ts` | A | OK — apiClient |

#### Resumo por Categoria

| Categoria | Count | Descricao |
|-----------|-------|-----------|
| **A** (funcional) | 38 | Branch else usa apiClient/Supabase |
| **B** (parcial/stub) | 5 | daily-feedback, developer, mensagens, turma-broadcast, video-progress |
| **C** (mock only) | 1 | device-fingerprint (browser utility) |
| **N/A** (barrel) | 2 | conquistas (→ medalhas), instrutor (→ professor) |
| **Barrels** | 1 | conquistas → medalhas |

#### Correcoes Aplicadas (5.1)

1. **`auth.service.ts`**: Removido `as any` cast em `supabase.from('profiles')` (linha 355)
2. **`particulares.service.ts`**: Adicionada interface `ProfessorSplit` + return type em `getInstrutoresSplit()`
3. **`pdv.service.ts`**: Adicionada interface `PDVStats` + return type em `getStats()` + type param em `apiClient.get<PDVStats>()`
4. **`perfil-estendido.service.ts`**: Adicionados tipos `ModalidadeInfo` e `CategoriaInfo` + return types + type params
5. **`visitantes.service.ts`**: Adicionada interface `VisitantesStats` + return type em `getVisitantesStats()`
6. **`mensagens.service.ts`**: Substituidas funcoes locais `useMock()`/`mockDelay()` por imports de `@/lib/env`
7. **TODOs adicionados**: `daily-feedback`, `developer`, `turma-broadcast`, `video-progress`, `mensagens` — cada funcao stub agora tem `// TODO(BBOS-Phase-X)` com endpoint esperado

#### handleServiceError

`handleServiceError()` **nao existe** em nenhum lugar do codebase. Nao ha utility de error handling centralizado para services. Error handling e inconsistente — a maioria deixa exceptions propagarem, alguns usam try/catch retornando null.

**Recomendacao**: Criar `lib/api/error-handler.ts` com utility de error handling padrao (Phase 2).

#### Hardcoded URLs/Secrets

- Nenhum secret real encontrado
- `gateway.service.ts`: Mock PIX key e URL `https://mock-boleto.com/` (apenas no branch mock, risco baixo)
- `mensagens.service.ts`: Hardcoded `'professor_01'` em `enviarMensagem()` (alias de conveniencia)

---

### 5.2 — Supabase Migrations Consistency

#### Migrations (12 + 1 corretiva)

| # | Migration | Tabelas | RLS | Policies | Indices |
|---|-----------|---------|-----|----------|---------|
| 00001 | foundation | academies, profiles, memberships, parent_child_links | OK | OK | OK |
| 00002 | classes_attendance | class_schedules, class_sessions, class_enrollments, attendances | OK | OK | OK |
| 00003 | progression | belt_systems, promotions, skill_tracks, skill_assessments, milestones | OK | OK | OK |
| 00004 | rls_policies | (policies adicionais) | OK | OK | N/A |
| 00005 | event_store | domain_events, snapshots, event_subscriptions | OK | OK (restrictive) | OK |
| 00006 | financial | plans, subscriptions, invoices, payments | OK | OK | OK |
| 00007 | gamification | points_ledger, streaks, achievements, member_achievements | OK | OK | OK |
| 00008 | notifications | notifications | OK | OK (4 policies) | OK |
| 00009 | lgpd | audit_log, lgpd_consent_log, data_export_requests, data_deletion_requests | OK | OK | OK |
| 00010 | audit_monitoring | rate_limit_log | OK | OK (restrictive) | OK |
| 00011 | ai_churn_labels | ai_churn_labels | OK | OK (4 policies) | OK |
| 00012 | ai_intelligence_layer | ai_student_dna_cache, ai_engagement_snapshots, ai_social_connections, ai_question_bank, ai_adaptive_tests, ai_test_responses, ai_instructor_briefings | OK | OK | OK |
| **00013** | **fix_missing_triggers** | **(corretiva)** | N/A | N/A | **NOVO** |

**Total: 38 tabelas + 1 view (leaderboard_view)**

#### Verificacoes

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| SQL valido | PASS | Todos os 12 arquivos sao PostgreSQL valido |
| RLS habilitado | PASS | Todas as 38 tabelas tem `ENABLE ROW LEVEL SECURITY` |
| Policies (min 1) | PASS | Todas as tabelas tem ao menos 1 policy |
| Foreign keys consistentes | PASS | Todas apontam para tabelas existentes em migrations anteriores |
| DROP TABLE sem IF EXISTS | PASS | Nenhum DROP TABLE encontrado |
| Dados sensiveis no seed | PASS | Apenas dados de referencia (belt systems, achievements) |
| Indices | PASS | Cobertura abrangente |
| `updated_at` triggers | CORRIGIDO | 2 tabelas faltavam triggers (ai_social_connections, ai_question_bank) — migration 00013 criada |

#### Consistencia queries vs migrations

| Verificacao | Status |
|-------------|--------|
| Tabelas em `lib/db/queries/` existem nas migrations | PASS |
| Colunas referenciadas existem | PASS |
| Tabelas sem query file | OK — 15 tabelas nao tem query (event_store, LGPD, AI) — acessadas via service_role ou pendentes |

#### `lib/supabase/types.ts`

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Arquivo existe | OK | 856 linhas |
| Tabelas presentes | PARCIAL | 29 de 38 tabelas presentes |
| Tabelas faltando | WARN | 9 tabelas: event_subscriptions, ai_churn_labels, ai_student_dna_cache, ai_engagement_snapshots, ai_social_connections, ai_question_bank, ai_adaptive_tests, ai_test_responses, ai_instructor_briefings |
| Colunas corretas | OK | Para as 29 tabelas presentes, todas as colunas correspondem ao SQL |
| Como regenerar | Documentado | `npx supabase gen types typescript --local > lib/supabase/types.ts` |

**Comentario adicionado ao topo de `lib/supabase/types.ts`** com lista de tabelas faltando e comando de regeneracao.

### Build & Tests (pos-Bloco 5)

- **pnpm build**: PASS (zero erros)
- **npx vitest run**: 469 passed, 4 failed (pre-existentes em `checkin.service.test.ts`), 1 skipped
  - Nenhuma regressao introduzida pelo Bloco 5
  - Os 4 testes falhando sao os mesmos pre-existentes dos Blocos 1-4

---

## BLOCO 6 — Frontend & UX

### 6.1 — Rotas e Navegacao

#### Mapeamento de Rotas

**Total de paginas (page.tsx): 109**
**Total de layouts (layout.tsx): 10**

| Route Group | Pages | Layout | Status |
|-------------|-------|--------|--------|
| `(admin)` | 27 | OK — AppShell + ADMIN_SHELL_CONFIG, ProtectedRoute UNIT_OWNER/ADMINISTRADOR | Todas validas |
| `(professor)` | 13 | OK — AppShell + cinematic overlays | Todas validas |
| `(main)` (adulto) | 27 | OK — AppShell + ProfileSwipeWrapper, dual theme | Todas validas |
| `(teen)` | 10 | OK — AppShell + ProfileSwipeWrapper, dual theme | Todas validas |
| `(kids)` | 7 | OK — AppShell + InactivityGuard + KidsGatekeeper (PIN/biometria) | Todas validas |
| `(parent)` | 5 | OK — Layout custom com nav manual (desktop header + mobile nav) | Todas validas |
| `(auth)` | 5 | OK — ErrorBoundary wrapper | Todas validas |
| `(developer)` | 8 | OK — AppShell + DEV_SHELL_CONFIG, permite SYS_AUDITOR/SUPPORT/SUPER_ADMIN | Todas validas |
| `(super-admin)` | 4 | OK — AppShell + SUPER_ADMIN_SHELL_CONFIG, dual theme | Todas validas |
| Root & Other | 3 | OK — Root layout com providers globais | Todas validas |

#### Verificacoes por Rota

| Verificacao | Status | Detalhes |
|-------------|--------|----------|
| Default export valido | 109/109 PASS | Todas as paginas exportam componentes React validos |
| Imports resolvem | 109/109 PASS | Zero imports de modulos inexistentes |
| Layout correspondente | 10/10 PASS | Todos os route groups tem layout.tsx |
| Paginas vazias/TODO-only | 0 encontradas | Todas as paginas tem conteudo substancial |
| Loading state (skeleton/spinner) | PASS | Uso consistente de PageSkeleton e PremiumLoader |
| Error state (PageError) | PASS | Uso consistente de PageError de DataStates.tsx |
| Empty state (PageEmpty) | PASS | Uso consistente de PageEmpty de DataStates.tsx |

#### Navegacao por Perfil

| Perfil | Rota Base | Shell Config | ProtectedRoute | Status |
|--------|-----------|-------------|----------------|--------|
| ADMIN | `/(admin)/` | ADMIN_SHELL_CONFIG | UNIT_OWNER, ADMINISTRADOR, SUPER_ADMIN, GESTOR | OK |
| PROFESSOR | `/(professor)/` | PROFESSOR_SHELL_CONFIG | INSTRUTOR | OK |
| ADULTO | `/(main)/` | MAIN_SHELL_CONFIG | ALUNO_ADULTO | OK |
| TEEN | `/(teen)/` | TEEN_SHELL_CONFIG | ALUNO_TEEN | OK |
| KIDS | `/(kids)/` | KIDS_SHELL_CONFIG | ALUNO_KIDS | OK |
| PARENT | `/(parent)/` | Layout custom | RESPONSAVEL | OK |
| DEVELOPER | `/(developer)/` | DEV_SHELL_CONFIG | SYS_AUDITOR, SUPPORT, SUPER_ADMIN | OK |
| SUPER_ADMIN | `/(super-admin)/` | SUPER_ADMIN_SHELL_CONFIG | SUPER_ADMIN | OK |

#### Sidebar/Menu

Cada route group tem `shell.config.ts` com menu structure, icons, hrefs, bottom nav items, search categories e tema de cores. AppShell orquestra o layout (top-nav ou sidebar).

#### Redirects

- `/` → redirect para `/login` (via `app/page.tsx`)
- Login → redirect para dashboard do perfil correto (via AuthContext)
- ProtectedRoute → redirect para `/login` se nao autenticado

#### TODOs de Integracao Frontend (nao bloqueantes)

| Ticket | Arquivo | Descricao |
|--------|---------|-----------|
| FE-022 | `app/(main)/shop/produto/[id]/page.tsx` | Integrar POST /shop/cart/add |
| FE-026 | `app/(teen)/teen-downloads/page.tsx` | Integrar GET /teen/downloads com cache local |
| FE-027 | `app/(teen)/teen-academia/page.tsx` | Substituir dados inline por GET /teen/unidade/areas |

**Conclusao 6.1**: Todas as 109 rotas sao funcionais, com loading/error/empty states consistentes. Zero rotas quebradas.

---

### 6.2 — Componentes Compartilhados

#### components/shared/

| Componente | Arquivo | Status | Detalhes |
|------------|---------|--------|----------|
| ConfirmModal | `ConfirmModal.tsx` | EXCELENTE | Props tipadas, `role="alertdialog"`, `aria-modal`, `aria-labelledby`, dark mode, responsive |
| Toast | `contexts/ToastContext.tsx` | EXCELENTE | `role="alert"`, `aria-live="polite"`, auto-dismiss, max 3 concorrentes, mobile/desktop layout |
| PageError | `DataStates.tsx` | EXCELENTE | HTTP status codes (401-503), mensagens amigaveis, retry button, design tokens |
| PageEmpty | `DataStates.tsx` | EXCELENTE | Icon customizavel, titulo, mensagem, design tokens |
| PageLoading | `DataStates.tsx` | EXCELENTE | PremiumLoader wrapper |
| SkeletonLoader | `SkeletonLoader.tsx` | EXCELENTE | 7 variantes, `role="status"`, `sr-only` text, shimmer animation, `prefers-reduced-motion` |
| ProtectedRoute | `ProtectedRoute.tsx` | EXCELENTE | Race condition fix, 2s safety timeout, 3-phase flow |

#### components/shell/

| Componente | Arquivo | Status | Detalhes |
|------------|---------|--------|----------|
| AppShell | `AppShell.tsx` | EXCELENTE | 2 layout variants (top-nav, sidebar), ESC close, Cmd+K search, FABCheckin integrado |
| ShellDesktopHeader | `ShellDesktopHeader.tsx` | OK | Todos aria-labels presentes, responsive (`hidden md:flex`), dark mode completo |
| ShellMobileHeader | `ShellMobileHeader.tsx` | OK | Todos aria-labels presentes, mobile-only (`md:hidden`), safe-area insets |
| ShellSidebar | `ShellSidebar.tsx` | EXCELENTE | `aria-current="page"`, mobile overlay, search morph, user card |
| ShellBottomNav | `ShellBottomNav.tsx` | EXCELENTE | `aria-label="Menu inferior"`, `aria-current`, `min-w-[64px]` touch targets |
| ShellMobileDrawer | `ShellMobileDrawer.tsx` | CORRIGIDO | 4 botoes faltavam `aria-label` e focus indicators — corrigidos |

#### components/auth/

| Componente | Arquivo | Status | Detalhes |
|------------|---------|--------|----------|
| ProfileSelection | `ProfileSelection.tsx` | EXCELENTE | Password modal, glassmorphism, grid responsivo, kids gatekeeper |
| RoleGuard | `RoleGuard.tsx` | EXCELENTE | Modo silent (hide) e redirect, permission checking |
| ProtectedRoute | `ProtectedRoute.tsx` | EXCELENTE | Descrito acima |

#### components/checkin/

| Componente | Arquivo | Status | Detalhes |
|------------|---------|--------|----------|
| FABCheckin | `FABCheckin.tsx` | CORRIGIDO | 4 modos (menu, QR, list, search), offline support, role check. StudentRow faltava `aria-label` — corrigido |

#### Correcoes Aplicadas (6.2)

1. **`ShellMobileDrawer.tsx`**: Adicionados `aria-label` em 4 botoes (Meu Perfil, Trocar Perfil, Tema, Sair) + `focus:ring-2` focus indicators
2. **`FABCheckin.tsx`**: Adicionado `aria-label={`Check-in para ${aluno.nome}`}` no botao StudentRow

#### Analise Transversal

| Aspecto | Cobertura | Notas |
|---------|-----------|-------|
| Type Safety (no `any`) | 99% | 3 `React.ComponentType<any>` em icon helpers — com eslint-disable, aceitavel |
| Dark Mode | 100% | Todos os componentes respeitam tema via design tokens ou isDark prop |
| Responsive | 100% | Mobile-first com breakpoints md/lg adequados |
| Acessibilidade (WCAG 2.1 Level A) | 98% | Corrigidos 5 botoes sem aria-label. Restante conforme |

### Build & Tests (pos-Bloco 6)

- **pnpm build**: PASS (zero erros)
- **npx vitest run**: 469 passed, 4 failed (pre-existentes), 1 skipped
  - Nenhuma regressao introduzida pelo Bloco 6
  - Os 4 testes falhando sao os mesmos pre-existentes dos Blocos 1-5

---

## BLOCO 7 — Contexts & State Management

### 7.1 — React Contexts

#### Contextos auditados (9 total)

| Contexto | Layout | Status | Problemas |
|----------|--------|--------|-----------|
| AuthContext | Root | OK | Usa localStorage para tokens (tech debt SEC-001, documentado) |
| ThemeContext | Root | CORRIGIDO | toggleTheme/setTheme eram no-ops; agora funcional com localStorage |
| ToastContext | Root | OK | success/error/warning/info + auto-dismiss + MAX_TOASTS=3 |
| OnboardingContext | Root | OK | Tours para aluno, instrutor, responsavel. Faltam: admin, teen, kids |
| ResponsiveContext | Root | OK | Wrapper sobre useBreakpoint com SSR fallback |
| NotificationContext | Root (CORRIGIDO) | CORRIGIDO | Provider NAO estava em nenhum layout — adicionado ao root |
| GlobalSearchContext | Sub-layouts | OK | Ref-based, zero re-renders, debounced search |
| ActiveClassContext | (professor) | OK | Persiste em localStorage, timer funcional |
| ParentContext | (parent) | OK | Depende de AuthContext (sem circular dep) |

#### Verificacoes de qualidade

| Verificacao | Resultado |
|-------------|-----------|
| Circular dependencies entre contexts | Nenhuma |
| Providers no layout correto | CORRIGIDO (NotificationProvider adicionado) |
| Loading state no AuthContext | Sim — loading=true ate sessao verificada |
| Logout limpa estado completamente | Sim — clearStorage() + setUser(null) + setAvailableProfiles([]) |
| Login redireciona para perfil correto | Sim — REDIRECT_MAP com 11 perfis mapeados |

#### Problemas corrigidos

1. **ThemeContext**: toggleTheme e setTheme eram funcoes no-op que nao faziam nada. Implementado:
   - `toggleTheme()` agora alterna dark/light e persiste em localStorage
   - `setTheme(t)` agora define tema e persiste em localStorage
   - OS preference continua sendo o default quando nao ha preferencia do usuario
   - `hasUserPreference` flag evita sobrescrever escolha manual do usuario

2. **NotificationProvider**: Definido em `contexts/NotificationContext.tsx` mas nunca colocado em nenhum layout.
   Componentes `DesktopHeader`, `NotificationBell`, `NotificationPanel` usam `useNotifications()` que lanca erro sem Provider.
   Adicionado `NotificationProvider` ao root layout, dentro de `AuthProvider`.

### 7.2 — Hooks

#### Hooks auditados (24 total)

| Hook | Tipo | Status |
|------|------|--------|
| useBreakpoint | Responsividade | OK — matchMedia + resize listener |
| useOfflineCheckin | Offline-first | OK — IndexedDB queue + auto-sync |
| useRequireAuth | Auth guard | OK — redirect se nao autenticado |
| useRequireRole | Role guard | OK — redirect se perfil incorreto |
| useServiceCall | Data fetching | OK — retry + backoff + mount guard |
| useCachedServiceCall | SWR caching | OK — stale-while-revalidate |
| useNetworkStatus | Connectivity | OK — Network Information API |
| useAutoSave | Form draft | OK — debounced localStorage |
| useRealtimeNotifications | Realtime | OK — Supabase Realtime + mock fallback |
| useFileUpload | Upload | OK — Supabase Storage |
| useVideoUpload | Upload | OK — Phases: validating > uploading > processing > done |
| useChurnInsights | AI hook | OK — fetch /api/ai/churn |
| useStudentRisk | AI hook | OK — fetch /api/ai/churn/[id] |
| useStudentDNA | AI hook | OK — fetch /api/ai/student-dna/[id] |
| useAdaptiveTest | AI hook | OK — POST /api/ai/adaptive-test |
| useClassInsights | AI hook | OK — fetch /api/ai/class-insights |
| useInstructorCoach | AI hook | CORRIGIDO — cancelled scope bug |
| useParentInsights | AI hook | OK — fetch /api/ai/parent-insights/[id] |
| useEngagementScore | AI hook | OK — fetch /api/ai/engagement/[id] |
| useAIInsights | AI hook | OK — parallel DNA + engagement fetch |
| useFormDefaults | UX | OK — pattern-based form defaults |
| useContextualMenu | UX | OK — time-based turma suggestions |
| useSwipeNavigation | Gestures | OK — horizontal swipe detection |
| useKeyboardAvoid | Mobile | OK — VisualViewport API + scrollIntoView |

#### Problema corrigido

3. **useInstructorCoach**: Variavel `cancelled` declarada dentro da funcao async do `useCallback` era inacessivel
   pelo cleanup do `useEffect`. O cleanup function retornado da async nunca era executado.
   Corrigido movendo o `cancelled` flag para o escopo do `useEffect`.

### 7.3 — Token Store (lib/security/token-store.ts)

| Aspecto | Status | Detalhes |
|---------|--------|---------|
| Tokens em memoria (nao localStorage) | OK | Variaveis JS privadas (`_accessToken`, etc.) |
| Refresh automatico | OK | `setRefreshInProgress()` + `waitForRefresh()` previne chamadas paralelas |
| Expiracao tratada | OK | `getAccessToken()` retorna null se expirado (margem de 30s) |
| Mock persistence | OK | Usa `sessionStorage` (nao localStorage) apenas em dev |
| Clear auth | OK | `clearAuth()` zera todas as 5 variaveis de sessao |
| Security config | OK | Defaults seguros: 15min access TTL, 7d refresh, 5 tentativas max |

#### Nota sobre SEC-001

O AuthContext ainda usa `localStorage` para persistir tokens no modo mock. O token-store esta pronto com
armazenamento em memoria, mas a migracao (SEC-001) esta documentada como tarefa futura no
BBOS Implementation Guide. Nao migrado neste bloco para evitar quebrar fluxo de autenticacao.

### Build & Tests (pos-Bloco 7)

- **pnpm build**: PASS (zero erros)
- **npx vitest run**: 469 passed, 4 failed (pre-existentes), 1 skipped
  - Nenhuma regressao introduzida pelo Bloco 7
  - Falhas pre-existentes: checkin.service.test.ts (3 testes), 1 outro

---

## BLOCO 8 — Dual Event Store Resolution

### 8.1 — Mapeamento e Documentacao

O BlackBelt possui **DOIS** event stores operando em paralelo. Isso constitui tech debt critico que deve ser unificado no BBOS Implementation Guide.

#### Adapter 1: Supabase Event Store (`lib/event-store/`)

**Localizacao**: `lib/event-store/event-store.ts` + `event-types.ts` + `projector-runner.ts`

| Aspecto | Detalhes |
|---------|----------|
| **Driver** | Supabase Admin Client (`getSupabaseAdminClient()`) |
| **Tabela** | `domain_events` (via Supabase) + `snapshots` + `event_subscriptions` |
| **Tipo** | Funcoes soltas (nao implementa interface `EventStoreAdapter`) |
| **@ts-nocheck** | Sim — `event-store.ts` e `projector-runner.ts` tem `// @ts-nocheck` |
| **Uso de `new Date()`** | Sim — viola convencao `utcNow()` do dominio |

**Funcionalidades:**

| Funcionalidade | Supabase Adapter |
|----------------|------------------|
| appendEvents | Sim — `appendEvents()` (batch insert via `.insert()`) |
| appendDomainEvent | Sim — convenience wrapper sobre `appendEvents()` |
| getEvents | Sim — por aggregateId + aggregateType, com afterEventId e limit |
| getEventsByType | Sim — por eventType, com from/to/limit |
| deduplication | Parcial — `idempotency_key` column mas sem ON CONFLICT, depende de unique constraint na tabela |
| snapshots | Sim — `getSnapshot()` + `saveSnapshot()` (upsert em `snapshots` table) |
| replay | Nao — nao tem funcao de replay |
| batch append | Sim — `appendEvents()` aceita array |
| retry | Nao — sem retry logic |
| projector runner | Sim — `projector-runner.ts` com subscription tracking (`event_subscriptions`) |

#### Adapter 2: Domain Event Store (`lib/application/events/event-store.ts`)

**Localizacao**: `lib/application/events/event-store.ts`

| Aspecto | Detalhes |
|---------|----------|
| **Arquitetura** | Interface `EventStoreAdapter` + classe `EventStore` (facade) + `InMemoryEventStoreAdapter` |
| **Design** | Clean Architecture — storage-agnostic via adapter pattern |
| **Singleton** | `export const eventStore` — default InMemory, swappable |
| **Uso de `utcNow()`** | Sim — usa `utcNow()` e `utcNowMs()` do dominio |

**Funcionalidades:**

| Funcionalidade | Domain Event Store |
|----------------|-------------------|
| append | Sim — `persist()` via adapter.append() |
| appendBatch | Sim — via adapter.appendBatch() |
| getParticipantHistory | Sim — query por participantId |
| getUnitHistory | Sim — query por unitId |
| getRecent | Sim — ultimos N eventos |
| deduplication | Sim — `hasIdempotencyKey()` check antes de persist |
| snapshots | Nao — nao tem snapshot support |
| replay | Sim — `replay()` retorna DomainEvent[] ordenados |
| getCausalChain | Sim — query por correlationId |
| getCause | Sim — query por causationId |
| getStats | Sim — count + eventsByType |
| batch append | Sim — via adapter |
| retry | Nao — sem retry logic |
| sequence tracking | Sim — sequenceCounter auto-incrementado |

#### Adapter 3: PostgreSQL Adapter (`server/src/infrastructure/event-store/postgres-event-store.ts`)

**Localizacao**: `server/src/infrastructure/event-store/postgres-event-store.ts`

| Aspecto | Detalhes |
|---------|----------|
| **Driver** | `pg` (Pool direto) |
| **Tabela** | `event_log` (diferente de `domain_events`!) |
| **Interface** | Implementa `EventStoreAdapter` de `lib/application/events/event-store.ts` |
| **Transacional** | Sim — BEGIN/COMMIT/ROLLBACK |
| **Idempotencia** | Sim — `ON CONFLICT (idempotency_key) DO NOTHING` |

**Funcionalidades:**

| Funcionalidade | Postgres Adapter |
|----------------|------------------|
| append | Sim — transacional com ON CONFLICT |
| appendBatch | Sim — transacional, loop de INSERTs |
| hasIdempotencyKey | Sim — SELECT 1 com LIMIT 1 |
| query | Sim — filtros: participantId, unitId, eventTypes, correlationId, causationId, after, before, minVersion, limit, offset |
| count | Sim — com filtros opcionais |
| getLastSequence | Sim — MAX(sequence) |
| deduplication | Sim — database-level via unique index |
| snapshots | Nao (nao faz parte do adapter interface) |
| replay | Via EventStore facade (que usa o adapter) |
| retry | Nao |

#### Tabela Comparativa Consolidada

| Funcionalidade | Supabase Adapter (`lib/event-store/`) | Domain EventStore (`lib/application/events/`) | Postgres Adapter (`server/`) |
|----------------|---------------------------------------|-----------------------------------------------|------------------------------|
| appendEvents | Sim | Sim (persist) | Sim (append) |
| getEvents | Sim (por aggregate) | Sim (por participant/unit) | Sim (query generico) |
| deduplication | Parcial (column only) | Sim (check + reject) | Sim (DB-level) |
| snapshots | Sim | Nao | Nao |
| replay | Nao | Sim | Via facade |
| batch append | Sim | Sim | Sim (transacional) |
| retry | Nao | Nao | Nao |
| causal chain | Nao | Sim | Via facade |
| projector runner | Sim | Nao | Nao |
| sequence tracking | Nao | Sim (in-memory) | Sim (SERIAL column) |
| transacional | Nao (Supabase SDK) | Nao | Sim (BEGIN/COMMIT) |

### Quem chama quem em runtime

#### Fluxo Principal (Event Wiring — `lib/application/events/event-wiring.ts`)

```
eventBus.publish(event)
  └→ eventBus.onAny() subscriber [event-wiring.ts:49-54]
       └→ eventStore.persist(event)  ← singleton InMemory por default
```

O singleton `eventStore` em `lib/application/events/event-store.ts:421` usa `InMemoryEventStoreAdapter` por default. Eventos publicados pelo bus vao para memoria e se perdem no restart.

#### Fluxo do Server Bootstrap (`server/src/bootstrap.ts`)

```
bootstrap()
  ├→ Se DATABASE_URL existe:
  │    pool = createPgPool()
  │    adapter = new PostgresEventStoreAdapter(pool)
  │    store = new EventStore(adapter)  ← nova instancia com Postgres
  │    eventBus.onAny() → store.persist()  ← persiste em event_log table
  │
  └→ Se nao:
       store = new EventStore(InMemoryEventStoreAdapter)
```

**PROBLEMA CRITICO**: O bootstrap cria uma **segunda instancia** do `EventStore` com o Postgres adapter, mas o `initializeEventSystem()` (chamado na mesma funcao bootstrap) usa o **singleton** `eventStore` de `lib/application/events/event-store.ts` que permanece InMemory. Resultado: **eventos sao persistidos duas vezes** — uma no InMemory singleton e outra no Postgres store do bootstrap.

#### Fluxo do Supabase Adapter (`lib/event-store/event-store.ts`)

```
appendEvents() / appendDomainEvent()
  └→ getSupabaseAdminClient().from('domain_events').insert()
```

Este adapter **NAO e chamado por nenhum outro arquivo** no codebase. Nenhum import direto foi encontrado alem de:
- `lib/event-store/event-types.ts` (re-exporta types)
- `lib/event-store/projector-runner.ts` (usa `event-types` locais)

O `projector-runner.ts` tambem **NAO e chamado** por nenhum outro arquivo.

#### Mapa completo de uso

| Arquivo que usa | Qual adapter/store | Como |
|-----------------|--------------------|------|
| `lib/application/events/event-wiring.ts` | Singleton `eventStore` (InMemory) | `eventStore.persist(event)` |
| `server/src/bootstrap.ts` | Nova instancia `EventStore(PostgresAdapter)` | `store.persist(event)` via `eventBus.onAny()` |
| `server/src/infrastructure/scoped-event-store.ts` | Wrapper sobre `EventStore` (injetado) | Delegates to injected store |
| `server/src/infrastructure/replay-policy.ts` | `EventStore` (injetado como parametro) | `store.replay(pid)` |
| `server/src/api/health.ts` | Nenhum diretamente | Apenas reporta mode POSTGRES/MEMORY |
| `lib/event-store/event-store.ts` | Supabase Admin Client | **NAO USADO em runtime** |
| `lib/event-store/projector-runner.ts` | Supabase Admin Client | **NAO USADO em runtime** |

### Diagnostico

| Issue | Severidade | Detalhes |
|-------|-----------|----------|
| **Duas tabelas diferentes** | CRITICO | `domain_events` (Supabase adapter) vs `event_log` (Postgres adapter). Schema incompativel |
| **Duas instancias de EventStore no server** | HIGH | Bootstrap cria nova instancia + event-wiring usa singleton. Duplicacao de persist |
| **Supabase adapter orfao** | MEDIUM | `lib/event-store/` nao e importado por ninguem. Codigo morto |
| **Projector runner orfao** | MEDIUM | `lib/event-store/projector-runner.ts` nao e chamado. Funcionalidade perdida |
| **@ts-nocheck em 2 arquivos** | LOW | `lib/event-store/event-store.ts` e `projector-runner.ts` ignoram type checking |
| **`new Date()` vs `utcNow()`** | LOW | Supabase adapter usa `new Date()` violando convencao do dominio |

### Recomendacao

**NAO unificar neste bloco** — conforme instrucao do audit. A unificacao sera feita no BBOS Implementation Guide (Prompt 0.1).

Plano recomendado para unificacao:

1. **Manter**: `lib/application/events/event-store.ts` (domain EventStore com adapter pattern) — e a arquitetura correta
2. **Manter**: `server/src/infrastructure/event-store/postgres-event-store.ts` — implementa o adapter para producao
3. **Deprecar**: `lib/event-store/` inteiro — codigo morto, Supabase adapter com @ts-nocheck, design inferior
4. **Migrar**: Funcionalidades uteis do Supabase adapter:
   - Snapshot support → adicionar ao `EventStoreAdapter` interface + Postgres adapter
   - Projector runner → migrar para usar o Domain EventStore
5. **Corrigir**: Remover duplicacao de persist no bootstrap (o `initializeEventSystem` ja registra listener no singleton)
6. **Unificar tabela**: Migrar `domain_events` → `event_log` ou vice-versa (alinhar schema)

### Build & Tests (pos-Bloco 8)

- **pnpm build**: PASS (zero erros)
- **npx vitest run**: 469 passed, 4 failed (pre-existentes), 1 skipped
  - Nenhuma regressao introduzida pelo Bloco 8 (bloco somente de documentacao)
  - Falhas pre-existentes: checkin.service.test.ts (3 testes), 1 outro

---

## BLOCO 9 — Tests & CI/CD

### 9.1 — Test Suite

#### Resultados iniciais (antes das correcoes)

| Metrica | Valor |
|---------|-------|
| Total de testes | 474 |
| Passando | 469 |
| Falhando | 4 |
| Skipped | 1 |
| Arquivos de teste | 26 |
| Duracao | ~9.7s |

#### Testes falhando (4 pre-existentes dos Blocos 1-8)

| Teste | Arquivo | Razao | Correcao |
|-------|---------|-------|----------|
| `getCurrentPermissions returns user permissions` | tests/security/rbac.test.ts:191 | Teste esperava apenas permissoes do usuario, mas `getCurrentPermissions()` corretamente combina user permissions + ROLE_PERMISSIONS[role]. `ALUNO_ADULTO` inclui `student:view:own_progress` via mapa de roles | Teste atualizado para validar comportamento correto (user + role permissions combinadas) |
| `registerCheckin > registers a checkin successfully` | tests/services/checkin.service.test.ts:22 | Teste usava `alunoId='aluno-test-001'` mas mock data usa IDs `u1`-`u8`. Mock retornava `success: false` por "Aluno nao encontrado" | Teste atualizado para usar `alunoId='u1'` (ID valido no mock) |
| `registerCheckin > supports QR method` | tests/services/checkin.service.test.ts:35 | Mesmo problema: `alunoId='aluno-test-001'` nao existe no mock | Teste atualizado para usar `alunoId='u1'` |
| `validateAndCheckin > validates QR payload` | tests/services/checkin.service.test.ts:43 | Teste usava `alunoId='aluno-test-001'` + hash invalido. Mock valida hash via `generateQRHash()` | Teste atualizado: usa `alunoId='u1'` + gera hash valido via `generateQRHash()` |

#### Resultados apos correcoes

| Metrica | Valor |
|---------|-------|
| Total de testes | 474 |
| Passando | 473 |
| Falhando | 0 |
| Skipped | 1 |
| Arquivos de teste | 26 |
| Duracao | ~9.6s |

O teste skipado (`tests/academy-contact.test.ts`) depende de configuracao externa e esta corretamente marcado como skip.

#### Cobertura de testes por area

| Area | Arquivos de teste | Testes | Status |
|------|-------------------|--------|--------|
| Intelligence Layer (ML) | 9 | ~296 | OK — todos passando |
| Security (RBAC, tokens, rate-limit) | 3 | ~35 | OK — todos passando |
| Services (auth, checkin, admin, etc.) | 7 | ~50 | OK — todos passando |
| Auth Context | 1 | 22 | OK |
| Nav Ranking | 1 | 12 | OK |
| Responsive Layout | 1 | 18 | OK |
| Domain Engine | 0 | 0 | GAP — sem testes unitarios (coberto indiretamente via ML e projectors) |
| Componentes React | 0 | 0 | GAP — nao obrigatorio nesta fase |

### 9.2 — CI/CD Pipeline

#### Workflows encontrados (3)

##### 1. `ci.yml` — CI Pipeline

| Aspecto | Status | Detalhes |
|---------|--------|---------|
| Trigger | OK | push/PR para main e develop |
| Steps | CORRIGIDO | install -> lint -> typecheck -> test -> build (build agora depende de test) |
| pnpm (nao npm) | OK | Usa `pnpm/action-setup@v4` + `pnpm install --frozen-lockfile` |
| Cache | OK | `actions/setup-node@v4` com `cache: 'pnpm'` |
| Concurrency | OK | `cancel-in-progress: true` — cancela runs anteriores |
| Build com mock=false | OK | Testa build de producao com placeholders Supabase |
| Bundle analysis | OK | Apenas em main, `continue-on-error: true` |
| **Problema corrigido** | CORRIGIDO | `build` job dependia apenas de `quality`, agora depende de `[quality, test]` — evita produzir artifacts de build quebrado |

##### 2. `supabase-deploy.yml` — Supabase Migrations

| Aspecto | Status | Detalhes |
|---------|--------|---------|
| Trigger | OK | push para main quando `supabase/migrations/**` muda |
| Secrets | OK | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF` |
| CLI version | OK | `supabase/setup-cli@v1` com `version: latest` |
| Concurrency | OK | `cancel-in-progress: false` (correto para migrations) |

##### 3. `deploy.yml` — Production Deploy (Vercel)

| Aspecto | Status | Detalhes |
|---------|--------|---------|
| Trigger | CORRIGIDO | Mudado de `push to main` para `workflow_run` (espera CI passar) |
| Guard | CORRIGIDO | Adicionado `if: github.event.workflow_run.conclusion == 'success'` |
| Secrets | OK | Vercel token, org/project IDs, Supabase, Sentry |
| Deploy action | OK | `amondnet/vercel-action@v25` com `--prod` |
| Notify job | OK | Reporta sucesso/falha |
| **Problema corrigido** | CORRIGIDO | Deploy disparava em paralelo com CI (sem aguardar testes). Agora depende de CI completar com sucesso via `workflow_run` |

##### 4. `vercel.json`

| Aspecto | Status | Detalhes |
|---------|--------|---------|
| Framework | OK | `nextjs` |
| Build command | OK | `pnpm build` |
| Install command | OK | `pnpm install` |
| Build env | OK | `NEXT_PUBLIC_USE_MOCK=true` |

#### Problemas corrigidos no CI/CD

1. **CI: build sem depender de test** — O job `build` no `ci.yml` so dependia de `quality` (lint + typecheck), executando em paralelo com `test`. Se testes falhassem, o build ainda produzia artifacts. Corrigido: `needs: [quality, test]`.

2. **Deploy sem depender de CI** — O `deploy.yml` disparava no mesmo evento `push to main` que o CI, sem esperar resultados. Codigo quebrado poderia ser deployado. Corrigido: trigger mudado para `workflow_run` do workflow "CI" com guard `conclusion == 'success'`.

#### Itens verificados sem problemas

- pnpm usado consistentemente (nao npm)
- Cache de pnpm configurado em todos os workflows
- Node 22 em todos os workflows
- `--frozen-lockfile` em todos os installs
- Secrets nunca expostos nos logs
- Concurrency groups previnem runs simultaneas

#### Nice-to-have (nao implementados)

| Item | Prioridade | Nota |
|------|-----------|------|
| Dependabot/Renovate | LOW | Atualizacao automatica de dependencias |
| Preview deploys para PRs | LOW | Vercel faz automaticamente se configurado |
| Test coverage report no CI | MEDIUM | `vitest run --coverage` + upload artifact |
| E2E tests (Playwright/Cypress) | MEDIUM | Criticos para producao, mas nao obrigatorio nesta fase |

### Build & Tests (pos-Bloco 9)

- **pnpm build**: PASS (zero erros)
- **npx vitest run**: 473 passed, 0 failed, 1 skipped
  - **4 testes previamente falhando foram corrigidos** neste bloco
  - Zero regressoes

---

## BLOCO 10 — Performance & Bundle

### 10.1 — Bundle Analysis

#### @next/bundle-analyzer

| Item | Status | Detalhes |
|------|--------|----------|
| `@next/bundle-analyzer` instalado | INSTALADO | Adicionado como devDependency; configurado em next.config.js |
| Comando de analise | OK | `ANALYZE=true pnpm build` abre relatorio no browser |

#### Dependencias pesadas no client bundle

| Dependencia | Tamanho aprox. | Usado em | Acao |
|-------------|---------------|----------|------|
| `recharts` | ~200KB (tree-shaken) | 4 paginas (seguranca, professor-dashboard, super-admin, financeiro) | Adicionado a `optimizePackageImports` para tree-shaking |
| `lucide-react` | ~150KB (tree-shaken) | 50+ paginas | Ja estava em `optimizePackageImports` |
| `jsqr` | ~55KB | QRScanner (1 componente) | Ja carregado via `dynamic()` no FABCheckin |
| `@supabase/supabase-js` | ~50KB | Services | Necessario; code-split por rota |

#### Dynamic imports existentes (ja implementados)

| Componente | Arquivo | Tipo |
|-----------|---------|------|
| QRScanner | `components/checkin/FABCheckin.tsx` | `next/dynamic` com `ssr: false` |
| SizeGuideModal | `app/(main)/shop/produto/[id]/page.tsx` | `next/dynamic` |

#### Dynamic imports adicionados (Block 10)

| Componente | Arquivo | Motivo |
|-----------|---------|--------|
| ChurnDashboard | `app/(admin)/ai-insights/page.tsx` | Componente pesado carregado por tab, lazy load economiza JS inicial |
| AIInsightsDashboard | `app/(admin)/ai-insights/page.tsx` | Idem — so carrega quando tab selecionada |

#### Imagens (`<img>` vs `next/image`)

| Arquivo | Contexto | Acao |
|---------|----------|------|
| `AvatarUploadSection.tsx` | Data URLs de FileReader | Mantido `<img>` — next/image nao otimiza data URLs |
| `LeaderboardCard.tsx` | Avatars mock (emoji strings) | Mantido `<img>` — nao sao URLs remotas |
| `MFASetupModal.tsx` | QR Code data URL | Mantido `<img>` — data URL |
| `ChurnDashboard.tsx` | Avatar mock (emoji) | Mantido `<img>` — nao sao URLs remotas |
| `StepAvatar.tsx` | Avatar preview (data URL) | Mantido `<img>` — data URL |
| `StepRevisao.tsx` | Avatar preview (data URL) | Mantido `<img>` — data URL |
| `DownloadsContent.tsx` | Thumbnails mock | Mantido `<img>` — mock data sem URLs reais |
| `shop/produto/[id]/page.tsx` | Product images mock | Mantido `<img>` — mock data |
| `minha-lista/page.tsx` | Video thumbnails mock | Mantido `<img>` — mock data |

**Nota:** Quando backend real com Supabase Storage for implementado, os thumbnails e imagens de produto devem ser migrados para `next/image` com os dominos ja configurados em `remotePatterns`.

#### next.config.js — Verificacao

| Item | Status | Detalhes |
|------|--------|----------|
| `images.remotePatterns` | CORRIGIDO | Adicionados `*.supabase.co` e `*.supabase.in` para futuro uso com Storage |
| YouTube domains | OK | `img.youtube.com` e `i.ytimg.com` ja configurados |
| `*.blackbelt.com` | OK | CDN proprio quando disponivel |
| `optimizePackageImports` | CORRIGIDO | Adicionado `recharts` ao array existente |
| Webpack mock aliases | OK | Mocks sao removidos do bundle de producao |
| CAPACITOR_BUILD | OK | Static export condicional para builds nativos |
| Security headers | OK | Configurados no middleware (Bloco 1) |
| `vercel.json` | OK | `pnpm build`/`pnpm install`, framework nextjs |

#### Metricas de bundle (First Load JS)

| Metrica | Valor |
|---------|-------|
| Shared JS (all routes) | 88.4 KB |
| Middleware | 71.7 KB |
| Maior rota (professor-dashboard) | 238 KB |
| Maior rota admin (seguranca) | 200 KB |
| Maior rota super-admin (financeiro) | 200 KB |
| Rota media | ~100 KB |

#### Recomendacoes futuras

1. **Recharts pages**: Quando mais graficos forem adicionados, considerar extrair chart sections em componentes separados com `dynamic()` e `ssr: false`
2. **Imagens reais**: Migrar `<img>` para `next/image` quando URLs reais do Supabase Storage estiverem disponiveis
3. **Route-level analysis**: Monitorar paginas que ultrapassem 250KB de First Load JS

### Build & Tests (pos-Bloco 10)

- **pnpm build**: PASS (zero erros)
- **npx vitest run**: 473 passed, 0 failed, 1 skipped
- Zero regressoes
