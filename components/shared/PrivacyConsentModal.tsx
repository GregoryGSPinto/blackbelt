// ============================================================
// PrivacyConsentModal — LGPD/ATT Soft Prompt (First Launch)
// ============================================================
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

const CONSENT_KEY = 'blackbelt-privacy-consent-v1';
const GOLD_ACCENT = '#C9A227';
const GOLD_GLOW = '0 0 20px rgba(201,162,39,0.3)';

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  notifications: boolean;
}

const DATA_ITEMS = [
  { key: 'essential' as const, label: 'essentialData', desc: 'essentialDesc', required: true },
  { key: 'analytics' as const, label: 'appImprovement', desc: 'improvementDesc', required: false },
  { key: 'notifications' as const, label: 'notificationsConsent', desc: 'notificationsConsent', required: false },
];

async function saveConsentToBackend(consent: ConsentState & { acceptedAt: string }) {
  try {
    await fetch('/api/user/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(consent),
    });
  } catch {
    console.warn('[LGPD] Failed to sync consent to backend. Will retry on next session.');
  }
}

export function PrivacyConsentModal() {
  const t = useTranslations('common.privacy');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    essential: true,
    analytics: true,
    notifications: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const timer = window.setTimeout(() => setVisible(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const detailItems = useMemo(() => [
    'Não vendemos seus dados para terceiros.',
    'Não usamos rastreamento cross-app nem IDFA.',
    'Os dados de treino ficam restritos ao seu contexto operacional.',
    'Você pode revogar consentimentos em Configurações -> Termos e Políticas.',
    'A exclusão de conta permanece disponível em Configurações -> Minha Conta -> Excluir Conta.',
  ], []);

  if (!visible) return null;

  const textPrimary = tokens.text;
  const textSecondary = tokens.textMuted;
  const cardStyle = {
    background: tokens.cardBg,
    border: `1px solid ${tokens.cardBorder}`,
    backdropFilter: 'blur(12px) saturate(1.2)',
    WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
    borderRadius: '2px',
  } as const;

  const persistConsent = (nextConsent: ConsentState) => {
    const accepted = { ...nextConsent, acceptedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(accepted));
    saveConsentToBackend(accepted);
    setVisible(false);
  };

  const handleAcceptAll = () => {
    const nextConsent = {
      essential: true,
      analytics: true,
      notifications: true,
    };
    setConsent(nextConsent);
    persistConsent(nextConsent);
  };

  const handleAcceptSelected = () => {
    persistConsent(consent);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center px-4 py-4 sm:items-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-[480px] overflow-hidden"
        style={{
          ...cardStyle,
          padding: '2rem',
          color: textPrimary,
          boxShadow: isDark ? '0 18px 60px rgba(0,0,0,0.45)' : '0 18px 60px rgba(0,0,0,0.18)',
          transform: 'translateY(0)',
          opacity: 1,
          animation: 'privacyConsentEnter 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Privacidade e dados"
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center"
            style={{
              ...cardStyle,
              borderColor: `${GOLD_ACCENT}55`,
              background: isDark ? 'rgba(201,162,39,0.12)' : 'rgba(201,162,39,0.08)',
              flexShrink: 0,
            }}
          >
            <Shield size={18} color={GOLD_ACCENT} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className="premium-title"
              style={{
                color: textPrimary,
                fontWeight: 300,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Privacidade &amp; Dados
            </h2>
            <p
              style={{
                color: textSecondary,
                fontWeight: 300,
                lineHeight: 1.65,
                fontSize: '0.95rem',
                maxWidth: '34ch',
              }}
            >
              Respeitamos sua privacidade. Escolha quais dados você autoriza para manter o app útil e previsível.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {DATA_ITEMS.map((item) => {
            const checked = consent[item.key];
            const interactive = !item.required;

            return (
              <label
                key={item.key}
                className="block cursor-pointer transition-colors duration-300"
                style={{
                  ...cardStyle,
                  padding: '1rem 1rem 0.95rem',
                  borderColor: checked ? `${GOLD_ACCENT}88` : tokens.cardBorder,
                  boxShadow: checked ? '0 0 0 1px rgba(201,162,39,0.08)' : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={item.required}
                    onChange={(event) => {
                      if (!interactive) return;
                      setConsent((previous) => ({
                        ...previous,
                        [item.key]: event.target.checked,
                      }));
                    }}
                    className="sr-only"
                  />

                  <span
                    aria-hidden="true"
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '999px',
                      border: `1px solid ${checked ? `${GOLD_ACCENT}AA` : tokens.cardBorder}`,
                      background: checked ? GOLD_ACCENT : 'transparent',
                      boxShadow: checked ? GOLD_GLOW : 'none',
                      position: 'relative',
                      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: item.required ? 0.8 : 1,
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: checked ? '22px' : '2px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '999px',
                        background: checked ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#f5f5f0' : '#111827'),
                        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {checked ? <Check size={11} color={GOLD_ACCENT} /> : null}
                    </span>
                  </span>

                  <span className="block min-w-0 flex-1">
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: textPrimary,
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                        fontSize: '0.96rem',
                      }}
                    >
                      {t(item.label)}
                      {item.required ? (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            opacity: 0.6,
                          }}
                        >
                          Obrigatório
                        </span>
                      ) : null}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.35rem',
                        color: textSecondary,
                        fontWeight: 300,
                        fontSize: '0.85rem',
                        lineHeight: 1.55,
                      }}
                    >
                      {t(item.desc)}
                    </span>
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => setExpanded((previous) => !previous)}
            className="inline-flex items-center gap-2 text-left transition-colors duration-200"
            style={{
              color: GOLD_ACCENT,
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Ver detalhes completos
          </button>

          {expanded ? (
            <div
              className="mt-3"
              style={{
                ...cardStyle,
                padding: '1rem',
              }}
            >
              <ul
                style={{
                  color: textSecondary,
                  fontSize: '0.82rem',
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                {detailItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-3">
                <Link
                  href="/politica-privacidade"
                  target="_blank"
                  style={{
                    color: GOLD_ACCENT,
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                  }}
                  className="hover:underline"
                >
                  {t('fullPolicy')}
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="transition-all duration-300"
            style={{
              flex: 1,
              minHeight: '46px',
              borderRadius: '2px',
              border: `1px solid ${GOLD_ACCENT}`,
              background: GOLD_ACCENT,
              color: isDark ? '#0f172a' : '#ffffff',
              fontWeight: 500,
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: GOLD_GLOW,
            }}
          >
            {t('acceptAll')}
          </button>

          <button
            type="button"
            onClick={handleAcceptSelected}
            className="transition-all duration-300"
            style={{
              flex: 1,
              minHeight: '46px',
              borderRadius: '2px',
              border: `1px solid ${GOLD_ACCENT}`,
              background: 'transparent',
              color: GOLD_ACCENT,
              fontWeight: 500,
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {t('acceptSelected')}
          </button>
        </div>

        <style>{`
          @keyframes privacyConsentEnter {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
