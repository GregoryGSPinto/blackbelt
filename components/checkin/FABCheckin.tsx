// ============================================================
// FABCheckin — Floating Action Button for Ultra-Fast Check-in
// ============================================================
// Visible ONLY for: professor, admin, gestor, super_admin
// Features:
//   - QR Code scanner (reuses QRScanner)
//   - Quick list (students of current class by schedule)
//   - Manual search by name
//   - Immediate visual feedback (toast + animation)
// Position: bottom-right, above BottomNav on mobile
// ============================================================
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  QrCode, Users, Search, X, Check, AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import * as checkinService from '@/lib/api/checkin.service';
import type { CheckInQR } from '@/lib/api/contracts';
import { useOfflineCheckin } from '@/hooks/useOfflineCheckin';
import { OfflineBanner } from '@/components/shared/OfflineBanner';

// ── Lazy QR Scanner ──
const LazyQRScanner = dynamic(
  () => import('@/components/checkin/QRScanner'),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div> }
);

// ── Types ──
interface AlunoQuickList {
  id: string;
  nome: string;
  avatar?: string;
  graduacao?: string;
  status: string;
  checked?: boolean;
}

type FABMode = 'closed' | 'menu' | 'qr' | 'list' | 'search';
type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

// ── Constants ──
const ALLOWED_ROLES = ['INSTRUTOR', 'ADMINISTRADOR', 'SUPER_ADMIN', 'GESTOR'];
const TURMA_MOCK_ID = 't1'; // Will be dynamic with contextual menu (Wave 6)

const FAB_STYLES = `
  @keyframes fab-overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fab-sheet-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes fab-toast-in {
    from { opacity: 0; transform: translate(-50%, -12px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes fab-check-pop {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes fab-pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
    70% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }
  .fab-scrollbar::-webkit-scrollbar { width: 4px; }
  .fab-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .fab-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
`;

// ══════════════════════════════════════════════════════════════
// Student Row Sub-component
// ══════════════════════════════════════════════════════════════
function StudentRow({
  aluno,
  onCheckin,
}: {
  aluno: AlunoQuickList;
  onCheckin: (id: string, nome: string) => Promise<void>;
}) {
  const [checking, setChecking] = useState(false);

  const handleClick = async () => {
    if (aluno.checked || checking) return;
    setChecking(true);
    await onCheckin(aluno.id, aluno.nome);
    setChecking(false);
  };

  const statusColor = aluno.status === 'EM_ATRASO' ? 'text-yellow-400' : 'text-emerald-400';

  return (
    <button
      onClick={handleClick}
      disabled={aluno.checked || checking}
      aria-label={`Check-in para ${aluno.nome}`}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${aluno.checked ? 'opacity-60' : 'hover:bg-white/5 active:scale-[0.98]'}
      `}
      style={{
        background: aluno.checked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${aluno.checked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
        {aluno.avatar || aluno.nome.charAt(0)}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-white text-sm font-medium truncate">{aluno.nome}</p>
        <p className={`text-xs ${statusColor} opacity-70`}>{aluno.graduacao}</p>
      </div>
      <div className="flex-shrink-0">
        {checking ? (
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        ) : aluno.checked ? (
          <div
            className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"
            style={{ animation: 'fab-check-pop 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-white/20" />
          </div>
        )}
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// Local Sub-components
// ══════════════════════════════════════════════════════════════

function MenuOption({
  icon, title, subtitle, gradient, border, iconBg, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  border: string;
  iconBg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: `linear-gradient(135deg, ${gradient}, ${gradient.replace('0.15', '0.05')})`,
        border: `1px solid ${border}`,
      }}
    >
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-white font-medium">{title}</p>
        <p className="text-white/40 text-sm">{subtitle}</p>
      </div>
    </button>
  );
}

function SheetHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white/90 text-lg font-semibold">{title}</h3>
      <button
        onClick={onBack}
        className="text-white/40 hover:text-white/70 text-sm transition-colors"
      >
        ← Voltar
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <p className="text-white/30 text-center py-8 text-sm">{text}</p>;
}

// ══════════════════════════════════════════════════════════════
// FABCheckin — Main Component
// ══════════════════════════════════════════════════════════════
export function FABCheckin() {
  const { user } = useAuth();
  const { isOnline, pendingCount, syncing, lastSync, saveCheckin, syncNow } = useOfflineCheckin();
  const [mode, setMode] = useState<FABMode>('closed');
  const [alunos, setAlunos] = useState<AlunoQuickList[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });
  const [fabPulse, setFabPulse] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // ── Role check (computed before early return, after all hooks) ──
  const hasAccess = useMemo(
    () => !!user && ALLOWED_ROLES.includes(user.tipo),
    [user]
  );

  // ── Toast Handler ──
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  // ── Load Students for Quick List ──
  const loadQuickList = useCallback(async () => {
    setLoading(true);
    try {
      const todayCheckins = await checkinService.getTodayCheckins();
      const checkedIds = new Set(todayCheckins.map(c => c.alunoId));
      const mock = await import('@/lib/__mocks__/checkin.mock');
      const students: AlunoQuickList[] = mock.MOCK_ALUNOS_CHECKIN
        .filter((a: { status: string }) => a.status !== 'BLOQUEADO')
        .map((a: { id: string; nome: string; avatar?: string; graduacao?: string; status: string }) => ({
          ...a,
          checked: checkedIds.has(a.id),
        }));
      setAlunos(students);
    } catch {
      showToast('Erro ao carregar alunos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ── Check-in Handler (offline-safe) ──
  const handleCheckin = useCallback(async (alunoId: string, alunoNome: string) => {
    try {
      const result = await saveCheckin({
        alunoId,
        alunoNome,
        turmaId: TURMA_MOCK_ID,
        method: 'MANUAL',
      });
      if (result.success) {
        setAlunos(prev => prev.map(a =>
          a.id === alunoId ? { ...a, checked: true } : a
        ));
        if (result.offline) {
          showToast(`📡 ${alunoNome} — Salvo offline`, 'info');
        } else {
          showToast(`✓ ${alunoNome} — Check-in confirmado!`, 'success');
        }
        setFabPulse(true);
        setTimeout(() => setFabPulse(false), 600);
        if (navigator.vibrate) navigator.vibrate(50);
      } else {
        showToast('Falha no check-in', 'error');
      }
    } catch {
      showToast('Erro de conexão', 'error');
    }
  }, [showToast, saveCheckin]);

  // ── QR Scan Handler ──
  const handleQRScan = useCallback(async (data: CheckInQR) => {
    try {
      const result = await checkinService.validateAndCheckin(data);
      if (result.success) {
        showToast(`✓ ${result.aluno?.nome || 'Aluno'} — QR Check-in!`, 'success');
        setFabPulse(true);
        setTimeout(() => setFabPulse(false), 600);
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => setMode('menu'), 1500);
      } else {
        showToast(result.error || 'QR inválido', 'error');
      }
    } catch {
      showToast('Erro ao processar QR', 'error');
    }
  }, [showToast]);

  // ── Mode Changes ──
  const openMode = useCallback((newMode: FABMode) => {
    setMode(newMode);
    if (newMode === 'list' || newMode === 'search') loadQuickList();
    if (newMode === 'search') {
      setTimeout(() => searchInputRef.current?.focus(), 200);
    }
  }, [loadQuickList]);

  const close = useCallback(() => {
    setMode('closed');
    setSearchQuery('');
  }, []);

  // ── Close on click outside ──
  useEffect(() => {
    if (mode === 'closed') return;
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [mode, close]);

  // ── ESC to close ──
  useEffect(() => {
    if (mode === 'closed') return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mode, close]);

  // ── Filtered students for search ──
  const filteredAlunos = searchQuery.trim()
    ? alunos.filter(a => a.nome.toLowerCase().includes(searchQuery.toLowerCase()))
    : alunos;

  // ── Early return AFTER all hooks ──
  if (!hasAccess) return null;

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FAB_STYLES }} />

      {/* ─── FAB Button ─── */}
      <button
        onClick={() => setMode(mode === 'closed' ? 'menu' : 'closed')}
        className={`
          fixed z-[55] right-4 shadow-2xl fab-checkin-btn
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${mode !== 'closed'
            ? 'bg-white/20 backdrop-blur-xl bottom-4 md:bottom-6 w-14 h-14 rounded-full'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 bottom-[calc(env(safe-area-inset-bottom,0px)+76px)] md:bottom-6 w-14 h-14 rounded-full md:w-auto md:h-12 md:rounded-2xl md:px-5 md:gap-2'
          }
          ${fabPulse ? 'scale-125' : 'scale-100'}
        `}
        aria-label={mode === 'closed' ? 'Abrir check-in rápido' : 'Fechar check-in'}
        style={{
          boxShadow: mode === 'closed'
            ? '0 4px 24px rgba(16, 185, 129, 0.4)'
            : '0 4px 12px rgba(0,0,0,0.2)',
          animation: mode === 'closed' ? 'fab-pulse-ring 2s ease-out infinite' : undefined,
        }}
      >
        {mode === 'closed' ? (
          <>
            <QrCode className="w-6 h-6 text-white md:w-5 md:h-5" />
            <span className="hidden md:inline text-white text-sm font-semibold">Check-in</span>
          </>
        ) : (
          <X className="w-6 h-6 text-white" />
        )}
        {/* Offline pending badge */}
        {mode === 'closed' && pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center shadow-md">
            {pendingCount}
          </span>
        )}
      </button>

      {/* ─── Overlay ─── */}
      {mode !== 'closed' && (
        <div
          className="fixed inset-0 z-[53] bg-black/50 backdrop-blur-sm"
          style={{ animation: 'fab-overlay-in 200ms ease-out' }}
        />
      )}

      {/* ─── Bottom Sheet (mobile) / Side Panel (desktop) ─── */}
      {mode !== 'closed' && (
        <div
          ref={sheetRef}
          className="fixed z-[54] max-h-[85vh] overflow-hidden
                     bottom-0 left-0 right-0
                     md:bottom-auto md:top-4 md:right-4 md:left-auto md:w-[420px] md:max-h-[calc(100vh-2rem)] md:rounded-2xl"
          style={{ animation: 'fab-sheet-up 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div
            className="rounded-t-3xl overflow-hidden md:rounded-2xl"
            style={{
              background: 'rgba(15, 15, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Drag Handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-2 md:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* ── Menu Mode ── */}
            {mode === 'menu' && (
              <div className="px-5 pb-6 space-y-3">
                <h3 className="text-white/90 text-lg font-semibold mb-4">
                  ⚡ Check-in Rápido
                </h3>
                {/* Offline status */}
                <OfflineBanner
                  isOnline={isOnline}
                  pendingCount={pendingCount}
                  syncing={syncing}
                  lastSyncedCount={lastSync?.synced}
                  onSync={syncNow}
                />
                <MenuOption
                  icon={<QrCode className="w-6 h-6 text-violet-400" />}
                  title="Scanner QR Code"
                  subtitle="Leitura pela câmera"
                  gradient="rgba(139,92,246,0.15)"
                  border="rgba(139,92,246,0.2)"
                  iconBg="bg-violet-500/20"
                  onClick={() => openMode('qr')}
                />
                <MenuOption
                  icon={<Users className="w-6 h-6 text-emerald-400" />}
                  title="Lista Rápida do Dia"
                  subtitle="Alunos da turma atual"
                  gradient="rgba(16,185,129,0.15)"
                  border="rgba(16,185,129,0.2)"
                  iconBg="bg-emerald-500/20"
                  onClick={() => openMode('list')}
                />
                <MenuOption
                  icon={<Search className="w-6 h-6 text-blue-400" />}
                  title="Buscar por Nome"
                  subtitle="Check-in manual"
                  gradient="rgba(59,130,246,0.15)"
                  border="rgba(59,130,246,0.2)"
                  iconBg="bg-blue-500/20"
                  onClick={() => openMode('search')}
                />
              </div>
            )}

            {/* ── QR Scanner Mode ── */}
            {mode === 'qr' && (
              <div className="px-5 pb-6">
                <SheetHeader title="📷 Scanner QR" onBack={() => setMode('menu')} />
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <LazyQRScanner onScan={handleQRScan} onClose={() => setMode('menu')} mockMode />
                </div>
              </div>
            )}

            {/* ── Quick List Mode ── */}
            {mode === 'list' && (
              <div className="px-5 pb-6">
                <SheetHeader title="📋 Turma Atual" onBack={() => setMode('menu')} />
                {loading ? <LoadingSpinner /> : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 fab-scrollbar">
                    {alunos.map(aluno => (
                      <StudentRow key={aluno.id} aluno={aluno} onCheckin={handleCheckin} />
                    ))}
                    {alunos.length === 0 && <EmptyMessage text="Nenhum aluno encontrado" />}
                  </div>
                )}
              </div>
            )}

            {/* ── Search Mode ── */}
            {mode === 'search' && (
              <div className="px-5 pb-6">
                <SheetHeader title="🔍 Buscar Aluno" onBack={() => setMode('menu')} />
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Search className="w-5 h-5 text-white/30 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite o nome do aluno..."
                    aria-label="Buscar aluno"
                    className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white/60 transition-colors" aria-label="Limpar busca">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {loading ? <LoadingSpinner /> : (
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 fab-scrollbar">
                    {filteredAlunos.map(aluno => (
                      <StudentRow key={aluno.id} aluno={aluno} onCheckin={handleCheckin} />
                    ))}
                    {filteredAlunos.length === 0 && searchQuery && (
                      <EmptyMessage text={`Nenhum aluno para "${searchQuery}"`} />
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toast.visible && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px]"
          style={{
            background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(59,130,246,0.95)',
            backdropFilter: 'blur(12px)',
            animation: 'fab-toast-in 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {toast.type === 'success' && <Check className="w-5 h-5 text-white flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />}
          <span className="text-white text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
