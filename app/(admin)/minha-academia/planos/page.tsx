'use client';

import { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit3, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useToast } from '@/contexts/ToastContext';
import { mockPlanos, mockModalidades } from '@/lib/__mocks__/academy-management.mock';
import type { PlanoAcademia } from '@/lib/__mocks__/academy-management.mock';

export default function PlanosPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const toast = useToast();
  const [planos, setPlanos] = useState<PlanoAcademia[]>(mockPlanos);
  const [editing, setEditing] = useState<string | null>(null);

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: 'var(--text-primary)', borderRadius: 12 } as const;

  const modalidadesAtivas = mockModalidades.filter(m => m.ativa).map(m => m.nome);

  const updatePlano = (id: string, field: keyof PlanoAcademia, value: unknown) => {
    setPlanos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleModalidade = (id: string, mod: string) => {
    setPlanos(prev => prev.map(p => {
      if (p.id !== id) return p;
      const mods = p.modalidades.includes(mod) ? p.modalidades.filter(m => m !== mod) : [...p.modalidades, mod];
      return { ...p, modalidades: mods };
    }));
  };

  const addPlano = () => {
    const novo: PlanoAcademia = {
      id: 'novo-' + Date.now(),
      nome: 'Novo Plano',
      preco: 0,
      modalidades: [],
      descricao: '',
      descontoFamilia2: 0,
      descontoFamilia3: 0,
      descontoEstudante: 0,
      descontoFuncionarioPublico: 0,
      trialDias: 7,
      features: [],
    };
    setPlanos(prev => [...prev, novo]);
    setEditing(novo.id);
  };

  const removePlano = (id: string) => {
    setPlanos(prev => prev.filter(p => p.id !== id));
    toast.success('Plano removido');
  };

  const formatMoney = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          <CreditCard size={22} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          Planos da Academia
        </h1>
        <button onClick={addPlano} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}>
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      {/* Comparative Table */}
      <div style={{ ...card, padding: '1.5rem', overflow: 'auto' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Tabela Comparativa</h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid black' }}></th>
              {planos.map(p => (
                <th key={p.id} className="text-center p-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid black' }}>
                  <div className="font-semibold text-base">{p.nome}</div>
                  <div className="text-lg font-medium mt-1">{formatMoney(p.preco)}<span className="text-xs font-normal">/mes</span></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 text-sm" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>Modalidades</td>
              {planos.map(p => (
                <td key={p.id} className="p-3 text-center text-xs" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                  {p.modalidades.length === modalidadesAtivas.length ? 'Todas' : p.modalidades.join(', ') || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-sm" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>Trial</td>
              {planos.map(p => (
                <td key={p.id} className="p-3 text-center" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                  {p.trialDias} dias
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-sm" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>Desc. Estudante</td>
              {planos.map(p => (
                <td key={p.id} className="p-3 text-center" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                  {p.descontoEstudante}%
                </td>
              ))}
            </tr>
            {planos[0]?.features.length > 0 && planos.flatMap(p => p.features).filter((f, i, a) => a.indexOf(f) === i).map(feat => (
              <tr key={feat}>
                <td className="p-3 text-sm" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>{feat}</td>
                {planos.map(p => (
                  <td key={p.id} className="p-3 text-center" style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                    {p.features.includes(feat) ? <Check size={16} className="inline" style={{ color: 'var(--text-primary)' }} /> : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Plan Editor Cards */}
      {planos.map((plano) => (
        <div key={plano.id} style={{ ...card, padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{plano.nome}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(editing === plano.id ? null : plano.id)} className="p-2 rounded-lg" style={{ border: '1px solid black', color: 'var(--text-primary)' }}>
                <Edit3 size={14} />
              </button>
              <button onClick={() => removePlano(plano.id)} className="p-2 rounded-lg" style={{ border: '1px solid black', color: 'var(--text-secondary)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {editing === plano.id && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Nome</label>
                <input value={plano.nome} onChange={(e) => updatePlano(plano.id, 'nome', e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Preco (R$)</label>
                <input type="number" step="0.01" value={plano.preco} onChange={(e) => updatePlano(plano.id, 'preco', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Descricao</label>
                <input value={plano.descricao} onChange={(e) => updatePlano(plano.id, 'descricao', e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Modalidades Incluidas</label>
                <div className="flex flex-wrap gap-2">
                  {modalidadesAtivas.map(mod => (
                    <button key={mod} onClick={() => toggleModalidade(plano.id, mod)} className="px-3 py-2 rounded-xl text-xs" style={{
                      background: plano.modalidades.includes(mod) ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'var(--card-bg)',
                      border: '1px solid black', color: 'var(--text-primary)',
                      fontWeight: plano.modalidades.includes(mod) ? 600 : 400,
                    }}>{mod}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Desc. Familia 2o membro (%)</label>
                <input type="number" value={plano.descontoFamilia2} onChange={(e) => updatePlano(plano.id, 'descontoFamilia2', Number(e.target.value))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Desc. Familia 3o membro (%)</label>
                <input type="number" value={plano.descontoFamilia3} onChange={(e) => updatePlano(plano.id, 'descontoFamilia3', Number(e.target.value))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Desc. Estudante (%)</label>
                <input type="number" value={plano.descontoEstudante} onChange={(e) => updatePlano(plano.id, 'descontoEstudante', Number(e.target.value))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Desc. Funcionario Publico (%)</label>
                <input type="number" value={plano.descontoFuncionarioPublico} onChange={(e) => updatePlano(plano.id, 'descontoFuncionarioPublico', Number(e.target.value))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Periodo Trial (dias)</label>
                <input type="number" value={plano.trialDias} onChange={(e) => updatePlano(plano.id, 'trialDias', Number(e.target.value))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
            </div>
          )}

          {editing !== plano.id && (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>{plano.descricao}</p>
              <p className="mt-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{formatMoney(plano.preco)}/mes · {plano.modalidades.join(', ') || 'Nenhuma'} · Trial {plano.trialDias}d</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
