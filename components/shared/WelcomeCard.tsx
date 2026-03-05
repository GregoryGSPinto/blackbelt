// ============================================================
// WelcomeCard — First-visit dismissable welcome message
// ============================================================
// Shows a personalized welcome card on the user's first visit.
// Dismissable, persists dismissed state in localStorage.
// Profile-specific next steps and styling.
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronRight, Sparkles } from 'lucide-react';

// ── Types ──

interface WelcomeStep {
  emoji: string;
  textKey: string;
  href?: string;
}

interface WelcomeConfig {
  greeting: string;
  subtitle: string;
  steps: WelcomeStep[];
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

interface WelcomeCardProps {
  profileKey: 'aluno' | 'instrutor' | 'responsavel' | 'admin';
  userName?: string;
}

// ── Profile configs ──

const PROFILE_CONFIGS: Record<string, WelcomeConfig> = {
  aluno: {
    greeting: 'welcomeBlackBelt',
    subtitle: 'welcomeSubtitle',
    steps: [
      { emoji: '🥋', textKey: 'steps.aluno.session', href: '/inicio' },
      { emoji: '📊', textKey: 'steps.aluno.frequency', href: '/meu-perfil-esportivo' },
      { emoji: '🎬', textKey: 'steps.aluno.techniques', href: '/inicio' },
      { emoji: '🏆', textKey: 'steps.aluno.ranking', href: '/ranking' },
    ],
    accentColor: '#EF4444',
    gradientFrom: 'rgba(239,68,68,0.15)',
    gradientTo: 'rgba(239,68,68,0.03)',
  },
  instrutor: {
    greeting: 'welcomeBlackBelt',
    subtitle: 'welcomeSubtitle',
    steps: [
      { emoji: '📋', textKey: 'steps.instrutor.dashboard', href: '/professor-dashboard' },
      { emoji: '✅', textKey: 'steps.instrutor.attendance', href: '/professor-chamada' },
      { emoji: '👥', textKey: 'steps.instrutor.progress', href: '/professor-alunos' },
      { emoji: '⏱️', textKey: 'steps.instrutor.timer', href: '/professor-cronometro' },
    ],
    accentColor: '#3B82F6',
    gradientFrom: 'rgba(59,130,246,0.15)',
    gradientTo: 'rgba(59,130,246,0.03)',
  },
  responsavel: {
    greeting: 'welcomeBlackBelt',
    subtitle: 'welcomeSubtitle',
    steps: [
      { emoji: '📈', textKey: 'steps.responsavel.frequency', href: '/painel-responsavel' },
      { emoji: '🏅', textKey: 'steps.responsavel.achievements', href: '/painel-responsavel/progresso' },
      { emoji: '💬', textKey: 'steps.responsavel.message', href: '/painel-responsavel' },
    ],
    accentColor: '#22C55E',
    gradientFrom: 'rgba(34,197,94,0.15)',
    gradientTo: 'rgba(34,197,94,0.03)',
  },
  admin: {
    greeting: 'welcomeBlackBelt',
    subtitle: 'welcomeSubtitle',
    steps: [
      { emoji: '📊', textKey: 'steps.admin.dashboard', href: '/dashboard' },
      { emoji: '👥', textKey: 'steps.admin.manage', href: '/usuarios' },
      { emoji: '🔔', textKey: 'steps.admin.alerts', href: '/automacoes' },
    ],
    accentColor: '#FBBF24',
    gradientFrom: 'rgba(251,191,36,0.15)',
    gradientTo: 'rgba(251,191,36,0.03)',
  },
};

const STORAGE_KEY = 'blackbelt_welcome_dismissed';

function isDismissed(profileKey: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      return !!map[profileKey];
    }
  } catch { /* ignore */ }
  return false;
}

function setDismissed(profileKey: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[profileKey] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

// ── Component ──

export function WelcomeCard({ profileKey, userName }: WelcomeCardProps) {
  const t = useTranslations('common.greeting');
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isDismissed(profileKey)) {
      setVisible(true);
    }
  }, [profileKey]);

  const config = PROFILE_CONFIGS[profileKey] || PROFILE_CONFIGS.aluno;

  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setDismissed(profileKey);
      setVisible(false);
    }, 300);
  };

  if (!visible) return null;

  const displayName = userName ? `, ${userName.split(' ')[0]}` : '';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
        border: `1px solid ${config.accentColor}20`,
        animation: 'anim-fade-in 500ms ease',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors bg-white/5 hover:bg-white/10"
        aria-label={t('dismissWelcome')}
      >
        <X size={12} className="text-white/40" />
      </button>

      <div className="p-5 pr-12">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${config.accentColor}20` }}
          >
            <Sparkles size={14} style={{ color: config.accentColor }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white/90">
              {t(config.greeting)}{displayName}! 🦁
            </h3>
            <p className="text-[11px] text-white/35 mt-0.5">{t(config.subtitle)}</p>
          </div>
        </div>

        {/* Next steps */}
        <div className="space-y-1.5 ml-0.5">
          {config.steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 py-1.5 group"
              style={{ animation: `anim-fade-in 300ms ease ${(i + 1) * 80}ms both` }}
            >
              <span className="text-sm flex-shrink-0">{step.emoji}</span>
              <p className="text-xs text-white/55 leading-relaxed flex-1">{t(step.textKey)}</p>
              {step.href && (
                <ChevronRight size={10} className="text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
