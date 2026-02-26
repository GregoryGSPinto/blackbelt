// ============================================================
// LayoutWrapper — Intelligent Responsive Page Wrapper
// ============================================================
// Centralizes ALL responsive layout decisions for page content.
// Components never need to know about breakpoints — they just
// render inside LayoutWrapper and get the right structure.
//
// Modes:
//   'stack'    — Default. Full-width content, responsive padding.
//   'split'    — Master-Detail. List left (30%), detail right (70%) on md+.
//                Falls back to stack on mobile.
//   'centered' — Centered card (login, error pages).
//
// Usage:
//   <LayoutWrapper mode="stack">
//     <PageContent />
//   </LayoutWrapper>
//
//   <LayoutWrapper mode="split" master={<List />} detail={<Detail />} />
// ============================================================
'use client';

import { type ReactNode, useState, useCallback, useEffect } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';

// ── Types ──

interface StackProps {
  mode?: 'stack';
  children: ReactNode;
  className?: string;
  /** No max-width constraint */
  fluid?: boolean;
}

interface SplitProps {
  mode: 'split';
  /** Left panel (list) — rendered on both mobile and desktop */
  master: ReactNode;
  /** Right panel (detail) — only on md+, or full-screen mobile when selected */
  detail: ReactNode | null;
  /** Whether a detail item is selected (controls mobile back navigation) */
  hasSelection?: boolean;
  /** Callback when mobile back is pressed from detail */
  onClearSelection?: () => void;
  /** Custom master width (default: '380px') */
  masterWidth?: string;
  className?: string;
}

interface CenteredProps {
  mode: 'centered';
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

type LayoutWrapperProps = StackProps | SplitProps | CenteredProps;

// ── Component ──

export function LayoutWrapper(props: LayoutWrapperProps) {
  const { isMobile, isTabletOrAbove } = useResponsive();

  switch (props.mode || 'stack') {
    case 'split':
      return <SplitLayout {...(props as SplitProps)} isMobile={isMobile} isTabletOrAbove={isTabletOrAbove} />;
    case 'centered':
      return <CenteredLayout {...(props as CenteredProps)} />;
    default:
      return <StackLayout {...(props as StackProps)} />;
  }
}

// ── Stack Layout ──

function StackLayout({ children, className = '', fluid }: StackProps) {
  return (
    <div className={`w-full ${fluid ? '' : 'max-w-7xl mx-auto'} ${className}`}>
      {children}
    </div>
  );
}

// ── Centered Layout ──

function CenteredLayout({ children, className = '', maxWidth = '480px' }: CenteredProps) {
  return (
    <div className={`min-h-[60vh] flex items-center justify-center ${className}`}>
      <div className="w-full" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

// ── Split Layout (Master-Detail) ──

interface SplitLayoutInternalProps extends SplitProps {
  isMobile: boolean;
  isTabletOrAbove: boolean;
}

function SplitLayout({
  master,
  detail,
  hasSelection,
  onClearSelection,
  masterWidth = '380px',
  className = '',
  isMobile,
  isTabletOrAbove,
}: SplitLayoutInternalProps) {
  // Track selection for mobile navigation
  const [showDetail, setShowDetail] = useState(false);

  // Sync external selection state
  useEffect(() => {
    if (hasSelection && isMobile) {
      setShowDetail(true);
    }
    if (!hasSelection) {
      setShowDetail(false);
    }
  }, [hasSelection, isMobile]);

  const handleBack = useCallback(() => {
    setShowDetail(false);
    onClearSelection?.();
  }, [onClearSelection]);

  // ─── Mobile: Stack with slide transition ───
  if (isMobile) {
    return (
      <div className={`w-full relative ${className}`}>
        {/* Master (list) */}
        <div
          className="w-full transition-transform duration-300 ease-out"
          style={{
            transform: showDetail ? 'translateX(-100%)' : 'translateX(0)',
            position: showDetail ? 'absolute' : 'relative',
            opacity: showDetail ? 0 : 1,
          }}
        >
          {master}
        </div>

        {/* Detail (full-screen overlay on mobile) */}
        {showDetail && detail && (
          <div className="w-full animate-slide-in-right">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 mb-3 px-1 py-1 text-sm text-white/50 hover:text-white/80 transition-colors"
              aria-label="Voltar para lista"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Voltar
            </button>
            {detail}
          </div>
        )}
      </div>
    );
  }

  // ─── Tablet/Desktop: Side-by-side ───
  return (
    <div className={`w-full flex gap-0 ${className}`} style={{ height: 'calc(100vh - 120px)' }}>
      {/* Master (list) — fixed width, independent scroll */}
      <div
        className="flex-shrink-0 overflow-y-auto overscroll-contain border-r border-white/[0.06]"
        style={{
          width: masterWidth,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        }}
      >
        {master}
      </div>

      {/* Detail — fills remaining space, independent scroll */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        }}
      >
        {detail ? (
          <div className="p-4 md:p-6">{detail}</div>
        ) : (
          <EmptyDetail />
        )}
      </div>
    </div>
  );
}

// ── Empty Detail Placeholder ──

function EmptyDetail() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5}>
            <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7Z" />
            <path d="M14 2v4a2 2 0 002 2h4" />
          </svg>
        </div>
        <p className="text-sm text-white/20">Selecione um item para ver detalhes</p>
      </div>
    </div>
  );
}

// ── CSS Animation ──
const SLIDE_STYLES = `
@keyframes slide-in-right {
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in-right {
  animation: slide-in-right 0.25s ease-out;
}
`;

// Inject animation styles
if (typeof document !== 'undefined') {
  const id = 'layout-wrapper-styles';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = SLIDE_STYLES;
    document.head.appendChild(style);
  }
}
