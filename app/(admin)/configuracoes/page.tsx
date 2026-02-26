'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle, MessageSquare , Settings} from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { ConfiguracaoUnidade } from '@/lib/api/admin.service';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfiguracaoUnidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const data = await adminService.getConfiguracao();
        setConfig(data);
      } catch (err) {
        setError(handleServiceError(err, 'Configuracoes'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await adminService.saveConfiguracao(config);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(handleServiceError(err, 'Salvar configuração'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 mx-auto mb-4" />
          <p className="text-white/60">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (!config) {
    return <PageEmpty icon={Settings} title="Configurações indisponíveis" message="Não foi possível carregar as configurações da unidade." />;
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Configurações da Unidade</h1>
        <p className="text-white/50">Políticas operacionais e regras do sistema</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Configurações Salvas!</p>
              <p className="text-xs text-green-400">As alterações foram aplicadas com sucesso</p>
            </div>
          </div>
        </div>
      )}

      {/* Políticas de Inadimplência */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Políticas de Inadimplência</h3>
            <p className="text-sm text-white/50">Defina as regras de bloqueio por atraso</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2">
              Limite de Atraso Permitido (dias)
            </label>
            <input
              type="number"
              value={config.limiteAtrasoPermitido}
              onChange={(e) => setConfig({ ...config, limiteAtrasoPermitido: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <p className="text-xs text-white/40 mt-2">
              Após este período, o aluno será marcado como "Em Atraso"
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/50 mb-2">
              Dias Para Bloqueio Automático
            </label>
            <input
              type="number"
              value={config.diasParaBloqueio}
              onChange={(e) => setConfig({ ...config, diasParaBloqueio: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <p className="text-xs text-white/40 mt-2">
              Após este período, o aluno será bloqueado automaticamente
            </p>
          </div>
        </div>
      </div>

      {/* Mensagem de Bloqueio */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Mensagem de Bloqueio</h3>
            <p className="text-sm text-white/50">Mensagem exibida ao aluno bloqueado</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/50 mb-2">
            Mensagem
          </label>
          <textarea
            value={config.mensagemBloqueio}
            onChange={(e) => setConfig({ ...config, mensagemBloqueio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
          />
          <p className="text-xs text-white/40 mt-2">
            Esta mensagem será exibida quando um aluno bloqueado tentar fazer check-in
          </p>
        </div>
      </div>

      {/* Horário de Funcionamento */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Horário de Funcionamento</h3>
            <p className="text-sm text-white/50">Defina os horários de abertura e fechamento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2">
              Horário de Abertura
            </label>
            <input
              type="time"
              value={config.horarioFuncionamento.abertura}
              onChange={(e) => setConfig({
                ...config,
                horarioFuncionamento: { ...config.horarioFuncionamento, abertura: e.target.value }
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/50 mb-2">
              Horário de Fechamento
            </label>
            <input
              type="time"
              value={config.horarioFuncionamento.fechamento}
              onChange={(e) => setConfig({
                ...config,
                horarioFuncionamento: { ...config.horarioFuncionamento, fechamento: e.target.value }
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Check-in Antecipado */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Check-in Antecipado</h3>
              <p className="text-sm text-white/50">Permitir check-in antes do horário da sessão</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.permitirCheckInAntecipado}
              onChange={(e) => setConfig({ ...config, permitirCheckInAntecipado: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-white/10"></div>
          </label>
        </div>

        {config.permitirCheckInAntecipado && (
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2">
              Minutos de Antecedência
            </label>
            <input
              type="number"
              value={config.minutosAntecedencia}
              onChange={(e) => setConfig({ ...config, minutosAntecedencia: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <p className="text-xs text-white/40 mt-2">
              Alunos poderão fazer check-in até {config.minutosAntecedencia} minutos antes da sessão
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </div>
  );
}
