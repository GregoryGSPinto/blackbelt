'use client';

import { useState } from 'react';
import { FileText, AlertTriangle, Eye, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { mockContratos, contratoTemplate } from '@/lib/__mocks__/academy-management.mock';
import type { Contrato } from '@/lib/__mocks__/academy-management.mock';

export default function ContratosPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [contratos] = useState<Contrato[]>(mockContratos);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [template, setTemplate] = useState(contratoTemplate);
  const [previewContrato, setPreviewContrato] = useState<Contrato | null>(null);

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: 'var(--text-primary)', borderRadius: 12 } as const;

  const filtered = contratos.filter(c => !filtroStatus || c.status === filtroStatus);

  const vencendoEm30 = contratos.filter(c => {
    if (c.status !== 'ativo') return false;
    const fim = new Date(c.dataFim);
    const hoje = new Date();
    const diff = (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff > 0;
  });

  const gerarPreview = (c: Contrato) => {
    return template
      .replace('{nome_aluno}', c.alunoNome)
      .replace('{cpf}', c.alunoCpf)
      .replace('{plano}', c.plano)
      .replace('{modalidade}', c.modalidade)
      .replace('{valor}', c.valor.toFixed(2))
      .replace('{data_inicio}', new Date(c.dataInicio).toLocaleDateString('pt-BR'));
  };

  const statusColor = (s: string) => {
    if (s === 'ativo') return isDark ? 'text-green-400' : 'text-green-600';
    if (s === 'vencido') return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        <FileText size={22} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
        Contratos
      </h1>

      {/* Alert: vencendo em 30 dias */}
      {vencendoEm30.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid black' }}>
          <AlertTriangle size={18} style={{ color: isDark ? '#F59E0B' : '#D97706', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {vencendoEm30.length} contrato(s) vencendo nos proximos 30 dias
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Ativos', count: contratos.filter(c => c.status === 'ativo').length, color: 'text-green-400' },
          { label: 'Vencidos', count: contratos.filter(c => c.status === 'vencido').length, color: 'text-yellow-400' },
          { label: 'Cancelados', count: contratos.filter(c => c.status === 'cancelado').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '1rem' }} className="text-center">
            <p className={`text-2xl font-medium ${s.color}`}>{s.count}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        {['', 'ativo', 'vencido', 'cancelado'].map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)} className="px-3 py-2 rounded-xl text-sm" style={{
            background: filtroStatus === s ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'var(--card-bg)',
            border: '1px solid black', color: 'var(--text-primary)',
            fontWeight: filtroStatus === s ? 600 : 400,
          }}>
            {s || 'Todos'}
          </button>
        ))}
      </div>

      {/* Contracts List */}
      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} style={{ ...card, padding: '1rem' }}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.alunoNome}</h4>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  CPF: {c.alunoCpf} · {c.plano} · R$ {c.valor.toFixed(2)}/mes
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(c.dataInicio).toLocaleDateString('pt-BR')} — {new Date(c.dataFim).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold capitalize ${statusColor(c.status)}`}>{c.status}</span>
                <button onClick={() => setPreviewContrato(c)} className="p-2 rounded-lg" style={{ border: '1px solid black', color: 'var(--text-primary)' }}>
                  <Eye size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contract Template Editor */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Template do Contrato</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
          {'Variaveis: {nome_aluno}, {cpf}, {plano}, {valor}, {data_inicio}, {modalidade}'}
        </p>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={15}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none font-mono"
          style={inputStyle}
        />
      </div>

      {/* Preview Modal */}
      {previewContrato && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setPreviewContrato(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-auto rounded-xl p-6" style={{ background: 'var(--card-bg)', border: '1px solid black' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Preview do Contrato</h3>
              <button onClick={() => setPreviewContrato(null)}><X size={20} style={{ color: 'var(--text-secondary)' }} /></button>
            </div>
            <pre className="text-sm whitespace-pre-wrap font-mono" style={{ color: 'var(--text-primary)' }}>
              {gerarPreview(previewContrato)}
            </pre>
            <p className="text-xs mt-4 italic" style={{ color: 'var(--text-secondary)' }}>
              TODO: Geracao de PDF disponivel em versao futura.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
