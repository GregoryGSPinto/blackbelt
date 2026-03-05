'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle, MessageSquare , Settings} from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { ConfiguracaoUnidade } from '@/lib/api/admin.service';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function ConfiguracoesPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '4px' } as const;

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
    return <PremiumLoader text="Carregando configurações..." />;
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
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{t('config.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>Políticas operacionais e regras do sistema</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div style={{ ...glass, padding: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: tokens.text }}>Configurações Salvas!</p>
              <p className="text-xs text-green-400">As alterações foram aplicadas com sucesso</p>
            </div>
          </div>
        </div>
      )}

      {/* Políticas de Inadimplência */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Políticas de Inadimplência</h3>
            <p className="text-sm" style={{ color: tokens.textMuted }}>Defina as regras de bloqueio por atraso</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.5rem', fontWeight: 400 }}>
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
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.5rem', fontWeight: 400 }}>
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
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Mensagem de Bloqueio</h3>
            <p className="text-sm" style={{ color: tokens.textMuted }}>Mensagem exibida ao aluno bloqueado</p>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.5rem', fontWeight: 400 }}>
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
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Horário de Funcionamento</h3>
            <p className="text-sm" style={{ color: tokens.textMuted }}>Defina os horários de abertura e fechamento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.5rem', fontWeight: 400 }}>
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
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.5rem', fontWeight: 400 }}>
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
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Check-in Antecipado</h3>
              <p className="text-sm" style={{ color: tokens.textMuted }}>Permitir check-in antes do horário da sessão</p>
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
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.5rem', fontWeight: 400 }}>
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
          <span>{saving ? t('config.saveConfig') + '...' : t('config.saveConfig')}</span>
        </button>
      </div>
    </div>
  );
}
