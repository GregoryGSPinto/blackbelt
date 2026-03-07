// ============================================================
// BLACKBELT — AppShell Composable System
// ============================================================
// Usage:
//   import { AppShell } from '@/components/shell';
//   import type { AppShellConfig } from '@/components/shell';
// ============================================================

// ─── Top-Nav variant components ───
export { AppShell } from './AppShell';
export { ShellBackground } from './ShellBackground';
export { ShellMobileHeader } from './ShellMobileHeader';
export { ShellDesktopHeader } from './ShellDesktopHeader';

export { ShellBottomNav } from './ShellBottomNav';
export { ShellMobileDrawer } from './ShellMobileDrawer';

// ─── Sidebar variant components ───
export { ShellSidebar } from './ShellSidebar';
export { ShellSidebarMobileHeader } from './ShellSidebarMobileHeader';
export { ShellSidebarDesktopHeader } from './ShellSidebarDesktopHeader';

// ─── Types ───
export type {
  AppShellConfig,
  ShellTheme,
  ShellNavConfig,
  ShellState,
  NavItem,
  ShellNotification,
  ColorFn,
  SidebarConfig,
} from './types';
