'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGlobalSearch, type SearchResult } from '@/contexts/GlobalSearchContext';
import { useTheme } from '@/contexts/ThemeContext';

export function SearchResultsOverlay() {
  const t = useTranslations('common.search');
  const { isOpen, query, results, close } = useGlobalSearch();
  const { isDark } = useTheme();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => { setPortalTarget(document.body); }, []);

  const showResults = isOpen && query.trim().length > 0;

  useEffect(() => {
    if (!showResults) return;
    const onScroll = () => { if (window.scrollY > 10) close(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showResults, close]);

  useEffect(() => {
    if (!showResults) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (overlayRef.current?.contains(target)) return;
      if (target.closest('[data-search-header]')) return;
      close();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onClick); };
  }, [showResults, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const handleResultClick = useCallback((result: SearchResult) => {
    if (result.href) router.push(result.href);
    close();
  }, [router, close]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.categoria]) acc[r.categoria] = [];
    acc[r.categoria].push(r);
    return acc;
  }, {});

  if (!portalTarget) return null;

  /* ─── Theme colors ─── */
  const c = {
    backdropBg:  isDark ? 'rgba(0,0,0,0.4)' : 'rgba(107,68,35,0.15)',
    glassBg:     isDark
      ? 'linear-gradient(155deg, rgba(22,18,10,0.94), rgba(28,23,14,0.90))'
      : 'linear-gradient(155deg, rgba(255,255,255,0.96), rgba(247,245,242,0.97))',
    glassBorder: isDark ? 'rgba(217,175,105,0.10)' : 'rgba(107,68,35,0.12)',
    shadow:      isDark ? 'rgba(0,0,0,0.6)' : 'rgba(107,68,35,0.15)',
    catLabel:    isDark ? 'rgba(245,158,11,0.4)' : '#8C6239',
    itemHover:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)',
    itemActive:  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.08)',
    iconBg:      isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)',
    iconBgH:     isDark ? 'rgba(245,158,11,0.1)' : 'rgba(140,98,57,0.1)',
    label:       isDark ? 'rgba(255,255,255,0.8)' : '#2A2318',
    labelH:      isDark ? '#FDE68A' : '#5A3A15',
    sublabel:    isDark ? 'rgba(255,255,255,0.25)' : '#6D5D4B',
    arrow:       isDark ? 'rgba(255,255,255,0.1)' : '#9E8E7A',
    arrowH:      isDark ? 'rgba(245,158,11,0.5)' : '#8C6239',
    emptyIcon:   isDark ? 'rgba(255,255,255,0.1)' : '#B5A590',
    emptyText:   isDark ? 'rgba(255,255,255,0.25)' : '#6D5D4B',
    emptySub:    isDark ? 'rgba(255,255,255,0.15)' : '#9E8E7A',
    footerBorder:isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.08)',
    footerText:  isDark ? 'rgba(255,255,255,0.15)' : '#9E8E7A',
    kbdBg:       isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)',
    kbdBorder:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.08)',
    matchColor:  isDark ? '#FDE68A' : '#8C6239',
  };

  const overlay = (
    <div
      ref={overlayRef}
      className={`fixed left-0 right-0 z-[60] search-overlay-transition ${
        showResults ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
      style={{ top: 56 }}
    >
      {/* Backdrop */}
      {showResults && (
        <div className="fixed inset-0 backdrop-blur-sm z-[-1]" style={{ background: c.backdropBg }} onClick={close} />
      )}

      {/* Results Panel */}
      <div className="mx-3 md:mx-auto md:max-w-2xl mt-1 md:mt-5" role="region" aria-label={t('results')}>
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: c.glassBg,
            backdropFilter: 'blur(32px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
            border: `1px solid ${c.glassBorder}`,
            boxShadow: `0 25px 50px -12px ${c.shadow}`,
          }}>
          <div className="max-h-[55vh] md:max-h-[60vh] overflow-y-auto overscroll-contain scrollbar-hide">
            {results.length > 0 ? (
              <div className="p-2">
                {Object.entries(grouped).map(([categoria, items]) => (
                  <div key={categoria}>
                    <div className="px-3 pt-3 pb-1.5">
                      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: c.catLabel }}>
                        {categoria}
                      </p>
                    </div>

                    {items.map((result, i) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group"
                        style={{ animation: `search-result-in 0.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = c.itemHover; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-colors duration-200"
                          style={{ background: c.iconBg }}>
                          {result.icon || '📄'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate transition-colors duration-200" style={{ color: c.label }}>
                            {highlightMatch(result.label, query, c.matchColor)}
                          </p>
                          {result.sublabel && (
                            <p className="text-[11px] truncate mt-0.5" style={{ color: c.sublabel }}>
                              {result.sublabel}
                            </p>
                          )}
                        </div>

                        <ArrowRight size={14} className="transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0" style={{ color: c.arrow }} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : query.trim().length > 1 ? (
              <div className="py-12 text-center">
                <Search size={28} className="mx-auto mb-3" style={{ color: c.emptyIcon }} />
                <p className="text-sm" style={{ color: c.emptyText }}>{t('noResultsFor', { query })}</p>
                <p className="text-[11px] mt-1" style={{ color: c.emptySub }}>{t('tryDifferent')}</p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: `1px solid ${c.footerBorder}` }}>
              <p className="text-[10px]" style={{ color: c.footerText }} aria-live="polite">
                {results.length} {t('results')}
              </p>
              <div className="hidden md:flex items-center gap-2 text-[10px]" style={{ color: c.footerText }}>
                <kbd className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: c.kbdBg, border: `1px solid ${c.kbdBorder}` }}>↵</kbd>
                <span>selecionar</span>
                <kbd className="px-1.5 py-0.5 rounded text-[9px] font-mono ml-2" style={{ background: c.kbdBg, border: `1px solid ${c.kbdBorder}` }}>esc</kbd>
                <span>fechar</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .search-overlay-transition {
          transition: opacity 250ms cubic-bezier(0.16,1,0.3,1),
                      transform 250ms cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes search-result-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );

  return createPortal(overlay, portalTarget);
}

function highlightMatch(text: string, query: string, matchColor: string): React.ReactNode {
  if (!query.trim()) return text;

  const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const index = normalizedText.indexOf(normalizedQuery);
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span style={{ color: matchColor, fontWeight: 600 }}>{match}</span>
      {after}
    </>
  );
}
