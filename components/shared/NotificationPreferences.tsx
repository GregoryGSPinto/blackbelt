// ============================================================
// NotificationPreferences — Notification toggles per category
// ============================================================
// Allows users to control which notifications they receive
// and at what frequency. Persists in localStorage.
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BookOpen, Megaphone, MessageSquare, Trophy, Clock } from 'lucide-react';

// ── Types ──

interface NotifCategory {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  color: string;
}

type Frequency = 'imediato' | 'diario' | 'semanal';

interface NotifPrefs {
  categories: Record<string, boolean>;
  frequency: Frequency;
}

const CATEGORIES: NotifCategory[] = [
  { id: 'sessões', label: 'Sessões', description: 'Lembretes de sessões e horários', icon: BookOpen, color: '#3B82F6' },
  { id: 'mensagens', label: 'Mensagens', description: 'Mensagens de instrutores e admin', icon: MessageSquare, color: '#22C55E' },
  { id: 'ranking', label: 'Ranking & Conquistas', description: 'Posição no ranking e novos badges', icon: Trophy, color: '#FBBF24' },
  { id: 'promocoes', label: 'Promoções', description: 'Ofertas e eventos da unidade', icon: Megaphone, color: '#8B5CF6' },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string; desc: string }[] = [
  { value: 'imediato', label: 'Imediato', desc: 'Receber na hora' },
  { value: 'diario', label: 'Diário', desc: 'Resumo 1x ao dia' },
  { value: 'semanal', label: 'Semanal', desc: 'Resumo semanal' },
];

const STORAGE_KEY = 'blackbelt_notif_prefs';

function loadPrefs(): NotifPrefs {
  if (typeof window === 'undefined') return defaultPrefs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultPrefs();
}

function defaultPrefs(): NotifPrefs {
  return {
    categories: { sessões: true, mensagens: true, ranking: true, promocoes: false },
    frequency: 'imediato',
  };
}

function savePrefs(prefs: NotifPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

// ── Component ──

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotifPrefs>(defaultPrefs);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setPrefs((prev: NotifPrefs) => {
      const next: NotifPrefs = {
        ...prev,
        categories: { ...prev.categories, [id]: !prev.categories[id] },
      };
      savePrefs(next);
      return next;
    });
  }, []);

  const setFrequency = useCallback((freq: Frequency) => {
    setPrefs((prev: NotifPrefs) => {
      const next: NotifPrefs = { ...prev, frequency: freq };
      savePrefs(next);
      return next;
    });
  }, []);

  return (
    <div className="space-y-5">
      {/* Category toggles */}
      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          const enabled = prefs.categories[cat.id] ?? false;
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200"
              style={{
                background: enabled ? `${cat.color}08` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${enabled ? `${cat.color}20` : 'rgba(255,255,255,0.05)'}`,
              }}
              aria-label={`${enabled ? 'Desativar' : 'Ativar'} notificações de ${cat.label}`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${cat.color}15` }}
              >
                <cat.icon size={14} style={{ color: enabled ? cat.color : 'rgba(255,255,255,0.2)' }} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium ${enabled ? 'text-white/80' : 'text-white/30'}`}>
                  {cat.label}
                </p>
                <p className="text-[10px] text-white/25 truncate">{cat.description}</p>
              </div>
              {/* Toggle pill */}
              <div
                className="w-10 h-5.5 rounded-full relative flex-shrink-0 transition-all duration-200"
                style={{
                  background: enabled ? cat.color : 'rgba(255,255,255,0.08)',
                  width: 40,
                  height: 22,
                }}
              >
                <div
                  className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200"
                  style={{ left: enabled ? 20 : 2 }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Frequency selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={12} className="text-white/25" />
          <p className="text-xs text-white/40 font-medium">Frequência</p>
        </div>
        <div className="flex gap-2">
          {FREQUENCY_OPTIONS.map((opt) => {
            const active = prefs.frequency === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-center transition-all duration-200 ${
                  active
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'bg-white/[0.02] text-white/30 border border-white/[0.04] hover:bg-white/[0.04]'
                }`}
              >
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[9px] text-white/20 mt-0.5">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
