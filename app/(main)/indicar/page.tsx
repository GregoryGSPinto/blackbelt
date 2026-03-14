'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, Share2, Users, Check, Award } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import * as referralService from '@/lib/api/referral.service';
import type { ReferralStats } from '@/lib/api/referral.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useToast } from '@/contexts/ToastContext';
import { trackEvent } from '@/lib/analytics/tracker';

export default function IndicarPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        setError(null);
        const data = await referralService.getReferralStats(user.id);
        setStats(data);
      } catch (err) {
        setError(handleServiceError(err, 'Referral'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id, retryCount]);

  const handleCopy = async () => {
    if (!stats) return;
    const link = `https://blackbelt.app/ref/${stats.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link copiado!');
      trackEvent('referral', 'copy_link');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleShare = async () => {
    if (!stats) return;
    const link = `https://blackbelt.app/ref/${stats.code}`;
    trackEvent('referral', 'share');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BlackBelt - Indicacao',
          text: 'Treine comigo no BlackBelt! Use meu codigo de indicacao.',
          url: link,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  if (loading) return <PremiumLoader text="Carregando indicacoes..." />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  if (!stats) return null;

  const shareLink = `https://blackbelt.app/ref/${stats.code}`;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Indicar Amigo
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Convide amigos e ganhe recompensas exclusivas
          </p>
        </div>

        {/* Referral Code Card */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center">
              <Gift size={24} className="text-teal-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Seu codigo</p>
              <p className="text-2xl font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>{stats.code}</p>
            </div>
          </div>

          {/* Link */}
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="flex-1 text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{shareLink}</p>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Copiar link"
            >
              {copied ? <Check size={18} className="text-teal-400" /> : <Copy size={18} style={{ color: 'var(--text-secondary)' }} />}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
            >
              <Copy size={16} /> Copiar Link
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors"
            >
              <Share2 size={16} /> Compartilhar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <Users size={20} className="text-blue-400 mb-2" />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalReferrals}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total de indicacoes</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <Award size={20} className="text-amber-400 mb-2" />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.rewards.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Recompensas ganhas</p>
          </div>
        </div>

        {/* Rewards list */}
        {stats.rewards.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recompensas</h3>
            <div className="space-y-3">
              {stats.rewards.map((reward, i) => (
                <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Award size={14} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{reward.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{reward.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Como funciona</h3>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Compartilhe seu link de indicacao' },
              { step: '2', text: 'Seu amigo se matricula usando o codigo' },
              { step: '3', text: 'Voces dois ganham recompensas!' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center text-sm font-bold text-teal-400">
                  {item.step}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
