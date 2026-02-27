# AI Implementation Log — Fase 1: Churn Prediction

**Data**: 2026-02-27
**Fase**: 1 de 3
**Status**: Implementado

---

## Resumo

Implementação de predição de risco de evasão (churn) usando scoring ponderado baseado em regras.
Zero dependências externas de ML. Todas as funções são puras e determinísticas.

---

## Arquivos Criados

### Domain Layer — `lib/domain/intelligence/`

| Arquivo | Descrição |
|---------|-----------|
| `models/risk-factors.ts` | 7 fatores de risco com pesos (soma=100), thresholds e direções (asc/desc) |
| `models/churn-score.ts` | `ChurnFeatureVector`, `ChurnFactor`, `ChurnPrediction`, `Recommendation`, `DataQuality` |
| `engine/weights.ts` | Resolução de pesos por segmento (martial_arts, fitness, dance, pilates, music) + renormalização |
| `engine/churn-engine.ts` | `predictChurn()` — pure function: features → prediction com score, fatores, recomendações |
| `index.ts` | Barrel export do bounded context |

### ACL Layer — `lib/acl/mappers/`

| Arquivo | Descrição |
|---------|-----------|
| `intelligence-mapper.ts` | `extractChurnFeatures()` — extrai features do snapshot + queries Supabase (last checkin, points trend, payment) |

### Application Layer — `lib/application/intelligence/`

| Arquivo | Descrição |
|---------|-----------|
| `projectors/churn-projectors.ts` | 3 projectors puros: `projectAdminChurnOverview`, `projectInstructorChurnAlerts`, `projectRetentionEncouragement` |
| `projectors/index.ts` | Barrel re-export |
| `subscribers/churn-subscriber.ts` | Event bus subscriber com debounce de 5 min por participante |
| `index.ts` | Barrel export |

### API Routes — `app/api/ai/`

| Arquivo | Descrição |
|---------|-----------|
| `churn/route.ts` | `GET /api/ai/churn` — Dashboard overview (admin/owner/professor) |
| `churn/[memberId]/route.ts` | `GET /api/ai/churn/:memberId` — Predição individual |
| `health/route.ts` | `GET /api/ai/health` — Status do módulo IA (público) |
| `insights/route.ts` | `GET /api/ai/insights` — Módulos IA disponíveis |

### Hooks — `hooks/`

| Arquivo | Descrição |
|---------|-----------|
| `useChurnInsights.ts` | Hook para dashboard admin (`GET /api/ai/churn`) |
| `useStudentRisk.ts` | Hook para predição individual (`GET /api/ai/churn/:memberId`) |

### Components

| Arquivo | Descrição |
|---------|-----------|
| `components/admin/ChurnDashboard.tsx` | Dashboard completo: cards overview, lista por risco, recomendações |
| `components/professor/StudentRiskBadge.tsx` | `StudentRiskBadge` (dot + label) + `StudentRiskDetail` (expandível) |

### Pages

| Arquivo | Descrição |
|---------|-----------|
| `app/(admin)/ai-insights/page.tsx` | Página IA Insights: header, status badge, tabs, dashboard, future phase cards |

### Migration

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/00011_ai_churn_labels.sql` | Tabela `ai_churn_labels` + RLS (admin-only) + trigger auto-label em memberships |

### Tests

| Arquivo | Descrição |
|---------|-----------|
| `tests/ai/churn-engine.test.ts` | 5 fixtures (healthy, at-risk, critical, partial, cold start) + testes de boundaries, recomendações, edge cases |
| `tests/ai/churn-projectors.test.ts` | Testes dos 3 projectors: admin overview, instructor alerts, retention encouragement |
| `tests/ai/churn-weights.test.ts` | Testes de resolução de pesos por segmento, normalização, thresholds |

---

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `lib/application/events/event-wiring.ts` | Adicionado wiring do churn subscriber (dynamic import, optional) |
| `lib/hooks/index.tsx` | Adicionado re-export de tipos Intelligence (ViewModels + Domain types) |

---

## Decisões de Arquitetura

### 1. Pure Functions Everywhere
O `predictChurn()` é uma pure function sem side effects. Recebe `ChurnFeatureVector` e retorna `ChurnPrediction`. Testável sem banco, sem mocks.

### 2. Weighted Scoring com Multipliers
Cada fator tem peso (soma=100) e é multiplicado pelo nível de risco:
- `none`: 0x (não contribui)
- `low`: 0.25x
- `medium`: 0.5x
- `high`: 0.75x
- `critical`: 1.0x

Score final = soma das contribuições (weight × multiplier), clamped 0-100.

### 3. Segment-Aware Weights
Pesos são configuráveis por segmento com renormalização automática:
- **Fitness**: streak e attendance mais pesados (hábito)
- **Pilates**: attendance dominante, plateau irrelevante
- **Music**: engagement e plateau mais relevantes
- **Dance**: points e plateau ajustados

### 4. Cold Start Confidence
Membros novos recebem penalidade de confiança:
- < 7 dias: 20% confiança
- < 30 dias: 50% confiança
- < 90 dias: 80% confiança
- 90+ dias: confiança total

### 5. Debounce de 5 Minutos
O subscriber usa debounce por participante para evitar recálculos em cascata quando múltiplos eventos disparam em sequência.

### 6. Intelligence Module is Optional
O wiring em `event-wiring.ts` usa dynamic import com catch silencioso. Se o módulo falhar, o sistema continua funcionando normalmente.

### 7. Tabela `ai_churn_labels` para Futuro ML
Labels auto-gerados via trigger em `memberships`. Quando status muda para `inactive`/`suspended`, uma label é criada com snapshot da predição. Dados para treino de modelos futuros.

### 8. Retorno Positivo para Alunos
O `projectRetentionEncouragement` NUNCA usa palavras como "risco" ou "evasão". Apenas mensagens motivacionais baseadas no fator dominante.

---

## Fatores de Risco (7)

| Fator | Peso Default | Direção | Thresholds (L/M/H/C) |
|-------|-------------|---------|----------------------|
| ATTENDANCE_DROP | 25 | desc | 70/50/35/20 |
| STREAK_BROKEN | 20 | desc | 60/40/20/5 |
| DAYS_SINCE_LAST_CHECKIN | 20 | asc | 5/10/14/21 |
| LONG_PLATEAU | 15 | asc | 4/6/10/18 |
| PAYMENT_ISSUES | 10 | asc | 1/2/3/4 |
| LOW_ENGAGEMENT_SCORE | 5 | desc | 50/30/15/5 |
| DECLINING_POINTS | 5 | desc | -10/-25/-50/-75 |

---

## Classificação de Risco

| Nível | Score Range |
|-------|------------|
| safe | 0–24 |
| watch | 25–44 |
| at_risk | 45–69 |
| critical | 70–100 |

---

## Endpoints API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/ai/churn` | admin/owner/professor | Dashboard overview com todos os alunos |
| GET | `/api/ai/churn/:memberId` | admin/owner/professor | Predição individual |
| GET | `/api/ai/health` | público | Status do módulo IA |
| GET | `/api/ai/insights` | admin/owner/professor | Módulos disponíveis |

---

## Checklist de Entrega

- [x] `lib/domain/intelligence/` — Bounded context com modelos e engine
- [x] `engine/churn-engine.ts` — Motor de scoring puro
- [x] `models/risk-factors.ts` — 7 fatores + pesos + thresholds
- [x] `engine/weights.ts` — Pesos por segmento + normalização
- [x] `lib/acl/mappers/intelligence-mapper.ts` — Feature extractor
- [x] `lib/application/intelligence/projectors/` — 3 projectors puros
- [x] `lib/application/intelligence/subscribers/` — Event bus subscriber
- [x] `app/api/ai/churn/` — API endpoints
- [x] `hooks/useChurnInsights.ts` + `hooks/useStudentRisk.ts` — React hooks
- [x] `components/admin/ChurnDashboard.tsx` — Dashboard UI
- [x] `components/professor/StudentRiskBadge.tsx` — Badge + detalhe
- [x] `app/(admin)/ai-insights/page.tsx` — Página admin
- [x] `supabase/migrations/00011_ai_churn_labels.sql` — Migration com RLS + trigger
- [x] `tests/ai/` — Testes do engine, fatores e projectors
- [x] `AI-IMPLEMENTATION-LOG.md` — Este documento

---

## Próximas Fases

### Fase 2 — ML Readiness
- Substituir rule-based por modelo treinado com dados de `ai_churn_labels`
- Feature store com cache de features em Redis/Supabase
- Batch prediction em background job

### Fase 3 — Smart Promotion + Feedback IA
- Predição de tempo para próxima graduação
- Classificação automática de feedback pós-aula
- NLP para sentimento em observações de instrutores
