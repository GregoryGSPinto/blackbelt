'use client';

import { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Clock, Users, Plus, Edit2, Pause, Play } from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { Turma, Usuario } from '@/lib/api/admin.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function TurmasPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [turmasData, usuariosData] = await Promise.all([
          adminService.getTurmas(),
          adminService.getUsuarios(),
        ]);
        setTurmas(turmasData);
        setUsuarios(usuariosData);
      } catch (err) {
        setError(handleServiceError(err, 'Turmas'));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  // ─── Search Registration ──────────────────────────────────
  const searchItems = useMemo<SearchItem[]>(() =>
    turmas.map((t) => ({
      id: `turma-${t.id}`,
      label: t.nome,
      sublabel: `${t.categoria} · ${t.diasSemana?.join(', ')} · ${t.horario} · ${t.alunosMatriculados} alunos`,
      categoria: 'Turma',
      icon: '🥋',
      href: '/turmas',
      keywords: [t.categoria, t.horario, t.status],
    })),
  [turmas]);

  useSearchRegistration('admin-turmas', searchItems);

  if (loading) {
    return <PremiumLoader text="Carregando..." />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (turmas.length === 0) {
    return <PageEmpty icon={GraduationCap} title="Nenhuma turma cadastrada" message="Cadastre turmas para começar a gerenciar a unidade." />;
  }


  const turma = turmas.find(t => t.id === selectedTurma);
  const alunosDaTurma = selectedTurma ? usuarios.filter(u => u.tipo === 'ALUNO' && u.turmaId === selectedTurma) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>Gestão de Turmas</h1>
          <p style={{ fontWeight: 300, color: tokens.textMuted }}>Organizar turmas, horários e alunos</p>
        </div>
        <button className="flex items-center gap-2 transition-all" style={{ background: 'transparent', border: `1px solid ${tokens.cardBorder}`, color: tokens.text, padding: '0.75rem 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem', borderRadius: '4px' }}>
          <Plus className="w-5 h-5" />
          <span>Nova Turma</span>
        </button>
      </div>

      {/* Turmas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas.map((turma) => {
          const professor = usuarios.find(u => u.id === turma.professorId);
          const ocupacao = (turma.alunosMatriculados / turma.capacidadeMaxima) * 100;
          
          return (
            <button
              key={turma.id}
              onClick={() => setSelectedTurma(turma.id)}
              className="text-left bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{turma.nome}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    turma.categoria === 'ADULTO'
                      ? 'bg-white/10 text-white'
                      : 'bg-pink-600/20 text-pink-400'
                  }`}>
                    {turma.categoria}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  turma.status === 'ATIVA'
                    ? 'bg-white/5'
                    : 'bg-white/10'
                }`}>
                  <GraduationCap className={`w-5 h-5 ${
                    turma.status === 'ATIVA' ? 'text-green-400' : 'text-white/40'
                  }`} />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Users className="w-4 h-4" />
                  <span>{professor?.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Clock className="w-4 h-4" />
                  <span>{turma.horario}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {turma.diasSemana.map((dia) => (
                    <span key={dia} className="px-2 py-0.5 bg-white/10 text-white/70 rounded text-xs">
                      {dia.substring(0, 3)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ocupação */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: tokens.textMuted }}>Ocupação</span>
                  <span style={{ color: tokens.text, fontWeight: 500 }}>
                    {turma.alunosMatriculados}/{turma.capacidadeMaxima}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      ocupacao >= 90
                        ? 'bg-red-600'
                        : ocupacao >= 70
                        ? 'bg-yellow-600'
                        : 'bg-white/10 border border-white/10'
                    }`}
                    style={{ width: `${ocupacao}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detalhes da Turma */}
      {selectedTurma && turma && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text, marginBottom: '0.5rem' }}>{turma.nome}</h2>
                  <p style={{ fontWeight: 300, color: tokens.textMuted }}>{turma.sala}</p>
                </div>
                <button
                  onClick={() => setSelectedTurma(null)}
                  className="text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div style={{ background: tokens.cardBg, borderRadius: '4px', padding: '1rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>Professor</p>
                  <p style={{ color: tokens.text, fontWeight: 500 }}>{usuarios.find(u => u.id === turma.professorId)?.nome}</p>
                </div>
                <div style={{ background: tokens.cardBg, borderRadius: '4px', padding: '1rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>Horário</p>
                  <p style={{ color: tokens.text, fontWeight: 500 }}>{turma.horario}</p>
                </div>
                <div style={{ background: tokens.cardBg, borderRadius: '4px', padding: '1rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>Dias da Semana</p>
                  <p style={{ color: tokens.text, fontWeight: 500 }}>{turma.diasSemana.join(', ')}</p>
                </div>
                <div style={{ background: tokens.cardBg, borderRadius: '4px', padding: '1rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>Capacidade</p>
                  <p style={{ color: tokens.text, fontWeight: 500 }}>
                    {turma.alunosMatriculados}/{turma.capacidadeMaxima}
                  </p>
                </div>
              </div>

              {/* Alunos */}
              <div className="mb-6">
                <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text, marginBottom: '1rem' }}>Alunos Matriculados ({alunosDaTurma.length})</h3>
                <div className="bg-white/10 rounded-lg divide-y max-h-80 overflow-y-auto">
                  {alunosDaTurma.map((aluno) => (
                    <div key={aluno.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: tokens.text }}>{aluno.nome}</p>
                          <p className="text-xs" style={{ color: tokens.textMuted }}>{aluno.graduacao}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        aluno.status === 'ATIVO'
                          ? 'bg-white/5 text-green-400'
                          : aluno.status === 'EM_ATRASO'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {aluno.status === 'ATIVO' ? 'Ativo' : aluno.status === 'EM_ATRASO' ? 'Em Atraso' : 'Bloqueado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar Turma
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-colors font-medium flex items-center gap-2">
                  {turma.status === 'ATIVA' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {turma.status === 'ATIVA' ? 'Pausar' : 'Ativar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
