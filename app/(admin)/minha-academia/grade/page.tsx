'use client';

import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { mockTurmasGrade } from '@/lib/__mocks__/academy-management.mock';
import type { TurmaGrade } from '@/lib/__mocks__/academy-management.mock';

const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
const HORAS = Array.from({ length: 17 }, (_, i) => i + 6); // 6-22

export default function GradePage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [turmas] = useState<TurmaGrade[]>(mockTurmasGrade);
  const [filtroModalidade, setFiltroModalidade] = useState('');
  const [filtroProfessor, setFiltroProfessor] = useState('');
  const [filtroSala, setFiltroSala] = useState('');

  const card = { background: 'var(--card-bg)', border: `1px solid ${tokens.cardBorder}`, borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)', borderRadius: 12 } as const;

  const modalidades = [...new Set(turmas.map(t => t.modalidade))];
  const professores = [...new Set(turmas.map(t => t.professor))];
  const salas = [...new Set(turmas.map(t => t.sala))];

  const filtered = turmas.filter(t =>
    (!filtroModalidade || t.modalidade === filtroModalidade) &&
    (!filtroProfessor || t.professor === filtroProfessor) &&
    (!filtroSala || t.sala === filtroSala)
  );

  const getOcupacao = (alunos: number, cap: number) => {
    const pct = (alunos / cap) * 100;
    if (pct >= 90) return { color: '#EF4444', label: 'Lotada' };
    if (pct >= 70) return { color: '#F59E0B', label: 'Quase lotada' };
    return { color: '#22C55E', label: 'Disponivel' };
  };

  const getTurmaAt = (dia: number, hora: number) => {
    return filtered.filter(t =>
      t.diaSemana === dia &&
      hora >= t.horaInicio &&
      hora < t.horaInicio + t.duracao
    );
  };

  // Detect conflicts (same sala, overlapping time)
  const hasConflict = (dia: number, hora: number) => {
    const turmasHere = filtered.filter(t =>
      t.diaSemana === dia &&
      hora >= t.horaInicio &&
      hora < t.horaInicio + t.duracao
    );
    const salas = turmasHere.map(t => t.sala);
    return salas.length !== new Set(salas).size;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        <Calendar size={22} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
        Grade Horaria
      </h1>

      {/* Filters */}
      <div style={{ ...card, padding: '1rem' }}>
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={filtroModalidade} onChange={(e) => setFiltroModalidade(e.target.value)} className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
            <option value="">Todas modalidades</option>
            {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)} className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
            <option value="">Todos professores</option>
            {professores.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filtroSala} onChange={(e) => setFiltroSala(e.target.value)} className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
            <option value="">Todas salas</option>
            {salas.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Schedule Grid */}
      <div style={{ ...card, padding: '0.5rem', overflow: 'auto' }}>
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-7 gap-px mb-1">
            <div className="p-2 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>Hora</div>
            {DIAS.map(d => (
              <div key={d} className="p-2 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{d}</div>
            ))}
          </div>

          {/* Body */}
          {HORAS.map(hora => (
            <div key={hora} className="grid grid-cols-7 gap-px" style={{ minHeight: 48 }}>
              <div className="p-2 flex items-center justify-center text-xs" style={{ color: 'var(--text-secondary)', borderTop: '1px solid rgba(128,128,128,0.1)' }}>
                {hora}:00
              </div>
              {DIAS.map((_, diaIdx) => {
                const turmasCell = getTurmaAt(diaIdx, hora);
                const conflict = hasConflict(diaIdx, hora);
                return (
                  <div
                    key={diaIdx}
                    className="p-1 relative"
                    style={{
                      borderTop: '1px solid rgba(128,128,128,0.1)',
                      background: conflict ? (isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)') : 'transparent',
                    }}
                  >
                    {turmasCell.map(t => {
                      if (hora !== t.horaInicio) return null;
                      const ocup = getOcupacao(t.alunosAtivos, t.capacidade);
                      return (
                        <div
                          key={t.id}
                          className="rounded-lg p-1.5 text-[10px] leading-tight"
                          style={{
                            background: t.cor + '20',
                            borderLeft: `3px solid ${t.cor}`,
                            height: `${t.duracao * 48 - 4}px`,
                            overflow: 'hidden',
                          }}
                        >
                          <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t.nome}</p>
                          <p style={{ color: 'var(--text-secondary)' }}>{t.professor}</p>
                          <p className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: ocup.color }} />
                            {t.alunosAtivos}/{t.capacidade}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ ...card, padding: '1rem' }}>
        <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> {'<70% — Disponivel'}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> 70-90% — Quase lotada</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> {'>90% — Lotada'}</span>
          <span className="flex items-center gap-1"><span className="w-4 h-3 rounded" style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)' }} /> Conflito de horario</span>
        </div>
      </div>
    </div>
  );
}
