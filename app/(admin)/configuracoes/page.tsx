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
  const tc = useTranslations('common');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' } as const;

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
      setError(handleServiceError(err, tc('actions.save')));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PremiumLoader text={t('config.loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (!config) {
    return <PageEmpty icon={Settings} title={t('config.unavailable')} message={t('config.cannotLoad')} />;
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('config.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>{t('config.subtitle')}</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div style={{ ...glass, padding: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: tokens.text }}>{t('config.saved')}</p>
              <p className="text-xs text-green-400">{t('config.changesApplied')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Políticas de Inadimplência */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('config.defaultPolicies')}</h3>
            <p className="text-sm" style={{ color: tokens.textMuted }}>{t('config.defaultPoliciesDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('config.overdueLimit')}
            </label>
            <input
              type="number"
              value={config.limiteAtrasoPermitido}
              onChange={(e) => setConfig({ ...config, limiteAtrasoPermitido: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <p className="text-xs text-white/40 mt-2">
              {t('config.overdueLimitDesc')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('config.daysToBlock')}
            </label>
            <input
              type="number"
              value={config.diasParaBloqueio}
              onChange={(e) => setConfig({ ...config, diasParaBloqueio: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <p className="text-xs text-white/40 mt-2">
              {t('config.daysToBlockDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Mensagem de Bloqueio */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('config.blockMessage')}</h3>
            <p className="text-sm" style={{ color: tokens.textMuted }}>{t('config.blockMessageDesc')}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
            {t('config.message')}
          </label>
          <textarea
            value={config.mensagemBloqueio}
            onChange={(e) => setConfig({ ...config, mensagemBloqueio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
          />
          <p className="text-xs text-white/40 mt-2">
            {t('config.blockMessageHint')}
          </p>
        </div>
      </div>

      {/* Horário de Funcionamento */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('config.businessHours')}</h3>
            <p className="text-sm" style={{ color: tokens.textMuted }}>{t('config.businessHoursDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('config.openingTime')}
            </label>
            <input
              type="time"
              value={config.horarioFuncionamento.abertura}
              onChange={(e) => setConfig({
                ...config,
                horarioFuncionamento: { ...config.horarioFuncionamento, abertura: e.target.value }
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('config.closingTime')}
            </label>
            <input
              type="time"
              value={config.horarioFuncionamento.fechamento}
              onChange={(e) => setConfig({
                ...config,
                horarioFuncionamento: { ...config.horarioFuncionamento, fechamento: e.target.value }
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Check-in Antecipado */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('config.earlyCheckin')}</h3>
              <p className="text-sm" style={{ color: tokens.textMuted }}>{t('config.earlyCheckinDesc')}</p>
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
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('config.minutesAhead')}
            </label>
            <input
              type="number"
              value={config.minutosAntecedencia}
              onChange={(e) => setConfig({ ...config, minutosAntecedencia: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <p className="text-xs text-white/40 mt-2">
              {t('config.minutesAheadDesc', { minutes: config.minutosAntecedencia })}
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? t('config.saveConfig') + '...' : t('config.saveConfig')}</span>
        </button>
      </div>
    </div>
  );
}
