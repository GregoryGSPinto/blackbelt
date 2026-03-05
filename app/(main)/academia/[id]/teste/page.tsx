'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight } from 'lucide-react';
import { getAreaById, getTestByAreaId, useAcademyProgress } from '@/lib/academy';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

type Phase = 'quiz' | 'result';

export default function TestPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const area = getAreaById(id);
  const test = getTestByAreaId(id);
  const { submitTestAnswers, resetArea } = useAcademyProgress();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [result, setResult] = useState({ score: 0, total: 0 });

  const handleSelect = useCallback((label: string) => {
    if (showFeedback) return;
    setSelected(label);
    setShowFeedback(true);

    const qId = test!.questions[currentQ].id;
    setAnswers(prev => ({ ...prev, [qId]: label }));

    // Auto-advance after feedback
    setTimeout(() => {
      if (currentQ < test!.questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setShowFeedback(false);
      } else {
        // Submit all answers
        const finalAnswers = { ...answers, [qId]: label };
        const res = submitTestAnswers(id, finalAnswers);
        setResult(res);
        setPhase('result');
      }
    }, 1200);
  }, [showFeedback, currentQ, test, answers, submitTestAnswers, id]);

  const handleRetry = useCallback(() => {
    resetArea(id);
    setCurrentQ(0);
    setAnswers({});
    setSelected(null);
    setShowFeedback(false);
    setPhase('quiz');
    setResult({ score: 0, total: 0 });
  }, [resetArea, id]);

  if (!area || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--color-text))' }}>{t('unit.testNotFound')}</p>
          <button onClick={() => router.push('/academia')} className="text-primary-light text-sm font-medium">
            {t('unit.backToUnit')}
          </button>
        </div>
      </div>
    );
  }

  const Icon = area.icon;
  const question = test.questions[currentQ];
  const isPerfect = result.score === result.total;

  /* ─── RESULT SCREEN ─── */
  if (phase === 'result') {
    return (
      <div className="min-h-screen px-4 md:px-8 tv:px-16 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">

          <button onClick={() => router.push(`/academia/${id}`)}
            className="flex items-center gap-2 text-sm"
            style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
            <ArrowLeft size={16} /> {t('unit.backToContent')}
          </button>

          <div className="rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 text-center"
            style={{
              background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgb(var(--color-border) / 0.06)',
            }}>

            {/* Score circle */}
            <div className="mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-6"
              style={{
                background: isPerfect
                  ? `linear-gradient(135deg, ${area.accentDark}, ${area.accent})`
                  : 'rgb(var(--color-border) / 0.08)',
                boxShadow: isPerfect ? `0 8px 32px ${area.accentDark}40` : 'none',
              }}>
              <div className="text-center">
                <p className={`text-4xl font-black ${isPerfect ? 'text-white' : ''}`}
                  style={!isPerfect ? { color: area.accent } : undefined}>
                  {result.score}/{result.total}
                </p>
              </div>
            </div>

            {isPerfect ? (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy size={22} style={{ color: area.accent }} />
                  <h2 className="text-2xl font-extrabold" style={{ color: 'rgb(var(--color-text))' }}>{t('unit.perfect')}</h2>
                </div>
                <p style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
                  {t('unit.mastered', { area: area.title })}
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'rgb(var(--color-text))' }}>
                  {t('unit.goodWork')}
                </h2>
                <p style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
                  {t('unit.goodWorkDesc', { score: result.score, total: result.total })}
                </p>
              </div>
            )}

            {/* Progress updated indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ background: 'rgb(var(--color-border) / 0.06)' }}>
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold" style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
                {t('unit.progressUpdated')}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button onClick={handleRetry}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: 'rgb(var(--color-border) / 0.08)',
                  color: 'rgb(var(--color-text) / 0.7)',
                  border: '1px solid rgb(var(--color-border) / 0.1)',
                }}>
                <RotateCcw size={15} /> {t('unit.retakeTestBtn')}
              </button>
              <button onClick={() => router.push('/academia')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${area.accentDark}, ${area.accent})`,
                }}>
                {t('unit.viewAllAreas')} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── QUIZ SCREEN ─── */
  return (
    <div className="min-h-screen px-4 md:px-8 tv:px-16 py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        <button onClick={() => router.push(`/academia/${id}`)}
          className="flex items-center gap-2 text-sm"
          style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
          <ArrowLeft size={16} /> {t('unit.backToContent')}
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${area.accentDark}, ${area.accent})`,
              boxShadow: `0 4px 16px ${area.accentDark}40`,
            }}>
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'rgb(var(--color-text))' }}>
              Teste: {area.title}
            </h1>
            <p className="text-sm" style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
              {t('unit.questionOf', { current: currentQ + 1, total: test.questions.length })}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {test.questions.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i < currentQ
                  ? `linear-gradient(90deg, ${area.accentDark}, ${area.accent})`
                  : i === currentQ
                    ? area.accent
                    : 'rgb(var(--color-border) / 0.1)',
              }} />
          ))}
        </div>

        {/* Question card */}
        <div className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgb(var(--color-border) / 0.06)',
          }}>

          <p className="text-lg md:text-xl font-bold leading-snug mb-8"
            style={{ color: 'rgb(var(--color-text))' }}>
            {question.question}
          </p>

          <div className="space-y-3">
            {question.options.map((opt) => {
              const isCorrect = opt.label === question.correctAnswer;
              const isSelected = selected === opt.label;
              const showCorrect = showFeedback && isCorrect;
              const showWrong = showFeedback && isSelected && !isCorrect;

              let bg = 'rgb(var(--color-border) / 0.04)';
              let border = 'rgb(var(--color-border) / 0.08)';
              let labelBg = 'rgb(var(--color-border) / 0.08)';
              let labelColor = 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))';
              let textColor = 'rgb(var(--color-text) / 0.75)';

              if (showCorrect) {
                bg = 'rgba(143,175,122,0.08)';
                border = 'rgba(143,175,122,0.3)';
                labelBg = 'rgba(143,175,122,0.2)';
                labelColor = '#8FAF7A';
                textColor = '#8FAF7A';
              } else if (showWrong) {
                bg = 'rgba(196,122,106,0.08)';
                border = 'rgba(196,122,106,0.3)';
                labelBg = 'rgba(196,122,106,0.2)';
                labelColor = '#C47A6A';
                textColor = '#C47A6A';
              } else if (isSelected && !showFeedback) {
                border = area.accent;
              }

              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.label)}
                  disabled={showFeedback}
                  className="w-full flex items-center gap-4 p-4 md:p-5 rounded-xl text-left transition-all duration-200 active:scale-[0.98]"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ background: labelBg, color: labelColor }}>
                    {showCorrect ? <CheckCircle size={18} /> : showWrong ? <XCircle size={18} /> : opt.label}
                  </div>
                  <span className="text-[15px] font-medium" style={{ color: textColor }}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className="mt-6 p-4 rounded-xl text-center text-sm font-medium"
              style={{
                background: selected === question.correctAnswer
                  ? 'rgba(143,175,122,0.08)'
                  : 'rgba(196,122,106,0.08)',
                color: selected === question.correctAnswer ? '#8FAF7A' : '#C47A6A',
              }}>
              {selected === question.correctAnswer
                ? `✓ ${t('unit.correct')}`
                : `✗ ${t('unit.incorrect', { answer: question.correctAnswer })}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
