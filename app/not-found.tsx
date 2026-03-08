'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

export default function NotFound() {
  const router = useRouter();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: 'rgb(10, 10, 10)' }}
      >
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-white/10 rounded mb-4 mx-auto" />
          <div className="h-4 w-48 bg-white/10 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg-primary, rgb(10, 10, 10))' }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: 'var(--card-bg, rgba(255,255,255,0.05))',
          border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="mb-6">
          <span className="text-6xl font-bold text-white/20">404</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Perdido no tatame?</h1>
        <p className="text-white/60 mb-8">
          Parece que essa página não existe ou foi movida para outro dojo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
