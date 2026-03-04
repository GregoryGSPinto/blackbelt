'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Calendar , Users} from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { Usuario, HistoricoStatus } from '@/lib/api/admin.service';
import { AlunoEmAtrasoActions, AlunoBloqueadoActions } from './_components/AlunoActions';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';

export default function FinanceiroPage() {
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

  if (loading) {
    return <PremiumLoader text="Carregando financeiro..." />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (alunos.length === 0) {
    return <PageEmpty icon={Users} title="Nenhum aluno encontrado" message="Não há registros financeiros de alunos." />;
  }


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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Financeiro</h1>
        <p className="text-white/50">Controle de status de pagamento dos alunos</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white/70">
              <strong>Módulo Financeiro Visual:</strong> Este módulo controla apenas o{' '}
              <strong>status operacional</strong> do aluno (Ativo / Em Atraso / Bloqueado). 
              Não processa pagamentos automáticos nem integra com gateways.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/50 mb-1">Pagamentos em Dia</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400">{stats.emDia}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-white/40" />
          </div>
          <div className="text-xs text-white/40">
            {Math.round((stats.emDia / alunos.length) * 100)}% dos alunos
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/50 mb-1">Em Atraso</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400">{stats.emAtraso}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-white/30" />
          </div>
          <div className="text-xs text-white/40">Requer atenção</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/50 mb-1">Bloqueados</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-400">{stats.bloqueados}</p>
            </div>
            <DollarSign className="w-12 h-12 text-white/30" />
          </div>
          <div className="text-xs text-white/40">Inadimplência crítica</div>
        </div>
      </div>

      {alunosPorStatus.emAtraso.length > 0 && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Alunos em Atraso ({alunosPorStatus.emAtraso.length})
            </h3>
          </div>
          <div className="space-y-3">
            {alunosPorStatus.emAtraso.map((aluno) => (
              <div key={aluno.id} className="bg-black/30 backdrop-blur-xl border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{aluno.nome}</p>
                      <p className="text-xs text-white/50">
                        Vencimento: {aluno.proximoVencimento ? new Date(aluno.proximoVencimento).toLocaleDateString('pt-BR') : '-'}
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
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-400" />
              Alunos Bloqueados ({alunosPorStatus.bloqueados.length})
            </h3>
          </div>
          <div className="space-y-3">
            {alunosPorStatus.bloqueados.map((aluno) => (
              <div key={aluno.id} className="bg-black/30 backdrop-blur-xl border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{aluno.nome}</p>
                      <p className="text-xs text-red-400">{aluno.observacoes}</p>
                    </div>
                  </div>
                  <AlunoBloqueadoActions alunoId={aluno.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Histórico de Alterações de Status</h3>
        <div className="space-y-3">
          {historico.slice(0, 5).map((hist) => {
            const aluno = allUsuarios.find(u => u.id === hist.alunoId);
            return (
              <div key={hist.id} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                <Calendar className="w-5 h-5 text-white/40 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <strong>{aluno?.nome}</strong> mudou de{' '}
                    <span className="text-yellow-400">{hist.statusAnterior}</span> para{' '}
                    <span className="text-red-400">{hist.statusNovo}</span>
                  </p>
                  <p className="text-xs text-white/50 mt-1">{hist.motivo}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {new Date(hist.data).toLocaleDateString('pt-BR')} - Alterado por {hist.alteradoPor}
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
