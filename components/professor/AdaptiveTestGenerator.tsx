'use client';

import { useState } from 'react';
import { useAdaptiveTest } from '@/hooks/useAdaptiveTest';
import { useTranslations } from 'next-intl';

// ════════════════════════════════════════════════════════════════════
// ADAPTIVE TEST GENERATOR — Gerador de provas adaptativas
// ════════════════════════════════════════════════════════════════════

export function AdaptiveTestGenerator() {
  const t = useTranslations('professor.adaptiveEval');
  const { generate, test, loading, error } = useAdaptiveTest();
  const [form, setForm] = useState({
    participantId: '',
    trackId: '',
    targetMilestoneId: '',
    testType: 'promotion' as 'promotion' | 'periodic' | 'diagnostic',
    maxQuestions: 15,
  });

  const handleGenerate = async () => {
    if (!form.participantId || !form.trackId || !form.targetMilestoneId) return;
    try {
      await generate(form);
    } catch {
      // Error is handled via hook's error state
    }
  };

  const testTypeLabels: Record<string, string> = {
    promotion: t('testTypes.promotion'),
    periodic: t('testTypes.periodic'),
    diagnostic: t('testTypes.diagnostic'),
  };

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <h3 className="text-sm font-medium text-zinc-300">{t('generateTitle')}</h3>
        <p className="text-[10px] text-zinc-600 mt-0.5">{t('generateSubtitle')}</p>
      </div>

      {/* Form */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
              {t('studentId')}
            </label>
            <input
              type="text"
              value={form.participantId}
              onChange={e => setForm(f => ({ ...f, participantId: e.target.value }))}
              placeholder="ID do participante"
              className="w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
              {t('trackId')}
            </label>
            <input
              type="text"
              value={form.trackId}
              onChange={e => setForm(f => ({ ...f, trackId: e.target.value }))}
              placeholder="ID da trilha"
              className="w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
              {t('milestone')}
            </label>
            <input
              type="text"
              value={form.targetMilestoneId}
              onChange={e => setForm(f => ({ ...f, targetMilestoneId: e.target.value }))}
              placeholder="ID do milestone"
              className="w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
              Tipo de Prova
            </label>
            <select
              value={form.testType}
              onChange={e => setForm(f => ({ ...f, testType: e.target.value as typeof form.testType }))}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-sm text-zinc-200 focus:border-blue-500/50 focus:outline-none transition-colors"
            >
              <option value="promotion">Promocao</option>
              <option value="periodic">Periodica</option>
              <option value="diagnostic">Diagnostica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
            Maximo de Questoes: {form.maxQuestions}
          </label>
          <input
            type="range"
            min={5}
            max={30}
            value={form.maxQuestions}
            onChange={e => setForm(f => ({ ...f, maxQuestions: parseInt(e.target.value) }))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-700">
            <span>5</span>
            <span>30</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-xs text-red-400">{error.message}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !form.participantId || !form.trackId || !form.targetMilestoneId}
          className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium transition-colors"
        >
          {loading ? '...' : t('generateTitle')}
        </button>
      </div>

      {/* Test Preview */}
      {test && (
        <div className="border-t border-white/[0.08]">
          <div className="px-4 py-3 bg-zinc-800/30 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-zinc-200">Prova Gerada</span>
              <span className="text-[10px] text-zinc-500 ml-2">
                {testTypeLabels[test.config.testType]} - {test.sections.reduce((sum, s) => sum + s.questions.length, 0)} questoes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">
                ~{test.estimatedDuration} min
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                Nota min: {test.passingScore}
              </span>
            </div>
          </div>

          {/* Difficulty distribution */}
          <div className="px-4 py-3 border-t border-white/[0.08]/50">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-2">
              Distribuicao de Dificuldade
            </span>
            <div className="flex h-4 rounded-lg overflow-hidden">
              {test.difficultyDistribution.easy > 0 && (
                <div
                  className="bg-green-500 flex items-center justify-center"
                  style={{ width: `${test.difficultyDistribution.easy}%` }}
                >
                  {test.difficultyDistribution.easy >= 15 && (
                    <span className="text-[9px] font-medium text-white">{test.difficultyDistribution.easy}%</span>
                  )}
                </div>
              )}
              {test.difficultyDistribution.medium > 0 && (
                <div
                  className="bg-yellow-500 flex items-center justify-center"
                  style={{ width: `${test.difficultyDistribution.medium}%` }}
                >
                  {test.difficultyDistribution.medium >= 15 && (
                    <span className="text-[9px] font-medium text-white">{test.difficultyDistribution.medium}%</span>
                  )}
                </div>
              )}
              {test.difficultyDistribution.hard > 0 && (
                <div
                  className="bg-orange-500 flex items-center justify-center"
                  style={{ width: `${test.difficultyDistribution.hard}%` }}
                >
                  {test.difficultyDistribution.hard >= 15 && (
                    <span className="text-[9px] font-medium text-white">{test.difficultyDistribution.hard}%</span>
                  )}
                </div>
              )}
              {test.difficultyDistribution.stretch > 0 && (
                <div
                  className="bg-red-500 flex items-center justify-center"
                  style={{ width: `${test.difficultyDistribution.stretch}%` }}
                >
                  {test.difficultyDistribution.stretch >= 15 && (
                    <span className="text-[9px] font-medium text-white">{test.difficultyDistribution.stretch}%</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-1.5">
              <span className="text-[9px] text-green-400">Facil</span>
              <span className="text-[9px] text-yellow-400">Media</span>
              <span className="text-[9px] text-orange-400">Dificil</span>
              <span className="text-[9px] text-red-400">Stretch</span>
            </div>
          </div>

          {/* Sections */}
          <div className="divide-y divide-zinc-800/50">
            {test.sections.map((section, sIdx) => (
              <div key={sIdx} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-300">{section.competencyName}</span>
                  <span className="text-[10px] text-zinc-600">
                    {section.questions.length} questoes - Peso: {Math.round(section.weight * 100)}%
                  </span>
                </div>
                <div className="space-y-1.5">
                  {section.questions.map((q, qIdx) => (
                    <div key={q.id} className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-700 w-5 text-right">{qIdx + 1}.</span>
                      <span className="text-zinc-400 flex-1 truncate">{q.content.title}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${
                        q.difficulty <= 2 ? 'bg-green-500/20 text-green-400' :
                        q.difficulty <= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        D{q.difficulty}
                      </span>
                      <span className="text-zinc-700">{q.points}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
