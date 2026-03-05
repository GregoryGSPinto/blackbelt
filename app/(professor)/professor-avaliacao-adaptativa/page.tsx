'use client';

import { useAdaptiveTest } from '@/hooks/useAdaptiveTest';
import { AdaptiveTestGenerator } from '@/components/professor/AdaptiveTestGenerator';
import { Brain } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function ProfessorAvaliacaoAdaptativaPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { error } = useAdaptiveTest();

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <Brain size={20} className="text-violet-400" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
            Avaliacao Adaptativa
          </h1>
        </div>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
          Gere provas personalizadas com inteligencia artificial. A IA analisa o
          historico do aluno, identifica pontos fortes e fracos, e cria
          avaliacoes sob medida para cada nivel e objetivo pedagogico.
        </p>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg mt-0.5">💡</span>
          <div>
            <p className="text-zinc-300 text-sm font-medium">
              Como funciona?
            </p>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Selecione o aluno, a turma e o tipo de avaliacao. A IA ira gerar
              questoes adaptadas ao nivel atual do praticante, considerando
              tecnicas ja dominadas e areas que precisam de mais pratica.
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-red-400 text-sm font-medium">
            Erro ao gerar avaliacao
          </p>
          <p className="text-red-400/60 text-xs mt-1">{error.message}</p>
        </div>
      )}

      {/* Generator Component */}
      <AdaptiveTestGenerator />
    </div>
  );
}
