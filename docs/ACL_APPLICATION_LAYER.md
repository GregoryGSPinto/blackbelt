# 🛡️ ACL + APPLICATION LAYER — Implementação Completa

**Data:** 19/02/2026  
**Status:** Implementado | Primeiro caso real (`useParticipantProgress`) funcional  
**Total:** 3.236 linhas | 4 camadas | 15 arquivos novos

---

## 1. ARQUITETURA IMPLEMENTADA

```
┌──────────────────────────────────┐
│           REACT UI               │  app/, components/
│                                  │
│   import { useParticipantProgress,│
│            useVocabulary,         │
│            useModules }           │
│     from '@/lib/hooks'           │
└──────────────┬───────────────────┘
               │ ViewModels only
               ▼
┌──────────────────────────────────┐
│          lib/hooks/              │  React hooks
│                                  │
│   useParticipantProgress()       │  → ProgressViewModel
│   useVocabulary()                │  → t('session') = "Aula"
│   useModules()                   │  → isEnabled('gamification')
│   useEvaluations()               │  → EvaluationVM[]
│   SegmentProvider                │  → Context provider
└──────────────┬───────────────────┘
               │ lazy import
               ▼
┌──────────────────────────────────┐
│      lib/application/            │  Use cases (orchestrators)
│                                  │
│   getParticipantProgress()       │  Calls legacy → ACL → VM
│   getEvaluations()               │  Calls legacy → ACL → VM
│                                  │
│   ViewModels definidos aqui:     │
│   ProgressViewModel              │
│   PromotionRequirementVM         │
│   TimelineEntryVM                │
│   MilestoneVM                    │
│   EvaluationVM                   │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│          lib/acl/                │  Anti-Corruption Layer
│                                  │
│   mappers/                       │
│     progression.mapper.ts        │  Legacy ↔ Domain
│   segment-resolver.ts            │  Preset + overrides
│                                  │
│   ÚNICO com acesso duplo:        │
│   ✅ import lib/domain           │
│   ✅ import lib/api              │
└────────┬──────────┬──────────────┘
         │          │
         ▼          ▼
┌────────────┐  ┌────────────────┐
│ lib/domain │  │    lib/api     │
│   (pure)   │  │   (legacy)     │
│            │  │                │
│ 0 external │  │ contracts.ts   │
│ imports    │  │ services       │
│            │  │ mocks          │
└────────────┘  └────────────────┘
```

---

## 2. REGRAS DE IMPORTAÇÃO

| Camada | Pode importar | NÃO pode importar |
|--------|--------------|-------------------|
| **app/, components/** | `lib/hooks` | `lib/domain`, `lib/acl`, `lib/application` |
| **lib/hooks** | `lib/application` (via lazy import) | `lib/domain`, `lib/api` |
| **lib/application** | `lib/acl`, `lib/api`, types de `lib/domain` | — |
| **lib/acl** | `lib/domain`, `lib/api` | `lib/hooks`, `lib/application` |
| **lib/domain** | Apenas `lib/domain/shared/*` | Tudo externo |
| **lib/api** | — | `lib/domain` |

**Exceção controlada:** `lib/application` e `lib/hooks` importam **types** (não valores) de `lib/domain`. Isto é seguro porque TypeScript apaga types em compile-time — zero acoplamento em runtime.

ESLint rules completas em `lib/ARCHITECTURE_RULES.ts`.

---

## 3. O PRIMEIRO CORTE: `useParticipantProgress()`

### Fluxo completo (rastreável)

```
1. GraduacaoPage renderiza
2. Chama useParticipantProgress()                          [lib/hooks]
3. Hook faz lazy import de getParticipantProgress()        [lib/application]
4. Use case chama 3 serviços legados em paralelo:          [lib/api]
   • gradService.getMinhaGraduacao()  → GraduacaoHistorico[]
   • gradService.getRequisitos()      → RequisitoGraduacao[]
   • gradService.getMeusSubniveis()   → { subniveisAtuais, ... }
5. ACL mapper traduz:                                      [lib/acl]
   • GraduacaoHistorico[] → ProgressState
   • RequisitoGraduacao[] → PromotionRule[]
6. Application builder monta ProgressViewModel:            [lib/application]
   • current: { milestoneName, visual, sublevels, timeDisplay }
   • next: { milestoneName, requirements[], overallProgress }
   • timeline: TimelineEntryVM[]
   • allMilestones: MilestoneVM[]
7. Hook retorna { data, loading, error, refetch }          [lib/hooks]
8. UI renderiza sem saber nada sobre domínio               [app/]
```

### O que a UI recebe (ProgressViewModel)

```typescript
{
  current: {
    milestoneName: "Nível Básico",
    milestoneVisual: { color: "#3B82F6" },
    sublevels: 2,
    maxSublevels: 4,
    monthsInMilestone: 8,
    timeDisplay: "8 meses",
  },
  next: {
    milestoneName: "Nível Intermediário",
    milestoneVisual: { color: "#8B5CF6" },
    requirements: [
      { label: "Tempo", current: 8, required: 24, unit: "meses", met: false, progress: 33 },
      { label: "Presença", current: 82, required: 75, unit: "%", met: true, progress: 100 },
      { label: "Sessões", current: 168, required: 200, unit: "sessões", met: false, progress: 84 },
    ],
    overallProgress: 72,
  },
  timeline: [
    { milestoneName: "Nível Iniciante", date: "2022-03-15", dateFormatted: "15 de março de 2022", ... },
    { milestoneName: "Nível Básico", date: "2024-06-20", dateFormatted: "20 de junho de 2024", isCurrent: true },
  ],
  allMilestones: [ ... 9 milestones com isAchieved/isCurrent ... ],
}
```

### O que a UI NÃO sabe

- Que existe `DevelopmentTrack`, `Milestone`, `PromotionRule`
- Que os dados vêm de `GraduacaoHistorico[]`
- Que existe um `BELT_ORDER` ou `NIVEL_COLORS`
- Que a lógica de "tempo no nível" é calculada no mapper
- Que o sistema poderia ser Dança ou Pilates com a mesma estrutura

---

## 4. ELIMINAÇÃO DAS 9 DUPLICATAS DE NIVEL_COLORS

O ACL mapper centraliza em uma única fonte: `DEFAULT_MILESTONES` no `progression.mapper.ts`.

### Antes (9 arquivos com mapas duplicados)

```
app/(admin)/analytics/page.tsx       → NIVEL_COLORS = { 'Nível Iniciante': '#E5E7EB', ... }
app/(admin)/dashboard/page.tsx       → NIVEL_COLORS = { ... }
app/(admin)/graduacoes/page.tsx      → NIVEL_COLORS = { ... }
app/(main)/graduacao/page.tsx        → NIVEL_COLORS = { ... }
app/(professor)/professor-aluno...   → NIVEL_COLORS = { ... }
app/(professor)/professor-alunos...  → NIVEL_COLORS = { ... }
app/atleta/[id]/page.tsx             → NIVEL_COLORS = { ... }
components/aluno/EvolutionTimeline   → NIVEL_COLORS = { ... }
components/checkin/QRGenerator       → NIVEL_COLORS = { ... }
```

### Agora (1 lugar)

```
lib/acl/mappers/progression.mapper.ts → DEFAULT_MILESTONES[] (single source of truth)
   ↓ exposed via
resolveMilestoneVisual(name) → VisualIdentity
```

Durante a migração progressiva, componentes podem trocar:

```typescript
// ANTES
const NIVEL_COLORS = { 'Nível Iniciante': '#E5E7EB', ... };
const color = NIVEL_COLORS[aluno.nivel];

// DEPOIS
import { resolveMilestoneVisual } from '@/lib/acl';
const { color } = resolveMilestoneVisual(aluno.nivel);
```

---

## 5. SEGMENT-AWARE HOOKS

### useVocabulary()

```tsx
const { t } = useVocabulary();

<h1>Minha {t('milestone')}</h1>
// BJJ     → "Minha Faixa"
// Dança   → "Meu Nível"
// Pilates → "Meu Estágio"

<p>{t('instructor')}: João</p>
// BJJ     → "Professor: João"
// Dança   → "Professor(a): João"
// Pilates → "Instrutor(a): João"
// Fitness → "Personal: João"
```

### useModules()

```tsx
const { isEnabled } = useModules();

{isEnabled('gamification') && <RankingWidget />}
{isEnabled('events') && <EventsSection />}
{isEnabled('activityTimer') && <TimerButton />}
{isEnabled('digitalCard') && <CarteirinhaLink />}
```

### SegmentProvider (layout)

```tsx
// app/layout.tsx
<SegmentProvider segmentType={unit.segmentType}>
  {children}
</SegmentProvider>
```

---

## 6. INVENTÁRIO DE ARQUIVOS

### Novos (criados agora)

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `lib/acl/index.ts` | 34 | Barrel export ACL |
| `lib/acl/mappers/progression.mapper.ts` | 230 | Legacy ↔ Domain translation |
| `lib/acl/segment-resolver.ts` | 138 | Resolve config + vocabulary |
| `lib/application/index.ts` | 26 | Barrel export use cases |
| `lib/application/progression/get-participant-progress.ts` | 359 | Core use case + ViewModels |
| `lib/hooks/index.ts` | 240 | React hooks (UI interface) |
| `lib/ARCHITECTURE_RULES.ts` | 80 | Import boundary rules (ESLint) |

### Anteriores (domain engine)

| Arquivo | Linhas |
|---------|--------|
| `lib/domain/shared/kernel.ts` | 119 |
| `lib/domain/segment/segment.ts` | 259 |
| `lib/domain/segment/presets.ts` | 597 |
| `lib/domain/development/track.ts` | 370 |
| `lib/domain/participant/participant.ts` | 211 |
| `lib/domain/unit/unit.ts` | 186 |
| `lib/domain/scheduling/scheduling.ts` | 242 |
| `lib/domain/recognition/recognition.ts` | 140 |
| `lib/domain/index.ts` | 85 |

**Total acumulado: 3.316 linhas | 16 arquivos | 4 camadas**

---

## 7. POLÍTICA DE MIGRAÇÃO: DOMAIN-FIRST PARCIAL

### Fase A — Read Model (agora)
- `useParticipantProgress()` lê do legado, apresenta via domínio
- Componentes migram de `NIVEL_COLORS` local para `resolveMilestoneVisual()`
- Zero risco: apenas leitura, legado intacto

### Fase B — Progress Write (próximo)
- Promoção de nível grava via domínio (ACL traduz de volta para legado)
- Subníveis gravados pelo domínio
- ACL `mapToLegacy*()` garante backward compat

### Fase C — Scheduling Write
- Sessões e presença passam pelo domínio
- `SessionPlan` substitui `PlanoSessão` com fases configuráveis

### Fase D — Recognition Write
- Gamificação condicional (por segmento/unidade)
- Conquistas configuráveis via `AchievementDefinition`

---

## 8. COMO A UI MUDA (exemplo concreto)

### graduacao/page.tsx — Antes (179 linhas, acoplada)

```tsx
import * as gradService from '@/lib/api/graduacao.service';
const NIVEL_COLORS = { ... };  // duplicado pela 9ª vez
const BELT_ORDER = [ ... ];    // hardcoded

// 3 useStates + Promise.all + cálculos manuais
const nivelAtual = historico[historico.length - 1].nivel;
const currentIdx = BELT_ORDER.indexOf(nivelAtual);
```

### graduacao/page.tsx — Depois (~80 linhas, desacoplada)

```tsx
import { useParticipantProgress, useVocabulary } from '@/lib/hooks';

export default function ProgressionPage() {
  const { data, loading, error } = useParticipantProgress();
  const { t } = useVocabulary();

  if (loading) return <Loading />;
  if (error || !data) return <Error message={error} />;

  return (
    <div>
      <h1>Minha {t('milestone')}</h1>

      {/* Current — usa ViewModel pronto */}
      <CurrentMilestoneCard
        name={data.current.milestoneName}
        visual={data.current.milestoneVisual}
        sublevels={data.current.sublevels}
        maxSublevels={data.current.maxSublevels}
        timeDisplay={data.current.timeDisplay}
      />

      {/* Next — requirements já calculados */}
      {data.next && (
        <NextMilestoneCard
          name={data.next.milestoneName}
          requirements={data.next.requirements}
          overallProgress={data.next.overallProgress}
        />
      )}

      {/* Timeline — data formatada, visual resolvido */}
      <Timeline entries={data.timeline} />
    </div>
  );
}
```

A página não sabe:
- Que milestones eram "faixas"
- Que as cores vêm de um mapper
- Que os requisitos eram `RequisitoGraduacao`
- Que o sistema poderia ser de dança ou pilates
