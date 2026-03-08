// ============================================================
// AppShell — Composable Layout Orchestrator
// ============================================================
// Central state manager + compositor for all route group layouts.
// Each layout provides an AppShellConfig (theme + nav) and the
// AppShell handles ALL shared behavior:
//   - scroll tracking, mount animation, route-change cleanup
//   - ESC close, ⌘K shortcut, search toggle, notif toggle
//   - logout, profile switch, drawer management
//
// Supports two layout variants:
//   'top-nav'  — ShellMobileHeader + ShellDesktopHeader + ShellBottomNav + ShellMobileDrawer
//   'sidebar'  — ShellSidebarMobileHeader + ShellSidebar + ShellSidebarDesktopHeader
//
// Sub-components receive config + state, render themed UI.
// ============================================================
'use client';

import { ReactNode, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth, PERFIL_INFO } from '@/features/auth/context/AuthContext';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { SearchResultsOverlay } from '@/components/ui/SearchResultsOverlay';
import { ModuleErrorBoundary, type ModuleName } from '@/components/shared/ModuleErrorBoundary';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { recordNavVisit } from '@/lib/nav-ranking';

import { AppShellConfig, ShellState } from './types';
import { ShellBackground } from './ShellBackground';
import { ShellMobileHeader } from './ShellMobileHeader';
import { ShellDesktopHeader } from './ShellDesktopHeader';

import { ShellBottomNav } from './ShellBottomNav';
import { ShellMobileDrawer } from './ShellMobileDrawer';
import { ShellSidebar } from './ShellSidebar';
import { ShellSidebarMobileHeader } from './ShellSidebarMobileHeader';
import { ShellSidebarDesktopHeader } from './ShellSidebarDesktopHeader';
import { FABCheckin } from '@/components/checkin/FABCheckin';
import { PageTransition } from '@/components/transitions/PageTransition';

interface AppShellProps {
  config: AppShellConfig;
  children: ReactNode;
  /** Optional isDark override (for themes using useTheme()) */
  isDark?: boolean;
  /** Optional theme toggler */
  toggleTheme?: () => void;
  /** Custom logout handler (e.g. kids gatekeeper) — overrides default */
  onLogout?: () => void;
  /** Custom switch profile handler (e.g. kids gatekeeper) — overrides default */
  onSwitchProfile?: () => void;
}

/**
 * Shared CSS animations injected once by AppShell.
 * Covers dropdown, fade-up, slide-up, and indicator animations
 * used across all sub-components.
 */
const SHELL_GLOBAL_STYLES = `
  @keyframes shell-dropdown-in {
    from { opacity: 0; transform: scale(0.95) translateY(-8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes shell-fade-up {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes shell-slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes shell-indicator-in {
    from { width: 0; opacity: 0; }
    to { width: 24px; opacity: 1; }
  }
`;

export function AppShell({
  config, children, isDark: isDarkOverride, toggleTheme,
  onLogout, onSwitchProfile,
}: AppShellProps) {
  const t = useTranslations('common');
  const { theme, nav } = config;
  const isSidebar = theme.variant === 'sidebar';
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    isOpen: searchOpen, query, setQuery,
    open: openSearch, close: closeSearch,
  } = useGlobalSearch();

  // ─── State ───
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Refs ───
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // ─── Derived ───
  const isDark = isDarkOverride ?? (typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true);
  const displayName = user?.nome?.split(' ')[0] || 'Usuário';
  const graduacao = user?.graduacao || '';
  const perfilInfo = user ? PERFIL_INFO[user.tipo] : null;
  const initial = user?.nome?.charAt(0)?.toUpperCase() || 'U';

  // ═══ EFFECTS ═══

  // Mount animation
  useEffect(() => { setMounted(true); }, []);

  // Scroll tracker
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
    setSidebarOpen(false);
    if (searchOpen) closeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ─── Nav Ranking: track visits & re-rank ───
  useEffect(() => {
    if (!mounted || !pathname) return;
    // Find which nav href matches current path
    const match = nav.allItems.find(
      (i) => pathname === i.href || pathname.startsWith(i.href + '/'),
    );
    if (match) {
      recordNavVisit(theme.moduleName, match.href);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted]);

  // Config with fixed nav order (no reordering)
  const rankedConfig = useMemo((): AppShellConfig => {
    return { theme, nav };
  }, [nav, theme]);

  // ESC close
  useEffect(() => {
    if (!menuOpen && !drawerOpen && !searchOpen && !sidebarOpen) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setDrawerOpen(false);
        setSidebarOpen(false);
        if (searchOpen) closeSearch();
      }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [menuOpen, drawerOpen, searchOpen, sidebarOpen, closeSearch]);

  // ⌘K shortcut (skip if search is hidden)
  useEffect(() => {
    if (nav.hideSearch) return;
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchOpen) closeSearch();
        else openSearch();
      }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [searchOpen, openSearch, closeSearch, nav.hideSearch]);

  // Auto-focus search
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => {
        searchInputRef.current?.focus();
        mobileSearchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  // Block scroll when drawer or sidebar open (mobile)
  useEffect(() => {
    if (drawerOpen || sidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen, sidebarOpen]);

  // ═══ HANDLERS ═══

  const handleSearchToggle = useCallback(() => {
    if (searchOpen) closeSearch();
    else { setMenuOpen(false); openSearch(); }
  }, [searchOpen, openSearch, closeSearch]);

  const handleLogout = useCallback(() => {
    setMenuOpen(false);
    setShowLogoutConfirm(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    if (onLogout) onLogout();
    else logout();
  }, [logout, onLogout]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSwitchProfile = useCallback(() => {
    setMenuOpen(false);
    if (onSwitchProfile) onSwitchProfile();
    else router.push('/selecionar-perfil');
  }, [router, onSwitchProfile]);

  const navTo = useCallback(
    (href: string) => {
      router.push(href);
      setMenuOpen(false);
      setDrawerOpen(false);
      setSidebarOpen(false);
    },
    [router],
  );

  // ═══ SHELL STATE ═══

  const state: ShellState = {
    menuOpen, setMenuOpen,
    drawerOpen, setDrawerOpen,
    mounted, scrollY, isDark, toggleTheme,
    pathname,
    searchOpen, query, setQuery, openSearch, closeSearch,
    user,
    initial, displayName, graduacao,
    perfilInfo,
    handleSearchToggle, handleLogout, handleSwitchProfile,
    navTo,
    searchInputRef, mobileSearchInputRef,
    sidebarOpen, setSidebarOpen,
  };

  // ═══ RENDER ═══

  if (isSidebar) {
    return (
      <div className="min-h-screen relative">
        {/* Skip to content — accessibility */}
        <a href="#main-content" className="skip-to-content">
          {t('meta.skipToContent')}
        </a>

        {/* Global shell animations */}
        <style dangerouslySetInnerHTML={{ __html: SHELL_GLOBAL_STYLES }} />
        {theme.globalStyles && <style dangerouslySetInnerHTML={{ __html: theme.globalStyles }} />}

        {/* Background */}
        <ShellBackground theme={theme} scrollY={scrollY} isDark={isDark} />

        {/* Mobile Top Bar */}
        <ShellSidebarMobileHeader config={rankedConfig} state={state} />

        {/* Sidebar */}
        <ShellSidebar config={rankedConfig} state={state} />

        {/* FAB Check-in (professor, admin, gestor) */}
        <FABCheckin />

        {/* Search Results Overlay */}
        <SearchResultsOverlay />

        {/* Main Content (offset by sidebar) */}
        <div className={`${theme.sidebar?.contentMargin || 'lg:ml-72'} relative z-10`}>
          <ShellSidebarDesktopHeader config={rankedConfig} state={state} />

          {/* Mobile: sidebar toggle below mobile top bar */}
          <div className="md:hidden flex items-center px-4 py-2 mt-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label={t('menu.openMenu')}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="text-sm text-white/50 ml-2">
              {nav.desktopNav.find(i => pathname === i.href || pathname.startsWith(i.href + '/'))?.label || t('menu.menu')}
            </span>
          </div>

          {/* Page Content */}
          <main id="main-content" className={theme.contentClassName || 'p-4 md:p-6'}>
            <div className={`${theme.contentMaxWidth} mx-auto`}>
              <ModuleErrorBoundary moduleName={theme.moduleName as ModuleName}>
                <PageTransition key={pathname}>
                  {children}
                </PageTransition>
              </ModuleErrorBoundary>
            </div>
          </main>
        </div>

        {/* Logout Confirmation */}
        <ConfirmModal
          open={showLogoutConfirm}
          title={t('confirm.logoutTitle')}
          message={t('confirm.logoutMessage')}
          confirmLabel={t('confirm.logoutConfirm')}
          cancelLabel={t('actions.cancel')}
          variant="warning"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </div>
    );
  }

  // ─── Top-Nav Variant (default) ───

  return (
    <div className="min-h-screen relative">
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="skip-to-content">
        {t('meta.skipToContent')}
      </a>

      {/* Global shell animations */}
      <style dangerouslySetInnerHTML={{ __html: SHELL_GLOBAL_STYLES }} />

      {/* Theme-specific global CSS */}
      {theme.globalStyles && <style dangerouslySetInnerHTML={{ __html: theme.globalStyles }} />}

      {/* Background */}
      <ShellBackground theme={theme} scrollY={scrollY} isDark={isDark} />

      {/* Mobile Header */}
      <ShellMobileHeader config={rankedConfig} state={state} />

      {/* Desktop Header */}
      <ShellDesktopHeader config={rankedConfig} state={state} />

      {/* Click-outside overlay for menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[49]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Search Results Overlay */}
      <SearchResultsOverlay />

      {/* Main Content */}
      <main id="main-content" className={theme.contentClassName || 'relative z-10 pt-[72px] md:pt-[96px] pb-24 md:pb-8'}>
        <div
          className={`container mx-auto px-4 sm:px-6 lg:px-8 py-6 ${theme.contentMaxWidth}`}
          style={theme.contentPadding ? { padding: theme.contentPadding } : undefined}
        >
          <ModuleErrorBoundary moduleName={theme.moduleName as ModuleName}>
            <PageTransition key={pathname}>
              {children}
            </PageTransition>
          </ModuleErrorBoundary>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <ShellBottomNav config={rankedConfig} state={state} />

      {/* FAB Check-in (professor, admin, gestor) */}
      <FABCheckin />

      {/* Mobile Drawer */}
      <ShellMobileDrawer config={rankedConfig} state={state} />

      {/* Logout Confirmation */}
      <ConfirmModal
        open={showLogoutConfirm}
        title={t('confirm.logoutTitle')}
        message={t('confirm.logoutMessage')}
        confirmLabel={t('confirm.logoutConfirm')}
        cancelLabel={t('actions.cancel')}
        variant="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
