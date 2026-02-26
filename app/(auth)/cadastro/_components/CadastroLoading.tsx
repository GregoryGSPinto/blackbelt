'use client';

import CinematicBackground from '@/components/ui/CinematicBackground';

export function CadastroLoading() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <CinematicBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl font-medium">Criando sua conta...</p>
          <p className="text-sm text-white/60 mt-2">Aguarde</p>
        </div>
      </div>
    </div>
  );
}
