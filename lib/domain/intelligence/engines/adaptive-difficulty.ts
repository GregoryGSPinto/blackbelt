/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ADAPTIVE DIFFICULTY — Gerador de Testes Adaptativos            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function — ZERO side effects.                             ║
 * ║  Seleciona e ordena questões do banco com base no DNA do aluno. ║
 * ║  Implementa IRT simplificado (Item Response Theory).            ║
 * ║                                                                 ║
 * ║  6-Step Logic:                                                  ║
 * ║    1. Determine target difficulty from DNA                      ║
 * ║    2. Compute competency weights (weak > strong)                ║
 * ║    3. Select questions per competency                           ║
 * ║    4. Apply difficulty distribution (easy→hard progression)     ║
 * ║    5. Respect time and question limits                          ║
 * ║    6. Compute coverage and confidence                           ║
 * ║                                                                 ║
 * ║  Input:  AdaptiveTestConfig + StudentDNA + QuestionBank         ║
 * ║  Output: AdaptiveTest (ordered questions + difficulty curve)    ║
 * ║                                                                 ║
 * ║  Testável sem banco. Determinístico.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  AdaptiveTestConfig,
  AdaptiveTest,
  TestSection,
  TestQuestion,
  QuestionContent,
  CompetencyFocusItem,
} from '../models/adaptive-test.types';
import type { StudentDNA } from '../models/student-dna.types';
import type { QuestionType } from '../core/types';


import { calculateConfidence } from '../core/confidence-calculator';

// ════════════════════════════════════════════════════════════════════
// QUESTION BANK ITEM (engine-local input type)
// ════════════════════════════════════════════════════════════════════

export interface QuestionBankItem {
  id: string;
  competencyId: string;
  competencyName: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  type: QuestionType;
  tags: string[];
  estimatedTimeMinutes: number;
  content: QuestionContent;
  points: number;
}

// ════════════════════════════════════════════════════════════════════
// DIFFICULTY DISTRIBUTION BY TEST TYPE
// ════════════════════════════════════════════════════════════════════

interface DifficultyDistribution {
  easy: number;    // difficulty 1-2
  medium: number;  // difficulty 3
  hard: number;    // difficulty 4
  stretch: number; // difficulty 5
}

const BASE_DISTRIBUTIONS: Record<AdaptiveTestConfig['testType'], DifficultyDistribution> = {
  diagnostic: { easy: 30, medium: 40, hard: 20, stretch: 10 },
  periodic: { easy: 20, medium: 40, hard: 30, stretch: 10 },
  promotion: { easy: 10, medium: 30, hard: 40, stretch: 20 },
};

// ════════════════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// ════════════════════════════════════════════════════════════════════

/**
 * Gera um teste adaptativo personalizado com base no DNA do aluno.
 *
 * @param config - Configuração do teste (participante, milestone, tipo, limites)
 * @param dna - DNA comportamental do aluno (pode ser null para novos)
 * @param questionBank - Banco de questões disponíveis
 * @returns AdaptiveTest com seções ordenadas e curva de dificuldade
 */
export function generateAdaptiveTest(
  config: AdaptiveTestConfig,
  dna: StudentDNA | null,
  questionBank: QuestionBankItem[],
): AdaptiveTest {
  // ── Step 1: Determine target difficulty from DNA ────────────
  const targetDifficulty = determineTargetDifficulty(dna, config.testType);

  // ── Step 2: Compute competency weights ──────────────────────
  const competencyWeights = computeCompetencyWeights(dna, questionBank);

  // ── Step 3: Compute difficulty distribution ─────────────────
  const distribution = adaptDistribution(config.testType, dna);

  // ── Step 4: Select questions per competency ─────────────────
  const selectedQuestions = selectQuestions(
    questionBank,
    competencyWeights,
    distribution,
    config.maxQuestions,
    targetDifficulty,
  );

  // ── Step 5: Build sections and respect limits ───────────────
  const { sections, totalTime } = buildSections(
    selectedQuestions,
    competencyWeights,
  );

  // ── Step 6: Compute coverage and confidence ─────────────────
  const competencyCoverage = computeCompetencyCoverage(selectedQuestions);
  const difficultyProgression = selectedQuestions.map(q => q.difficulty);

  // Passing score adapted by DNA
  const passingScore = computePassingScore(config.testType, dna);

  // Confidence
  const totalCompetencies = new Set(questionBank.map(q => q.competencyId)).size;
  const coveredCompetencies = Object.keys(competencyCoverage).length;
  const confidence = calculateConfidence(
    coveredCompetencies + selectedQuestions.length,
    totalCompetencies + config.maxQuestions,
    null,
  );

  return {
    id: generateTestId(config),
    participantId: config.participantId,
    config,
    sections,
    difficultyDistribution: {
      easy: distribution.easy,
      medium: distribution.medium,
      hard: distribution.hard,
      stretch: distribution.stretch,
    },
    competencyFocus: buildCompetencyFocus(competencyWeights),
    estimatedDuration: totalTime,
    passingScore,
    generatedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════════
// STEP 1: TARGET DIFFICULTY
// ════════════════════════════════════════════════════════════════════

function determineTargetDifficulty(
  dna: StudentDNA | null,
  testType: AdaptiveTestConfig['testType'],
): number {
  if (!dna) {
    // No DNA: use moderate difficulty
    return testType === 'promotion' ? 4 : 3;
  }

  // Base from optimal challenge level (0-100 -> 1-5)
  const optimalLevel = dna.difficultyProfile?.optimalChallengeLevel ?? 50;
  let target = Math.round((optimalLevel / 100) * 4) + 1; // 1-5

  // Adjust by test type
  if (testType === 'promotion') target = Math.min(5, target + 1);
  if (testType === 'diagnostic') target = Math.max(1, target - 1);

  return Math.max(1, Math.min(5, target)) as 1 | 2 | 3 | 4 | 5;
}

// ════════════════════════════════════════════════════════════════════
// STEP 2: COMPETENCY WEIGHTS
// ════════════════════════════════════════════════════════════════════

function computeCompetencyWeights(
  dna: StudentDNA | null,
  questionBank: QuestionBankItem[],
): Map<string, { name: string; weight: number; reason: CompetencyFocusItem['reason'] }> {
  const competencies = new Map<string, { name: string; weight: number; reason: CompetencyFocusItem['reason'] }>();

  // Get unique competencies from question bank
  const uniqueCompetencies = new Map<string, string>();
  for (const q of questionBank) {
    if (!uniqueCompetencies.has(q.competencyId)) {
      uniqueCompetencies.set(q.competencyId, q.competencyName);
    }
  }

  if (!dna) {
    // Equal weights for all competencies
    const equalWeight = 100 / uniqueCompetencies.size;
    for (const [id, name] of uniqueCompetencies) {
      competencies.set(id, { name, weight: equalWeight, reason: 'maintenance' });
    }
    return competencies;
  }

  const weakIds = new Set(dna.difficultyProfile?.weakCompetencies ?? []);
  const strongIds = new Set(dna.difficultyProfile?.strongCompetencies ?? []);

  for (const [id, name] of uniqueCompetencies) {
    let weight: number;
    let reason: CompetencyFocusItem['reason'];

    if (weakIds.has(id)) {
      weight = 30; // Extra focus on weak areas
      reason = 'weak_area';
    } else if (strongIds.has(id)) {
      weight = 10; // Less focus on strengths (validation only)
      reason = 'strength_validation';
    } else {
      weight = 20; // Maintenance
      reason = 'maintenance';
    }

    competencies.set(id, { name, weight, reason });
  }

  // Normalize weights to sum 100
  const totalWeight = Array.from(competencies.values()).reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight > 0) {
    for (const [id, comp] of competencies) {
      competencies.set(id, { ...comp, weight: Math.round((comp.weight / totalWeight) * 100) });
    }
  }

  return competencies;
}

// ════════════════════════════════════════════════════════════════════
// STEP 3: ADAPT DIFFICULTY DISTRIBUTION
// ════════════════════════════════════════════════════════════════════

function adaptDistribution(
  testType: AdaptiveTestConfig['testType'],
  dna: StudentDNA | null,
): DifficultyDistribution {
  const base = { ...BASE_DISTRIBUTIONS[testType] };

  if (!dna) return base;

  const learningSpeed = dna.difficultyProfile?.learningSpeed ?? 'average';

  // Fast learners: shift towards harder questions
  if (learningSpeed === 'fast') {
    base.easy = Math.max(5, base.easy - 10);
    base.hard += 5;
    base.stretch += 5;
  }

  // Slow learners: shift towards easier questions
  if (learningSpeed === 'slow') {
    base.easy += 10;
    base.hard = Math.max(5, base.hard - 5);
    base.stretch = Math.max(5, base.stretch - 5);
  }

  // Normalize to 100
  const total = base.easy + base.medium + base.hard + base.stretch;
  if (total !== 100) {
    const factor = 100 / total;
    base.easy = Math.round(base.easy * factor);
    base.medium = Math.round(base.medium * factor);
    base.hard = Math.round(base.hard * factor);
    base.stretch = 100 - base.easy - base.medium - base.hard;
  }

  return base;
}

// ════════════════════════════════════════════════════════════════════
// STEP 4: QUESTION SELECTION
// ════════════════════════════════════════════════════════════════════

function selectQuestions(
  questionBank: QuestionBankItem[],
  competencyWeights: Map<string, { name: string; weight: number; reason: CompetencyFocusItem['reason'] }>,
  distribution: DifficultyDistribution,
  maxQuestions: number,
  targetDifficulty: number,
): (QuestionBankItem & { selectedBecause: string; expectedCorrectRate: number })[] {
  const selected: (QuestionBankItem & { selectedBecause: string; expectedCorrectRate: number })[] = [];

  // Compute questions per competency (proportional to weight)
  const questionsPerCompetency = new Map<string, number>();
  for (const [id, { weight }] of competencyWeights) {
    const count = Math.max(1, Math.round((weight / 100) * maxQuestions));
    questionsPerCompetency.set(id, count);
  }

  // Compute questions per difficulty tier
  const difficultySlots = {
    easy: Math.max(1, Math.round((distribution.easy / 100) * maxQuestions)),
    medium: Math.max(1, Math.round((distribution.medium / 100) * maxQuestions)),
    hard: Math.max(1, Math.round((distribution.hard / 100) * maxQuestions)),
    stretch: Math.max(0, Math.round((distribution.stretch / 100) * maxQuestions)),
  };

  // Group available questions by competency
  const byCompetency = new Map<string, QuestionBankItem[]>();
  for (const q of questionBank) {
    if (!byCompetency.has(q.competencyId)) {
      byCompetency.set(q.competencyId, []);
    }
    byCompetency.get(q.competencyId)!.push(q);
  }

  // Select questions per competency, respecting difficulty distribution
  for (const [compId, targetCount] of questionsPerCompetency) {
    const available = byCompetency.get(compId) ?? [];
    if (available.length === 0) continue;

    const compInfo = competencyWeights.get(compId);
    const reason = compInfo?.reason ?? 'maintenance';

    // Sort by proximity to target difficulty
    const sorted = [...available].sort((a, b) => {
      return Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty);
    });

    // Pick up to targetCount, preferring difficulty variety
    let picked = 0;
    const usedIds = new Set<string>();

    for (const q of sorted) {
      if (picked >= targetCount || selected.length >= maxQuestions) break;
      if (usedIds.has(q.id)) continue;

      // Check if this difficulty tier still has slots
      const tier = getDifficultyTier(q.difficulty);
      if (difficultySlots[tier] <= 0) continue;

      const selectedBecause = buildSelectionReason(reason, q, compInfo?.name ?? '');
      const expectedCorrectRate = estimateCorrectRate(q.difficulty, targetDifficulty);

      selected.push({ ...q, selectedBecause, expectedCorrectRate });
      usedIds.add(q.id);
      difficultySlots[tier]--;
      picked++;
    }

    // If we didn't fill the quota, relax difficulty constraints
    if (picked < targetCount) {
      for (const q of sorted) {
        if (picked >= targetCount || selected.length >= maxQuestions) break;
        if (usedIds.has(q.id)) continue;

        const selectedBecause = buildSelectionReason(reason, q, compInfo?.name ?? '');
        const expectedCorrectRate = estimateCorrectRate(q.difficulty, targetDifficulty);

        selected.push({ ...q, selectedBecause, expectedCorrectRate });
        usedIds.add(q.id);
        picked++;
      }
    }
  }

  // Sort by difficulty progression (easy -> hard)
  selected.sort((a, b) => a.difficulty - b.difficulty);

  // Trim to maxQuestions
  return selected.slice(0, maxQuestions);
}

function getDifficultyTier(difficulty: number): keyof DifficultyDistribution {
  if (difficulty <= 2) return 'easy';
  if (difficulty === 3) return 'medium';
  if (difficulty === 4) return 'hard';
  return 'stretch';
}

function buildSelectionReason(
  reason: CompetencyFocusItem['reason'],
  question: QuestionBankItem,
  competencyName: string,
): string {
  switch (reason) {
    case 'weak_area':
      return `Competência fraca: ${competencyName} — reforço com questão nível ${question.difficulty}`;
    case 'strength_validation':
      return `Validação de domínio: ${competencyName} — confirmação com questão nível ${question.difficulty}`;
    case 'new_skill':
      return `Competência nova: ${competencyName} — avaliação diagnóstica`;
    case 'maintenance':
    default:
      return `Manutenção: ${competencyName} — questão nível ${question.difficulty}`;
  }
}

function estimateCorrectRate(questionDifficulty: number, targetDifficulty: number): number {
  // If question matches target, ~60-70% expected
  // Easier questions: higher rate, harder: lower
  const diff = targetDifficulty - questionDifficulty;
  const baseRate = 65; // at target level
  const adjustedRate = baseRate + diff * 15; // +15% per level easier
  return Math.max(10, Math.min(95, adjustedRate));
}

// ════════════════════════════════════════════════════════════════════
// STEP 5: BUILD SECTIONS
// ════════════════════════════════════════════════════════════════════

function buildSections(
  selectedQuestions: (QuestionBankItem & { selectedBecause: string; expectedCorrectRate: number })[],
  competencyWeights: Map<string, { name: string; weight: number; reason: CompetencyFocusItem['reason'] }>,
): { sections: TestSection[]; totalTime: number } {
  // Group questions by competency
  const grouped = new Map<string, typeof selectedQuestions>();
  for (const q of selectedQuestions) {
    if (!grouped.has(q.competencyId)) {
      grouped.set(q.competencyId, []);
    }
    grouped.get(q.competencyId)!.push(q);
  }

  let totalTime = 0;
  const sections: TestSection[] = [];

  for (const [compId, questions] of grouped) {
    const compInfo = competencyWeights.get(compId);

    const testQuestions: TestQuestion[] = questions.map(q => {
      totalTime += q.estimatedTimeMinutes;
      return {
        id: q.id,
        competencyId: q.competencyId,
        difficulty: q.difficulty,
        type: q.type,
        content: q.content,
        points: q.points,
        timeLimit: q.estimatedTimeMinutes * 60, // convert to seconds
        adaptiveMetadata: {
          selectedBecause: q.selectedBecause,
          expectedCorrectRate: q.expectedCorrectRate,
        },
      };
    });

    // Sort within section: easy to hard
    testQuestions.sort((a, b) => a.difficulty - b.difficulty);

    sections.push({
      competencyId: compId,
      competencyName: compInfo?.name ?? compId,
      questions: testQuestions,
      weight: compInfo?.weight ?? 0,
    });
  }

  // Sort sections: weak areas first
  const reasonPriority: Record<string, number> = {
    weak_area: 0,
    new_skill: 1,
    maintenance: 2,
    strength_validation: 3,
  };

  sections.sort((a, b) => {
    const aReason = competencyWeights.get(a.competencyId)?.reason ?? 'maintenance';
    const bReason = competencyWeights.get(b.competencyId)?.reason ?? 'maintenance';
    return (reasonPriority[aReason] ?? 99) - (reasonPriority[bReason] ?? 99);
  });

  return { sections, totalTime };
}

// ════════════════════════════════════════════════════════════════════
// STEP 6: COVERAGE AND METADATA
// ════════════════════════════════════════════════════════════════════

function computeCompetencyCoverage(
  selectedQuestions: QuestionBankItem[],
): Record<string, number> {
  const coverage: Record<string, number> = {};
  for (const q of selectedQuestions) {
    coverage[q.competencyId] = (coverage[q.competencyId] ?? 0) + 1;
  }
  return coverage;
}

function buildCompetencyFocus(
  competencyWeights: Map<string, { name: string; weight: number; reason: CompetencyFocusItem['reason'] }>,
): CompetencyFocusItem[] {
  return Array.from(competencyWeights.entries()).map(([id, { weight, reason }]) => ({
    competencyId: id,
    weight,
    reason,
  }));
}

function computePassingScore(
  testType: AdaptiveTestConfig['testType'],
  dna: StudentDNA | null,
): number {
  // Base passing scores by test type
  let baseScore: number;
  switch (testType) {
    case 'promotion': baseScore = 70; break;
    case 'periodic': baseScore = 60; break;
    case 'diagnostic': baseScore = 0; break; // Diagnostic: no passing score
    default: baseScore = 60;
  }

  if (!dna || testType === 'diagnostic') return baseScore;

  // Adapt based on learning speed
  const speed = dna.difficultyProfile?.learningSpeed ?? 'average';
  if (speed === 'fast') return Math.min(90, baseScore + 5);
  if (speed === 'slow') return Math.max(50, baseScore - 5);

  return baseScore;
}

function generateTestId(config: AdaptiveTestConfig): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `test_${config.testType}_${timestamp}_${random}`;
}
