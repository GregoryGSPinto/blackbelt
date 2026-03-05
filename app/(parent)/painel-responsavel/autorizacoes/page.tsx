'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, UserPlus, X, Phone, User, Clock,
  CheckCircle, ToggleLeft, ToggleRight, History,
} from 'lucide-react';
import * as kidsSafety from '@/lib/api/kids-safety.service';
import type { PessoaAutorizada, AutorizacaoSaida } from '@/lib/api/kids-safety.service';
import { AuthorizationToggle } from '@/components/parent/AuthorizationToggle';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { ParentPreferences } from '@/components/parent/ParentPreferences';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function AutorizacoesPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [pessoas, setPessoas] = useState<PessoaAutorizada[]>([]);
  const [saidas, setSaidas] = useState<AutorizacaoSaida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', parentesco: '' });

  useEffect(() => {
    setLoading(true);
    Promise.all([kidsSafety.getPessoasAutorizadas('RESP001'), kidsSafety.getHistoricoSaidas()])
      .then(([p, s]) => { setPessoas(p); setSaidas(s); })
      .catch((err: unknown) => setError(handleServiceError(err, 'Autorizações')))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = useCallback(async () => {
    if (!form.nome || !form.cpf || !form.telefone || !form.parentesco) return;
    try {
      const nova = await kidsSafety.addPessoaAutorizada({
        responsavelId: 'RESP001', alunoId: 'ALU005',
        nome: form.nome, cpf: form.cpf, telefone: form.telefone,
        parentesco: form.parentesco, ativa: true,
      });
      setPessoas(prev => [...prev, nova]);
      setForm({ nome: '', cpf: '', telefone: '', parentesco: '' });
      setShowAdd(false);
    } catch { /* noop */ }
  }, [form]);

  const handleToggle = useCallback(async (id: string, ativa: boolean) => {
    try {
      const updated = await kidsSafety.togglePessoaAutorizada(id, ativa);
      setPessoas(prev => prev.map(p => p.id === id ? updated : p));
    } catch { /* noop */ }
  }, []);

  if (loading) return <PremiumLoader />;
  if (error) return <PageError error={error} onRetry={() => window.location.reload()} />;

  const ativas = pessoas.filter(p => p.ativa);
  const inativas = pessoas.filter(p => !p.ativa);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
            <ShieldCheck size={20} className="text-emerald-400" />
            Pessoas Autorizadas
          </h1>
          <p className="text-sm text-white/40 mt-1">Gerencie quem pode buscar seu(s) filho(s)</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors">
          <UserPlus size={14} /> Adicionar
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <ShieldCheck size={16} className="text-blue-400/60 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-300/50 leading-relaxed">
          Apenas pessoas cadastradas aqui poderão buscar seu filho na unidade. A recepção verificará a identidade antes de liberar.
        </p>
      </div>

      {/* Active persons */}
      <div>
        <h2 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.75rem', fontWeight: 400 }}>Ativas ({ativas.length})</h2>
        <div className="space-y-2">
          {ativas.map(p => (
            <PersonCard key={p.id} pessoa={p} onToggle={handleToggle} />
          ))}
          {ativas.length === 0 && (
            <p className="text-xs text-white/20 italic py-4 text-center">Nenhuma pessoa autorizada ativa</p>
          )}
        </div>
      </div>

      {/* Inactive */}
      {inativas.length > 0 && (
        <div>
          <h2 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.75rem', fontWeight: 400 }}>Desativadas ({inativas.length})</h2>
          <div className="space-y-2">
            {inativas.map(p => (
              <PersonCard key={p.id} pessoa={p} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      )}

      {/* Exit history */}
      <div>
        <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
          <History size={14} /> Histórico de Saídas
        </h2>
        <div className="space-y-2">
          {saidas.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <CheckCircle size={14} className="text-emerald-400/50 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60"><span className="font-bold">{s.alunoNome}</span> saiu com <span className="font-bold">{s.pessoaAutorizadaNome}</span></p>
                <p className="text-[9px] text-white/20">{s.parentesco} · Validado por {s.validadoPor}</p>
              </div>
              <span className="text-[10px] text-white/20 shrink-0">
                {new Date(s.dataHoraSaida).toLocaleDateString('pt-BR')} {new Date(s.dataHoraSaida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0D1117] border border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Nova Pessoa Autorizada</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-white/[0.06] text-white/30"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <Input label="Nome completo" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} placeholder="Maria Helena Santos" />
              <Input label="CPF" value={form.cpf} onChange={v => setForm(p => ({ ...p, cpf: v }))} placeholder="123.456.789-00" />
              <Input label="Telefone" value={form.telefone} onChange={v => setForm(p => ({ ...p, telefone: v }))} placeholder="(31) 99876-1234" />
              <Input label="Parentesco" value={form.parentesco} onChange={v => setForm(p => ({ ...p, parentesco: v }))} placeholder="Avó, Tio, Babá, etc." />
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-white/[0.06]">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 text-sm font-bold">Cancelar</button>
              <button onClick={handleAdd} disabled={!form.nome || !form.cpf}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm font-bold disabled:opacity-30">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Autorizações Legais (Wave 13.3) ── */}
      <AuthorizacoesLegais />

      {/* ── Preferências de Comunicação ── */}
      <ParentPreferences />
    </div>
  );
}

// ── Autorizações Legais sub-component ──
function AuthorizacoesLegais() {
  const AUTH_KEY = 'blackbelt_parent_auths';
  const loadAuths = () => {
    try { const r = localStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
  };
  const [auths, setAuths] = useState<Record<string, { enabled: boolean; date?: string }>>(() => loadAuths());
  const toggle = (key: string, enabled: boolean) => {
    const next = { ...auths, [key]: { enabled, date: enabled ? new Date().toISOString() : undefined } };
    setAuths(next);
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(next)); } catch { /* */ }
  };

  return (
    <section className="space-y-3">
      <p className="text-white/30 text-xs tracking-[0.15em] uppercase font-medium">Autorizações Legais</p>
      <AuthorizationToggle
        label="Autorização de Uso de Imagem"
        description="Permitir uso de fotos/vídeos do seu filho em materiais da unidade"
        legalText="Nos termos da Lei 13.709/2018 (LGPD) e do Estatuto da Criança e do Adolescente (ECA), autorizo o uso de imagem do(a) menor sob minha responsabilidade para fins de divulgação institucional da unidade, incluindo redes sociais, materiais impressos e digitais. Esta autorização pode ser revogada a qualquer momento."
        enabled={auths.imagem?.enabled || false}
        date={auths.imagem?.date}
        onChange={(v: boolean) => toggle('imagem', v)}
      />
      <AuthorizationToggle
        label="Autorização para Competições"
        description="Permitir participação em campeonatos e competições oficiais"
        legalText="Autorizo a participação do(a) menor em competições de treinamento especializado organizadas pela unidade ou por entidades parceiras. Declaro estar ciente dos riscos inerentes à prática esportiva competitiva e que a unidade tomará todas as precauções de segurança necessárias."
        enabled={auths.competicao?.enabled || false}
        date={auths.competicao?.date}
        onChange={(v: boolean) => toggle('competicao', v)}
      />
      <AuthorizationToggle
        label="Autorização para Eventos Externos"
        description="Permitir participação em seminários e treinos em outras unidades"
        legalText="Autorizo que o(a) menor participe de eventos externos promovidos pela unidade, incluindo seminários, confraternizações e treinos em unidades parceiras, sob supervisão dos instrutores responsáveis."
        enabled={auths.eventos?.enabled || false}
        date={auths.eventos?.date}
        onChange={(v: boolean) => toggle('eventos', v)}
      />
    </section>
  );
}function PersonCard({ pessoa, onToggle }: { pessoa: PessoaAutorizada; onToggle: (id: string, ativa: boolean) => void }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${pessoa.ativa ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white/[0.01] border-white/[0.04] opacity-50'}`}>
      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
        <User size={18} className="text-emerald-400/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white/70">{pessoa.nome}</p>
        <div className="flex items-center gap-3 text-[10px] text-white/25 mt-0.5">
          <span>{pessoa.parentesco}</span>
          <span>CPF: •••.•••.{pessoa.cpf.slice(-6)}</span>
          <span className="flex items-center gap-1"><Phone size={8} /> {pessoa.telefone}</span>
        </div>
      </div>
      <button onClick={() => onToggle(pessoa.id, !pessoa.ativa)}
        className="shrink-0">
        {pessoa.ativa
          ? <ToggleRight size={28} className="text-emerald-400" />
          : <ToggleLeft size={28} className="text-white/20" />
        }
      </button>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-[10px] text-white/25 uppercase tracking-wider">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full mt-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm placeholder:text-white/15 focus:outline-none focus:border-white/20" />
    </div>
  );
}
