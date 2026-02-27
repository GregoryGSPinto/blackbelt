'use client';

import { useState, useEffect } from 'react';
import { useStudentDNA } from '@/hooks/useStudentDNA';
import { AdventureProgress } from '@/components/kids/AdventureProgress';
import { StickerCollection } from '@/components/kids/StickerCollection';
import { MascotBubble } from '@/components/kids/MascotBubble';
import { SimpleProgressStars } from '@/components/kids/SimpleProgressStars';

export default function KidsAventuraPage() {
  const [memberId, setMemberId] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Fetch current kid's member ID
  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar perfil');
        return res.json();
      })
      .then(json => {
        if (json.data?.memberId) setMemberId(json.data.memberId);
      })
      .catch(err => {
        setUserError(err instanceof Error ? err.message : 'Erro desconhecido');
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const { dna, loading: dnaLoading, error: dnaError } = useStudentDNA(memberId);

  const isLoading = loadingUser || dnaLoading;
  const error = userError || dnaError?.message;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="h-24 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-40 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-20 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-48 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !dna) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-3xl mx-auto">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-4xl mb-3">😢</p>
          <p className="text-red-300 text-sm font-medium">
            Opa! Algo deu errado...
          </p>
          <p className="text-red-300/60 text-xs mt-1">
            Tenta de novo daqui a pouquinho!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 font-kids">
          Sua Aventura
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-kids">
          Continue treinando e desbloqueie novas conquistas!
        </p>
      </div>

      {/* Mascot greeting at top */}
      <MascotBubble
        dna={dna}
        message="Oi, campeao! Vamos ver como voce esta indo na sua aventura?"
      />

      {/* Adventure Progress Map */}
      <AdventureProgress dna={dna} />

      {/* Stars Progress */}
      <SimpleProgressStars dna={dna} />

      {/* Sticker Collection */}
      <StickerCollection dna={dna} memberId={memberId} />
    </div>
  );
}
