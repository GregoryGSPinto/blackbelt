'use client';

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  GLOBAL SEARCH SYSTEM — Busca Contextual Inteligente       ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  • Items stored in ref (zero re-renders on registration)   ║
 * ║  • Only query/results state triggers UI updates            ║
 * ║  • Pages register/unregister via registerSearchContext()   ║
 * ║  • Search UI is fully decoupled from page components       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ============================================================
// TYPES
// ============================================================

export interface SearchItem {
  id: string;
  label: string;
  sublabel?: string;
  categoria: string;    // 'Aluno' | 'Turma' | 'Vídeo' | 'Avaliação' | ...
  icon?: string;        // emoji
  href?: string;        // navigation target
  keywords?: string[];  // extra searchable terms
}

export interface SearchResult extends SearchItem {
  score: number;
}

interface GlobalSearchContextValue {
  // State
  isOpen: boolean;
  query: string;
  results: SearchResult[];

  // Actions
  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  toggle: () => void;

  // Registration (pages call these)
  registerSearchContext: (contextId: string, items: SearchItem[]) => void;
  unregisterSearchContext: (contextId: string) => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

// ============================================================
// PROVIDER
// ============================================================

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  // Items stored in ref — NO re-renders when pages register/unregister
  const itemsMapRef = useRef<Map<string, SearchItem[]>>(new Map());

  // Only these trigger UI updates (isolated to search components)
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Search algorithm ────────────────────────────────────
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const normalizedQuery = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);

    const allItems: SearchItem[] = [];
    itemsMapRef.current.forEach((items) => allItems.push(...items));

    const scored: SearchResult[] = [];

    for (const item of allItems) {
      let score = 0;

      // Normalize all searchable text
      const label = item.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const sublabel = (item.sublabel || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const categoria = item.categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const keywords = (item.keywords || []).map(k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

      for (const term of terms) {
        // Exact start match on label = highest score
        if (label.startsWith(term)) {
          score += 100;
        } else if (label.includes(term)) {
          score += 60;
        }

        // Sublabel match
        if (sublabel.includes(term)) score += 30;

        // Category match
        if (categoria.includes(term)) score += 20;

        // Keyword match
        for (const kw of keywords) {
          if (kw.includes(term)) {
            score += 15;
            break;
          }
        }
      }

      if (score > 0) {
        scored.push({ ...item, score });
      }
    }

    // Sort by score descending, limit to 8 results
    scored.sort((a, b) => b.score - a.score);
    setResults(scored.slice(0, 8));
  }, []);

  // ─── Debounced query setter ──────────────────────────────
  const setQuery = useCallback((q: string) => {
    setQueryState(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      performSearch(q);
    }, 180); // slightly under 250ms for responsiveness
  }, [performSearch]);

  // ─── Open/Close ──────────────────────────────────────────
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing query so close animation completes
    setTimeout(() => {
      setQueryState('');
      setResults([]);
    }, 280);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (prev) {
        // Closing
        setTimeout(() => {
          setQueryState('');
          setResults([]);
        }, 280);
      }
      return !prev;
    });
  }, []);

  // ─── Registration (ref-based, zero re-renders) ──────────
  const registerSearchContext = useCallback((contextId: string, items: SearchItem[]) => {
    itemsMapRef.current.set(contextId, items);
  }, []);

  const unregisterSearchContext = useCallback((contextId: string) => {
    itemsMapRef.current.delete(contextId);
  }, []);

  // ─── Memoized context value ──────────────────────────────
  const value = useMemo<GlobalSearchContextValue>(() => ({
    isOpen,
    query,
    results,
    open,
    close,
    setQuery,
    toggle,
    registerSearchContext,
    unregisterSearchContext,
  }), [isOpen, query, results, open, close, setQuery, toggle, registerSearchContext, unregisterSearchContext]);

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

// ============================================================
// HOOKS
// ============================================================

export function useGlobalSearch(): GlobalSearchContextValue {
  const ctx = useContext(GlobalSearchContext);
  if (!ctx) throw new Error('useGlobalSearch must be used within GlobalSearchProvider');
  return ctx;
}

/**
 * Hook for pages to register searchable items.
 * Items stored in a ref inside provider — zero re-renders.
 *
 * Usage:
 * ```tsx
 * useSearchRegistration('turmas', turmas.map(t => ({
 *   id: t.id, label: t.nome, sublabel: t.categoria,
 *   categoria: 'Turma', icon: '🥋', href: '/professor-turmas',
 * })));
 * ```
 */
export function useSearchRegistration(contextId: string, items: SearchItem[]) {
  const { registerSearchContext, unregisterSearchContext } = useGlobalSearch();

  // Stable serialized key to avoid unnecessary re-registrations
  const serialized = useMemo(
    () => JSON.stringify(items.map(i => i.id + i.label)),
    [items]
  );

  // Register when items change
  useEffect(() => {
    registerSearchContext(contextId, items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId, serialized, registerSearchContext]);

  // Unregister on unmount
  useEffect(() => {
    return () => {
      unregisterSearchContext(contextId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
