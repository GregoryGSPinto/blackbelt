'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, ArrowLeft, Users, ChevronUp, ChevronDown, Clock, Check, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useToast } from '@/contexts/ToastContext';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { PageEmpty } from '@/components/shared/DataStates';
import {
  getModalityMembers,
  updateMemberBelt,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from '@/lib/api/modality.service';

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
  const t = useTranslations('admin.modality');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const toast = useToast();
  const [members, setMembers] = useState<ModalityMember[]>([]);
  const [pending, setPending] = useState<ModalityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promoteBelt, setPromoteBelt] = useState('');
  const [promoteStripes, setPromoteStripes] = useState(0);

  const card = { background: 'var(--card-bg)', border: `1px solid ${tokens.cardBorder}`, borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)', borderRadius: 12 } as const;

  const fetchData = useCallback(async () => {
    try {
      const [membersData, pendingData] = await Promise.all([
        getModalityMembers(modalityId),
        getPendingEnrollments(modalityId),
      ]);
      setMembers(membersData);
      setPending(pendingData);
    } finally {
      setLoading(false);
    }
  }, [modalityId]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      toast.success(t('beltUpdated'));
    } catch {
      toast.error(t('beltUpdateError'));
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    try {
      await approveEnrollment(modalityId, enrollmentId);
      toast.success(t('approved'));
      fetchData();
    } catch {
      toast.error(t('approveError'));
    }
  };

  const handleReject = async (enrollmentId: string) => {
    try {
      await rejectEnrollment(modalityId, enrollmentId);
      toast.success(t('rejected'));
      fetchData();
    } catch {
      toast.error(t('approveError'));
    }
  };

  if (loading) return <PremiumLoader text={t('loadingStudents')} />;

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
          {t('detail')}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div style={{ ...card, padding: '1rem' }} className="text-center">
          <p className="text-2xl font-medium text-green-400">{activeMembers.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('activeStudents')}</p>
        </div>
        {Object.entries(beltCounts).slice(0, 4).map(([belt, count]) => (
          <div key={belt} style={{ ...card, padding: '1rem' }} className="text-center">
            <p className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>{count}</p>
            <p className="text-xs mt-1 capitalize" style={{ color: 'var(--text-secondary)' }}>{t('belt')} {belt}</p>
          </div>
        ))}
      </div>

      {/* Pending enrollments */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-1.5" style={{ color: tokens.warning }}>
            <Clock size={14} /> {t('pendingEnrollments')} ({pending.length})
          </h3>
          {pending.map(member => {
            const profile = member.memberships?.profiles;
            return (
              <div key={member.id} style={{ ...card, padding: '1rem 1.25rem', borderColor: tokens.warning }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)' }}>
                      {(profile?.full_name || '?')[0]}
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{profile?.full_name || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(member.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                      style={{ border: `1px solid ${tokens.success}`, color: tokens.success }}
                    >
                      <Check size={14} /> {t('approve')}
                    </button>
                    <button
                      onClick={() => handleReject(member.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                      style={{ border: `1px solid ${tokens.error}`, color: tokens.error }}
                    >
                      <X size={14} /> {t('reject')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active members list */}
      {activeMembers.length === 0 ? (
        <PageEmpty
          title={t('noStudents')}
          message={t('noStudentsHint')}
        />
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Users size={14} className="inline mr-1" /> {t('students')} ({activeMembers.length})
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
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{profile?.full_name || '—'}</p>
                      <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                        {t('belt')} {member.belt_rank || 'branca'} • {member.stripes} {t('stripes')}
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
                    style={{ border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-secondary)' }}
                  >
                    {isPromoting ? t('cancel') : t('promote')}
                  </button>
                </div>

                {isPromoting && (
                  <div className="mt-3 pt-3 flex items-center gap-3" style={{ borderTop: `1px solid ${tokens.divider}` }}>
                    <input
                      value={promoteBelt}
                      onChange={e => setPromoteBelt(e.target.value)}
                      placeholder={t('belt')}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-white/20"
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
                      style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)' }}
                    >
                      {t('save')}
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
