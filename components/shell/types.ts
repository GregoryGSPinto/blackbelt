// ============================================================
// BLACKBELT — AppShell Composable Types
// ============================================================
// Central type definitions for the composable layout system.
// Each route group provides its own ShellConfig to customize
// appearance while sharing 100% of the structural logic.
//
// Supports two layout variants:
//   'top-nav'  — Header + bottom nav (teen, professor, main, parent, kids)
//   'sidebar'  — Left sidebar + main area (admin)
// ============================================================

import { ComponentType, ReactNode, RefObject } from 'react';
import type { User } from '@/contexts/AuthContext';
import type { PerfilInfoUI } from '@/contexts/AuthContext';

/** A single navigation item */
export interface NavItem {
  href: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  label: string;
  emoji?: string;
}

/** Notification mock (until backend integration) */
export interface ShellNotification {
  id: number;
  title: string;
  desc: string;
  time: string;
}

/** Color resolver — takes isDark, returns CSS value */
export type ColorFn = (isDark: boolean) => string;

/**
 * Theme configuration — captures ALL visual differences
 * between route groups while keeping structure identical.
 */
export interface ShellTheme {
  // ─── Layout Variant ───
  /** 'top-nav' (default) or 'sidebar' (admin) */
  variant?: 'top-nav' | 'sidebar';

  // ─── Background ───
  backgroundImage: string;
  /** Extra overlays rendered inside the background container */
  backgroundOverlays?: ReactNode;
  parallaxFactor: number;
  /** Grain overlay opacity (0 to 1) */
  grainOpacity: number;
  /** Main background overlay gradient */
  backgroundGradient: ColorFn;

  // ─── Header ───
  mobileHeaderBg: ColorFn;
  mobileHeaderBorder: ColorFn;
  desktopHeaderBg: ColorFn;
  desktopHeaderBorder: ColorFn;

  // ─── Text ───
  textHeading: ColorFn;
  textMuted: ColorFn;

  // ─── Accent / Active ───
  accentColor: ColorFn;
  navActiveColor: ColorFn;
  navInactiveColor: ColorFn;
  navHoverColor: ColorFn;
  /** Active indicator bar (below desktop nav link) */
  navIndicatorColor: ColorFn;
  /** Desktop nav link sizing override */
  desktopNavClassName?: string;

  // ─── Avatar ───
  avatarGradient: string;
  /** If true, uses perfilInfo.cor instead of avatarGradient */
  avatarUsePerfilColor?: boolean;
  avatarRing: ColorFn;

  // ─── Notifications ───
  notifDotColor: string;
  notifAccentColor: ColorFn;

  // ─── Dropdown / Panels ───
  panelBg: ColorFn;
  panelBorder: ColorFn;
  panelBackdrop: string;

  // ─── Bottom Nav ───
  bottomNavBg: ColorFn;
  bottomNavBorder: ColorFn;
  bottomNavActive: ColorFn;
  bottomNavInactive: ColorFn;
  /** Optional active background (e.g. 'rgba(255,255,255,0.1)') */
  bottomNavActiveBg?: ColorFn;
  /** If true, bottom nav uses emoji field from NavItem (kids) */
  bottomNavUseEmoji?: boolean;
  /** Custom bottom nav border-top width (e.g. '4px' for kids) */
  bottomNavBorderWidth?: string;

  // ─── Drawer ───
  drawerBg: ColorFn;
  drawerBorder: ColorFn;
  drawerItemBg: (isDark: boolean, isActive: boolean) => string;
  drawerItemColor: (isDark: boolean, isActive: boolean) => string;

  // ─── Search ───
  searchBg: ColorFn;
  searchBorder: ColorFn;
  searchText: ColorFn;

  // ─── Typography ───
  fontClass?: string;

  // ─── Logo ───
  logoHref: string;
  logoLabel: string;
  logoSublabel?: string;
  logoLabelColor: ColorFn;
  logoSublabelColor?: ColorFn;

  // ─── Content area ───
  contentMaxWidth: string;
  contentPadding?: string;
  /** Custom content wrapper class (replaces default pt/pb) */
  contentClassName?: string;

  // ─── Custom global CSS ───
  globalStyles?: string;

  // ─── Misc ───
  /** Whether this theme supports light mode via useTheme() */
  supportsLightMode: boolean;
  moduleName: string;

  // ─── Sidebar Variant Config ───
  sidebar?: SidebarConfig;
}

/**
 * Sidebar-specific config (only for variant: 'sidebar').
 * Used by admin panel's enterprise layout.
 */
export interface SidebarConfig {
  /** Sidebar width class (default: 'w-72') */
  width: string;
  /** Main content margin class when sidebar visible (default: 'lg:ml-72') */
  contentMargin: string;
  /** Sidebar background */
  bg: string;
  /** Sidebar border */
  border: string;
  /** Active nav item bg */
  navActiveBg: string;
  /** Active nav item text */
  navActiveText: string;
  /** Inactive nav item text */
  navInactiveText: string;
  /** Active nav item icon */
  navActiveIcon: string;
  /** Inactive nav item icon */
  navInactiveIcon: string;
  /** Sidebar search morph: collapsed bg */
  searchCollapsedBg: string;
  /** Sidebar search morph: collapsed border */
  searchCollapsedBorder: string;
  /** Sidebar search morph: expanded bg */
  searchExpandedBg: string;
  /** Sidebar search morph: expanded border */
  searchExpandedBorder: string;
  /** User section border color */
  userSectionBorder: string;
  /** Custom desktop header right-side actions */
  desktopHeaderActions?: ReactNode;
  /** Mobile sidebar overlay bg */
  overlayBg: string;
  /** Sidebar logo subtitle text */
  logoSubtitle?: string;
}

/**
 * Navigation configuration for a route group.
 */
export interface ShellNavConfig {
  /** Desktop top nav items (center of header) — or sidebar nav for sidebar variant */
  desktopNav: readonly NavItem[];
  /** Mobile bottom bar items */
  mobileBar: readonly NavItem[];
  /** Mobile drawer items */
  drawerNav: readonly NavItem[];
  /** All nav items for route matching */
  allItems: readonly NavItem[];
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Mock notifications */
  notifications: readonly ShellNotification[];
  /** Profile href */
  profileHref: string;
  /** Settings href */
  settingsHref: string;
  /** If true, hide search functionality completely */
  hideSearch?: boolean;
}

/**
 * Full config passed to AppShell.
 */
export interface AppShellConfig {
  theme: ShellTheme;
  nav: ShellNavConfig;
}

/**
 * Internal shell state — managed by AppShell, passed to sub-components.
 */
export interface ShellState {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  mounted: boolean;
  scrollY: number;
  isDark: boolean;
  toggleTheme?: () => void;
  pathname: string;
  // Search (from GlobalSearchContext)
  searchOpen: boolean;
  query: string;
  setQuery: (v: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
  // User
  user: User | null;
  initial: string;
  displayName: string;
  graduacao: string;
  perfilInfo: PerfilInfoUI | null;
  // Handlers
  handleSearchToggle: () => void;
  handleLogout: () => void;
  handleSwitchProfile: () => void;
  navTo: (href: string) => void;
  toggleNotif: () => void;
  // Refs
  searchInputRef: RefObject<HTMLInputElement>;
  mobileSearchInputRef: RefObject<HTMLInputElement>;
  notifRef: RefObject<HTMLDivElement>;
  // Sidebar-specific (only populated for sidebar variant)
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}
