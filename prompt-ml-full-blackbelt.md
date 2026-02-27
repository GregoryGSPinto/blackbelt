# BLACKBELT — Motor de Inteligência Completo (Intelligence Layer)

Cole este prompt no Claude Code na raiz do projeto Blackbelt (`/Users/user_pc/Projetos/blackbelt`):

---

## Contexto

O Blackbelt é uma plataforma SaaS de gestão de academias. Já possui:
- **Domain Engine (DDD)** com 7 bounded contexts, 12 domain events, 8 projectors
- **Event Bus** + dual event store (Supabase + PostgreSQL)
- **ACL** como ponte entre legacy e domínio
- **26+ features por participante**, 14 séries temporais
- **6 perfis de usuário:** Admin, Professor, Adulto, Teen, Kids, Parent
- **Churn Prediction** já implementado (ou em implementação) como Fase 1

**Antes de começar:** Leia estes arquivos para entender os padrões existentes:
- `lib/domain/development/track.ts` (entidades do domínio)
- `lib/domain/events/domain-events.ts` (12 eventos)
- `lib/application/progression/state/build-snapshot.ts` (snapshot builder)
- `lib/application/progression/projectors/` (8 projectors — entenda o padrão)
- `lib/acl/mappers/` (ACL pattern)
- `lib/hooks/index.tsx` (hooks existentes)
- `lib/application/events/event-wiring.ts` (subscriber pattern)
- `lib/monitoring/anomaly-detector.ts` (regras existentes)
- `lib/__mocks__/daily-feedback.service.ts` (FeedbackAIClassification type)
- `supabase/migrations/` (padrão de migrations)
- `components/professor/` (componentes existentes)
- `components/kids/` (componentes kids)
- `components/admin/` (componentes admin)

---

## Arquitetura do Intelligence Layer

```
lib/domain/intelligence/
├── core/
│   ├── types.ts                    # Tipos base compartilhados
│   ├── scoring-utils.ts            # Funções utilitárias de scoring
│   └── confidence-calculator.ts    # Calcula confiança baseado em volume de dados
│
├── engines/                        # Motores puros (zero side effects)
│   ├── churn-engine.ts             # [JÁ EXISTE ou implementar] Predição de evasão
│   ├── adaptive-difficulty.ts      # Motor de dificuldade adaptativa
│   ├── student-dna.ts              # Perfil comportamental do aluno
│   ├── class-optimizer.ts          # Otimizador de aulas/turmas
│   ├── instructor-coach.ts         # Coach inteligente para professor
│   ├── engagement-scorer.ts        # Score de engajamento unificado
│   ├── promotion-predictor.ts      # Previsão de promoção
│   └── social-graph.ts             # Grafo social (retenção por vínculos)
│
├── models/
│   ├── student-dna.types.ts        # DNA do aluno
│   ├── adaptive-test.types.ts      # Tipos de prova adaptativa
│   ├── class-insight.types.ts      # Insights de aula
│   ├── coach-tip.types.ts          # Tips para professor
│   └── engagement.types.ts         # Engagement model
│
└── weights/
    ├── default-weights.ts          # Pesos padrão
    └── segment-overrides.ts        # Overrides por segmento (BJJ, Dança, etc.)

lib/acl/mappers/
├── intelligence-mapper.ts          # [JÁ EXISTE ou criar] Feature extractor geral
├── adaptive-test-mapper.ts         # Extrai dados para provas adaptativas
├── class-optimizer-mapper.ts       # Extrai dados para otimização de aulas
└── social-graph-mapper.ts          # Extrai vínculos sociais

lib/application/intelligence/
├── projectors/
│   ├── project-student-insights.ts     # VM para aluno adulto
│   ├── project-teen-insights.ts        # VM para teen
│   ├── project-kids-insights.ts        # VM para kids
│   ├── project-parent-insights.ts      # VM para responsável
│   ├── project-instructor-coach.ts     # VM para professor
│   ├── project-admin-analytics.ts      # VM para admin
│   └── project-super-admin-health.ts   # VM para super admin
│
├── subscribers/
│   ├── intelligence-wiring.ts      # Conecta todos os subscribers ao Event Bus
│   ├── on-attendance.ts            # Recalcula ao registrar presença
│   ├── on-promotion.ts             # Recalcula ao promover
│   └── on-evaluation.ts            # Recalcula ao completar avaliação
│
└── commands/
    ├── generate-adaptive-test.ts   # Gera prova adaptativa
    ├── refresh-student-dna.ts      # Recalcula DNA do aluno
    └── generate-class-plan.ts      # Sugere plano de aula inteligente

lib/hooks/
├── useStudentDNA.ts
├── useAdaptiveTest.ts
├── useClassInsights.ts
├── useInstructorCoach.ts
├── useParentInsights.ts
├── useEngagementScore.ts
└── useAIInsights.ts                # Hook unificado

app/api/ai/
├── student-dna/[memberId]/route.ts
├── adaptive-test/route.ts
├── class-insights/route.ts
├── instructor-coach/route.ts
├── parent-insights/[childId]/route.ts
├── engagement/[memberId]/route.ts
├── admin-analytics/route.ts
└── health/route.ts
```

---

## ENGINE 1 — Student DNA (Perfil Comportamental Inteligente)

### Conceito
Todo aluno tem um "DNA" que o sistema aprende ao longo do tempo. Não é um score único — é um perfil multidimensional que alimenta TODOS os outros engines.

### Arquivo: `lib/domain/intelligence/engines/student-dna.ts`

```typescript
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STUDENT DNA — Perfil Comportamental Inteligente               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Aprende o "DNA" do aluno a partir do histórico de eventos.    ║
 * ║  Pure function. Alimenta todos os outros engines.              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

interface StudentDNA {
  participantId: string;
  
  // ── Dimensões comportamentais (0-100 cada) ──────────────
  dimensions: {
    consistency: number;      // Regularidade de presença (padrão semanal)
    intensity: number;        // Frequência × duração real
    progression: number;      // Velocidade de avanço vs média da faixa
    resilience: number;       // Capacidade de manter streak após quebra
    socialConnection: number; // Quanto treina com os mesmos colegas
    competitiveness: number;  // Engajamento com ranking/pontos/conquistas
    curiosity: number;        // Diversidade de turmas/horários que frequenta
    responsiveness: number;   // Rapidez de resposta a feedback do professor
  };

  // ── Padrões descobertos ─────────────────────────────────
  patterns: {
    preferredDays: number[];          // Dias da semana mais frequentes (0=dom)
    preferredTimeSlot: 'morning' | 'afternoon' | 'evening';
    averageSessionsPerWeek: number;
    peakPerformanceDay: number;       // Dia que mais se destaca
    dropoffPattern: DropoffPattern;   // Como abandona (gradual, abrupto, sazonal)
    learningStyle: LearningStyle;     // Visual, prático, teórico, social
    motivationDrivers: MotivationDriver[]; // O que mais motiva (ranking, badges, promoção, social)
  };

  // ── Perfil de Dificuldade (alimenta provas adaptativas) ──
  difficultyProfile: {
    strongCompetencies: string[];     // IDs das competências fortes
    weakCompetencies: string[];       // IDs das competências fracas
    learningSpeed: 'slow' | 'average' | 'fast'; // Baseado em tempo entre sublevels
    retentionRate: number;            // % de skills que mantém após 30 dias sem praticar
    optimalChallengeLevel: number;    // 0-100, nível ideal de dificuldade (Zona de Desenvolvimento Proximal)
  };

  // ── Predições ───────────────────────────────────────────
  predictions: {
    nextPromotionEstimate: string | null;  // ISO date estimado
    churnRisk: number;                      // 0-100 (do churn engine)
    nextMilestoneWeeks: number | null;      // Semanas estimadas
    plateauRisk: number;                    // 0-100, risco de estagnação
  };

  // ── Metadados ───────────────────────────────────────────
  dataPoints: number;           // Quantos eventos alimentaram este DNA
  confidence: number;           // 0-1 (cresce com dados)
  computedAt: string;
  firstEventAt: string;         // Desde quando tem dados
}

type DropoffPattern = 
  | 'gradual'      // Vai diminuindo aos poucos
  | 'abrupt'       // Some de repente
  | 'seasonal'     // Sazonal (férias, feriados)
  | 'event_driven' // Após evento específico (lesão, mudança de horário)
  | 'unknown';     // Poucos dados

type LearningStyle =
  | 'consistent_grinder'   // Treina pouco mas todo dia
  | 'intensity_burst'      // Treina muito em poucos dias
  | 'social_learner'       // Vai quando amigos vão
  | 'goal_oriented'        // Intensifica perto de promoção/evento
  | 'explorer'             // Experimenta turmas diferentes
  | 'routine_follower';    // Mesmos dias, mesma turma, mesmo horário

type MotivationDriver =
  | 'ranking'        // Sobe no leaderboard
  | 'badges'         // Conquistas/medalhas
  | 'promotion'      // Próxima faixa
  | 'social'         // Amigos na academia
  | 'streak'         // Manter sequência
  | 'competition'    // Competições/eventos
  | 'mastery'        // Dominar técnicas
  | 'health';        // Saúde/fitness
```

### Lógica de cálculo (dentro do `computeStudentDNA` pure function):

**consistency** = Calcular desvio padrão dos intervalos entre check-ins. Quanto menor o desvio, maior a consistência. Normalizar 0-100.

**intensity** = (sessões_por_semana × horas_médias_por_sessão) normalizado contra a média da academia.

**progression** = (tempo_real_entre_milestones / tempo_médio_da_academia_para_mesmo_milestone). Se o aluno é mais rápido que a média → score alto.

**resilience** = Analisar todas as quebras de streak: quantas vezes voltou dentro de 7 dias vs quantas vezes ficou >14 dias fora. Proporção normalizada.

**socialConnection** = Cruzar check-ins do aluno com check-ins de outros alunos na mesma sessão. Se treina consistentemente com as mesmas pessoas → score alto.

**competitiveness** = (pontos_ganhos + conquistas_desbloqueadas + posição_ranking_change) normalizados. Se sobe ativamente no ranking → score alto.

**curiosity** = COUNT(DISTINCT turmas frequentadas) / total_turmas_disponíveis. Normalizar.

**responsiveness** = Se professor deu feedback/avaliação e aluno melhorou score na competência em até 30 dias → score alto.

**preferredDays** = GROUP BY day_of_week dos check-ins, top 3.

**dropoffPattern** = Analisar os últimos 3 gaps > 7 dias: se decrescimento gradual de frequência antes → 'gradual'. Se frequência normal e sumiu → 'abrupt'. Se gaps coincidem com férias escolares/feriados → 'seasonal'.

**learningStyle** = Combinar patterns: se desvio_padrao_intervalo < 1 dia → 'consistent_grinder'. Se treina >4x por semana mas pula semanas → 'intensity_burst'. Se frequência correlaciona com colegas específicos → 'social_learner'. Se intensifica 30 dias antes de avaliação → 'goal_oriented'.

**motivationDrivers** = Ordenar por correlação: se ranking_check correlaciona com presença → 'ranking'. Se frequência aumenta após conquista → 'badges'. Se frequência aumenta após sublevel → 'promotion'.

**strongCompetencies / weakCompetencies** = Top 3 / Bottom 3 do competencyScores[] ordenado.

**learningSpeed** = Mediana de dias entre sublevels do aluno vs mediana da academia.

**optimalChallengeLevel** = Baseado na Zona de Desenvolvimento Proximal de Vygotsky:
- Se aluno acerta >90% das avaliações → dificuldade muito baixa, aumentar
- Se aluno acerta 60-80% → zona ideal
- Se aluno acerta <50% → dificuldade muito alta, reduzir
- Se não há avaliações suficientes → usar progressionSpeed como proxy

---

## ENGINE 2 — Adaptive Difficulty (Provas Inteligentes)

### Conceito
Cada avaliação é gerada dinamicamente baseada no DNA do aluno. Aluno forte em guarda mas fraco em raspagem? A prova foca mais em raspagem. Aluno que aprende rápido? Prova mais difícil. Isso é [Item Response Theory](https://en.wikipedia.org/wiki/Item_response_theory) simplificado.

### Arquivo: `lib/domain/intelligence/engines/adaptive-difficulty.ts`

```typescript
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ADAPTIVE DIFFICULTY — Avaliações Personalizadas               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Gera avaliações adaptadas ao perfil do aluno.                 ║
 * ║  Baseado em Item Response Theory (IRT) simplificado.           ║
 * ║  Pure function. Input: DNA + banco de questões.                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

interface AdaptiveTestConfig {
  participantId: string;
  trackId: string;
  targetMilestoneId: string;      // Para qual milestone é a avaliação
  testType: 'promotion' | 'periodic' | 'diagnostic';
  maxQuestions: number;            // Limite de questões (default: 15)
}

interface AdaptiveTest {
  id: string;
  participantId: string;
  config: AdaptiveTestConfig;
  
  sections: TestSection[];
  
  // ── Distribuição de dificuldade ─────────────────────────
  difficultyDistribution: {
    easy: number;      // % de questões fáceis (calibrado pelo DNA)
    medium: number;    // % médias
    hard: number;      // % difíceis
    stretch: number;   // % "stretch" (acima do nível — testar potencial)
  };
  
  // ── Foco adaptativo ─────────────────────────────────────
  competencyFocus: {
    competencyId: string;
    weight: number;       // Quanto % da prova foca nesta competência
    reason: 'weak_area' | 'maintenance' | 'strength_validation' | 'new_skill';
  }[];

  estimatedDuration: number;  // minutos
  passingScore: number;       // Score mínimo para aprovação (adaptado)
  generatedAt: string;
}

interface TestSection {
  competencyId: string;
  competencyName: string;
  questions: TestQuestion[];
  weight: number;              // Peso desta seção no score final
}

interface TestQuestion {
  id: string;
  competencyId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;   // 1=básico, 5=avançado
  type: QuestionType;
  content: QuestionContent;
  points: number;
  timeLimit?: number;               // segundos (opcional)
  adaptiveMetadata: {
    selectedBecause: string;        // Ex: "Competência fraca: raspagem (score 35)"
    expectedCorrectRate: number;    // % esperado de acerto baseado no DNA
  };
}

type QuestionType = 
  | 'practical_demonstration'  // Demonstrar técnica (professor avalia)
  | 'situational'              // "O que faria se..." (professor avalia)
  | 'sequence'                 // Ordenar passos de uma técnica
  | 'identification'           // Identificar posição/técnica
  | 'application'              // Aplicar em sparring controlado
  | 'self_assessment';         // Auto-avaliação (calibra confiança)

interface QuestionContent {
  title: string;
  description: string;
  criteria: string[];          // O que o professor deve avaliar
  referenceVideo?: string;     // URL de vídeo de referência
  tips?: string[];             // Dicas para o professor avaliar
}
```

### Lógica do `generateAdaptiveTest`:

1. **Ler DNA do aluno** → `difficultyProfile`
2. **Calcular distribuição de dificuldade:**
   - Se `learningSpeed = 'fast'` → mais questões hard/stretch
   - Se `learningSpeed = 'slow'` → mais questões easy/medium
   - Se `optimalChallengeLevel` alto → distribuição mais agressiva
   - Sempre incluir pelo menos 1 questão stretch (testar potencial)
   - Sempre incluir pelo menos 2 questões de competências fortes (manter confiança)

3. **Calcular foco por competência:**
   ```
   Para cada competência da trilha:
     Se está em weakCompetencies → weight = 35% (foco de melhoria)
     Se está em strongCompetencies → weight = 15% (validação)
     Demais → weight distribuído igualmente nos 50% restantes
   ```

4. **Selecionar questões do banco:**
   - Banco de questões vem da configuração da trilha (admin configura)
   - Filtrar por competência + dificuldade
   - Priorizar questões que o aluno NUNCA fez antes
   - Se já fez e errou → incluir variação da mesma questão (testar retenção)

5. **Calcular `passingScore` adaptado:**
   ```
   Se testType = 'promotion': 
     baseScore = 70%
     Se learningSpeed = 'fast': passingScore = 75%
     Se learningSpeed = 'slow': passingScore = 65% (dar margem)
   Se testType = 'diagnostic':
     passingScore = N/A (não reprova, só mapeia)
   Se testType = 'periodic':
     passingScore = 60%
   ```

6. **Gerar `adaptiveMetadata` por questão** — explicar ao professor POR QUE aquela questão foi escolhida.

### Migration — Banco de Questões

```sql
-- Nova migration: xxx_ai_question_bank.sql

CREATE TABLE ai_question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id),
  track_id TEXT NOT NULL,
  competency_id TEXT NOT NULL,
  
  -- Conteúdo
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'practical_demonstration', 'situational', 'sequence', 
    'identification', 'application', 'self_assessment'
  )),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  criteria JSONB NOT NULL DEFAULT '[]',     -- string[]
  reference_video TEXT,
  tips JSONB DEFAULT '[]',
  
  -- Metadados adaptativos (auto-calculados)
  times_used INTEGER DEFAULT 0,
  times_passed INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  discrimination_index NUMERIC(5,4) DEFAULT 0.5, -- IRT: quão bem diferencia bons de fracos
  
  -- Status
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de respostas (alimenta o IRT)
CREATE TABLE ai_test_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id),
  test_id UUID NOT NULL,
  membership_id UUID REFERENCES memberships(id),
  question_id UUID REFERENCES ai_question_bank(id),
  
  score NUMERIC(5,2) NOT NULL,         -- 0-100
  evaluator_id UUID REFERENCES profiles(id),
  feedback TEXT,
  time_spent_seconds INTEGER,
  
  -- DNA snapshot no momento da resposta
  student_difficulty_level NUMERIC(5,2), -- optimalChallengeLevel do aluno
  question_difficulty INTEGER,            -- 1-5
  expected_correct_rate NUMERIC(5,4),     -- O que o modelo previa
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update discrimination_index após cada resposta
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_question_bank SET
    times_used = times_used + 1,
    times_passed = times_passed + CASE WHEN NEW.score >= 70 THEN 1 ELSE 0 END,
    average_score = (
      SELECT AVG(score) FROM ai_test_responses WHERE question_id = NEW.question_id
    ),
    discrimination_index = (
      SELECT COALESCE(
        CORR(r.score, dna.overall_score), 0.5
      )
      FROM ai_test_responses r
      JOIN (
        -- Correlação entre score na questão e score geral do aluno
        SELECT membership_id, 
          COALESCE(
            (SELECT (payload->>'overallScore')::numeric 
             FROM domain_events 
             WHERE aggregate_id = r2.membership_id::text
             ORDER BY occurred_at DESC LIMIT 1
            ), 50
          ) as overall_score
        FROM ai_test_responses r2
        WHERE r2.question_id = NEW.question_id
      ) dna ON dna.membership_id = r.membership_id
      WHERE r.question_id = NEW.question_id
    ),
    updated_at = NOW()
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_question_stats
AFTER INSERT ON ai_test_responses
FOR EACH ROW EXECUTE FUNCTION update_question_stats();

-- RLS
ALTER TABLE ai_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_test_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "academy_members" ON ai_question_bank
  FOR ALL USING (academy_id IN (
    SELECT academy_id FROM memberships WHERE profile_id = auth.uid()
  ));

CREATE POLICY "academy_members" ON ai_test_responses
  FOR ALL USING (academy_id IN (
    SELECT academy_id FROM memberships WHERE profile_id = auth.uid()
  ));
```

---

## ENGINE 3 — Engagement Scorer (Score Unificado de Engajamento)

### Conceito
Um score único 0-100 que representa o quão engajado o aluno está. Diferente do churn (que prediz saída), o engagement mede QUALIDADE do envolvimento. Alimenta decisões em todo o sistema.

### Arquivo: `lib/domain/intelligence/engines/engagement-scorer.ts`

```typescript
interface EngagementScore {
  participantId: string;
  
  // Score composto
  overall: number;           // 0-100
  trend: 'rising' | 'stable' | 'declining';  // Tendência últimas 4 semanas
  trendDelta: number;        // +/- pontos vs mês anterior
  
  // Subdimensões
  dimensions: {
    physical: number;        // Presença real (check-ins, horas)
    pedagogical: number;     // Evolução técnica (scores, sublevels, promoções)
    social: number;          // Interação (ranking, conquistas, treinos em grupo)
    financial: number;       // Pagamentos em dia, plano ativo
    digital: number;         // Uso do app (check-in digital, visualização de conteúdo)
  };
  
  // Classificação
  tier: EngagementTier;
  tierSince: string;         // Desde quando está neste tier
  
  // ── Prioridade de atenção ──────────────────────────────
  // Sistema de prioridade que alimenta o professor
  attentionPriority: {
    level: 1 | 2 | 3 | 4 | 5;   // 1 = precisa de atenção urgente, 5 = autônomo
    reasons: string[];            // Ex: ["Queda de 30% na frequência", "2 sublevels atrasado vs média"]
    suggestedAction: string;      // Ex: "Conversa individual sobre motivação"
  };
}

type EngagementTier = 
  | 'champion'      // 90-100: Embaixador da academia, exemplar
  | 'committed'     // 70-89: Aluno dedicado, consistente
  | 'active'        // 50-69: Presente mas sem brilho
  | 'drifting'      // 30-49: Perdendo engajamento
  | 'disconnected'; // 0-29: Praticamente ausente
```

### Lógica de cálculo:

**physical (peso 30%):**
```
checkinsUltimos30Dias / mediaAcademia × 40
+ (horasReais / horasEsperadas) × 30
+ streakAtual / 30 × 30   // streak de 30 dias = 100%
```

**pedagogical (peso 25%):**
```
overallScore × 0.4
+ (sublevelsGanhos_90dias / maxSublevels) × 0.3
+ (avaliacoes_aprovadas / avaliacoes_total) × 0.3
```

**social (peso 20%):**
```
posicaoRanking_normalizada × 0.3    // top 10% = 100, bottom 10% = 10
+ conquistasDesbloqueadas / conquistasDisponiveis × 0.3
+ socialConnection_do_DNA × 0.4
```

**financial (peso 15%):**
```
Se pagamento em dia → 100
Se 1 fatura atrasada < 15 dias → 60
Se 1 fatura atrasada > 15 dias → 30
Se subscription paused → 10
Se cancelled → 0
```

**digital (peso 10%):**
```
Se fez checkin digital (QR/app) vs manual → +20
Se acessou app nos últimos 7 dias → +40
Se visualizou conteúdo/vídeo → +40
(Se não há tracking digital → usar 50 como default neutro)
```

### Prioridade de Atenção (Sistema de Filas para o Professor):

```
Prioridade 1 (URGENTE): engagement < 30 E trend = 'declining'
  → "Aluno desconectado e piorando. Conversa individual necessária."

Prioridade 2 (ALTA): engagement < 50 OU (trend = 'declining' E trendDelta < -15)
  → "Aluno perdendo engajamento. Verificar se há obstáculo."

Prioridade 3 (MEDIA): engagement 50-69 E alguma dimensão < 30
  → "Aluno ativo mas com ponto cego em [dimensão fraca]."

Prioridade 4 (BAIXA): engagement 70-89
  → "Aluno bem. Manter motivação. Sugerir desafio novo."

Prioridade 5 (AUTÔNOMO): engagement >= 90
  → "Embaixador. Considerar como monitor/ajudante."
```

---

## ENGINE 4 — Class Optimizer (Inteligência de Aulas)

### Conceito
Analisa dados de todas as turmas e alunos para gerar insights acionáveis para o professor e admin. "A terça às 19h está perdendo alunos — aqui está o porquê."

### Arquivo: `lib/domain/intelligence/engines/class-optimizer.ts`

```typescript
interface ClassInsight {
  classScheduleId: string;
  className: string;
  dayOfWeek: number;
  timeSlot: string;
  instructorId: string;
  
  // ── Saúde da Turma ──────────────────────────────────────
  health: {
    score: number;            // 0-100
    trend: 'improving' | 'stable' | 'declining';
    avgAttendanceRate: number;  // % média de presença
    retentionRate: number;      // % que continuam após 3 meses
    avgEngagement: number;      // Média do EngagementScore dos alunos
  };

  // ── Composição Inteligente ──────────────────────────────
  composition: {
    totalEnrolled: number;
    avgLevel: number;           // Média do milestone order dos alunos
    levelSpread: number;        // Desvio padrão (alta = turma muito heterogênea)
    championCount: number;      // Quantos no tier 'champion'
    driftingCount: number;      // Quantos no tier 'drifting' ou 'disconnected'
    newMemberCount: number;     // Alunos com < 60 dias
  };

  // ── Recomendações para o Professor ──────────────────────
  recommendations: ClassRecommendation[];
  
  // ── Sugestão de Plano de Aula ───────────────────────────
  suggestedFocus: {
    primaryCompetency: string;     // Competência mais fraca da turma
    secondaryCompetency: string;   // Segunda mais fraca
    avoidCompetency: string;       // Competência que todos já dominam (gastar menos tempo)
    difficultyLevel: number;       // 1-5, calibrado pela composição
    specialAttention: {
      participantId: string;
      participantName: string;
      reason: string;              // Ex: "Primeira aula após 21 dias fora"
      suggestion: string;          // Ex: "Incluir em dupla com aluno experiente"
    }[];
  };
}

interface ClassRecommendation {
  type: 
    | 'split_class'            // Turma muito heterogênea → dividir
    | 'merge_class'            // Turma vazia → juntar com outra
    | 'change_time'            // Horário ruim → sugerir melhor
    | 'focus_retention'        // Muitos drifting → foco em retenção
    | 'pair_mentoring'         // Colocar champion com drifting
    | 'adjust_difficulty'      // Dificuldade inadequada
    | 'celebrate_progress'     // Alguém merece reconhecimento público
    | 'welcome_back'           // Aluno voltando após ausência longa
    | 'pre_promotion_focus';   // Alunos próximos de promoção → intensificar
  
  priority: 'high' | 'medium' | 'low';
  description: string;
  involvedParticipants?: string[];  // IDs dos alunos envolvidos
  expectedImpact: string;          // Ex: "Pode reduzir evasão em 20% nesta turma"
}
```

### Lógica do `analyzeClass`:

1. **Para cada aluno da turma**, puxar: EngagementScore, StudentDNA, últimos 30 dias de check-ins
2. **Calcular health.score:**
   ```
   avgAttendanceRate × 0.4 + retentionRate × 0.3 + avgEngagement × 0.3
   ```
3. **Calcular levelSpread:**
   ```
   stddev(milestone_order de todos os alunos)
   Se > 2.0 → gerar recomendação 'split_class'
   ```
4. **Encontrar competências mais fracas da turma:**
   ```
   Para cada competência da trilha:
     mediaScore = AVG(competencyScore de todos os alunos)
   Ordenar ASC → top 2 são primaryCompetency e secondaryCompetency
   Ordenar DESC → top 1 é avoidCompetency
   ```
5. **Gerar specialAttention:**
   ```
   Alunos com attentionPriority.level <= 2 E que estão matriculados nesta turma
   Alunos voltando após > 14 dias de ausência
   Alunos que estão a < 1 sublevel de promoção
   ```
6. **Gerar recomendações** baseadas em regras:
   ```
   Se driftingCount > 30% da turma → 'focus_retention'
   Se algum champion E algum drifting → 'pair_mentoring' (juntar na dupla)
   Se algum aluno voltando → 'welcome_back' com sugestão de acolhimento
   Se algum aluno eligible para promoção → 'pre_promotion_focus'
   Se turma < 30% capacidade → 'merge_class'
   Se avgAttendanceRate < 50% → 'change_time' (analisar se outro horário tem mais demanda)
   Se algum aluno com progressão muito boa → 'celebrate_progress'
   ```

---

## ENGINE 5 — Instructor Coach (Assistente Inteligente do Professor)

### Conceito
O professor recebe DICAS CONTEXTUAIS antes de cada aula. Não é informação — é orientação acionável. "Hoje na sua turma: 2 alunos voltando de ausência, 1 pronto para promoção, foque raspagem (competência mais fraca do grupo)."

### Arquivo: `lib/domain/intelligence/engines/instructor-coach.ts`

```typescript
interface InstructorCoachBriefing {
  instructorId: string;
  instructorName: string;
  briefingDate: string;          // ISO date
  
  // ── Resumo do Dia ───────────────────────────────────────
  daySummary: {
    totalClassesToday: number;
    totalStudentsExpected: number;
    criticalAlerts: number;      // Quantos alunos precisam de atenção urgente
    celebrations: number;        // Quantos merecem reconhecimento
  };

  // ── Briefing por Turma ──────────────────────────────────
  classBriefings: ClassBriefing[];
  
  // ── Dicas Pedagógicas ───────────────────────────────────
  pedagogicalTips: PedagogicalTip[];
  
  // ── Métricas do Professor ───────────────────────────────
  performanceMetrics: {
    studentRetentionRate: number;      // % dos seus alunos que continuam
    avgStudentEngagement: number;      // Média de engagement dos seus alunos
    avgStudentProgression: number;     // Velocidade média de progressão
    promotionsThisMonth: number;       // Promoções concedidas no mês
    topPerformingClass: string;        // Turma com melhor health score
    attentionNeededClass: string;      // Turma que precisa de foco
  };
}

interface ClassBriefing {
  classId: string;
  className: string;
  time: string;
  
  // ── Antes da Aula (preparação) ──────────────────────────
  preparation: {
    suggestedFocusCompetency: string;
    suggestedDifficulty: number;
    estimatedAttendance: number;       // Baseado no padrão histórico
    
    // Alunos que merecem atenção especial
    spotlight: SpotlightStudent[];
  };
  
  // ── Durante a Aula (sugestões) ──────────────────────────
  duringSuggestions: string[];    // Ex: "Colocar [Aluno A] com [Aluno B] na dupla"
  
  // ── Após a Aula (follow-up) ─────────────────────────────
  afterActions: AfterAction[];
}

interface SpotlightStudent {
  participantId: string;
  name: string;
  avatar?: string;
  
  // O que o professor precisa saber
  context: SpotlightContext;
  
  // O que fazer
  suggestedApproach: string;
  
  // Dados de suporte
  engagementTier: EngagementTier;
  daysLastSeen: number;
  currentMilestone: string;
}

type SpotlightContext =
  | { type: 'returning_after_absence'; daysAway: number; previousStreak: number }
  | { type: 'near_promotion'; progress: number; missingCriteria: string[] }
  | { type: 'declining_engagement'; trendDelta: number; possibleCause: string }
  | { type: 'new_student'; daysSinceJoin: number; needsBuddy: boolean }
  | { type: 'achieved_milestone'; milestone: string; celebrateHow: string }
  | { type: 'struggling_with'; competency: string; score: number; suggestedDrill: string }
  | { type: 'champion_potential'; reason: string; monitorRole: string };

interface PedagogicalTip {
  category: 'retention' | 'technique' | 'motivation' | 'class_management';
  tip: string;
  basedOn: string;       // Ex: "3 alunos com queda de 20% em frequência esta semana"
  priority: 'high' | 'medium' | 'low';
}

interface AfterAction {
  action: string;           // Ex: "Avaliar competência 'raspagem' do João"
  participantId?: string;
  deadline: string;         // Ex: "Antes da próxima aula"
  impact: string;           // Ex: "Pode destravar promoção para faixa azul"
}
```

### Lógica do `generateDailyBriefing`:

1. **Identificar turmas do dia** do professor (query class_schedules WHERE instructor_id AND day_of_week)
2. **Para cada turma**, rodar `analyzeClass` (Engine 4)
3. **Para cada aluno de cada turma**, cruzar:
   - StudentDNA (patterns, difficultyProfile)
   - EngagementScore (tier, trend, attentionPriority)
   - ChurnPrediction (se at_risk ou critical → spotlight)
   - Últimos domain events do aluno (promoções recentes, avaliações, streaks)
4. **Gerar spotlights** por prioridade:
   ```
   Prioridade 1: Alunos voltando após > 14 dias (welcome_back)
   Prioridade 2: Alunos com churn risk >= 60 (declining_engagement)
   Prioridade 3: Alunos eligible para promoção (near_promotion)
   Prioridade 4: Alunos novos < 30 dias (new_student)
   Prioridade 5: Alunos que conquistaram algo recentemente (achieved_milestone)
   Prioridade 6: Alunos com competência < 40 no foco da aula (struggling_with)
   Prioridade 7: Alunos tier champion (champion_potential)
   ```
5. **Gerar pedagogicalTips** baseado em padrões da turma:
   ```
   Se retentionRate < 70% → tip de retenção: "Foque em acolhimento nos primeiros 10 minutos"
   Se levelSpread > 2 → tip de gestão: "Turma muito heterogênea — criar sub-grupos por nível"
   Se avgEngagement declining → tip de motivação: "Introduzir elemento competitivo leve"
   Se muitos struggling_with mesma competência → tip de técnica: "Revisar [competência] com progressão mais gradual"
   ```
6. **Gerar afterActions:**
   ```
   Para cada aluno near_promotion → "Avaliar [competência faltante] de [aluno]"
   Para cada aluno returning_after_absence → "Checar se [aluno] pretende continuar"
   Para cada aluno com avaliação atrasada → "Agendar avaliação de [aluno]"
   ```

---

## ENGINE 6 — Promotion Predictor (Previsão de Promoção)

### Arquivo: `lib/domain/intelligence/engines/promotion-predictor.ts`

```typescript
interface PromotionPrediction {
  participantId: string;
  currentMilestone: { id: string; name: string; order: number };
  targetMilestone: { id: string; name: string; order: number };
  
  // ── Previsão principal ──────────────────────────────────
  estimatedReadyDate: string | null;   // ISO date
  estimatedWeeks: number | null;
  confidence: number;                   // 0-1
  
  // ── Progresso por critério ──────────────────────────────
  criteriaProgress: {
    criterionType: string;
    currentValue: number;
    requiredValue: number;
    progress: number;              // 0-100%
    estimatedCompletionDate: string | null;
    velocity: number;              // Unidades por semana
    isBlocker: boolean;            // Se este critério está atrasando a promoção
  }[];
  
  // ── Aceleradores e Bloqueadores ─────────────────────────
  accelerators: string[];    // Ex: ["Aumentar frequência para 4x/semana economiza 3 semanas"]
  blockers: string[];        // Ex: ["Competência 'raspagem' abaixo do mínimo (35/70)"]
  
  // ── Comparação com pares ────────────────────────────────
  peerComparison: {
    avgWeeksForThisTransition: number;  // Média da academia para mesma transição
    percentilePlacement: number;        // Em que percentil o aluno está (velocidade)
    fasterThanAverage: boolean;
  };
}
```

### Lógica:

1. Para cada critério da PromotionRule:
   - Calcular `velocity` = (valor_atual - valor_30dias_atras) / 4 semanas
   - Se velocity > 0: `estimatedCompletionDate` = hoje + (requiredValue - currentValue) / velocity semanas
   - Se velocity <= 0: isBlocker = true, estimatedCompletionDate = null
2. `estimatedReadyDate` = MAX de todos os estimatedCompletionDate (o mais lento determina)
3. `peerComparison`: query promoções históricas da academia para mesma transição (from→to milestone), calcular mediana de tempo
4. `accelerators`: para cada critério com velocity > 0, calcular "se aumentar X em Y%, economiza Z semanas"
5. `blockers`: critérios com velocity <= 0 ou progress < 30%

---

## ENGINE 7 — Social Graph (Retenção por Vínculos)

### Arquivo: `lib/domain/intelligence/engines/social-graph.ts`

```typescript
interface SocialProfile {
  participantId: string;
  
  // ── Conexões ────────────────────────────────────────────
  connections: {
    participantId: string;
    name: string;
    strength: number;          // 0-100 (baseado em co-ocorrência de check-ins)
    sharedClasses: number;     // Quantas turmas em comum
    sharedSessions: number;    // Quantas sessões treinaram juntos
    isActive: boolean;         // Se o colega ainda está ativo
  }[];
  
  // ── Métricas sociais ────────────────────────────────────
  metrics: {
    networkSize: number;           // Total de conexões significativas (strength > 30)
    strongBonds: number;           // Conexões com strength > 70
    socialRetentionRisk: number;   // 0-100 (se bonds principais saírem → risco)
    communityRole: CommunityRole;
  };
  
  // ── Alerta de risco social ──────────────────────────────
  alerts: SocialAlert[];
}

type CommunityRole =
  | 'connector'     // Treina com muitas pessoas diferentes
  | 'loyalist'      // Sempre com o mesmo grupo pequeno
  | 'solo'          // Treina sozinho (não socializa)
  | 'influencer'    // Quando ele vai, outros vão junto
  | 'newcomer';     // Muito novo, ainda formando conexões

interface SocialAlert {
  type: 
    | 'bond_churned'       // Amigo próximo saiu da academia
    | 'group_declining'    // Grupo do aluno está todo declining
    | 'isolated'           // Aluno sem conexões significativas
    | 'influencer_at_risk'; // Influencer em risco → pode levar outros
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestedAction: string;
}
```

### Lógica:

1. **Construir grafo:** Para cada par de alunos, contar quantas vezes fizeram check-in na mesma sessão (mesma `class_session_id` + ±15 minutos)
2. **connection.strength:** `min(100, sharedSessions × 5)` — 20 sessões juntos = conexão máxima
3. **socialRetentionRisk:** Se top 3 conexões mais fortes tiverem churnRisk > 60 → risco alto
4. **communityRole:**
   ```
   Se networkSize > 15 → 'connector'
   Se strongBonds >= 3 E networkSize < 8 → 'loyalist'
   Se networkSize < 3 → 'solo'
   Se quando o aluno está presente a frequência média sobe > 15% → 'influencer'
   Se memberSince < 60 dias → 'newcomer'
   ```
5. **Alertas:**
   ```
   Se alguma conexão strength > 70 churn → 'bond_churned'
   Se >50% das conexões com engagement declining → 'group_declining'
   Se networkSize < 2 após 90 dias de membro → 'isolated'
   Se communityRole = 'influencer' E churnRisk > 50 → 'influencer_at_risk' (URGENTE)
   ```

---

## PROJEÇÕES POR PERFIL DE USUÁRIO

### Para Aluno Adulto (`project-student-insights.ts`):

```typescript
interface StudentInsightsVM {
  // ── Motivação personalizada ─────────────────────────────
  motivationalMessage: string;       // Gerado baseado no DNA
  motivationDriver: MotivationDriver; // O que mais motiva este aluno
  
  // ── Próximos passos ─────────────────────────────────────
  nextSteps: {
    icon: string;
    title: string;
    description: string;
    progress: number;    // 0-100
    estimatedDate?: string;
  }[];
  
  // ── Insights pessoais ───────────────────────────────────
  personalInsights: {
    bestDay: string;              // "Você rende mais às terças!"
    optimalFrequency: string;     // "3x por semana é seu ritmo ideal"
    strongPoint: string;          // "Sua guarda fechada é top 20% da academia"
    improvementArea: string;      // "Raspagem é sua maior oportunidade de evolução"
    funFact: string;              // "Você já treinou 247 horas desde que entrou!"
  };
  
  // ── Desafio da Semana ───────────────────────────────────
  weeklyChallenge: {
    title: string;
    description: string;
    reward: number;      // pontos
    basedOn: string;     // Ex: "Baseado na sua competência mais fraca"
    difficulty: 'easy' | 'medium' | 'hard';
  };
  
  // ── Posição Social ──────────────────────────────────────
  socialContext: {
    trainingBuddies: { name: string; avatar?: string; lastTrained: string }[];
    communityRole: string;
    networkStrength: string;  // "Forte — você é bem conectado na academia"
  };
}
```

**Lógica de motivationalMessage:**
```
Se motivationDriver = 'ranking':
  "Você subiu {X} posições este mês! Continue assim para chegar ao top {Y}."
Se motivationDriver = 'streak':
  "Sequência de {X} dias! Seu recorde é {Y} — faltam {Z} para bater!"
Se motivationDriver = 'promotion':
  "Faltam aproximadamente {X} semanas para a próxima faixa. Você está {faster/slower} que a média."
Se motivationDriver = 'social':
  "{Amigo} treinou ontem. Que tal ir juntos amanhã?"
Se motivationDriver = 'mastery':
  "Sua {competência forte} está no top {X}% da academia. Hora de dominar {competência fraca}!"
```

### Para Teen (`project-teen-insights.ts`):

```typescript
interface TeenInsightsVM {
  // Linguagem adaptada para teen (mais informal, gamificada)
  levelUp: {
    currentXP: number;         // Pontos como XP
    nextLevelXP: number;
    progress: number;          // barra de XP
    title: string;             // "Guerreiro" → "Samurai" → "Mestre"
  };
  
  dailyQuest: {
    title: string;             // "Missão do Dia"
    description: string;
    xpReward: number;
    emoji: string;
  };
  
  achievements: {
    recent: { name: string; icon: string; unlockedAt: string }[];
    nextClosest: { name: string; icon: string; progress: number }[];
  };
  
  // Versão simplificada dos insights
  funStats: {
    emoji: string;
    text: string;              // "🔥 12 dias seguidos treinando!"
  }[];
  
  rivalChallenge?: {
    rivalName: string;
    rivalAvatar?: string;
    metric: string;            // "Quem treina mais esta semana?"
    yourScore: number;
    rivalScore: number;
  };
}
```

### Para Kids (`project-kids-insights.ts`):

```typescript
interface KidsInsightsVM {
  // Tudo é aventura/história
  adventure: {
    currentChapter: string;    // "A Floresta dos Desafios"
    starsCollected: number;
    totalStars: number;
    mascotMessage: string;     // Mensagem do mascote
    mascotMood: 'happy' | 'excited' | 'encouraging' | 'proud';
  };
  
  // Adesivos/selos colecionáveis
  stickers: {
    earned: { id: string; name: string; image: string }[];
    nextToEarn: { name: string; hint: string; progress: number };
  };
  
  // Estrelas por comportamento (professor avalia)
  stars: {
    technique: number;     // 0-5 estrelas
    effort: number;
    behavior: number;
    lastUpdated: string;
  };
  
  // Simplicidade máxima — criança entende
  simpleProgress: {
    beltColor: string;
    beltName: string;
    stripesEarned: number;
    stripesTotal: number;
    daysUntilNextStripe: number | null;  // Estimativa simplificada
    cheerMessage: string;    // "Faltam só 2 listrinhas! Você consegue! 🎉"
  };
}
```

### Para Parent (`project-parent-insights.ts`):

```typescript
interface ParentInsightsVM {
  childId: string;
  childName: string;
  
  // ── Resumo para os pais ─────────────────────────────────
  summary: {
    headline: string;          // "João está indo muito bem! 🌟"
    engagementLevel: string;   // "Alto" / "Estável" / "Precisa de atenção"
    attendanceThisMonth: number;
    totalClassesThisMonth: number;
  };

  // ── O que o filho está aprendendo ───────────────────────
  learningProgress: {
    currentBelt: string;
    nextBelt: string;
    progressToNext: number;    // 0-100%
    strongAreas: string[];     // "Disciplina", "Técnica de solo"
    growthAreas: string[];     // "Trabalho em equipe", "Flexibilidade"
  };

  // ── Desenvolvimento comportamental ──────────────────────
  behavioralDevelopment: {
    discipline: TrendIndicator;
    respect: TrendIndicator;
    teamwork: TrendIndicator;
    confidence: TrendIndicator;
    focusAndAttention: TrendIndicator;
  };

  // ── Alertas para os pais ────────────────────────────────
  parentAlerts: {
    type: 'positive' | 'attention' | 'info';
    message: string;
    // Ex positive: "João ganhou a medalha de Persistência esta semana!"
    // Ex attention: "João faltou 3 aulas seguidas. Está tudo bem?"
    // Ex info: "Próxima avaliação de faixa: 15 de março"
  }[];

  // ── Sugestões para os pais ──────────────────────────────
  parentTips: string[];
  // Ex: "Pergunte ao João sobre a técnica que ele aprendeu hoje!"
  // Ex: "Praticar em casa 10 minutos por dia acelera o progresso"

  // ── Calendário ──────────────────────────────────────────
  upcomingEvents: {
    date: string;
    type: 'class' | 'evaluation' | 'event' | 'promotion';
    title: string;
  }[];
}

interface TrendIndicator {
  level: 'excellent' | 'good' | 'developing' | 'needs_attention';
  trend: 'improving' | 'stable' | 'declining';
  description: string;  // "Consistentemente respeitoso com colegas e professor"
}
```

**Nota:** Os `behavioralDevelopment` vêm das avaliações do professor (competencyScores mapeados para soft skills). Se o segmento não tem essas competências, omitir esta seção.

### Para Admin (`project-admin-analytics.ts`):

```typescript
interface AdminAIAnalyticsVM {
  // ── Saúde Geral da Academia ─────────────────────────────
  academyHealth: {
    overallScore: number;           // 0-100
    trend: 'improving' | 'stable' | 'declining';
    
    // Breakdown
    retention: { score: number; trend: string; detail: string };
    engagement: { score: number; trend: string; detail: string };
    revenue: { score: number; trend: string; detail: string };
    growth: { score: number; trend: string; detail: string };
  };

  // ── Mapa de Risco ───────────────────────────────────────
  riskMap: {
    critical: { count: number; revenue_at_risk: number; members: MemberRiskSummary[] };
    atRisk: { count: number; revenue_at_risk: number; members: MemberRiskSummary[] };
    watch: { count: number; members: MemberRiskSummary[] };
    safe: { count: number };
    champion: { count: number };
  };

  // ── Previsões ───────────────────────────────────────────
  predictions: {
    expectedChurnNext30Days: number;        // Quantos devem sair
    expectedRevenueImpact: number;          // R$ em risco
    expectedPromotionsNext30Days: number;   // Promoções previstas
    expectedNewMembersNeeded: number;       // Para manter receita estável
  };

  // ── Insights Acionáveis ─────────────────────────────────
  actionableInsights: {
    priority: 'critical' | 'high' | 'medium';
    category: 'retention' | 'revenue' | 'operations' | 'growth';
    title: string;
    description: string;
    estimatedImpact: string;
    suggestedAction: string;
    deadline?: string;
  }[];

  // ── Turmas que precisam de atenção ──────────────────────
  classesNeedingAttention: {
    classId: string;
    className: string;
    issue: string;
    healthScore: number;
    recommendation: string;
  }[];

  // ── Professores — Performance ───────────────────────────
  instructorPerformance: {
    instructorId: string;
    name: string;
    studentsRetentionRate: number;
    avgStudentEngagement: number;
    avgStudentProgression: number;
    promotionsGranted: number;
    classHealthAvg: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];

  // ── ROI do Sistema de IA ────────────────────────────────
  aiSystemMetrics: {
    predictionsGenerated: number;
    alertsGenerated: number;
    alertsActedUpon: number;       // Quantos o admin/professor agiu
    churnsPrevented: number;       // Estimativa: alunos at_risk que ficaram
    estimatedRevenueSaved: number; // R$ salvos por retenção
  };
}
```

### Para Super Admin (`project-super-admin-health.ts`):

```typescript
interface SuperAdminHealthVM {
  // Visão macro de todas as academias
  platformHealth: {
    totalAcademies: number;
    totalMembers: number;
    avgHealthScore: number;
    healthDistribution: {
      healthy: number;      // score > 70
      attention: number;    // score 40-70
      critical: number;     // score < 40
    };
  };
  
  // Top academias / academias em risco
  topAcademies: { id: string; name: string; score: number; trend: string }[];
  atRiskAcademies: { id: string; name: string; score: number; issues: string[] }[];
  
  // Métricas de IA agregadas
  aiPlatformMetrics: {
    totalPredictions: number;
    avgAccuracy: number;     // Quando o modelo previu churn, acertou?
    topInsightCategory: string;
    platformChurnRate: number;
  };
}
```

---

## COMPONENTES UI A CRIAR

### Admin
```
components/admin/
├── AIInsightsDashboard.tsx        # Dashboard principal de IA
├── AcademyHealthScore.tsx         # Gauge visual de saúde
├── RiskMapVisualization.tsx       # Mapa de risco (treemap ou heatmap)
├── PredictionsCards.tsx           # Cards de previsão (churn, promoções, receita)
├── ActionableInsightsList.tsx     # Lista priorizável de insights
├── InstructorPerformanceTable.tsx # Tabela de performance dos professores
└── AISystemROI.tsx                # Métricas de ROI do sistema de IA
```

### Professor
```
components/professor/
├── DailyBriefing.tsx              # Briefing do dia (tela principal)
├── ClassBriefingCard.tsx          # Card por turma com insights
├── SpotlightStudentCard.tsx       # Card de aluno em destaque
├── PedagogicalTipsBanner.tsx      # Banner com dicas contextuais
├── AfterClassChecklist.tsx        # Checklist pós-aula
├── StudentRiskBadge.tsx           # Badge na lista de alunos (🟢🟡🟠🔴)
├── AdaptiveTestGenerator.tsx      # Interface para gerar prova adaptativa
└── ClassCompositionRadar.tsx      # Radar chart de composição da turma
```

### Aluno Adulto
```
components/aluno/
├── PersonalInsightsCard.tsx       # Card de insights pessoais
├── WeeklyChallengeCard.tsx        # Desafio da semana
├── PromotionPredictionCard.tsx    # "Faltam X semanas para a próxima faixa"
├── TrainingBuddiesWidget.tsx      # Parceiros de treino
└── MotivationalBanner.tsx         # Banner motivacional contextual
```

### Teen
```
components/teen/
├── XPProgressBar.tsx              # Barra de XP gamificada
├── DailyQuestCard.tsx             # Missão do dia
├── RivalChallengeCard.tsx         # Desafio contra rival
└── FunStatsCarousel.tsx           # Carrossel de stats divertidos
```

### Kids
```
components/kids/
├── AdventureProgress.tsx          # Progresso na aventura
├── StickerCollection.tsx          # Coleção de adesivos
├── MascotBubble.tsx               # Balão do mascote com mensagem
└── SimpleProgressStars.tsx        # Estrelas de progresso simplificado
```

### Parent
```
components/parent/
├── ChildProgressSummary.tsx       # Resumo do progresso do filho
├── BehavioralRadarChart.tsx       # Radar de desenvolvimento comportamental
├── ParentAlertsList.tsx           # Alertas e notificações
├── ParentTipsBanner.tsx           # Dicas para os pais
└── UpcomingEventsTimeline.tsx     # Timeline de eventos
```

---

## PÁGINAS A CRIAR/MODIFICAR

```
app/(admin)/ai-insights/page.tsx           # Dashboard completo de IA (admin)
app/(professor)/briefing/page.tsx          # Briefing diário do professor
app/(professor)/avaliacao-adaptativa/page.tsx  # Gerar prova adaptativa
app/(main)/meus-insights/page.tsx          # Insights pessoais (aluno adulto)
app/(teen)/insights/page.tsx               # Insights teen (gamificado)
app/(kids)/aventura/page.tsx               # Aventura/progresso kids
app/(parent)/progresso/page.tsx            # Progresso do filho (parent)
app/(super-admin)/ai-health/page.tsx       # Saúde da plataforma (super admin)
```

---

## MIGRATIONS SQL

Criar nova migration com:

```sql
-- 1. ai_question_bank (banco de questões para provas adaptativas)
-- 2. ai_test_responses (respostas das provas — alimenta IRT)
-- 3. ai_churn_labels (labels de churn — alimenta treino futuro)
-- 4. ai_student_dna_cache (cache do DNA calculado — evita recálculo constante)
-- 5. ai_engagement_snapshots (snapshots periódicos de engagement — série temporal)
-- 6. ai_social_connections (cache do grafo social)
-- 7. ai_instructor_briefings (briefings gerados — histórico)
-- 8. ai_adaptive_tests (provas geradas — histórico)

-- Cada tabela com:
-- - academy_id FK + RLS
-- - created_at / updated_at timestamps
-- - Índices para queries frequentes
-- - Triggers de atualização automática onde aplicável

-- ai_student_dna_cache
CREATE TABLE ai_student_dna_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id),
  membership_id UUID NOT NULL REFERENCES memberships(id),
  dna JSONB NOT NULL,                -- StudentDNA completo
  data_points INTEGER NOT NULL,
  confidence NUMERIC(5,4) NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE (academy_id, membership_id)
);

-- ai_engagement_snapshots (série temporal para trend analysis)
CREATE TABLE ai_engagement_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id),
  membership_id UUID NOT NULL REFERENCES memberships(id),
  overall_score NUMERIC(5,2) NOT NULL,
  physical NUMERIC(5,2),
  pedagogical NUMERIC(5,2),
  social_score NUMERIC(5,2),
  financial NUMERIC(5,2),
  digital NUMERIC(5,2),
  tier TEXT NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (academy_id, membership_id, snapshot_date)
);

-- Criar index para query de trend (últimas 4 semanas)
CREATE INDEX idx_engagement_trend 
ON ai_engagement_snapshots (academy_id, membership_id, snapshot_date DESC);

-- ai_social_connections
CREATE TABLE ai_social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id),
  member_a UUID NOT NULL REFERENCES memberships(id),
  member_b UUID NOT NULL REFERENCES memberships(id),
  strength NUMERIC(5,2) NOT NULL DEFAULT 0,
  shared_sessions INTEGER NOT NULL DEFAULT 0,
  shared_classes INTEGER NOT NULL DEFAULT 0,
  last_trained_together TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (academy_id, member_a, member_b),
  CHECK (member_a < member_b)  -- Evitar duplicatas inversas
);

-- RLS para todas as tabelas (padrão)
-- [Aplicar o mesmo padrão das 50+ policies existentes]
```

---

## REGRAS DE IMPLEMENTAÇÃO

1. **ZERO dependências externas de ML.** Tudo em TypeScript puro.
2. **Engines são pure functions.** Input → Output, sem side effects, sem DB, sem fetch.
3. **ACL é a ÚNICA porta de entrada.** Engines NUNCA importam de `lib/api/` ou `lib/supabase/` diretamente.
4. **Cada engine é testável isoladamente** com fixtures mockadas.
5. **RLS em toda tabela nova.** Copiar padrão das 50+ policies existentes.
6. **Não modificar engines/projectors existentes.** Adicionar novos.
7. **Internacionalização.** Usar `useVocabulary()` para termos do segmento.
8. **Responsivo.** Tailwind com mobile-first.
9. **Logging.** Seguir `structured-logger.ts`.
10. **Confiança.** Todo output de IA inclui `confidence` e `dataQuality`. Se poucos dados → mostrar com aviso.
11. **Gradual degradation.** Se um engine falha, os outros continuam. Nunca travar a UI.
12. **Segment-aware.** Pesos e vocabulário adaptam por segmento (BJJ vs Dança vs Pilates).
13. **Mensagens NUNCA negativas para aluno.** Aluno vê motivação, nunca "risco de evasão". A inteligência de risco é para admin/professor.
14. **Kids-safe.** Tudo na área kids é positivo, divertido, sem pressão.

---

## PRIORIDADE DE IMPLEMENTAÇÃO

Implemente nesta ordem (cada item funciona independente):

1. **`core/types.ts` + `core/scoring-utils.ts`** — Fundação compartilhada
2. **`engines/engagement-scorer.ts`** — Alimenta tudo
3. **`engines/student-dna.ts`** — O cérebro do sistema
4. **`engines/instructor-coach.ts`** + **`engines/class-optimizer.ts`** — Valor imediato para professor
5. **`engines/promotion-predictor.ts`** — Valor para aluno
6. **`engines/adaptive-difficulty.ts`** — Provas inteligentes
7. **`engines/social-graph.ts`** — Retenção social
8. **ACL mappers** — Conectar engines aos dados
9. **Projectors por perfil** — ViewModels para cada usuário
10. **Subscribers** — Conectar ao Event Bus
11. **API routes + Hooks** — Expor para frontend
12. **Componentes UI** — Telas e widgets
13. **Páginas** — Integrar tudo
14. **Migrations** — Tabelas de cache e histórico
15. **Testes** — Engine tests com fixtures

---

## CHECKLIST FINAL

Ao finalizar, confirme:

- [ ] 7 engines implementados como pure functions
- [ ] StudentDNA com 8 dimensões + patterns + difficultyProfile
- [ ] Adaptive Difficulty gerando provas personalizadas
- [ ] Engagement Scorer com 5 subdimensões e sistema de prioridade
- [ ] Class Optimizer com recomendações e sugestão de plano de aula
- [ ] Instructor Coach com briefing diário completo
- [ ] Promotion Predictor com estimativas e comparação com pares
- [ ] Social Graph com detecção de vínculos e alertas sociais
- [ ] 7 projectors (1 por perfil de usuário)
- [ ] ACL mappers respeitando fronteiras
- [ ] Event Bus subscribers com debounce
- [ ] API endpoints protegidos por role
- [ ] Hooks React para cada feature
- [ ] Componentes UI por perfil (Admin, Professor, Adulto, Teen, Kids, Parent, Super Admin)
- [ ] 8 páginas novas
- [ ] Migrations SQL com RLS
- [ ] Testes para cada engine
- [ ] `AI-FULL-IMPLEMENTATION-LOG.md` na raiz com relatório completo

**Salvar relatório de implementação como `AI-FULL-IMPLEMENTATION-LOG.md` na raiz do projeto.**

Execute agora. Comece lendo os arquivos listados no topo para entender os padrões antes de criar qualquer coisa.
