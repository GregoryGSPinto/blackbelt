'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Download,
  Share2,
  Info,
  Clock,
  Signal,
  X,
  CheckCircle,
} from 'lucide-react';
import type { Video } from '@/lib/api/content.service';
import { useTheme } from '@/contexts/ThemeContext';

/* ───────────────────────────────────────────────
   Context — single active preview, zero page re-render
   ─────────────────────────────────────────────── */

interface PreviewState {
  video: Video | null;
  rect: DOMRect | null;
  cardId: string | null;
}

interface PreviewCtx {
  show: (video: Video, rect: DOMRect, cardId: string) => void;
  hide: (cardId: string) => void;
  enterPreview: () => void;
  leavePreview: () => void;
  activeCardId: string | null;
}

const Ctx = createContext<PreviewCtx | null>(null);

export function useVideoPreview() {
  return useContext(Ctx);
}

/* ───────────────────────────────────────────────
   Provider + Portal — wraps carousel section
   ─────────────────────────────────────────────── */

export function VideoPreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState>({
    video: null,
    rect: null,
    cardId: null,
  });
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insidePreview = useRef(false);
  const currentCardId = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const cancelTimers = useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const show = useCallback(
    (video: Video, rect: DOMRect, cardId: string) => {
      cancelTimers();

      // If same card, just cancel hide
      if (currentCardId.current === cardId && state.video) {
        return;
      }

      // If different card is showing, instant swap
      if (state.video && currentCardId.current !== cardId) {
        currentCardId.current = cardId;
        setState({ video, rect, cardId });
        setVisible(true);
        return;
      }

      // Fresh open: debounce 180ms
      showTimer.current = setTimeout(() => {
        currentCardId.current = cardId;
        setState({ video, rect, cardId });
        // Double rAF for transition
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setVisible(true))
        );
      }, 180);
    },
    [cancelTimers, state.video]
  );

  const hide = useCallback(
    (cardId: string) => {
      // Only process hide for the currently active card
      if (currentCardId.current !== cardId) {
        // Cancel any pending show for this card
        if (showTimer.current) {
          clearTimeout(showTimer.current);
          showTimer.current = null;
        }
        return;
      }

      cancelTimers();
      hideTimer.current = setTimeout(() => {
        if (insidePreview.current) return;
        setVisible(false);
        setTimeout(() => {
          setState({ video: null, rect: null, cardId: null });
          currentCardId.current = null;
        }, 160);
      }, 220);
    },
    [cancelTimers]
  );

  const enterPreview = useCallback(() => {
    insidePreview.current = true;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const leavePreview = useCallback(() => {
    insidePreview.current = false;
    if (currentCardId.current) {
      hide(currentCardId.current);
    }
  }, [hide]);

  const ctx: PreviewCtx = {
    show,
    hide,
    enterPreview,
    leavePreview,
    activeCardId: state.cardId,
  };

  return (
    <Ctx.Provider value={ctx}>
      {children}
      {mounted &&
        state.video &&
        state.rect &&
        createPortal(
          <PreviewPanel
            video={state.video}
            rect={state.rect}
            visible={visible}
            onMouseEnter={enterPreview}
            onMouseLeave={leavePreview}
          />,
          document.body
        )}
    </Ctx.Provider>
  );
}

/* ───────────────────────────────────────────────
   Preview Panel — the floating premium card
   ─────────────────────────────────────────────── */

interface PreviewPanelProps {
  video: Video;
  rect: DOMRect;
  visible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function PreviewPanel({
  video,
  rect,
  visible,
  onMouseEnter,
  onMouseLeave,
}: PreviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    transformOrigin: string;
  }>({ top: 0, left: 0, transformOrigin: 'top left' });

  /* ─── Button feedback state ─── */
  const [downloaded, setDownloaded] = useState(false);
  const [addedToList, setAddedToList] = useState(false);
  const [shared, setShared] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  const PANEL_W = 380;
  const PANEL_MAX_H = 580;

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const cardCenterX = rect.left + rect.width / 2;

    let left: number;
    let transformOrigin: string;

    const rightEdge = rect.right + 12;
    if (rightEdge + PANEL_W < vw - 20) {
      left = rightEdge;
      transformOrigin = 'top left';
    } else if (rect.left - 12 - PANEL_W > 20) {
      left = rect.left - 12 - PANEL_W;
      transformOrigin = 'top right';
    } else {
      left = Math.max(20, cardCenterX - PANEL_W / 2);
      left = Math.min(left, vw - PANEL_W - 20);
      transformOrigin = 'top center';
    }

    let top = rect.top - 20;
    if (top + PANEL_MAX_H > vh - 20) {
      top = vh - PANEL_MAX_H - 20;
    }
    if (top < 20) top = 20;

    setPos({ top, left, transformOrigin });
  }, [rect]);

  /* Reset states when video changes */
  useEffect(() => {
    setDownloaded(false);
    setAddedToList(false);
    setShared(false);
    setIframeReady(false);
  }, [video.id]);

  const levelColor =
    video.level === 'Iniciante'
      ? 'bg-emerald-500/90 text-white'
      : video.level === 'Intermediário'
      ? 'bg-amber-500/90 text-white'
      : 'bg-red-500/90 text-white';

  /* ─── Button actions ─── */
  const handleDownload = useCallback(() => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }, []);

  const handleAddToList = useCallback(() => {
    setAddedToList(prev => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/sessões/${video.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: video.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }, [video]);

  const handleDetails = useCallback(() => {
    window.location.href = `/sessões/${video.id}`;
  }, [video.id]);

  /* ─── Theme colors ─── */
  const c = {
    title:     isDark ? '#FFFFFF' : '#15120C',
    desc:      isDark ? 'rgba(255,255,255,0.45)' : '#50422F',
    btnBg:     isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)',
    btnBgH:    isDark ? 'rgba(255,255,255,0.12)' : 'rgba(107,68,35,0.12)',
    btnBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.1)',
    btnText:   isDark ? 'rgba(255,255,255,0.6)' : '#5A4B38',
    btnTextH:  isDark ? 'rgba(255,255,255,0.9)' : '#15120C',
    btnActive: isDark ? 'rgba(184,154,106,0.15)' : 'rgba(184,154,106,0.12)',
    btnActiveText: '#B89A6A',
    metaLabel: isDark ? 'rgba(255,255,255,0.4)' : '#6D5D4B',
    metaIcon:  isDark ? 'rgba(255,255,255,0.3)' : '#9E8E7A',
    metaVal:   isDark ? 'rgba(255,255,255,0.7)' : '#2A2318',
    border:    isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.08)',
    shadow:    isDark
      ? '0 25px 60px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)'
      : '0 25px 60px rgba(107,68,35,0.15), 0 8px 24px rgba(107,68,35,0.1)',
  };

  /* YouTube embed URL — autoplay, muted, no controls, loop, start at 5s for interesting content */
  const ytSrc = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${video.youtubeId}&start=5&end=20&iv_load_policy=3&disablekb=1&fs=0`;

  return (
    <div
      ref={panelRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed pointer-events-auto"
      style={{
        zIndex: 9999,
        top: pos.top,
        left: pos.left,
        width: PANEL_W,
        transformOrigin: pos.transformOrigin,
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'scale(1) translateY(0)'
          : 'scale(0.92) translateY(8px)',
        transition:
          'opacity 160ms cubic-bezier(0.16,1,0.3,1), transform 160ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Glass card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgb(var(--glass-bg) / 0.97) 0%, rgb(var(--color-bg) / 0.99) 100%)',
          backdropFilter: 'blur(40px) saturate(1.3)',
          border: `1px solid ${c.border}`,
          boxShadow: c.shadow,
        }}
      >
        {/* ─── Video Trailer (autoplay muted) ─── */}
        <div className="relative aspect-video overflow-hidden bg-black">
          {/* Thumbnail as fallback while iframe loads */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: iframeReady ? 0 : 1 }}
          />

          {/* YouTube autoplay embed */}
          {visible && (
            <iframe
              src={ytSrc}
              className="absolute inset-0 w-full h-full"
              style={{ opacity: iframeReady ? 1 : 0, transition: 'opacity 0.5s ease' }}
              allow="autoplay; encrypted-media"
              frameBorder="0"
              onLoad={() => setTimeout(() => setIframeReady(true), 300)}
            />
          )}

          {/* Gradient overlay bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded"
              style={{ background: 'linear-gradient(135deg, #c5a44e 0%, #f5e6a3 50%, #c5a44e 100%)', color: '#1a1a1a', letterSpacing: '0.5px' }}>4K</span>
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded"
              style={{ background: 'linear-gradient(135deg, #c5a44e 0%, #f5e6a3 50%, #c5a44e 100%)', color: '#1a1a1a', letterSpacing: '0.5px' }}>HDR</span>
          </div>
          <div className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold tracking-widest rounded pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(197,164,78,0.9), rgba(245,230,163,0.9))', color: '#1a1a1a' }}>PREMIUM</div>
        </div>

        {/* ─── Content ─── */}
        <div className="p-5">
          <h3 className="text-[17px] font-bold leading-snug mb-2 line-clamp-2 tracking-tight" style={{ color: c.title }}>
            {video.title.toUpperCase()}
          </h3>

          <p className="text-[13px] leading-relaxed line-clamp-3 mb-4" style={{ color: c.desc }}>
            {video.description}
          </p>

          {/* ─── Functional action buttons ─── */}
          <div className="flex flex-wrap gap-2 mb-4">
            <ActionBtn
              icon={downloaded ? CheckCircle : Download}
              label={downloaded ? 'Salvo!' : 'Download'}
              active={downloaded}
              c={c}
              onClick={handleDownload}
            />
            <ActionBtn
              icon={addedToList ? CheckCircle : Plus}
              label={addedToList ? 'Na Lista ✓' : 'Adicionar à Lista'}
              active={addedToList}
              c={c}
              onClick={handleAddToList}
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            <ActionBtn
              icon={shared ? CheckCircle : Share2}
              label={shared ? 'Link Copiado!' : 'Compartilhar'}
              active={shared}
              c={c}
              onClick={handleShare}
            />
            <ActionBtn
              icon={Info}
              label="Mais Detalhes"
              active={false}
              c={c}
              onClick={handleDetails}
            />
          </div>

          {/* ─── Metadata ─── */}
          <div className="flex items-center gap-4 pt-3" style={{ borderTop: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: c.metaLabel }}>
              <Clock size={13} style={{ color: c.metaIcon }} />
              Duração:{' '}
              <span className="font-semibold" style={{ color: c.metaVal }}>{video.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: c.metaLabel }}>
              <Signal size={13} style={{ color: c.metaIcon }} />
              Nível:{' '}
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${levelColor}`}>
                {video.level}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable action button ─── */
function ActionBtn({ icon: Icon, label, active, c, onClick }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  label: string;
  active: boolean;
  c: Record<string, string>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 active:scale-95"
      style={{
        background: active ? c.btnActive : c.btnBg,
        border: `1px solid ${active ? c.btnActiveText + '30' : c.btnBorder}`,
        color: active ? c.btnActiveText : c.btnText,
      }}
      onMouseEnter={e => {
        if (!active) {
          const el = e.currentTarget as HTMLElement;
          el.style.background = c.btnBgH;
          el.style.color = c.btnTextH;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          const el = e.currentTarget as HTMLElement;
          el.style.background = c.btnBg;
          el.style.color = c.btnText;
        }
      }}
    >
      <Icon size={13} />{label}
    </button>
  );
}
