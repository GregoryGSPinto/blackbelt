// ============================================================
// ParentPreferences — Notification and contact preferences
// ============================================================
'use client';

import { useState, useCallback } from 'react';
import { Bell, Save, Loader2 } from 'lucide-react';

const PREFS_KEY = 'blackbelt_parent_prefs';

function load() {
  try { const r = localStorage.getItem(PREFS_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

function persist(data: unknown) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(data)); } catch { /* */ }
}

interface ParentPrefs {
  notifFrequencia: boolean;
  notifProgresso: boolean;
  notifMensagens: boolean;
  relatorioFreq: 'diario' | 'semanal' | 'mensal';
  contatoPref: 'whatsapp' | 'email' | 'app';
}

const DEFAULTS: ParentPrefs = {
  notifFrequencia: true, notifProgresso: true, notifMensagens: true,
  relatorioFreq: 'semanal', contatoPref: 'whatsapp',
};

export function ParentPreferences() {
  const [prefs, setPrefs] = useState<ParentPrefs>(() => ({ ...DEFAULTS, ...load() }));
  const [saving, setSaving] = useState(false);

  const update = useCallback((partial: Partial<ParentPrefs>) => {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    persist(next);
  }, [prefs]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    persist(prefs);
    setSaving(false);
  }, [prefs]);

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2">
        <Bell size={14} className="text-green-400/60" />
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Preferências de Comunicação</h3>
      </div>

      {/* Notification toggles */}
      <div className="space-y-2">
        {[
          { key: 'notifFrequencia' as const, label: 'Frequência do filho', desc: 'Receber alertas de presença/ausência' },
          { key: 'notifProgresso' as const, label: 'Progresso', desc: 'Notificar sobre graduações e conquistas' },
          { key: 'notifMensagens' as const, label: 'Mensagens', desc: 'Avisar quando instrutor enviar mensagem' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-1.5">
            <div>
              <p className="text-xs text-white/60">{label}</p>
              <p className="text-[9px] text-white/25">{desc}</p>
            </div>
            <button
              onClick={() => update({ [key]: !prefs[key] })}
              className={`w-10 h-5 rounded-full transition-colors relative ${prefs[key] ? 'bg-green-500/40' : 'bg-white/10'}`}
            >
              <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: prefs[key] ? '22px' : '2px' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Frequency */}
      <div className="flex items-center gap-3">
        <label className="text-[10px] text-white/30">Frequência de relatório:</label>
        <div className="flex gap-1">
          {(['diario', 'semanal', 'mensal'] as const).map((f) => (
            <button
              key={f}
              onClick={() => update({ relatorioFreq: f })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                prefs.relatorioFreq === f
                  ? 'bg-green-500/15 text-green-300 border-green-500/20'
                  : 'bg-white/[0.02] text-white/25 border-white/[0.04]'
              }`}
              style={{ border: `1px solid ${prefs.relatorioFreq === f ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)'}` }}
            >
              {f === 'diario' ? 'Diário' : f === 'semanal' ? 'Semanal' : 'Mensal'}
            </button>
          ))}
        </div>
      </div>

      {/* Contact preference */}
      <div className="flex items-center gap-3">
        <label className="text-[10px] text-white/30">Contato preferencial:</label>
        <div className="flex gap-1">
          {(['whatsapp', 'email', 'app'] as const).map((c) => (
            <button
              key={c}
              onClick={() => update({ contatoPref: c })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                prefs.contatoPref === c
                  ? 'bg-green-500/15 text-green-300 border-green-500/20'
                  : 'bg-white/[0.02] text-white/25 border-white/[0.04]'
              }`}
              style={{ border: `1px solid ${prefs.contatoPref === c ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)'}` }}
            >
              {c === 'whatsapp' ? 'WhatsApp' : c === 'email' ? 'Email' : 'App'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-green-200 bg-green-600/20 hover:bg-green-600/30 transition-colors"
      >
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
        Salvar Preferências
      </button>
    </div>
  );
}
