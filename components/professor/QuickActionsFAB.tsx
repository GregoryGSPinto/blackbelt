// ============================================================
// QuickActionsFAB — Floating Action Button with Expandable Menu
// ============================================================
// Mobile: FAB bottom-right, expands vertically above
// Desktop: Same behavior or horizontal (adaptive)
// Features: Drag, smooth animations, click outside to close
// ============================================================
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, X, Film, ClipboardList, Medal, FileText, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

// ── Mock student list for medal/observation ──
const MOCK_ALUNOS = [
  { id: 'a1', nome: 'Carlos Silva' },
  { id: 'a2', nome: 'Ana Souza' },
  { id: 'a3', nome: 'Pedro Lima' },
  { id: 'a4', nome: 'Julia Santos' },
  { id: 'a5', nome: 'Rafael Costa' },
];

const CONQUISTAS = [
  { id: 'm1', emoji: '🥇', label: 'Destaque do Dia' },
  { id: 'm2', emoji: '💪', label: 'Esforço' },
  { id: 'm3', emoji: '🧠', label: 'Técnica' },
  { id: 'm4', emoji: '🤝', label: 'Espírito de Equipe' },
  { id: 'm5', emoji: '⭐', label: 'Evolução' },
];

type ModalType = null | 'conquista' | 'observacao';

interface ActionItem {
  id: string;
  icon: React.ElementType;
  labelKey: string;
  color: string;
  gradient: string;
}

const ACTIONS: ActionItem[] = [
  { id: 'video', icon: Film, labelKey: 'video', color: '#F59E0B', gradient: 'from-amber-500 to-orange-600' },
  { id: 'plano', icon: ClipboardList, labelKey: 'lessonPlan', color: '#3B82F6', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'conquista', icon: Medal, labelKey: 'achievement', color: '#22C55E', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'obs', icon: FileText, labelKey: 'observation', color: '#8B5CF6', gradient: 'from-violet-500 to-purple-600' },
];

// Animation variants
const fabVariants = {
  closed: { rotate: 0, scale: 1 },
  open: { rotate: 135, scale: 1 },
};

const menuVariants = {
  closed: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2 }
  },
  open: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3, 
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
};

const itemVariants = {
  closed: { 
    opacity: 0, 
    y: 20, 
    scale: 0.8,
    transition: { duration: 0.2 }
  },
  open: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }
  },
};

export function QuickActionsFAB() {
  const tq = useTranslations('professor.quickActions');
  const router = useRouter();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setModal(null); }
    };
    const clickHandler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', keyHandler);
    if (open) {
      setTimeout(() => window.addEventListener('mousedown', clickHandler), 100);
    }
    return () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('mousedown', clickHandler);
    };
  }, [open]);

  const handleAction = useCallback((id: string) => {
    setOpen(false);
    setTimeout(() => {
      switch (id) {
        case 'video': router.push('/professor-videos'); break;
        case 'plano': router.push('/professor-plano-aula'); break;
        case 'conquista': setModal('conquista'); break;
        case 'obs': setModal('observacao'); break;
      }
    }, 200);
  }, [router]);

  // Calculate stacked positions for vertical layout
  const getStackedPosition = (index: number) => {
    const spacing = 64; // 56px button + 8px gap
    return -(spacing * (index + 1));
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[44] bg-black/30 backdrop-blur-sm md:bg-black/20"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Container - Draggable */}
      <motion.div
        ref={containerRef}
        drag
        dragControls={dragControls}
        dragConstraints={{ left: -100, right: 100, top: -300, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        whileDrag={{ scale: 1.05 }}
        className="fixed z-[45] flex flex-col items-center"
        style={{ 
          bottom: '20px', 
          right: '20px',
          touchAction: 'none'
        }}
        initial={false}
        animate={{ x: position.x, y: position.y }}
      >
        {/* Expanded Menu Items - Stacked Vertically */}
        <AnimatePresence>
          {open && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="absolute bottom-[72px] flex flex-col items-center gap-2"
            >
              {ACTIONS.map((action, index) => (
                <motion.button
                  key={action.id}
                  variants={itemVariants}
                  onClick={() => handleAction(action.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-white shadow-lg transition-shadow hover:shadow-xl"
                  style={{
                    background: isDark 
                      ? `linear-gradient(135deg, ${action.color}30, ${action.color}15)`
                      : `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                    border: `1px solid ${action.color}40`,
                    backdropFilter: 'blur(12px)',
                    minWidth: '160px',
                  }}
                  whileHover={{ scale: 1.05, x: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${action.color}30` }}
                  >
                    <action.icon size={16} style={{ color: action.color }} />
                  </div>
                  <span style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
                    {tq(action.labelKey)}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background: open 
              ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
              : 'linear-gradient(135deg, #D97706, #B45309)',
            backdropFilter: open ? 'blur(12px)' : undefined,
            border: open ? `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` : undefined,
            boxShadow: open 
              ? '0 8px 32px rgba(0,0,0,0.2)'
              : '0 6px 24px rgba(217,119,6,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
          }}
          variants={fabVariants}
          animate={open ? 'open' : 'closed'}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={open ? tq('close') : tq('quickActions')}
          dragListener={false}
        >
          <Plus size={24} className="text-white" />
        </motion.button>

        {/* Hint text when closed */}
        <AnimatePresence>
          {!open && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-8 text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap pointer-events-none"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {tq('tapAndDrag')}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'conquista' && (
          <ConquistaModal onClose={() => setModal(null)} />
        )}
        {modal === 'observacao' && (
          <ObservacaoModal onClose={() => setModal(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Conquista Modal ──
function ConquistaModal({ onClose }: { onClose: () => void }) {
  const tq = useTranslations('professor.quickActions');
  const [search, setSearch] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');
  const [selectedConquista, setSelectedConquista] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const filtered = MOCK_ALUNOS.filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!selectedAluno || !selectedConquista) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    setDone(true);
    setTimeout(onClose, 800);
  };

  return (
    <BottomSheet onClose={onClose} title={`🏅 ${tq('grantAchievement')}`}>
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tq('searchStudent')}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus:border-amber-500/50 transition-colors"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAluno(a.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedAluno === a.id 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
            } border`}
          >
            {a.nome}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {CONQUISTAS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedConquista(m.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedConquista === m.id 
                ? 'bg-amber-500/20 text-amber-200 border-amber-500/30' 
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
            } border`}
          >
            <span>{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={!selectedAluno || !selectedConquista || saving || done}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: done ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #D97706, #B45309)' }}
      >
        {done ? `✅ ${tq('achievementGranted')}` : saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : tq('grant')}
      </button>
    </BottomSheet>
  );
}

// ── Observação Modal ──
function ObservacaoModal({ onClose }: { onClose: () => void }) {
  const tq = useTranslations('professor.quickActions');
  const [selectedAluno, setSelectedAluno] = useState('');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (!selectedAluno || !text.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    setDone(true);
    setTimeout(onClose, 800);
  };

  return (
    <BottomSheet onClose={onClose} title={`📝 ${tq('observationTitle')}`}>
      <div className="flex flex-wrap gap-2 mb-3">
        {MOCK_ALUNOS.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAluno(a.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedAluno === a.id 
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' 
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
            } border`}
          >
            {a.nome}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={tq('observationPlaceholder')}
        maxLength={200}
        rows={4}
        className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-white/20 resize-none mb-2 focus:border-violet-500/50 transition-colors"
      />
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/30">{text.length}/200</span>
      </div>
      <button
        onClick={handleSave}
        disabled={!selectedAluno || !text.trim() || saving || done}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: done ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
      >
        {done ? `✅ ${tq('observationSaved')}` : saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : tq('grant')}
      </button>
    </BottomSheet>
  );
}

// ── BottomSheet wrapper ──
function BottomSheet({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center"
    >
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6"
        style={{ 
          background: 'linear-gradient(180deg, rgba(25,25,35,0.98), rgba(15,15,25,0.99))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white/90">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={18} className="text-white/40" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
