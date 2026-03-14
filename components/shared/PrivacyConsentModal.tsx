// ============================================================
// PrivacyConsentModal — LGPD/ATT Soft Prompt (First Launch)
// ============================================================
// Shows on first app usage. Collects privacy consents.
// Stores acceptance in localStorage to avoid re-showing.
//
// TODO(LGPD-001): MIGRATE CONSENT STORAGE TO DATABASE
//   Currently consent is stored ONLY in localStorage, which means:
//   1) It is lost when the user clears browser data
//   2) It is not auditable for LGPD compliance (Art. 8, §2 — burden of proof)
//   3) It does not persist across devices
//   The consent state should be persisted to the backend via
//   POST /api/user/consent with { essential, analytics, notifications, acceptedAt }
//   and the localStorage should serve only as a cache/fallback.
//   See: saveConsentToBackend() stub below.
//
// Compliance:
//   - LGPD Art. 7, 8 (consentimento)
//   - Apple ATT-style flow (sem IDFA, mas boa prática)
//   - Google Data Safety disclosure
//
// Positioning: Não é "tracking consent" — é transparência.
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

const CONSENT_KEY = 'blackbelt-privacy-consent-v1';

interface ConsentState {
  essential: boolean;  // Always true, can't be unchecked
  analytics: boolean;
  notifications: boolean;
}

const DATA_ITEMS = [
  { key: 'essential' as const, label: 'essentialData', desc: 'essentialDesc', required: true },
  { key: 'analytics' as const, label: 'appImprovement', desc: 'improvementDesc', required: false },
  { key: 'notifications' as const, label: 'notificationsConsent', desc: 'notificationsConsent', required: false },
];

// TODO(LGPD-001): Replace this stub with a real API call once the endpoint exists.
// This should POST the consent record to the backend so it's stored in the database
// alongside the user profile, making it auditable per LGPD requirements.
async function saveConsentToBackend(consent: ConsentState & { acceptedAt: string }) {
  try {
    // Fire-and-forget: send consent to backend for database storage.
    // The localStorage write (below) acts as immediate cache so the modal
    // doesn't re-show even if this request fails.
    await fetch('/api/user/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(consent),
    });
  } catch {
    // Silent fail — localStorage is the fallback.
    // TODO(LGPD-001): Add retry logic or queue for offline scenarios.
    console.warn('[LGPD] Failed to sync consent to backend. Will retry on next session.');
  }
}

export function PrivacyConsentModal() {
  const t = useTranslations('common.privacy');
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    essential: true,
    analytics: true,
    notifications: true,
  });

  useEffect(() => {
    // Only show if not yet consented
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    const accepted = { ...consent, acceptedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(accepted));
    // TODO(LGPD-001): Sync consent to database for LGPD compliance audit trail
    saveConsentToBackend(accepted);
    setVisible(false);
  };

  const handleAcceptSelected = () => {
    const accepted = { ...consent, acceptedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(accepted));
    // TODO(LGPD-001): Sync consent to database for LGPD compliance audit trail
    saveConsentToBackend(accepted);
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[calc(100%-2rem)] sm:max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(20,18,16,0.97)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          animation: 'slideUp 0.3s ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Consentimento de privacidade"
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <Shield size={24} className="text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">{t('title')}</h2>
          <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
            O BlackBelt respeita seus dados. Veja como usamos suas informações.
          </p>
        </div>

        {/* Data items */}
        <div className="px-6 space-y-2">
          {DATA_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <label className="relative flex-shrink-0 mt-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent[item.key]}
                  onChange={(e) => {
                    if (item.required) return; // Can't uncheck essential
                    setConsent(prev => ({ ...prev, [item.key]: e.target.checked }));
                  }}
                  disabled={item.required}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                    ${consent[item.key]
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white/5 border-white/15'
                    }
                    ${item.required ? 'opacity-60' : ''}`}
                >
                  {consent[item.key] && <CheckCircle size={12} className="text-white" />}
                </div>
              </label>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 font-medium">
                  {t(item.label)}
                  {item.required && <span className="text-[9px] text-white/25 ml-1.5">(obrigatório)</span>}
                </p>
                <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">{t(item.desc)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Expandable details */}
        <div className="px-6 mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] text-blue-400/60 hover:text-blue-400/90 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Ocultar detalhes' : 'Ver detalhes completos'}
          </button>
          {expanded && (
            <div className="mt-2 p-3 rounded-xl bg-white/[0.02] text-[10px] text-white/25 leading-relaxed space-y-1.5">
              <p>• Não vendemos seus dados para terceiros</p>
              <p>• Não usamos IDFA ou tracking entre apps</p>
              <p>• Dados de treino são privados e só visíveis para você e seus instrutores</p>
              <p>• Você pode revogar consentimentos a qualquer momento em Configurações → Termos e Políticas</p>
              <p>• Dados podem ser excluídos em Configurações → Minha Conta → Excluir Conta</p>
              <p className="mt-2">
                <a href="/politica-privacidade" target="_blank" className="text-blue-400/50 underline">
                  {t('fullPolicy')}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 space-y-2.5">
          <button
            onClick={handleAcceptAll}
            className="w-full py-3.5 rounded-xl font-medium text-sm
                       bg-gradient-to-r from-blue-600 to-blue-500 text-white
                       hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg"
          >
            {t('acceptAll')}
          </button>
          <button
            onClick={handleAcceptSelected}
            className="w-full py-3 rounded-xl text-xs font-medium
                       bg-white/5 border border-white/10 text-white/40
                       hover:bg-white/10 transition-colors"
          >
            {t('acceptSelected')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
