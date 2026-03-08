'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Check, X, AlertCircle, Clock, Users as UsersIcon } from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import * as checkinService from '@/src/features/attendance/services/checkin.service';
import type { Usuario, CheckIn, Turma } from '@/lib/api/admin.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

export default function CheckInPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatTime } = useFormatting();
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' } as const;

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
  const [today, setToday] = useState('');
  const [successTime, setSuccessTime] = useState('');

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

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

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
    return <PremiumLoader text={t('checkin.loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  const checkInsHoje = checkIns.filter(c => c.data === today);

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = async (aluno: Usuario) => {
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

    try {
      await checkinService.registerCheckin(aluno.id, aluno.turmaId || '', 'MANUAL');
      setSuccessTime(formatTime(new Date()));
      setShowSuccess(true);
      setRetryCount(c => c + 1); // Reload data
      setTimeout(() => {
        setShowSuccess(false);
        setSearchTerm('');
      }, 2000);
    } catch (err) {
      setError(handleServiceError(err, 'Check-in'));
    }
  };

  const getAlunoCheckInStatus = (alunoId: string) => {
    return checkInsHoje.some(c => c.alunoId === alunoId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('checkin.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>{t('checkin.validatePresence')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hover-card" style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('checkin.todayCheckins')}</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white/70">{checkInsHoje.length}</p>
            </div>
            <Check className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div className="hover-card" style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('checkin.totalStudents')}</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white">{alunos.length}</p>
            </div>
            <UsersIcon className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div className="hover-card" style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('checkin.attendanceRate')}</p>
              <p className="text-green-400" style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.03em' }}>
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
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('checkin.checkinDone')}</h3>
              <p className="text-green-400">{selectedAluno.nome} - {successTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Alert */}
      {showBlocked && selectedAluno && (
        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('checkin.studentBlocked')}</h3>
              <p className="text-red-400">{t('checkin.cannotCheckin', { name: selectedAluno.nome })}</p>
              <p className="text-sm text-white/50 mt-1">
                {t('checkin.reason')}: {selectedAluno.observacoes || t('checkin.regularizeSituation')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Area */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <label className="block text-sm font-normal mb-3" style={{ color: 'var(--text-secondary)' }}>
          {t('checkin.searchStudent')}
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('checkin.searchPlaceholder')}
            className="w-full pl-14 pr-4 py-4 bg-white/10 border border-white/15 rounded-xl text-white text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            autoFocus
          />
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div style={{ ...glass, overflow: 'hidden' }}>
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('checkin.resultsFound', { count: filteredAlunos.length })}
            </h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
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
                        <span className="text-white font-medium text-lg">
                          {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{aluno.nome}</h4>
                          {aluno.status === 'ATIVO' && (
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-green-400 font-medium">
                              {t('checkin.statusActive')}
                            </span>
                          )}
                          {aluno.status === 'EM_ATRASO' && (
                            <span className="px-2 py-0.5 bg-yellow-600/20 border border-yellow-600/30 rounded-full text-xs text-yellow-400 font-medium">
                              {t('checkin.statusOverdue')}
                            </span>
                          )}
                          {aluno.status === 'BLOQUEADO' && (
                            <span className="px-2 py-0.5 bg-red-600/20 border border-red-600/30 rounded-full text-xs text-red-400 font-medium">
                              {t('checkin.statusBlocked')}
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
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
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
                          {t('checkin.checkinMade')}
                        </span>
                      ) : aluno.status === 'BLOQUEADO' ? (
                        <span className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          {t('financial.blocked')}
                        </span>
                      ) : (
                        t('checkin.validateCheckin')
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAlunos.length === 0 && (
            <div className="empty-state-premium text-center py-12">
              <Search className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p style={{ fontWeight: 300, color: tokens.textMuted }}>{t('checkin.noStudentFound')}</p>
            </div>
          )}
        </div>
      )}

      {/* Check-ins Today */}
      <div style={{ ...glass, overflow: 'hidden' }}>
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('checkin.todayCheckinsList')}</h3>
        </div>
        <div className="divide-y">
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
                      <p className="text-sm font-medium" style={{ color: tokens.text }}>{aluno.nome}</p>
                      <p className="text-xs" style={{ color: tokens.textMuted }}>{turma?.nome}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: tokens.text }}>{checkIn.hora}</p>
                    {checkIn.validadoPor && (
                      <p className="text-xs" style={{ color: tokens.textMuted }}>{t('checkin.viaGuardian')}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {checkInsHoje.length === 0 && (
          <div className="empty-state-premium text-center py-12">
            <Clock className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p style={{ fontWeight: 300, color: tokens.textMuted }}>{t('checkin.noCheckinToday')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
