'use client';

import { useState } from 'react';
import { Award, Users, Shield, Package, Plus, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useToast } from '@/contexts/ToastContext';
import { mockModalidades, TODAS_MODALIDADES, FAIXAS_ETARIAS, NIVEIS, EQUIPAMENTOS } from '@/lib/__mocks__/academy-management.mock';
import type { Modalidade, Graduacao } from '@/lib/__mocks__/academy-management.mock';

export default function ModalidadesPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const toast = useToast();
  const [modalidades, setModalidades] = useState<Modalidade[]>(mockModalidades);
  const [expanded, setExpanded] = useState<string | null>(null);

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: 'var(--text-primary)', borderRadius: 12 } as const;

  const toggleModalidade = (nome: string) => {
    setModalidades(prev => {
      const exists = prev.find(m => m.nome === nome);
      if (exists) {
        return prev.map(m => m.nome === nome ? { ...m, ativa: !m.ativa } : m);
      }
      return [...prev, {
        id: nome.toLowerCase().replace(/[^a-z]/g, '-'),
        nome,
        ativa: true,
        graduacoes: [],
        tempoMinimoMeses: 12,
        faixaEtaria: ['Adulto 18+'],
        niveis: ['Iniciante'],
        professorResponsavel: '',
        equipamentos: [],
      }];
    });
  };

  const updateField = (id: string, field: keyof Modalidade, value: unknown) => {
    setModalidades(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const toggleArrayItem = (id: string, field: 'faixaEtaria' | 'niveis' | 'equipamentos', item: string) => {
    setModalidades(prev => prev.map(m => {
      if (m.id !== id) return m;
      const arr = m[field] as string[];
      return { ...m, [field]: arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item] };
    }));
  };

  const addGraduacao = (id: string) => {
    setModalidades(prev => prev.map(m => {
      if (m.id !== id) return m;
      const ordem = m.graduacoes.length + 1;
      return { ...m, graduacoes: [...m.graduacoes, { nome: `Faixa ${ordem}`, cor: '#888888', ordem }] };
    }));
  };

  const removeGraduacao = (id: string, ordem: number) => {
    setModalidades(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, graduacoes: m.graduacoes.filter(g => g.ordem !== ordem).map((g, i) => ({ ...g, ordem: i + 1 })) };
    }));
  };

  const updateGraduacao = (id: string, ordem: number, field: keyof Graduacao, value: string | number) => {
    setModalidades(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, graduacoes: m.graduacoes.map(g => g.ordem === ordem ? { ...g, [field]: value } : g) };
    }));
  };

  const ativas = modalidades.filter(m => m.ativa);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Catalogo de Modalidades</h1>

      {/* All modalities grid */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Modalidades Disponiveis</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TODAS_MODALIDADES.map((nome) => {
            const mod = modalidades.find(m => m.nome === nome);
            const isActive = mod?.ativa ?? false;
            return (
              <button
                key={nome}
                onClick={() => toggleModalidade(nome)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: isActive ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'var(--card-bg)',
                  border: '1px solid black',
                  color: 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500/30'}`} />
                {nome}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active modalities config */}
      {ativas.map((mod) => (
        <div key={mod.id} style={{ ...card, padding: '1.5rem' }}>
          <button
            onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Award size={18} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
              {mod.nome}
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{expanded === mod.id ? 'Fechar' : 'Configurar'}</span>
          </button>

          {expanded === mod.id && (
            <div className="mt-4 space-y-5">
              {/* Graduacoes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>Sistema de Graduacao</label>
                  <button onClick={() => addGraduacao(mod.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ border: '1px solid black', color: 'var(--text-primary)' }}>
                    <Plus size={12} /> Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {mod.graduacoes.map((g) => (
                    <div key={g.ordem} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ border: '1px solid black' }}>
                      <input type="color" value={g.cor} onChange={(e) => updateGraduacao(mod.id, g.ordem, 'cor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" style={{ border: 'none' }} />
                      <input value={g.nome} onChange={(e) => updateGraduacao(mod.id, g.ordem, 'nome', e.target.value)} className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>#{g.ordem}</span>
                      <button onClick={() => removeGraduacao(mod.id, g.ordem)}><X size={14} style={{ color: 'var(--text-secondary)' }} /></button>
                    </div>
                  ))}
                  {mod.graduacoes.length === 0 && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Sem sistema de graduacao (ex: MMA)</p>}
                </div>
              </div>

              {/* Tempo minimo */}
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Tempo minimo entre graduacoes (meses)</label>
                <input type="number" value={mod.tempoMinimoMeses} onChange={(e) => updateField(mod.id, 'tempoMinimoMeses', Number(e.target.value))} className="w-32 px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>

              {/* Faixa Etaria */}
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Users size={14} className="inline mr-1" /> Faixa Etaria
                </label>
                <div className="flex flex-wrap gap-2">
                  {FAIXAS_ETARIAS.map((fe) => (
                    <button key={fe} onClick={() => toggleArrayItem(mod.id, 'faixaEtaria', fe)}
                      className="px-3 py-2 rounded-xl text-xs"
                      style={{
                        background: mod.faixaEtaria.includes(fe) ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'var(--card-bg)',
                        border: '1px solid black', color: 'var(--text-primary)',
                        fontWeight: mod.faixaEtaria.includes(fe) ? 600 : 400,
                      }}>
                      {fe}
                    </button>
                  ))}
                </div>
              </div>

              {/* Niveis */}
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Shield size={14} className="inline mr-1" /> Niveis
                </label>
                <div className="flex flex-wrap gap-2">
                  {NIVEIS.map((n) => (
                    <button key={n} onClick={() => toggleArrayItem(mod.id, 'niveis', n)}
                      className="px-3 py-2 rounded-xl text-xs"
                      style={{
                        background: mod.niveis.includes(n) ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'var(--card-bg)',
                        border: '1px solid black', color: 'var(--text-primary)',
                        fontWeight: mod.niveis.includes(n) ? 600 : 400,
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Professor */}
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Professor Responsavel</label>
                <select value={mod.professorResponsavel} onChange={(e) => updateField(mod.id, 'professorResponsavel', e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle}>
                  <option value="">Selecionar...</option>
                  <option value="Prof. Ricardo Silva">Prof. Ricardo Silva</option>
                  <option value="Prof. Ana Costa">Prof. Ana Costa</option>
                  <option value="Prof. Joao Mendes">Prof. Joao Mendes</option>
                </select>
              </div>

              {/* Equipamentos */}
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Package size={14} className="inline mr-1" /> Equipamentos Obrigatorios
                </label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPAMENTOS.map((eq) => (
                    <button key={eq} onClick={() => toggleArrayItem(mod.id, 'equipamentos', eq)}
                      className="px-3 py-2 rounded-xl text-xs"
                      style={{
                        background: mod.equipamentos.includes(eq) ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'var(--card-bg)',
                        border: '1px solid black', color: 'var(--text-primary)',
                        fontWeight: mod.equipamentos.includes(eq) ? 600 : 400,
                      }}>
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
