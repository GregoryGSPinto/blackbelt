'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Check, X, AlertCircle, Clock, Users as UsersIcon } from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { Usuario, CheckIn, Turma } from '@/lib/api/admin.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';

export default function CheckInPage() {
  const [checkIns, setCheckins] = useState<CheckIn[]>([]);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Usuario | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [checkInsData, usuariosData, turmasData] = await Promise.all([
          adminService.getCheckIns(),
          adminService.getUsuarios(),
          adminService.getTurmas(),
        ]);
        setCheckins(checkInsData);
        setAllUsuarios(usuariosData);
        setAlunos(usuariosData.filter(u => u.tipo === 'ALUNO'));
        setTurmas(turmasData);
      } catch (err) {
        setError(handleServiceError(err, 'CheckIn'));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  // ─── Search Registration ──────────────────────────────────
  const searchItems = useMemo<SearchItem[]>(() => {
    return checkIns.slice(0, 20).map((ci) => {
      const aluno = alunos.find(a => a.id === ci.alunoId);
      return {
        id: `checkin-${ci.id}`,
        label: aluno?.nome || ci.alunoId,
        sublabel: `${ci.turmaId} · ${ci.data} ${ci.hora}`,
        categoria: 'Check-in',
        icon: ci.statusAluno === 'ATIVO' ? '✅' : ci.statusAluno === 'BLOQUEADO' ? '🚫' : '⏳',
        href: '/check-in',
        keywords: [ci.statusAluno, ci.data],
      };
    });
  }, [checkIns, alunos]);

  useSearchRegistration('admin-checkin', searchItems);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  const checkInsHoje = checkIns.filter(c => c.data === '2026-02-02');

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = (aluno: Usuario) => {
    setSelectedAluno(aluno);
    
    if (aluno.status === 'BLOQUEADO') {
      setShowBlocked(true);
      setTimeout(() => setShowBlocked(false), 3000);
      return;
    }

    // Verificar se já fez check-in hoje
    const jaFezCheckIn = checkInsHoje.some(c => c.alunoId === aluno.id);
    if (jaFezCheckIn) {
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSearchTerm('');
    }, 2000);
  };

  const getAlunoCheckInStatus = (alunoId: string) => {
    return checkInsHoje.some(c => c.alunoId === alunoId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Check-in Administrativo</h1>
        <p className="text-white/50">Validar presença dos alunos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Check-ins Hoje</p>
              <p className="text-4xl font-bold text-white/70">{checkInsHoje.length}</p>
            </div>
            <Check className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Total de Alunos</p>
              <p className="text-4xl font-bold text-white">{alunos.length}</p>
            </div>
            <UsersIcon className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Taxa de Presença</p>
              <p className="text-4xl font-bold text-green-400">
                {Math.round((checkInsHoje.length / alunos.length) * 100)}%
              </p>
            </div>
            <Clock className="w-10 h-10 text-white/40" />
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && selectedAluno && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Check-in Realizado!</h3>
              <p className="text-green-400">{selectedAluno.nome} - {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Alert */}
      {showBlocked && selectedAluno && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Aluno Bloqueado!</h3>
              <p className="text-red-400">{selectedAluno.nome} não pode fazer check-in</p>
              <p className="text-sm text-white/50 mt-1">
                Motivo: {selectedAluno.observacoes || 'Regularize a situação na recepção'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Area */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <label className="block text-sm font-medium text-white/50 mb-3">
          Buscar Aluno
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome ou ID do aluno..."
            className="w-full pl-14 pr-4 py-4 bg-white/10 border border-white/15 rounded-lg text-white text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            autoFocus
          />
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">
              {filteredAlunos.length} Resultado(s) Encontrado(s)
            </h3>
          </div>
          <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
            {filteredAlunos.map((aluno) => {
              const jaFezCheckIn = getAlunoCheckInStatus(aluno.id);
              const turma = turmas.find(t => t.id === (aluno.turmaId || ''));

              return (
                <div
                  key={aluno.id}
                  className={`p-4 hover:bg-white/5 transition-colors ${
                    aluno.status === 'BLOQUEADO' ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-white">{aluno.nome}</h4>
                          {aluno.status === 'ATIVO' && (
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-green-400 font-medium">
                              Ativo
                            </span>
                          )}
                          {aluno.status === 'EM_ATRASO' && (
                            <span className="px-2 py-0.5 bg-yellow-600/20 border border-yellow-600/30 rounded-full text-xs text-yellow-400 font-medium">
                              Em Atraso
                            </span>
                          )}
                          {aluno.status === 'BLOQUEADO' && (
                            <span className="px-2 py-0.5 bg-red-600/20 border border-red-600/30 rounded-full text-xs text-red-400 font-medium">
                              Bloqueado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span>{aluno.graduacao}</span>
                          <span>•</span>
                          <span>{turma?.nome}</span>
                          <span>•</span>
                          <span className={`${
                            aluno.categoria === 'KIDS' ? 'text-pink-400' : 'text-white'
                          }`}>
                            {aluno.categoria}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCheckIn(aluno)}
                      disabled={jaFezCheckIn || aluno.status === 'BLOQUEADO'}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        jaFezCheckIn
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : aluno.status === 'BLOQUEADO'
                          ? 'bg-red-950/20 border border-red-500/20 text-red-400 cursor-not-allowed'
                          : 'bg-white/10 border border-white/10 hover:bg-white/15 text-white hover:scale-105'
                      }`}
                    >
                      {jaFezCheckIn ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          Check-in Feito
                        </span>
                      ) : aluno.status === 'BLOQUEADO' ? (
                        <span className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Bloqueado
                        </span>
                      ) : (
                        'Validar Check-in'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAlunos.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/50">Nenhum aluno encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Check-ins Today */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Check-ins de Hoje</h3>
        </div>
        <div className="divide-y divide-white/10">
          {checkInsHoje.map((checkIn) => {
            const aluno = allUsuarios.find(u => u.id === checkIn.alunoId);
            const turma = turmas.find(t => t.id === checkIn.turmaId);
            
            if (!aluno) return null;

            return (
              <div key={checkIn.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{aluno.nome}</p>
                      <p className="text-xs text-white/50">{turma?.nome}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{checkIn.hora}</p>
                    {checkIn.validadoPor && (
                      <p className="text-xs text-white/50">Via Responsável</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {checkInsHoje.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50">Nenhum check-in realizado hoje</p>
          </div>
        )}
      </div>
    </div>
  );
}
