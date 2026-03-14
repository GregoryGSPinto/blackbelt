'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, ArrowLeft, Users, ChevronUp, ChevronDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { PageEmpty } from '@/components/shared/DataStates';
import { getModalityMembers, updateMemberBelt } from '@/lib/api/modality.service';

interface ModalityMember {
  id: string;
  membership_id: string;
  belt_rank: string;
  stripes: number;
  status: string;
  started_at: string;
  memberships?: {
    id: string;
    profile_id: string;
    role: string;
    status: string;
    profiles?: { full_name: string; avatar_url: string | null };
  };
}

export default function ModalityDetailPage() {
  const params = useParams();
  const modalityId = params.id as string;
  const { isDark } = useTheme();
  const toast = useToast();
  const [members, setMembers] = useState<ModalityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promoteBelt, setPromoteBelt] = useState('');
  const [promoteStripes, setPromoteStripes] = useState(0);

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: 'var(--text-primary)', borderRadius: 12 } as const;

  const fetchMembers = useCallback(async () => {
    try {
      const data = await getModalityMembers(modalityId);
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }, [modalityId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handlePromote = async (member: ModalityMember) => {
    if (!promoteBelt.trim()) return;
    try {
      const profileId = member.memberships?.profile_id;
      if (!profileId) return;
      await updateMemberBelt(profileId, modalityId, promoteBelt, promoteStripes);
      setMembers(prev => prev.map(m =>
        m.id === member.id ? { ...m, belt_rank: promoteBelt, stripes: promoteStripes } : m,
      ));
      setPromotingId(null);
      setPromoteBelt('');
      setPromoteStripes(0);
      toast.success('Graduação atualizada');
    } catch {
      toast.error('Erro ao atualizar graduação');
    }
  };

  if (loading) return <PremiumLoader text="Carregando alunos..." />;

  // Belt distribution
  const beltCounts: Record<string, number> = {};
  const activeMembers = members.filter(m => m.status === 'active');
  for (const m of activeMembers) {
    const belt = m.belt_rank || 'branca';
    beltCounts[belt] = (beltCounts[belt] || 0) + 1;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <div className="flex items-center gap-3">
        <a href="/minha-academia/modalidades" className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          <Award size={22} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          Detalhe da Modalidade
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div style={{ ...card, padding: '1rem' }} className="text-center">
          <p className="text-2xl font-medium text-green-400">{activeMembers.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Alunos ativos</p>
        </div>
        {Object.entries(beltCounts).slice(0, 4).map(([belt, count]) => (
          <div key={belt} style={{ ...card, padding: '1rem' }} className="text-center">
            <p className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>{count}</p>
            <p className="text-xs mt-1 capitalize" style={{ color: 'var(--text-secondary)' }}>Faixa {belt}</p>
          </div>
        ))}
      </div>

      {/* Members list */}
      {activeMembers.length === 0 ? (
        <PageEmpty
          title="Nenhum aluno matriculado"
          message="Matricule alunos nesta modalidade pelo perfil do aluno."
        />
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Users size={14} className="inline mr-1" /> Alunos ({activeMembers.length})
          </h3>
          {activeMembers.map(member => {
            const profile = member.memberships?.profiles;
            const isPromoting = promotingId === member.id;

            return (
              <div key={member.id} style={{ ...card, padding: '1rem 1.25rem' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)' }}>
                        {(profile?.full_name || '?')[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{profile?.full_name || 'Aluno'}</p>
                      <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                        Faixa {member.belt_rank || 'branca'} • {member.stripes} grau(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (isPromoting) {
                        setPromotingId(null);
                      } else {
                        setPromotingId(member.id);
                        setPromoteBelt(member.belt_rank || 'branca');
                        setPromoteStripes(member.stripes);
                      }
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ border: '1px solid black', color: 'var(--text-secondary)' }}
                  >
                    {isPromoting ? 'Cancelar' : 'Promover'}
                  </button>
                </div>

                {isPromoting && (
                  <div className="mt-3 pt-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(128,128,128,0.2)' }}>
                    <input
                      value={promoteBelt}
                      onChange={e => setPromoteBelt(e.target.value)}
                      placeholder="Faixa"
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={inputStyle}
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPromoteStripes(Math.max(0, promoteStripes - 1))} className="p-1" style={{ color: 'var(--text-secondary)' }}><ChevronDown size={14} /></button>
                      <span className="text-sm w-6 text-center" style={{ color: 'var(--text-primary)' }}>{promoteStripes}</span>
                      <button onClick={() => setPromoteStripes(Math.min(6, promoteStripes + 1))} className="p-1" style={{ color: 'var(--text-secondary)' }}><ChevronUp size={14} /></button>
                    </div>
                    <button
                      onClick={() => handlePromote(member)}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: '1px solid black', color: 'var(--text-primary)' }}
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
