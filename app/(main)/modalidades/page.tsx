'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, Plus, Check, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { PageEmpty } from '@/components/shared/DataStates';
import {
  getMyModalities,
  getAvailableModalities,
  requestEnrollment,
  type MemberModality,
  type AcademyModality,
} from '@/lib/api/modality.service';

export default function StudentModalidadesPage() {
  const { isDark } = useTheme();
  const toast = useToast();
  const [myModalities, setMyModalities] = useState<MemberModality[]>([]);
  const [available, setAvailable] = useState<AcademyModality[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;

  const fetchData = useCallback(async () => {
    try {
      const [mine, avail] = await Promise.all([getMyModalities(), getAvailableModalities()]);
      setMyModalities(mine);
      setAvailable(avail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEnroll = async (modalityId: string) => {
    setEnrollingId(modalityId);
    try {
      const result = await requestEnrollment(modalityId);
      if (result.status === 'pending') {
        toast.success('Solicitação enviada. Aguarde aprovação da academia.');
      } else {
        toast.success('Matrícula confirmada!');
      }
      await fetchData();
    } catch {
      toast.error('Erro ao solicitar matrícula');
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) return <PremiumLoader text="Carregando modalidades..." />;

  const enrolledIds = new Set(myModalities.map(m => m.modality_id));
  const notEnrolled = available.filter(a => !enrolledIds.has(a.id));
  const activeModalities = myModalities.filter(m => m.status === 'active');
  const pendingModalities = myModalities.filter(m => m.status === 'pending');

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        <Award size={22} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
        Minhas Modalidades
      </h1>

      {/* Active enrollments */}
      {activeModalities.length > 0 && (
        <div className="space-y-3">
          {activeModalities.map(mod => {
            const modalityInfo = mod.academy_modalities as any;
            return (
              <div key={mod.id} style={{ ...card, padding: '1rem 1.25rem' }} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-green-400" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {modalityInfo?.icon && <span className="mr-1">{modalityInfo.icon}</span>}
                      {modalityInfo?.name || 'Modalidade'}
                    </p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                      Faixa {mod.belt_rank || 'branca'} • {mod.stripes} grau(s)
                    </p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Desde {new Date(mod.started_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending enrollments */}
      {pendingModalities.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Aguardando aprovação</p>
          {pendingModalities.map(mod => {
            const modalityInfo = mod.academy_modalities as any;
            return (
              <div key={mod.id} style={{ ...card, padding: '1rem 1.25rem', opacity: 0.7 }} className="flex items-center gap-3">
                <Clock size={16} className="text-yellow-400" />
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {modalityInfo?.name || 'Modalidade'} — aguardando aprovação
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {activeModalities.length === 0 && pendingModalities.length === 0 && notEnrolled.length === 0 && (
        <PageEmpty
          title="Nenhuma modalidade disponível"
          message="A academia ainda não cadastrou modalidades."
        />
      )}

      {/* Available to enroll */}
      {notEnrolled.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Modalidades disponíveis</p>
          {notEnrolled.map(mod => (
            <div key={mod.id} style={{ ...card, padding: '1rem 1.25rem' }} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {mod.icon && <span className="mr-1">{mod.icon}</span>}
                  {mod.name}
                </p>
                {mod.description && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{mod.description}</p>
                )}
              </div>
              <button
                onClick={() => handleEnroll(mod.id)}
                disabled={enrollingId === mod.id}
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: '1px solid black', color: 'var(--text-primary)' }}
              >
                <Plus size={14} />
                {enrollingId === mod.id ? 'Matriculando...' : mod.enrollment_mode === 'approval_required' ? 'Solicitar' : 'Matricular'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
