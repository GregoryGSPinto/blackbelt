'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Calendar, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import * as adminService from '@/lib/api/admin.service';
import type { Usuario, HistoricoStatus } from '@/lib/api/admin.service';
import { AlunoEmAtrasoActions, AlunoBloqueadoActions } from './_components/AlunoActions';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

export default function FinanceiroPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate } = useFormatting();
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [historico, setHistorico] = useState<HistoricoStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [usuariosData, historicoData] = await Promise.all([
          adminService.getUsuarios(),
          adminService.getHistoricoStatus(),
        ]);
        setAllUsuarios(usuariosData);
        setAlunos(usuariosData.filter(u => u.tipo === 'ALUNO'));
        setHistorico(historicoData);
      } catch (err) {
        setError(handleServiceError(err, 'Financeiro'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  if (loading) return <PremiumLoader text={t('financial.loading')} />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  if (alunos.length === 0) return <PageEmpty icon={Users} title={t('financial.noStudentFound')} message={t('financial.noFinancialRecords')} />;

  const stats = {
    emDia: alunos.filter(a => a.status === 'ATIVO').length,
    emAtraso: alunos.filter(a => a.status === 'EM_ATRASO').length,
    bloqueados: alunos.filter(a => a.status === 'BLOQUEADO').length,
  };

  const alunosPorStatus = {
    ativos: alunos.filter(a => a.status === 'ATIVO'),
    emAtraso: alunos.filter(a => a.status === 'EM_ATRASO'),
    bloqueados: alunos.filter(a => a.status === 'BLOQUEADO'),
  };

  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '4px' } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{t('financial.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted, marginTop: '0.25rem' }}>{t('financial.paymentStatusControl')}</p>
      </div>

      <div style={{ ...glass, padding: '1rem' }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: tokens.text }} />
          <p className="text-sm" style={{ fontWeight: 300, color: tokens.textMuted }}>
            <strong>{t('financial.visualModuleTitle')}:</strong> {t('financial.visualModuleDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>{t('financial.onTime')}</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.03em', color: '#4ade80' }}>{stats.emDia}</p>
            </div>
            <CheckCircle className="w-12 h-12" style={{ color: tokens.textMuted }} />
          </div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>
            {t('financial.percentStudents', { pct: Math.round((stats.emDia / alunos.length) * 100) })}
          </div>
        </div>

        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>{t('financial.overdue')}</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.03em', color: tokens.warning }}>{stats.emAtraso}</p>
            </div>
            <AlertCircle className="w-12 h-12" style={{ color: tokens.textMuted }} />
          </div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>{t('financial.requiresAttention')}</div>
        </div>

        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>{t('financial.blocked')}</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.03em', color: tokens.error }}>{stats.bloqueados}</p>
            </div>
            <DollarSign className="w-12 h-12" style={{ color: tokens.textMuted }} />
          </div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>{t('financial.criticalDefault')}</div>
        </div>
      </div>

      {alunosPorStatus.emAtraso.length > 0 && (
        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-2" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>
              <AlertCircle className="w-5 h-5" style={{ color: tokens.warning }} />
              {t('financial.overdueStudents')} ({alunosPorStatus.emAtraso.length})
            </h3>
          </div>
          <div className="space-y-3">
            {alunosPorStatus.emAtraso.map((aluno) => (
              <div key={aluno.id} style={{ background: tokens.cardBg, border: `1px solid ${tokens.divider}`, borderRadius: '4px', padding: '1rem' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}` }}>
                      <span className="font-medium text-sm" style={{ color: tokens.text }}>
                        {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: tokens.text }}>{aluno.nome}</p>
                      <p className="text-xs" style={{ color: tokens.textMuted }}>
                        {t('financial.dueDate')}: {aluno.proximoVencimento ? formatDate(aluno.proximoVencimento, 'short') : '-'}
                      </p>
                    </div>
                  </div>
                  <AlunoEmAtrasoActions alunoId={aluno.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alunosPorStatus.bloqueados.length > 0 && (
        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-2" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>
              <DollarSign className="w-5 h-5" style={{ color: tokens.error }} />
              {t('financial.blockedStudents')} ({alunosPorStatus.bloqueados.length})
            </h3>
          </div>
          <div className="space-y-3">
            {alunosPorStatus.bloqueados.map((aluno) => (
              <div key={aluno.id} style={{ background: tokens.cardBg, border: `1px solid ${tokens.divider}`, borderRadius: '4px', padding: '1rem' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}` }}>
                      <span className="font-medium text-sm" style={{ color: tokens.text }}>
                        {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: tokens.text }}>{aluno.nome}</p>
                      <p className="text-xs" style={{ color: tokens.error }}>{aluno.observacoes}</p>
                    </div>
                  </div>
                  <AlunoBloqueadoActions alunoId={aluno.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...glass, padding: '1.5rem' }}>
        <h3 className="mb-6" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>{t('financial.statusChangeHistory')}</h3>
        <div className="space-y-3">
          {historico.slice(0, 5).map((hist) => {
            const aluno = allUsuarios.find(u => u.id === hist.alunoId);
            return (
              <div key={hist.id} className="flex items-start gap-3 p-3" style={{ borderBottom: `1px solid ${tokens.divider}` }}>
                <Calendar className="w-5 h-5 mt-0.5" style={{ color: tokens.textMuted }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: tokens.text }}>
                    <strong>{aluno?.nome}</strong> {t('financial.changedFrom')}{' '}
                    <span style={{ color: tokens.warning }}>{hist.statusAnterior}</span> {t('financial.changedTo')}{' '}
                    <span style={{ color: tokens.error }}>{hist.statusNovo}</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: tokens.textMuted }}>{hist.motivo}</p>
                  <p className="text-xs mt-1" style={{ color: tokens.textMuted }}>
                    {formatDate(hist.data, 'short')} - {t('financial.changedBy')} {hist.alteradoPor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
