'use client';
// ============================================================
// /offline — Fallback page when user is offline (PWA)
// ============================================================
import { WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0908]">
      <div
        className="max-w-sm w-full rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.15)' }}
        >
          <WifiOff size={28} className="text-amber-400" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Sem Conexão</h1>
        <p className="text-sm text-white/40 mb-6">
          Você está offline. Conecte-se à internet para acessar o BlackBelt.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-amber-600 to-amber-500 text-white
                       hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg"
          >
            Tentar Novamente
          </button>

          <Link
            href="/dashboard"
            className="block w-full py-3 rounded-xl text-sm
                       bg-white/5 border border-white/10 text-white/50
                       hover:bg-white/10 transition-colors text-center"
          >
            Voltar ao Início
          </Link>
        </div>

        <p className="text-[10px] text-white/15 mt-6">
          Check-ins feitos offline serão sincronizados quando a conexão voltar.
        </p>
      </div>
    </div>
  );
}
