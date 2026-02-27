'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';


/**
 * SplashScreen — Overlay global de carregamento.
 * Renderiza por cima de TUDO (z-[9999]).
 * A página real carrega por baixo enquanto o splash anima.
 * Quando termina, faz fade-out suave revelando a página já pronta.
 * Exibe apenas 1x por sessão do navegador.
 */
export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<'hidden' | 'loading' | 'fadeout'>('hidden');
  const [progress, setProgress] = useState(0);

  // Only render on client (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem('blackbelt_splash')) {
        setPhase('hidden');
      } else {
        setPhase('loading');
      }
    } catch {
      setPhase('loading');
    }
  }, []);

  // Progresso: 0 → 100% em 2.5s
  useEffect(() => {
    if (phase !== 'loading') return;

    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setProgress(current);
      if (current >= 100) {
        clearInterval(timer);
        // Pequena pausa no 100% antes do fade
        setTimeout(() => setPhase('fadeout'), 350);
      }
    }, 25); // 100 steps × 25ms = 2.5s

    return () => clearInterval(timer);
  }, [phase]);

  // Fase fadeout → marca sessão e aguarda animação CSS terminar
  useEffect(() => {
    if (phase !== 'fadeout') return;
    sessionStorage.setItem('blackbelt_splash', '1');

    const timer = setTimeout(() => setPhase('hidden'), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  // Não renderiza nada se não montou no client ou se já terminou
  if (!mounted || phase === 'hidden') return null;

  const circumference = 2 * Math.PI * 52;
  const strokeOffset = circumference * (1 - progress / 100);

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: 'opacity 800ms ease-out',
        pointerEvents: phase === 'fadeout' ? 'none' : 'auto',
      }}
    >
      {/* Background — mesma imagem da tela de login (já fica em cache) */}
      <div className="absolute inset-0 bg-black">
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
      <div
        className="relative flex flex-col items-center justify-center min-h-screen"
        style={{
          animation: 'splash-fadein 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Círculo de progresso 3D Premium */}
        <div className="relative w-40 h-40 md:w-48 md:h-48">

          {/* Glow externo pulsante */}
          <div
            className="absolute inset-[-12px] rounded-full"
            style={{
              background: `conic-gradient(from 0deg, rgba(168,178,193,${0.15 + progress * 0.003}), rgba(255,255,255,0.05), rgba(168,178,193,${0.15 + progress * 0.003}))`,
              filter: 'blur(20px)',
              animation: 'splash-pulse 3s ease-in-out infinite',
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
              <linearGradient id="splash-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8B2C1" />
                <stop offset="50%" stopColor="#D1D5DB" />
                <stop offset="100%" stopColor="#A8B2C1" />
              </linearGradient>
              <filter id="splash-glow">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#A8B2C1" floodOpacity="0.6" />
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.3" />
              </filter>
            </defs>
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#splash-silver)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              filter="url(#splash-glow)"
              style={{ transition: 'stroke-dashoffset 200ms ease-out' }}
            />
          </svg>

          {/* Anel interno */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(168,178,193,0.1)" strokeWidth="0.5" />
          </svg>

          {/* Logo central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/logo-blackbelt.png"
              alt="BlackBelt"
              width={80}
              height={80}
              className="rounded-lg"
              style={{
                filter: 'drop-shadow(0 0 12px rgba(168,178,193,0.4))',
              }}
            />
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

        {/* Texto sutil */}
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

      {/* Animações CSS (global, sem styled-jsx para evitar hydration mismatch) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes splash-fadein {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}} />
    </div>
  );
}
