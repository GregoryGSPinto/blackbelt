'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle , CalendarOff} from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { Turma, CheckIn, Usuario } from '@/lib/api/admin.service';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function AgendaPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '4px' } as const;

  const [turmasHoje, setTurmasHoje] = useState<Turma[]>([]);
  const [checkInsHoje, setCheckInsHoje] = useState<CheckIn[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [turmasData, checkInsData, usuariosData] = await Promise.all([
          adminService.getTurmas(),
          adminService.getCheckIns(),
          adminService.getUsuarios(),
        ]);
        const hoje = 'Segunda';
        setTurmasHoje(turmasData.filter(t =>
          t.status === 'ATIVA' && t.diasSemana.some(dia => dia.includes(hoje))
        ));
        setCheckInsHoje(checkInsData.filter(c => c.data === '2026-02-02'));
        setUsuarios(usuariosData);
      } catch (err) {
        setError(handleServiceError(err, 'Agenda'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  if (loading) {
    return <PremiumLoader text="Carregando agenda..." />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (turmasHoje.length === 0) {
    return <PageEmpty icon={CalendarOff} title="Nenhuma sessão hoje" message="Não há turmas agendadas para hoje." />;
  }


  const getCheckInsDaTurma = (turmaId: string) => {
    return checkInsHoje.filter(c => c.turmaId === turmaId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{t('agenda.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>Segunda-feira, 02 de Fevereiro de 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>{t('agenda.classesToday')}</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/70">{turmasHoje.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>{t('agenda.checkinsDone')}</p>
              <p className="text-green-400" style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.03em' }}>{checkInsHoje.length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div style={{ ...glass, padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.25rem' }}>Total de Alunos</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {turmasHoje.reduce((sum, t) => sum + t.alunosMatriculados, 0)}
              </p>
            </div>
            <Users className="w-10 h-10 text-white/40" />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text, marginBottom: '1.5rem' }}>{t('agenda.classSchedule')}</h3>
        <div className="space-y-4">
          {turmasHoje
            .sort((a, b) => {
              const horaA = parseInt(a.horario.split(':')[0]);
              const horaB = parseInt(b.horario.split(':')[0]);
              return horaA - horaB;
            })
            .map((turma) => {
              const professor = usuarios.find(u => u.id === turma.professorId);
              const alunosDaTurma = usuarios.filter(u => u.tipo === 'ALUNO' && u.turmaId === turma.id);
              const checkInsDaTurma = getCheckInsDaTurma(turma.id);
              const taxaPresenca = alunosDaTurma.length > 0 
                ? Math.round((checkInsDaTurma / alunosDaTurma.length) * 100) 
                : 0;

              return (
                <div
                  key={turma.id}
                  className="bg-white/10 rounded-lg p-5 border-l-4 border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-white/70">
                          <Clock className="w-5 h-5" />
                          <span className="text-xl font-bold">{turma.horario}</span>
                        </div>
                        <span className="text-white/30">|</span>
                        <h4 className="text-xl font-bold text-white">{turma.nome}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          turma.categoria === 'ADULTO'
                            ? 'bg-white/10 text-white'
                            : 'bg-pink-600/20 text-pink-400'
                        }`}>
                          {turma.categoria}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-white/50">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{professor?.nome}</span>
                        </div>
                        <span>•</span>
                        <span>{turma.sala}</span>
                        <span>•</span>
                        <span>{alunosDaTurma.length} alunos matriculados</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                        <p className="text-green-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{checkInsDaTurma}</p>
                        <p className="text-xs" style={{ color: tokens.textMuted }}>Check-ins</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                      <span>Presença Atual</span>
                      <span className="font-medium text-white">{taxaPresenca}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-white/30 to-white/20"
                        style={{ width: `${taxaPresenca}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
