'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, Plus, X, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useToast } from '@/contexts/ToastContext';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { PageEmpty } from '@/components/shared/DataStates';
import { useTranslations } from 'next-intl';
import {
  getAcademyModalities,
  createModality,
  deactivateModality,
  type AcademyModality,
} from '@/lib/api/modality.service';

export default function ModalidadesPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const toast = useToast();
  const t = useTranslations('common');
  const [modalities, setModalities] = useState<AcademyModality[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const card = { background: 'var(--card-bg)', border: `1px solid ${tokens.cardBorder}`, borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)', borderRadius: 12 } as const;

  const fetchModalities = useCallback(async () => {
    try {
      const data = await getAcademyModalities();
      setModalities(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModalities(); }, [fetchModalities]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await createModality({ name: newName.trim(), description: newDescription.trim() || undefined });
      setModalities(prev => [...prev, created]);
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
      toast.success('Modalidade criada com sucesso');
    } catch {
      toast.error('Erro ao criar modalidade');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateModality(id);
      setModalities(prev => prev.map(m => m.id === id ? { ...m, is_active: false } : m));
      toast.success('Modalidade desativada');
    } catch {
      toast.error('Erro ao desativar modalidade');
    }
  };

  if (loading) return <PremiumLoader text={t('loading.modalities')} />;

  const active = modalities.filter(m => m.is_active);
  const inactive = modalities.filter(m => !m.is_active);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          <Award size={22} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          Modalidades
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)' }}
        >
          <Plus size={16} /> Nova Modalidade
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div style={{ ...card, padding: '1rem' }} className="text-center">
          <p className="text-2xl font-medium text-green-400">{active.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Ativas</p>
        </div>
        <div style={{ ...card, padding: '1rem' }} className="text-center">
          <p className="text-2xl font-medium" style={{ color: 'var(--text-secondary)' }}>{inactive.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Inativas</p>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-xl p-6 space-y-4" style={{ background: 'var(--card-bg)', border: `1px solid ${tokens.cardBorder}` }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Nova Modalidade</h3>
              <button onClick={() => setShowCreate(false)}><X size={20} style={{ color: 'var(--text-secondary)' }} /></button>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Nome</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Jiu-Jitsu Brasileiro"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Descrição (opcional)</label>
              <textarea
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={inputStyle}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)' }}
            >
              {creating ? 'Criando...' : 'Criar Modalidade'}
            </button>
          </div>
        </div>
      )}

      {/* Active modalities */}
      {active.length === 0 && inactive.length === 0 ? (
        <PageEmpty
          title={t('empty.noModalitiesAdmin')}
          message="Adicione as artes marciais oferecidas pela sua academia."
        />
      ) : (
        <div className="space-y-3">
          {active.map(mod => (
            <div key={mod.id} style={{ ...card, padding: '1rem 1.25rem' }} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {mod.icon && <span className="mr-1">{mod.icon}</span>}
                    {mod.name}
                  </p>
                  {mod.description && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{mod.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)' }}>
                  {mod.enrollment_mode === 'approval_required' ? 'Aprovação' : 'Direta'}
                </span>
                <button
                  onClick={() => handleDeactivate(mod.id)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-secondary)' }}
                >
                  Desativar
                </button>
                <a href={`/minha-academia/modalidades/${mod.id}`}>
                  <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                </a>
              </div>
            </div>
          ))}

          {inactive.length > 0 && (
            <>
              <p className="text-xs font-medium mt-6" style={{ color: 'var(--text-secondary)' }}>Inativas</p>
              {inactive.map(mod => (
                <div key={mod.id} style={{ ...card, padding: '1rem 1.25rem', opacity: 0.6 }} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-500/30" />
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{mod.name}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
