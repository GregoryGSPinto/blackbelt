'use client';

import { useEffect, useState } from 'react';

interface PremiumLoadingProps {
  onComplete?: () => void;
}

export default function PremiumLoading({ onComplete }: PremiumLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  // Fase 1: Animação de progresso 0 → 100%
  useEffect(() => {
    const duration = 2500;
    const steps = 100;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      setProgress(current);
      if (current >= 100) {
        clearInterval(timer);
        // Progresso completo → inicia fade-out
        setTimeout(() => setFadingOut(true), 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Fase 2: Fade-out terminou → chama onComplete para desmontar
  useEffect(() => {
    if (fadingOut) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 900); // Espera o CSS transition (800ms) + margem
      return () => clearTimeout(timer);
    }
  }, [fadingOut, onComplete]);

  const circumference = 2 * Math.PI * 52;
  const strokeOffset = circumference * (1 - progress / 100);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black overflow-hidden"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 800ms ease-out',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      {/* Background - Imagem do tatami */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/bg-dark.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/90" />
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative flex flex-col items-center justify-center min-h-screen animate-fade-in">
        <div className="relative w-40 h-40 md:w-48 md:h-48">

          {/* Glow externo pulsante */}
          <div
            className="absolute inset-[-12px] rounded-full animate-pulse-glow"
            style={{
              background: `conic-gradient(from 0deg, rgba(168,178,193,${0.15 + progress * 0.003}), rgba(255,255,255,0.05), rgba(168,178,193,${0.15 + progress * 0.003}))`,
              filter: 'blur(20px)',
            }}
          />

          {/* Anel externo */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </svg>

          {/* Track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          </svg>

          {/* Progresso prata */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="progress-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8B2C1" />
                <stop offset="50%" stopColor="#D1D5DB" />
                <stop offset="100%" stopColor="#A8B2C1" />
              </linearGradient>
              <filter id="glow-3d">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#A8B2C1" floodOpacity="0.6" />
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.3" />
              </filter>
            </defs>
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#progress-silver)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              filter="url(#glow-3d)"
              className="transition-all duration-200 ease-out"
            />
          </svg>

          {/* Anel interno */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(168,178,193,0.1)" strokeWidth="0.5" />
          </svg>

          {/* Porcentagem 3D */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <span
                className="absolute inset-0 flex items-center justify-center text-2xl sm:text-xl md:text-2xl lg:text-5xl font-black tabular-nums tracking-tight select-none"
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(0,0,0,0.3)',
                  transform: 'translate(2px, 2px)',
                  filter: 'blur(2px)',
                }}
              >
                {progress}%
              </span>
              <span
                className="relative text-2xl sm:text-xl md:text-2xl lg:text-5xl font-black tabular-nums tracking-tight select-none"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #D1D5DB 30%, #A8B2C1 60%, #6B7280 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 8px rgba(168,178,193,0.4))',
                }}
              >
                {progress}%
              </span>
            </div>
          </div>

          {/* Ponto luminoso */}
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: 'radial-gradient(circle, #D1D5DB, #A8B2C1)',
              boxShadow: '0 0 12px 4px rgba(168,178,193,0.6), 0 0 24px 8px rgba(168,178,193,0.3)',
              top: '50%',
              left: '50%',
              transform: `rotate(${progress * 3.6}deg) translateY(-70px) translate(-50%, -50%)`,
              transformOrigin: '0 0',
              opacity: progress > 2 ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          />
        </div>

        <p
          className="mt-10 text-sm tracking-[0.3em] uppercase select-none"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(168,178,193,0.6), rgba(255,255,255,0.3))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Carregando
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
