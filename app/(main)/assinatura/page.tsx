'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  FileText, CheckCircle, Clock, AlertCircle, Shield,
  ChevronDown, ChevronUp, PenTool, X, Lock,
} from 'lucide-react';
import * as assService from '@/lib/api/assinatura.service';
import type { DocumentoAssinatura, ConsentimentoLGPD } from '@/lib/api/assinatura.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';

type TabView = 'documentos' | 'privacidade';

const STATUS_CONFIG: Record<string, { Icon: typeof CheckCircle; color: string; labelKey: string }> = {
  ASSINADO: { Icon: CheckCircle, color: 'text-emerald-400', labelKey: 'signature.status.signed' },
  PENDENTE: { Icon: Clock, color: 'text-amber-400', labelKey: 'signature.status.pending' },
  EXPIRADO: { Icon: AlertCircle, color: 'text-red-400', labelKey: 'signature.status.expired' },
  CANCELADO: { Icon: X, color: 'text-white/30', labelKey: 'signature.status.cancelled' },
};

export default function AssinaturaPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate } = useFormatting();

  const [documentos, setDocumentos] = useState<DocumentoAssinatura[]>([]);
  const [consentimentos, setConsentimentos] = useState<ConsentimentoLGPD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabView>('documentos');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [signing, setSigning] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([assService.getDocumentos(), assService.getConsentimentos()])
      .then(([docs, cons]) => { setDocumentos(docs); setConsentimentos(cons); })
      .catch((err: unknown) => setError(handleServiceError(err, 'Documentos')))
      .finally(() => setLoading(false));
  }, []);

  const handleSign = useCallback(async (id: string) => {
    setSigning(id);
    try {
      const updated = await assService.assinarDocumento(id);
      setDocumentos(prev => prev.map(d => d.id === id ? updated : d));
    } catch { /* noop */ }
    setSigning(null);
  }, []);

  const handleToggleConsent = useCallback(async (id: string, aceito: boolean) => {
    try {
      const updated = await assService.toggleConsentimento(id, aceito);
      setConsentimentos(prev => prev.map(c => c.id === id ? updated : c));
    } catch { /* noop */ }
  }, []);

  const pendentes = documentos.filter(d => d.status === 'PENDENTE');
  const assinados = documentos.filter(d => d.status === 'ASSINADO');

  if (loading) return <PremiumLoader />;
  if (error) return <PageError error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          <FileText size={20} className="text-blue-400" />
          {t('signature.title')}
        </h1>
        <p className="text-sm text-white/40 mt-1">{t('signature.subtitle')}</p>
      </div>

      {/* Pending alert */}
      {pendentes.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <Clock size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-amber-300/70 font-bold">{t('signature.pendingDocs', { count: pendentes.length })}</p>
            <p className="text-[10px] text-amber-300/40 mt-0.5">{t('signature.pendingHint')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 w-fit">
        <button onClick={() => setTab('documentos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${tab === 'documentos' ? 'bg-white/[0.08] text-white' : 'text-white/30'}`}>
          <PenTool size={13} /> {t('signature.tabs.documents')} {pendentes.length > 0 && <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[9px] flex items-center justify-center">{pendentes.length}</span>}
        </button>
        <button onClick={() => setTab('privacidade')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${tab === 'privacidade' ? 'bg-white/[0.08] text-white' : 'text-white/30'}`}>
          <Shield size={13} /> {t('signature.tabs.privacy')}
        </button>
      </div>

      {/* DOCUMENTOS TAB */}
      {tab === 'documentos' && (
        <div className="space-y-3">
          {documentos.map(doc => {
            const statusCfg = STATUS_CONFIG[doc.status];
            const StatusIcon = statusCfg.Icon;
            const isExpanded = expandedDoc === doc.id;

            return (
              <div key={doc.id} className={`rounded-xl border overflow-hidden hover-card ${
                doc.status === 'PENDENTE' ? 'bg-amber-500/[0.02] border-amber-500/15' : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                <button
                  onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                  className="flex items-center gap-3 p-4 w-full text-left"
                >
                  <StatusIcon size={18} className={statusCfg.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white/70">{doc.titulo}</p>
                      {doc.obrigatorio && <span className="text-[8px] text-red-400/60 bg-red-500/10 px-1.5 py-0.5 rounded font-bold">{t('signature.required')}</span>}
                    </div>
                    <p className="text-[10px] text-white/25 mt-0.5">{doc.descricao}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.color} bg-current/10`}>
                    {t(statusCfg.labelKey)}
                  </span>
                  {isExpanded ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/[0.04] p-4 space-y-4 bg-white/[0.01]">
                    {/* Document content */}
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 max-h-48 overflow-y-auto">
                      <p className="text-xs text-white/50 whitespace-pre-wrap leading-relaxed font-mono">{doc.conteudo}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-[10px] text-white/20">
                      <span>{t('signature.version', { version: doc.versao })}</span>
                      {doc.dataAssinatura && <span>{t('signature.signedOn', { date: formatDate(doc.dataAssinatura, 'short') })}</span>}
                      {doc.hashAssinatura && <span className="flex items-center gap-1"><Lock size={9} /> {doc.hashAssinatura.slice(0, 20)}...</span>}
                    </div>

                    {/* Sign button */}
                    {doc.status === 'PENDENTE' && (
                      <button
                        onClick={() => handleSign(doc.id)}
                        disabled={signing === doc.id}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-300 text-sm font-bold hover:bg-blue-500/25 transition-colors disabled:opacity-40"
                      >
                        <PenTool size={14} />
                        {signing === doc.id ? t('signature.signing') : t('signature.signDigitally')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PRIVACIDADE TAB */}
      {tab === 'privacidade' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <Shield size={16} className="text-blue-400/60 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-300/50 leading-relaxed">
              {t('signature.lgpdInfo')}
            </p>
          </div>

          <div className="space-y-2">
            {consentimentos.map(cons => (
              <div key={cons.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white/70">{cons.titulo}</p>
                    {cons.obrigatorio && <span className="text-[8px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded font-bold">{t('signature.required')}</span>}
                  </div>
                  <p className="text-[10px] text-white/25 mt-0.5">{cons.descricao}</p>
                  {cons.dataAceite && <p className="text-[9px] text-white/15 mt-1">{t('signature.acceptedOn', { date: cons.dataAceite })}</p>}
                </div>
                <button
                  onClick={() => !cons.obrigatorio && handleToggleConsent(cons.id, !cons.aceito)}
                  disabled={cons.obrigatorio}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    cons.aceito ? 'bg-emerald-500' : 'bg-white/10'
                  } ${cons.obrigatorio ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    cons.aceito ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>

          {/* Data rights */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-3">
            <h3 className="text-sm font-bold text-white/50 flex items-center gap-2">
              <Lock size={14} className="text-white/30" /> {t('signature.yourRights')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                t('signature.rights.dataAccess'),
                t('signature.rights.dataCorrection'),
                t('signature.rights.dataDeletion'),
                t('signature.rights.dataPortability'),
                t('signature.rights.consentRevocation'),
                t('signature.rights.sharingInfo'),
              ].map(right => (
                <div key={right} className="flex items-center gap-2 text-xs text-white/40">
                  <CheckCircle size={10} className="text-emerald-400/50 shrink-0" />
                  {right}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/15">{t('signature.contactForRights')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
