'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle, XCircle, DollarSign, TrendingDown } from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { Alerta, Usuario, Turma } from '@/lib/api/admin.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filter, setFilter] = useState<'TODOS' | 'ALTA' | 'MEDIA' | 'BAIXA'>('TODOS');

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [alertasData, usuariosData, turmasData] = await Promise.all([
          adminService.getAlertas(),
          adminService.getUsuarios(),
          adminService.getTurmas(),
        ]);
        setAlertas(alertasData);
        setUsuarios(usuariosData);
        setTurmas(turmasData);
      } catch (err) {
        setError(handleServiceError(err, 'Alertas'));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  // ─── Search Registration ──────────────────────────────────
  const searchItems = useMemo<SearchItem[]>(() =>
    alertas.map((a) => ({
      id: `alerta-${a.id}`,
      label: a.titulo,
      sublabel: `${a.mensagem} · ${a.prioridade}`,
      categoria: 'Alerta',
      icon: a.prioridade === 'ALTA' ? '🔴' : a.prioridade === 'MEDIA' ? '🟡' : '🟢',
      href: '/alertas',
      keywords: [a.tipo, a.prioridade, a.mensagem],
    })),
  [alertas]);

  useSearchRegistration('admin-alertas', searchItems);

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

  const filteredAlertas = filter === 'TODOS' 
    ? alertas 
    : alertas.filter(a => a.prioridade === filter);

  const alertasPorPrioridade = {
    ALTA: alertas.filter(a => a.prioridade === 'ALTA').length,
    MEDIA: alertas.filter(a => a.prioridade === 'MEDIA').length,
    BAIXA: alertas.filter(a => a.prioridade === 'BAIXA').length,
  };

  const getAlertaIcon = (tipo: Alerta['tipo']) => {
    switch (tipo) {
      case 'BLOQUEIO':
        return XCircle;
      case 'ATRASO':
        return AlertCircle;
      case 'VENCIMENTO':
        return DollarSign;
      case 'FREQUENCIA':
        return TrendingDown;
      default:
        return AlertCircle;
    }
  };

  const getAlertaColor = (prioridade: Alerta['prioridade']) => {
    switch (prioridade) {
      case 'ALTA':
        return {
          bg: 'bg-black/40 backdrop-blur-xl',
          border: 'border-red-500/20',
          text: 'text-red-400',
          dot: 'bg-red-500'
        };
      case 'MEDIA':
        return {
          bg: 'bg-black/40 backdrop-blur-xl',
          border: 'border-yellow-500/20',
          text: 'text-yellow-400',
          dot: 'bg-yellow-500'
        };
      case 'BAIXA':
        return {
          bg: 'bg-black/40 backdrop-blur-xl',
          border: 'border-white/10',
          text: 'text-white',
          dot: 'bg-white/20'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Alertas Operacionais</h1>
        <p className="text-white/50">Monitoramento de eventos que requerem atenção</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 backdrop-blur-xl border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Prioridade Alta</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-400">{alertasPorPrioridade.ALTA}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-white/30" />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Prioridade Média</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400">{alertasPorPrioridade.MEDIA}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-white/30" />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Prioridade Baixa</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{alertasPorPrioridade.BAIXA}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-white/40" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['TODOS', 'ALTA', 'MEDIA', 'BAIXA'] as const).map((prioridade) => (
          <button
            key={prioridade}
            onClick={() => setFilter(prioridade)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === prioridade
                ? 'bg-white/10 border border-white/10 text-white'
                : 'bg-white/10 text-white/50 hover:text-white'
            }`}
          >
            {prioridade === 'TODOS' ? 'Todos' : `Prioridade ${prioridade.charAt(0) + prioridade.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      {/* Alertas List */}
      <div className="space-y-4">
        {filteredAlertas.map((alerta) => {
          const color = getAlertaColor(alerta.prioridade);
          const Icon = getAlertaIcon(alerta.tipo);
          const aluno = alerta.alunoId ? usuarios.find(u => u.id === alerta.alunoId) : null;
          const turma = alerta.turmaId ? turmas.find(t => t.id === alerta.turmaId) : null;

          return (
            <div
              key={alerta.id}
              className={`${color.bg} border ${color.border} rounded-xl p-6`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${color.bg} border ${color.border} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${color.text}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-bold ${color.text}`}>{alerta.titulo}</h3>
                      <span className={`w-2 h-2 rounded-full ${color.dot} ${!alerta.lido ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className="text-xs text-white/40 flex-shrink-0">
                      {new Date(alerta.data).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(alerta.data).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="text-white/70 mb-3">{alerta.mensagem}</p>

                  {(aluno || turma) && (
                    <div className="flex items-center gap-4 text-sm">
                      {aluno && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/40">Aluno:</span>
                          <span className="text-white font-medium">{aluno.nome}</span>
                        </div>
                      )}
                      {turma && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/40">Turma:</span>
                          <span className="text-white font-medium">{turma.nome}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!alerta.lido && (
                    <button className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium">
                      Marcar como Lido
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlertas.length === 0 && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Tudo Tranquilo!</h3>
          <p className="text-white/50">Não há alertas nesta categoria</p>
        </div>
      )}
    </div>
  );
}
