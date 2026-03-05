'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocaleSwitch } from '@/hooks/useLocale';
import type { AppLocale } from '@/i18n/routing';

const LOCALES: { code: AppLocale; flag: string; label: string }[] = [
  { code: 'pt-BR', flag: '\u{1F1E7}\u{1F1F7}', label: 'portuguese' },
  { code: 'en-US', flag: '\u{1F1FA}\u{1F1F8}', label: 'english' },
];

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile' | 'landing';
}

export function LanguageSwitcher({ variant = 'desktop' }: LanguageSwitcherProps) {
  const { locale, setLocale, isPending } = useLocaleSwitch();
  const t = useTranslations('common.language');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open]);

  const handleSelect = (code: AppLocale) => {
    if (code !== locale) {
      setLocale(code);
    }
    setOpen(false);
  };

  if (variant === 'mobile') {
    return (
      <div className="w-full">
        {LOCALES.map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => handleSelect(code)}
            disabled={isPending}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 ${
              locale === code ? 'opacity-100' : 'opacity-70'
            }`}
            style={{
              background: locale === code ? 'rgba(201,162,39,0.1)' : 'transparent',
            }}
          >
            <span className="text-xl w-6 text-center">{flag}</span>
            <span className="text-sm font-semibold">{t(label)}</span>
            {locale === code && (
              <span className="ml-auto text-xs opacity-60">&#10003;</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Desktop + Landing variant
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={`flex items-center justify-center rounded-full transition-all duration-200 ${
          variant === 'landing'
            ? 'w-10 h-10 hover:bg-white/10'
            : 'w-[48px] h-[48px]'
        } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
        aria-label={t('switchLanguage')}
        aria-expanded={open}
        title={t('switchLanguage')}
      >
        <Globe size={variant === 'landing' ? 18 : 20} />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 min-w-[180px] rounded-xl overflow-hidden shadow-2xl z-[80]"
          style={{
            animation: 'shell-dropdown-in 0.2s cubic-bezier(0.16,1,0.3,1)',
            transformOrigin: 'top right',
          }}
        >
          <div
            className="rounded-xl overflow-hidden backdrop-blur-xl"
            style={{
              background: 'var(--dropdown-bg, rgba(30,30,50,0.95))',
              border: '1px solid var(--dropdown-border, rgba(255,255,255,0.1))',
            }}
          >
            {LOCALES.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                disabled={isPending}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  locale === code
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{flag}</span>
                <span>{t(label)}</span>
                {locale === code && (
                  <span className="ml-auto text-xs opacity-60">&#10003;</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
