# 🧬 BLACKBELT DOMAIN ENGINE — Modelo de Entidades Completo (DDD)

**Data:** 19/02/2026  
**Status:** Implementado em `lib/domain/`  
**Total:** 9 arquivos | 2.209 linhas | 7 bounded contexts

---

## 1. A MUDANÇA FUNDAMENTAL

### Antes (modelo marcial disfarçado)

```
Aluno → Treina → Evolui por Faixas → Gradua → Compete
```

Hardcoded. Inflexível. BJJ-only.

### Agora (engine de desenvolvimento humano)

```
Participante → Participa → Desenvolve Competências → Progride em Trilhas → Recebe Reconhecimento
```

Universal. Configurável. Multi-segmento.

---

## 2. MAPA DE BOUNDED CONTEXTS

```
┌──────────────────────────────────────────────────────────────────┐
│                      BLACKBELT DOMAIN ENGINE                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    SHARED KERNEL                             │ │
│  │  EntityId<T>  VisualIdentity  LocalizedText  TenantScoped   │ │
│  └──────────────────────┬──────────────────────────────────────┘ │
│                         │                                        │
│  ┌──────────────┐  ┌────┴───────┐  ┌──────────────────────────┐ │
│  │   SEGMENT    │  │    UNIT    │  │     PARTICIPANT          │ │
│  │              │→→│            │←←│                          │ │
│  │ SegmentType  │  │ UnitId     │  │ ParticipantId            │ │
│  │ Vocabulary   │  │ Branding   │  │ Roles (learner,          │ │
│  │ Modules      │  │ Settings   │  │   instructor, guardian)  │ │
│  │ Audiences    │  │ Spaces     │  │ FamilyLinks              │ │
│  │ Presets      │  │ Gamification│  │ ExtendedFields           │ │
│  └──────┬───────┘  └────────────┘  └──────────┬───────────────┘ │
│         │                                      │                 │
│  ┌──────┴──────────────────────────────────────┴───────────────┐ │
│  │                   DEVELOPMENT                                │ │
│  │                                                              │ │
│  │  DevelopmentTrack ─── Milestone ─── Competency              │ │
│  │         │                  │              │                  │ │
│  │   ProgressionModel   SublevelConfig  ExpectedCompetency     │ │
│  │         │                  │                                 │ │
│  │   PromotionRule      ProgressState ← (por participante)     │ │
│  │         │                  │                                 │ │
│  │   PromotionCriterion  CompetencyScore                       │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────┴──────────────────────────────────┐ │
│  │                                                              │ │
│  │   SCHEDULING                      RECOGNITION               │ │
│  │                                                              │ │
│  │   Group ─── Session               AchievementDefinition     │ │
│  │      │         │                        │                   │ │
│  │   Schedule  SessionPlan            AchievementTrigger       │ │
│  │      │         │                        │                   │ │
│  │   Enrollment  Attendance           GamificationConfig       │ │
│  │               Record                    │                   │ │
│  │                                    PointRule ── Ranking      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. OS 5 MODELOS DE PROGRESSÃO

O insight central: todo segmento do mundo cabe em 5 modelos.

| Modelo | `ProgressionModel` | Métrica | Critério de avanço | Segmentos |
|--------|------|---------|---------------------|-----------|
| **Hierárquico** | `hierarchical` | Nível sequencial | Tempo + presença + avaliação | BJJ, Karate, Escoteiro |
| **Acumulativo** | `accumulative` | Horas praticadas | Acúmulo de horas | Pilates, Yoga, Fitness |
| **Competencial** | `competency` | Skills dominadas | Score mínimo por competência | Escolas técnicas |
| **Repertório** | `repertoire` | Itens aprendidos | Quantidade completada | Dança, Música |
| **Avaliativo** | `evaluation` | Provas aprovadas | Aprovação em exames | Cursos, Certificações |

O `DevelopmentTrack` suporta TODOS nativamente via `PromotionCriterion`:

```typescript
type PromotionCriterion =
  | { type: 'min_time_months'; value: number }         // hierarchical
  | { type: 'min_attendance_pct'; value: Percentage }   // hierarchical
  | { type: 'min_sessions'; value: number }             // hierarchical
  | { type: 'min_hours'; value: number }                // accumulative
  | { type: 'min_competency_score'; ... }               // competency
  | { type: 'completed_items'; value: number }          // repertoire
  | { type: 'passed_evaluation'; ... }                  // evaluation
  | { type: 'custom'; key: string; value: unknown };    // extensível
```

---

## 4. COMO CADA PROBLEMA DA AUDITORIA DESAPARECE

| Problema (auditoria) | Resolução (Domain Engine) |
|----|-----|
| `NIVEL_COLORS` duplicado em 9 arquivos | `Milestone.visual: VisualIdentity` — cor vem da trilha, um lugar |
| `BELT_ORDER` hardcoded | `DevelopmentTrack.milestones[]` — ordem é dado, não código |
| `BeltStripes` com faixa visual | `SublevelConfig.displayMode` — stripe, star, dot, bar |
| Limite 4 subníveis em código | `SublevelConfig.maxCount: number` — configurável |
| Módulos "Quedas/Passagens" hardcoded | `AudienceProfile.progressModules[]` — vem do preset |
| `CategoriaCompetidor` (galo/pluma) | `ProfileFieldConfig` com options — configurável |
| `Modalidade` (gi/nogi/mma) | `ProfileFieldConfig` com options — configurável |
| Kids/Teen/Adulto fixo | `AudienceProfile` — cada segmento define suas audiências |
| Navegação fixa por shell.config | `SegmentModuleConfig` — módulos ligam/desligam features |
| Técnicas de BJJ em plano de aula | `SessionActivity` genérico + `Competency` da trilha |
| Gamificação obrigatória | `GamificationConfig.enabled: boolean` — toggle por unidade |
| Termos marciais na UI | `SegmentVocabulary` — cada segmento fala sua língua |
| Emojis 🥋 hardcoded | `SegmentVocabulary.emoji` — vem do segmento |
| Conteúdo educacional marcial | Conteúdo vive na trilha, não no código |
| AuthContext routing fixo | Role + segment → route dinâmica |
| `RequisitoGraduacao` fixo | `PromotionRule` com `PromotionCriterion[]` genéricos |
| `ExameGraduacao` específico | `Evaluation` genérica com tipos (promotion, certification, periodic) |
| Pontos de gamificação fixos | `PointRule[]` configurável por unidade |

---

## 5. PRESETS — PROVA DE CONCEITO

5 presets implementados demonstram que o engine funciona:

### 🥋 Martial Arts
- Progressão: **hierarchical** (faixas)
- Audiências: Kids, Teen, Adulto
- Vocab: Aula, Faixa, Grau, Professor, Tatame, Campeonato
- Todos os módulos habilitados

### 💃 Dance
- Progressão: **repertoire** (peças dominadas)
- Audiências: Iniciante, Intermediário, Avançado, Kids
- Vocab: Ensaio, Nível, Estrela, Professor(a), Sala, Espetáculo
- Timer e gamificação opcionais

### 🧘 Pilates
- Progressão: **accumulative** (horas praticadas)
- Audiências: Regular, Gestante, Terceira Idade, Clínico
- Vocab: Sessão, Estágio, Módulo, Instrutor(a), Estúdio, Workshop
- Gamificação desabilitada por padrão

### 🏋️ Fitness
- Progressão: **accumulative** (horas/treinos)
- Audiências: Geral
- Vocab: Treino, Fase, Nível, Personal, Sala, Desafio
- Loja habilitada por padrão

### 🎵 Music
- Progressão: **evaluation** (provas de nível)
- Audiências: Musicalização Infantil, Regular
- Vocab: Aula, Módulo, Unidade, Professor(a), Sala, Recital
- Timer habilitado (metrônomo)

---

## 6. INVENTÁRIO DE ENTIDADES

### Shared Kernel (`lib/domain/shared/kernel.ts`)

| Tipo | Propósito |
|------|-----------|
| `EntityId<T>` | ID branded — impede mistura de IDs |
| `VisualIdentity` | Cor + gradiente + ícone (universal) |
| `LocalizedText` | Texto com traduções opcionais (i18n-ready) |
| `NormalizedScore` | Score 0..100 (validado) |
| `TenantScoped` | Interface: toda entidade tem `unitId` |
| `Auditable` | Interface: `createdAt`, `updatedAt`, `createdBy` |

### Segment (`lib/domain/segment/`)

| Entidade | Propósito |
|----------|-----------|
| `SegmentDefinition` | DNA do negócio — vocabulário, módulos, audiências |
| `SegmentVocabulary` | Mapa de termos genéricos → termos do segmento |
| `SegmentModuleConfig` | Toggle de módulos (enabled/disabled/optional) |
| `AudienceProfile` | Substitui Kids/Teen/Adulto — configurável |
| `ProfileFieldConfig` | Campos de perfil dinâmicos por segmento |
| `EventTypeConfig` | Tipos de evento por segmento |

### Development (`lib/domain/development/track.ts`)

| Entidade | Propósito |
|----------|-----------|
| `DevelopmentTrack` | **Entidade raiz** — trilha de desenvolvimento |
| `Milestone` | Marco de progressão (substitui "faixa") |
| `SublevelConfig` | Config de subníveis (substitui "4 stripes") |
| `Competency` | Habilidade avaliável (substitui "técnicas de BJJ") |
| `PromotionRule` | Regras de avanço (substitui `RequisitoGraduacao`) |
| `PromotionCriterion` | Critério individual (tempo, presença, score, etc.) |
| `ProgressState` | Estado do participante na trilha |
| `Evaluation` | Avaliação formal (substitui `ExameGraduacao`) |

### Participant (`lib/domain/participant/participant.ts`)

| Entidade | Propósito |
|----------|-----------|
| `Participant` | Pessoa no sistema — com papéis, não tipos fixos |
| `ParticipantRole` | Papel (learner, instructor, guardian, etc.) |
| `RoleMetadata` | Dados específicos por papel (turmas, especialidades) |
| `FamilyLink` | Vínculo familiar (responsável ↔ dependente) |
| `PublicProfile` | Perfil compartilhável (sem dados sensíveis) |

### Unit (`lib/domain/unit/unit.ts`)

| Entidade | Propósito |
|----------|-----------|
| `Unit` | Tenant — unidade de negócio com segment config |
| `UnitBranding` | Logo, cores, background da unidade |
| `Space` | Espaço físico (tatame/sala/estúdio — vocab do segmento) |
| `UnitSettings` | Check-in, documentos, permissões |

### Scheduling (`lib/domain/scheduling/scheduling.ts`)

| Entidade | Propósito |
|----------|-----------|
| `Group` | Turma/grupo recorrente — vinculável a trilha |
| `Session` | Ocorrência individual (aula, ensaio, treino) |
| `SessionPlan` | Plano pedagógico com fases e atividades |
| `AttendanceRecord` | Presença — método e status |

### Recognition (`lib/domain/recognition/recognition.ts`)

| Entidade | Propósito |
|----------|-----------|
| `AchievementDefinition` | Template de conquista (configurável) |
| `AchievementTrigger` | O que desbloqueia (extensível) |
| `GamificationConfig` | Toggle + regras de pontos (por unidade) |
| `PointRule` | Regra de pontuação |

---

## 7. DE → PARA: MIGRAÇÃO DE CONCEITOS

### Tipos e interfaces que serão substituídos

| contracts.ts (atual) | Domain Engine (novo) |
|---|---|
| `User` | `Participant` + `ParticipantRole` |
| `TipoPerfil` (enum fixo) | `RoleType` + `AudienceProfile` |
| `CategoriaRegistro` | `AudienceProfile.id` |
| `CategoriaAluno` | `AudienceProfile.id` |
| `CategoriaRanking` | `AudienceProfile.id` |
| `Modalidade` | `ProfileFieldConfig` (segmento martial) |
| `CategoriaCompetidor` | `ProfileFieldConfig` (segmento martial) |
| `GraduacaoHistorico` | `ProgressState.history[]` |
| `RequisitoGraduacao` | `PromotionRule` + `PromotionCriterion[]` |
| `ExameGraduacao` | `Evaluation` |
| `SubnivelAluno` | `ProgressState.currentSublevels` |
| `StatusGraduacao` | `ProgressState.promotionStatus` |
| `ModuloProgresso` | `CompetencyScore` |
| `ProgressoTecnico` | `ProgressState.competencyScores[]` |
| `ConquistaAluno` | `AchievementAwarded` |
| `Class` (turma) | `Group` |
| `CheckIn` | `AttendanceRecord` |
| `Academy` | `Unit` |
| `AcademyConfiguracao` | `UnitSettings` + `SegmentDefinition` |
| `PlanoSessão` | `SessionPlan` |
| `FaseSessão` | `SessionPhase` |
| `TecnicaPratica` | `SessionActivity` + `Competency` |
| `PontoRegra` | `PointRule` |
| `RankingEntry` | `RankingEntry` (reconhecimento) |
| `Evento` | mantém + `EventTypeConfig` por segmento |

---

## 8. ORDEM DE IMPLEMENTAÇÃO

### Etapa 0 — Feito ✅
Domain layer criado em `lib/domain/` com 2.209 linhas de tipos puros.

### Etapa 1 — Adapter Layer
Criar adaptadores que traduzem os contratos atuais (`contracts.ts`) para o domínio novo:

```
lib/adapters/
├── legacy-to-domain.ts      ← Converte User → Participant, etc.
├── domain-to-legacy.ts      ← Converte de volta (backward compat)
└── segment-resolver.ts      ← Resolve config efetiva da unidade
```

### Etapa 2 — Vocabulary Hook
Criar `useVocabulary()` — hook React que resolve termos:

```typescript
const { t } = useVocabulary();
// t('session')  → "Aula" (BJJ) | "Ensaio" (Dança) | "Sessão" (Pilates)
// t('milestone') → "Faixa" (BJJ) | "Nível" (Dança) | "Estágio" (Pilates)
```

### Etapa 3 — Module Registry
Criar `useModules()` — hook que resolve quais módulos estão ativos:

```typescript
const { isEnabled } = useModules();
if (isEnabled('gamification')) { /* mostra ranking */ }
if (isEnabled('events')) { /* mostra eventos */ }
```

### Etapa 4 — Progressive Migration
Migrar um contexto por vez:
1. Progressão (graduação → DevelopmentTrack)
2. Navegação (shell.config → dinâmico por segmento)
3. Perfil (campos fixos → ProfileFieldConfig)
4. Conteúdo (hardcoded → vinculado à trilha)
5. Gamificação (global → por unidade)

### Etapa 5 — Onboarding
Criar fluxo de onboarding: escolher segmento → receber preset → customizar.

---

## 9. O QUE O SISTEMA AGORA PODE SE TORNAR

```
Antes:   "Um sistema que organiza aulas de luta"
Agora:   "Um sistema operacional para negócios baseados em evolução humana"
```

O BlackBelt passou de vertical (BJJ) para **plataforma horizontal** (qualquer negócio que tenha pessoas evoluindo).

O Domain Engine é o DNA. Tudo o resto — UI, API, infra — são expressões dele.
