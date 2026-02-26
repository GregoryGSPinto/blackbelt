// ============================================================
// StudentExtraSections — Privacy, Physical Data, LGPD, Goals
// ============================================================
// Renders below the existing tab-based settings.
// Self-contained with localStorage persistence.
// ============================================================
'use client';

import { useState, useCallback } from 'react';
import {
  Scale, Shield, Download, Trash2, Target,
  Eye, EyeOff, Trophy, Loader2, AlertTriangle,
} from 'lucide-react';

// ── Storage helpers ──

const PRIVACY_KEY = 'blackbelt_privacy_prefs';
const PHYSICAL_KEY = 'blackbelt_physical_data';
const GOALS_KEY = 'blackbelt_goals';

function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

function saveJSON(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* */ }
}

// ── Section wrapper ──

function Section({ title, icon: Icon, children }: {
  title: string; icon: typeof Scale; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-red-400/60" />
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Toggle helper ──

function Toggle({ label, description, value, onChange }: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-xs text-white/60">{label}</p>
        {description && <p className="text-[9px] text-white/25 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-green-500/40' : 'bg-white/10'}`}
        role="switch"
        aria-checked={value}
      >
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${value ? 'left-5.5' : 'left-0.5'}`}
          style={{ left: value ? '22px' : '2px' }}
        />
      </button>
    </div>
  );
}

// ── Main component ──

const CATEGORIAS_PESO = [
  'Galo', 'Pluma', 'Pena', 'Leve', 'Médio',
  'Meio-Pesado', 'Pesado', 'Super-Pesado', 'Pesadíssimo',
];

export function StudentExtraSections() {
  // Physical data
  const [physical, setPhysical] = useState(() => loadJSON(PHYSICAL_KEY, { peso: '', altura: '', categoria: '' }));

  // Privacy
  const [privacy, setPrivacy] = useState(() => loadJSON(PRIVACY_KEY, {
    exibirConquistas: true, aparecerRanking: true, professorVerEvolucao: true,
  }));

  // Goals
  const [goals, setGoals] = useState(() => loadJSON(GOALS_KEY, { objetivo: '', prazo: '' }));

  // LGPD
  const [exporting, setExporting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteRequested, setDeleteRequested] = useState(false);

  const savePhysical = useCallback((data: typeof physical) => {
    setPhysical(data);
    saveJSON(PHYSICAL_KEY, data);
  }, []);

  const savePrivacy = useCallback((data: typeof privacy) => {
    setPrivacy(data);
    saveJSON(PRIVACY_KEY, data);
  }, []);

  const saveGoals = useCallback((data: typeof goals) => {
    setGoals(data);
    saveJSON(GOALS_KEY, data);
  }, []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 500));
    const blob = new Blob([JSON.stringify({ physical, privacy, goals, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'blackbelt_meus_dados.json'; a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }, [physical, privacy, goals]);

  return (
    <div className="space-y-4 mt-6">
      {/* ── Dados Físicos ── */}
      <Section title="Dados Físicos" icon={Scale}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[9px] text-white/25 block mb-1">Peso (kg)</label>
            <input
              type="number"
              step={0.1}
              value={physical.peso}
              onChange={(e: { target: { value: string } }) => savePhysical({ ...physical, peso: e.target.value })}
              placeholder="75.0"
              className="w-full px-2 py-1.5 rounded-lg text-xs text-white/70 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="text-[9px] text-white/25 block mb-1">Altura (cm)</label>
            <input
              type="number"
              value={physical.altura}
              onChange={(e: { target: { value: string } }) => savePhysical({ ...physical, altura: e.target.value })}
              placeholder="178"
              className="w-full px-2 py-1.5 rounded-lg text-xs text-white/70 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="text-[9px] text-white/25 block mb-1">Categoria</label>
            <select
              value={physical.categoria}
              onChange={(e: { target: { value: string } }) => savePhysical({ ...physical, categoria: e.target.value })}
              className="w-full px-2 py-1.5 rounded-lg text-xs text-white/70 outline-none appearance-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <option value="">Selecionar</option>
              {CATEGORIAS_PESO.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* ── Privacidade ── */}
      <Section title="Privacidade" icon={privacy.exibirConquistas ? Eye : EyeOff}>
        <Toggle
          label="Exibir conquistas publicamente"
          description="Suas conquistas e subniveis aparecem para outros alunos"
          value={privacy.exibirConquistas}
          onChange={(v: boolean) => savePrivacy({ ...privacy, exibirConquistas: v })}
        />
        <Toggle
          label="Aparecer no ranking"
          description="Seu nome aparece na tabela de ranking da unidade"
          value={privacy.aparecerRanking}
          onChange={(v: boolean) => savePrivacy({ ...privacy, aparecerRanking: v })}
        />
        <Toggle
          label="Professor pode ver minha evolução"
          description="O instrutor acessa seu progresso e frequência detalhada"
          value={privacy.professorVerEvolucao}
          onChange={(v: boolean) => savePrivacy({ ...privacy, professorVerEvolucao: v })}
        />
      </Section>

      {/* ── Meus Dados (LGPD) ── */}
      <Section title="Meus Dados (LGPD)" icon={Shield}>
        <p className="text-[10px] text-white/25 leading-relaxed">
          Seus dados são protegidos pela Lei Geral de Proteção de Dados (LGPD). Você tem direito de exportar ou solicitar a exclusão dos seus dados a qualquer momento.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 transition-colors border border-blue-500/15"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Exportar meus dados
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            disabled={deleteRequested}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/15 transition-colors border border-red-500/15 disabled:opacity-40"
          >
            <Trash2 size={12} />
            {deleteRequested ? 'Exclusão Solicitada' : 'Solicitar exclusão'}
          </button>
        </div>

        {/* Delete modal */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal(false)} />
            <div className="relative w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <h4 className="text-sm font-bold text-white/80">Solicitar Exclusão de Conta</h4>
              </div>
              <p className="text-xs text-white/40">Esta ação é irreversível. Todos os seus dados serão excluídos em até 30 dias.</p>
              <textarea
                value={deleteReason}
                onChange={(e: { target: { value: string } }) => setDeleteReason(e.target.value)}
                placeholder="Motivo (opcional)"
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-xs text-white/70 placeholder:text-white/15 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs text-white/40 border border-white/[0.06]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { setDeleteRequested(true); setDeleteModal(false); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600/80 hover:bg-red-500"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Objetivos ── */}
      <Section title="Objetivos" icon={Target}>
        <textarea
          value={goals.objetivo}
          onChange={(e: { target: { value: string } }) => saveGoals({ ...goals, objetivo: e.target.value })}
          placeholder="Qual seu objetivo no treinamento especializado?"
          maxLength={300}
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-xs text-white/70 placeholder:text-white/15 outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        />
        <div className="flex items-center gap-3">
          <label className="text-[10px] text-white/25">Prazo:</label>
          <select
            value={goals.prazo}
            onChange={(e: { target: { value: string } }) => saveGoals({ ...goals, prazo: e.target.value })}
            className="px-2 py-1.5 rounded-lg text-xs text-white/70 outline-none appearance-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <option value="">Sem prazo</option>
            <option value="3m">3 meses</option>
            <option value="6m">6 meses</option>
            <option value="1a">1 ano</option>
          </select>
        </div>
      </Section>
    </div>
  );
}
