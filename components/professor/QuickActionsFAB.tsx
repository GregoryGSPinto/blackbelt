// ============================================================
// QuickActionsFAB — Quick actions "+" button for professors
// ============================================================
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus, X, Film, ClipboardList, Medal, FileText, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

const ACTIONS = [
  { id: 'video', icon: Film, label: 'Vídeo', color: '#D97706' },
  { id: 'plano', icon: ClipboardList, label: 'Plano de Sessão', color: '#3B82F6' },
  { id: 'conquista', icon: Medal, label: 'Conquista', color: '#22C55E' },
  { id: 'obs', icon: FileText, label: 'Observação', color: '#8B5CF6' },
] as const;

export function QuickActionsFAB() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setModal(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleAction = useCallback((id: string) => {
    setOpen(false);
    switch (id) {
      case 'video': router.push('/professor-videos'); break;
      case 'plano': router.push('/professor-plano-aula'); break;
      case 'conquista': setModal('conquista'); break;
      case 'obs': setModal('observacao'); break;
    }
  }, [router]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-[45] backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      )}

      {/* Mini action buttons */}
      <div className="fixed z-[46]" style={{ bottom: '110px', right: '20px' }}>
        {open && ACTIONS.map((action, idx) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.03]"
            style={{
              background: `${action.color}25`,
              border: `1px solid ${action.color}30`,
              animation: `quickSlideUp 200ms ease both`,
              animationDelay: `${idx * 50}ms`,
            }}
          >
            <action.icon size={14} style={{ color: action.color }} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed z-[46] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          bottom: '100px',
          right: '20px',
          background: open ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #D97706, #B45309)',
          boxShadow: open ? 'none' : '0 6px 20px rgba(217,119,6,0.3)',
        }}
        aria-label="Ações rápidas"
      >
        {open ? <X size={18} className="text-white/60" /> : <Plus size={20} className="text-white" />}
      </button>

      {/* Quick modals */}
      {modal === 'conquista' && (
        <ConquistaModal onClose={() => setModal(null)} />
      )}
      {modal === 'observacao' && (
        <ObservacaoModal onClose={() => setModal(null)} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes quickSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </>
  );
}

// ── Conquista Modal ──

function ConquistaModal({ onClose }: { onClose: () => void }) {
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
    <BottomSheet onClose={onClose} title="🏅 Conceder Conquista">
      {/* Aluno search */}
      <div className="relative mb-3">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search}
          onChange={(e: { target: { value: string } }) => setSearch(e.target.value)}
          placeholder="Buscar aluno..."
          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs text-white/70 placeholder:text-white/15 outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        />
      </div>
      <div className="flex flex-wrap gap-1 mb-4 max-h-20 overflow-y-auto">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAluno(a.id)}
            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
              selectedAluno === a.id ? 'bg-green-500/15 text-green-300 border-green-500/20' : 'bg-white/[0.02] text-white/30 border-white/[0.04]'
            }`}
            style={{ border: `1px solid ${selectedAluno === a.id ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)'}` }}
          >
            {a.nome}
          </button>
        ))}
      </div>

      {/* Conquista selection */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CONQUISTAS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedConquista(m.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              selectedConquista === m.id ? 'bg-amber-500/15 text-amber-200 border-amber-500/20' : 'bg-white/[0.02] text-white/30 border-white/[0.04]'
            }`}
            style={{ border: `1px solid ${selectedConquista === m.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)'}` }}
          >
            <span>{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!selectedAluno || !selectedConquista || saving || done}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-30"
        style={{ background: done ? 'rgba(74,222,128,0.2)' : 'linear-gradient(135deg, #D97706, #B45309)' }}
      >
        {done ? '✅ Conquista Concedida!' : saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Conceder'}
      </button>
    </BottomSheet>
  );
}

// ── Observação Modal ──

function ObservacaoModal({ onClose }: { onClose: () => void }) {
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
    <BottomSheet onClose={onClose} title="📝 Observação">
      <div className="flex flex-wrap gap-1 mb-3">
        {MOCK_ALUNOS.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAluno(a.id)}
            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
              selectedAluno === a.id ? 'bg-purple-500/15 text-purple-300 border-purple-500/20' : 'bg-white/[0.02] text-white/30 border-white/[0.04]'
            }`}
            style={{ border: `1px solid ${selectedAluno === a.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)'}` }}
          >
            {a.nome}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e: { target: { value: string } }) => setText(e.target.value)}
        placeholder="Escreva a observação..."
        maxLength={200}
        rows={3}
        className="w-full px-3 py-2 rounded-xl text-xs text-white/70 placeholder:text-white/15 outline-none resize-none mb-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      />
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] text-white/15">{text.length}/200</span>
      </div>
      <button
        onClick={handleSave}
        disabled={!selectedAluno || !text.trim() || saving || done}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-30"
        style={{ background: done ? 'rgba(74,222,128,0.2)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
      >
        {done ? '✅ Observação Salva!' : saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Salvar'}
      </button>
    </BottomSheet>
  );
}

// ── BottomSheet wrapper ──

function BottomSheet({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-3"
        style={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white/80">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg"><X size={14} className="text-white/30" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
