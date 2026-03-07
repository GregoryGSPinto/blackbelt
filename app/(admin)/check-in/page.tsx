'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Check, X, AlertCircle, Clock, Users as UsersIcon, RefreshCw, Loader2 } from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import * as checkinService from '@/lib/api/checkin.service';
import type { Usuario, CheckIn, Turma } from '@/lib/api/admin.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

interface LoadingStates {
  checkIns: boolean;
  usuarios: boolean;
  turmas: boolean;
}

interface ErrorStates {
  checkIns: string | null;
  usuarios: string | null;
  turmas: string | null;
  general: string | null;
}

// ============================================================
// COMPONENT
// ============================================================

export default function CheckInPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatTime } = useFormatting();
  const glass = { 
    background: tokens.cardBg, 
    border: `1px solid ${tokens.cardBorder}`, 
    backdropFilter: 'blur(12px) saturate(1.2)', 
    WebkitBackdropFilter: 'blur(12px) saturate(1.2)', 
    borderRadius: '12px' 
  } as const;

  // ─── Data States ─────────────────────────────────────────
  const [checkIns, setCheckins] = useState<CheckIn[]>([]);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  // ─── Loading States (granular) ───────────────────────────
  const [loading, setLoading] = useState<LoadingStates>({
    checkIns: true,
    usuarios: true,
    turmas: true,
  });

  // ─── Error States (descritivo) ───────────────────────────
  const [errors, setErrors] = useState<ErrorStates>({
    checkIns: null,
    usuarios: null,
    turmas: null,
    general: null,
  });

  // ─── UI States ───────────────────────────────────────────
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Usuario | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // ============================================================
  // DATA LOADING (com tratamento de erro individual)
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    async function loadCheckIns() {
      if (!isMounted) return;
      setLoading(prev => ({ ...prev, checkIns: true }));
      setErrors(prev => ({ ...prev, checkIns: null }));
      
      try {
        logger.info('[CheckIn]', 'Carregando check-ins...');
        const data = await adminService.getCheckIns();
        if (isMounted) {
          setCheckins(data);
          logger.info('[CheckIn]', `${data.length} check-ins carregados`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar check-ins';
        if (isMounted) {
          setErrors(prev => ({ ...prev, checkIns: errorMsg }));
          logger.error('[CheckIn]', 'Falha ao carregar check-ins:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(prev => ({ ...prev, checkIns: false }));
        }
      }
    }

    async function loadUsuarios() {
      if (!isMounted) return;
      setLoading(prev => ({ ...prev, usuarios: true }));
      setErrors(prev => ({ ...prev, usuarios: null }));
      
      try {
        logger.info('[CheckIn]', 'Carregando usuários...');
        const data = await adminService.getUsuarios();
        if (isMounted) {
          setAllUsuarios(data);
          setAlunos(data.filter(u => u.tipo === 'ALUNO'));
          logger.info('[CheckIn]', `${data.length} usuários carregados (${data.filter(u => u.tipo === 'ALUNO').length} alunos)`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar usuários';
        if (isMounted) {
          setErrors(prev => ({ ...prev, usuarios: errorMsg }));
          logger.error('[CheckIn]', 'Falha ao carregar usuários:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(prev => ({ ...prev, usuarios: false }));
        }
      }
    }

    async function loadTurmas() {
      if (!isMounted) return;
      setLoading(prev => ({ ...prev, turmas: true }));
      setErrors(prev => ({ ...prev, turmas: null }));
      
      try {
        logger.info('[CheckIn]', 'Carregando turmas...');
        const data = await adminService.getTurmas();
        if (isMounted) {
          setTurmas(data);
          logger.info('[CheckIn]', `${data.length} turmas carregadas`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar turmas';
        if (isMounted) {
          setErrors(prev => ({ ...prev, turmas: errorMsg }));
          logger.error('[CheckIn]', 'Falha ao carregar turmas:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(prev => ({ ...prev, turmas: false }));
        }
      }
    }

    // Carregar todos os dados em paralelo
    Promise.all([
      loadCheckIns(),
      loadUsuarios(),
      loadTurmas(),
    ]);

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  // ============================================================
  // COMPUTED
  // ============================================================

  const isLoading = loading.checkIns || loading.usuarios || loading.turmas;
  const hasErrors = errors.checkIns || errors.usuarios || errors.turmas || errors.general;
  const hasCriticalError = errors.usuarios !== null; // Sem usuários não dá pra usar a tela

  const today = new Date().toISOString().split('T')[0];
  const checkInsHoje = checkIns.filter(c => c.data === today);

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

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

    setIsRegistering(true);
    try {
      logger.info('[CheckIn]', `Registrando check-in para ${aluno.nome}...`);
      const result = await checkinService.registerCheckin(aluno.id, aluno.turmaId || '', 'MANUAL');
      
      if (result.success) {
        setShowSuccess(true);
        setRetryCount(c => c + 1); // Reload data
        setTimeout(() => {
          setShowSuccess(false);
          setSearchTerm('');
        }, 2000);
        logger.info('[CheckIn]', `Check-in registrado com sucesso: ${aluno.nome}`);
      } else {
        setErrors(prev => ({ ...prev, general: result.error || 'Erro ao registrar check-in' }));
        logger.error('[CheckIn]', 'Falha ao registrar check-in:', result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao registrar check-in';
      setErrors(prev => ({ ...prev, general: errorMsg }));
      logger.error('[CheckIn]', 'Exceção ao registrar check-in:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const getAlunoCheckInStatus = (alunoId: string) => {
    return checkInsHoje.some(c => c.alunoId === alunoId);
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <PremiumLoader text="Carregando dados do check-in..." />
      <div className="text-sm text-white/50 space-y-1">
        {loading.checkIns && <p>• Carregando check-ins...</p>}
        {loading.usuarios && <p>• Carregando alunos...</p>}
        {loading.turmas && <p>• Carregando turmas...</p>}
      </div>
    </div>
  );

  const renderErrorState = () => {
    // Erro crítico: sem usuários
    if (hasCriticalError) {
      return (
        <PageError 
          error={errors.usuarios || 'Erro ao carregar dados'} 
          onRetry={handleRetry}
          message="Não foi possível carregar a lista de alunos. Verifique sua conexão e tente novamente."
        />
      );
    }

    // Erros parciais: mostrar aviso mas permitir uso
    return (
      <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-400 mb-1">
              Alguns dados não puderam ser carregados
            </p>
            <ul className="text-xs text-white/60 space-y-1">
              {errors.checkIns && <li>• Check-ins: {errors.checkIns}</li>}
              {errors.turmas && <li>• Turmas: {errors.turmas}</li>}
            </ul>
          </div>
          <button
            onClick={handleRetry}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Tentar novamente"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading && !hasErrors) {
    return renderLoadingState();
  }

  if (hasCriticalError) {
    return renderErrorState();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('checkin.title')}
        </h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>
          {t('checkin.validatePresence')}
        </p>
      </div>

      {/* Erros Parciais */}
      {(errors.checkIns || errors.turmas) && renderErrorState()}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hover-card" style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('checkin.todayCheckins')}
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white/70">
                {loading.checkIns ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                ) : (
                  checkInsHoje.length
                )}
              </p>
            </div>
            <Check className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div className="hover-card" style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('checkin.totalStudents')}
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white">
                {loading.usuarios ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                ) : (
                  alunos.length
                )}
              </p>
            </div>
            <UsersIcon className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div className="hover-card" style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('checkin.attendanceRate')}
              </p>
              <p className="text-green-400" style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.03em' }}>
                {loading.checkIns || loading.usuarios ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                ) : alunos.length > 0 ? (
                  `${Math.round((checkInsHoje.length / alunos.length) * 100)}%`
                ) : (
                  '0%'
                )}
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
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('checkin.checkinDone')}
              </h3>
              <p className="text-green-400">{selectedAluno.nome} - {formatTime(new Date())}</p>
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
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('checkin.studentBlocked')}
              </h3>
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
            className="w-full pl-14 pr-4 py-4 bg-white/10 border border-white/15 rounded-xl text-white text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent disabled:opacity-50"
            autoFocus
            disabled={loading.usuarios}
          />
          {loading.usuarios && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-white/40" />
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div style={{ ...glass, overflow: 'hidden' }}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('checkin.resultsFound', { count: filteredAlunos.length })}
            </h3>
            {isRegistering && (
              <span className="text-xs text-white/50 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Registrando...
              </span>
            )}
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
                          <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {aluno.nome}
                          </h4>
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
                          <span>{turma?.nome || 'Sem turma'}</span>
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
                      disabled={jaFezCheckIn || aluno.status === 'BLOQUEADO' || isRegistering}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        jaFezCheckIn
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : aluno.status === 'BLOQUEADO'
                          ? 'bg-red-950/20 border border-red-500/20 text-red-400 cursor-not-allowed'
                          : isRegistering
                          ? 'bg-white/5 text-white/40 cursor-wait'
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
                      ) : isRegistering ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processando...
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
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('checkin.todayCheckinsList')}
          </h3>
          {loading.checkIns && (
            <Loader2 className="w-5 h-5 animate-spin text-white/40" />
          )}
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

        {checkInsHoje.length === 0 && !loading.checkIns && (
          <div className="empty-state-premium text-center py-12">
            <Clock className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p style={{ fontWeight: 300, color: tokens.textMuted }}>{t('checkin.noCheckinToday')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
