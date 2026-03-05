'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { useTheme } from '@/contexts/ThemeContext';

export function DesktopSearchHover() {
  const t = useTranslations('common');
  const { query, setQuery, open: openSearch, close: closeSearch } = useGlobalSearch();
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const expand = useCallback(() => {
    setIsExpanded(true);
    openSearch();
    setTimeout(() => { setShowPlaceholder(true); inputRef.current?.focus(); }, 120);
  }, [openSearch]);

  const collapse = useCallback(() => {
    setQuery(''); setIsExpanded(false); setShowPlaceholder(false); closeSearch();
  }, [setQuery, closeSearch]);

  const handleMouseEnter = useCallback(() => {
    if (collapseTimerRef.current) { clearTimeout(collapseTimerRef.current); collapseTimerRef.current = null; }
    hoverTimerRef.current = setTimeout(expand, 80);
  }, [expand]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    if (!query.trim()) collapseTimerRef.current = setTimeout(collapse, 300);
  }, [query, collapse]);

  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') collapse(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isExpanded, collapse]);

  useEffect(() => {
    if (!isExpanded) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (containerRef.current?.contains(t) || t.closest('[data-search-results]')) return;
      if (query.trim()) return;
      collapse();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [isExpanded, query, collapse]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isExpanded) collapse(); else expand();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isExpanded, expand, collapse]);

  /* ─── Theme colors ─── */
  const iconColor = isDark ? 'rgba(255,255,255,0.5)' : '#5A4B38';
  const expandedBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)';
  const expandedBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.1)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)';
  const inputColor = isDark ? '#FFFFFF' : '#15120C';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.2)' : '#7A6A56';
  const clearIcon = isDark ? 'rgba(255,255,255,0.4)' : '#5A4B38';
  const kbdBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)';
  const kbdBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.08)';
  const kbdText = isDark ? 'rgba(255,255,255,0.2)' : '#7A6A56';

  return (
    <div ref={containerRef} className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} data-search-header>
      <div className="flex items-center overflow-hidden rounded-full transition-all ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ width: isExpanded ? 427 : 54, height: 54, transitionDuration: '220ms',
          background: isExpanded ? expandedBg : 'transparent',
          border: isExpanded ? `1px solid ${expandedBorder}` : '1px solid transparent' }}>
        <button onClick={() => !isExpanded && expand()} className="w-[54px] h-[54px] flex items-center justify-center flex-shrink-0 rounded-full transition-colors duration-150"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          aria-label={t('search.openSearch') + ' (⌘K)'}>
          <Search size={24} style={{ color: iconColor }} />
        </button>
        <div className="flex-1 flex items-center gap-3 pr-3 transition-opacity" style={{ opacity: isExpanded ? 1 : 0, transitionDuration: '180ms', transitionDelay: isExpanded ? '60ms' : '0ms' }}>
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={showPlaceholder ? t('search.searchPlaceholder') : ''}
            aria-label={t('search.searchContent')}
            className="flex-1 bg-transparent text-[19px] outline-none"
            style={{ color: inputColor, caretColor: inputColor }}
            autoComplete="off" autoCorrect="off" spellCheck={false} tabIndex={isExpanded ? 0 : -1} />
          {query.trim() ? (
            <button onClick={collapse} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              aria-label={t('actions.clear')}><X size={17} style={{ color: clearIcon }} /></button>
          ) : (
            <kbd className="hidden lg:flex items-center px-2 py-0.5 rounded text-[14px] font-mono flex-shrink-0"
              style={{ background: kbdBg, border: `1px solid ${kbdBorder}`, color: kbdText }}>⌘K</kbd>
          )}
        </div>
      </div>
      <style>{`
        .flex-1.bg-transparent::placeholder { color: ${placeholderColor}; }
        input[class*="bg-transparent"]::placeholder { color: ${placeholderColor} !important; }
      `}</style>
    </div>
  );
}
