'use client';

// ============================================================
// CRONÔMETRO DE ROUNDS — Professor
//
// Usado em TODA sessão de JJ/Muay Thai para sparring e drills.
// Presets configuráveis, sons via Web Audio API, fullscreen,
// wake lock, controles touch-friendly.
//
// Tema: amber/gold instrutor. Zero dependências externas.
// ============================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, SkipForward, Plus, Minus,
  Maximize2, Minimize2, Settings, Volume2, VolumeX,
} from 'lucide-react';

// ── Types ──
type TimerState = 'idle' | 'round' | 'rest' | 'paused' | 'finished';

interface TimerPreset {
  id: string;
  label: string;
  emoji: string;
  roundSec: number;
  restSec: number;
  rounds: number;
}

// ── Presets ──
const PRESETS: TimerPreset[] = [
  { id: 'sparring', label: 'Sparring', emoji: '🥋', roundSec: 300, restSec: 60, rounds: 6 },
  { id: 'muaythai', label: 'Muay Thai', emoji: '🥊', roundSec: 180, restSec: 60, rounds: 5 },
  { id: 'drill', label: 'Drill Rápido', emoji: '⚡', roundSec: 120, restSec: 30, rounds: 10 },
  { id: 'warmup', label: 'Aquecimento', emoji: '🔥', roundSec: 60, restSec: 15, rounds: 5 },
  { id: 'custom', label: 'Personalizado', emoji: '⚙️', roundSec: 300, restSec: 60, rounds: 6 },
];

// ── Audio engine (Web Audio API) ──
class AudioEngine {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playTone(freq: number, duration: number, volume = 0.15) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = volume;
      gain.gain.setTargetAtTime(0, ctx.currentTime + duration - 0.05, 0.02);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch { /* Audio not available */ }
  }

  roundStart() {
    this.playTone(880, 0.15, 0.2);
    setTimeout(() => this.playTone(1100, 0.2, 0.2), 160);
  }

  roundEnd() {
    this.playTone(440, 0.3, 0.25);
    setTimeout(() => this.playTone(440, 0.3, 0.25), 350);
    setTimeout(() => this.playTone(660, 0.5, 0.3), 700);
  }

  warning() {
    this.playTone(600, 0.1, 0.12);
  }

  finished() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.playTone(880 + i * 110, 0.15, 0.2), i * 200);
    }
  }
}

// ── Helpers ──
function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

const STATE_COLORS: Record<TimerState, { bg: string; text: string; ring: string; label: string }> = {
  idle: { bg: 'rgba(255,255,255,0.05)', text: '#FFFFFF', ring: 'rgba(255,255,255,0.15)', label: 'PRONTO' },
  round: { bg: 'rgba(34,197,94,0.08)', text: '#4ade80', ring: '#22c55e', label: 'ROUND' },
  rest: { bg: 'rgba(234,179,8,0.08)', text: '#facc15', ring: '#eab308', label: 'DESCANSO' },
  paused: { bg: 'rgba(255,255,255,0.03)', text: 'rgba(255,255,255,0.4)', ring: 'rgba(255,255,255,0.1)', label: 'PAUSADO' },
  finished: { bg: 'rgba(239,68,68,0.08)', text: '#f87171', ring: '#ef4444', label: 'FINALIZADO' },
};

// ── Component ──
export default function ProfessorCronometroPage() {
  // Config
  const [preset, setPreset] = useState<TimerPreset>(PRESETS[0]);
  const [roundSec, setRoundSec] = useState(PRESETS[0].roundSec);
  const [restSec, setRestSec] = useState(PRESETS[0].restSec);
  const [totalRounds, setTotalRounds] = useState(PRESETS[0].rounds);
  const [showConfig, setShowConfig] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Timer state
  const [state, setState] = useState<TimerState>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundSec);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const prevState = useRef<TimerState>('idle');

  // Init audio
  useEffect(() => {
    audioRef.current = new AudioEngine();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      releaseWakeLock();
    };
  }, []);

  // ── Wake Lock ──
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch { /* Wake lock not available */ }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  // ── Tick ──
  const tick = useCallback(() => {
    setTimeLeft((prev: number) => {
      if (prev <= 1) {
        // Time's up — transition
        if (state === 'round') {
          if (soundOn && audioRef.current) audioRef.current.roundEnd();
          if (currentRound >= totalRounds) {
            // All rounds done
            setState('finished');
            if (soundOn && audioRef.current) {
              setTimeout(() => audioRef.current?.finished(), 800);
            }
            releaseWakeLock();
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          // Start rest
          setState('rest');
          return restSec;
        } else if (state === 'rest') {
          // Start next round
          if (soundOn && audioRef.current) audioRef.current.roundStart();
          setCurrentRound((r: number) => r + 1);
          setState('round');
          return roundSec;
        }
        return 0;
      }

      // Warning beep at 10s
      if (prev === 11 && soundOn && audioRef.current) {
        audioRef.current.warning();
      }
      // Beep every second in last 3
      if (prev <= 4 && prev > 1 && soundOn && audioRef.current) {
        audioRef.current.warning();
      }

      return prev - 1;
    });
  }, [state, currentRound, totalRounds, roundSec, restSec, soundOn, releaseWakeLock]);

  // ── Interval management ──
  useEffect(() => {
    if (state === 'round' || state === 'rest') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, tick]);

  // ── Controls ──
  const handleStart = useCallback(() => {
    if (state === 'idle' || state === 'finished') {
      setCurrentRound(1);
      setTimeLeft(roundSec);
      setState('round');
      if (soundOn && audioRef.current) audioRef.current.roundStart();
      requestWakeLock();
    } else if (state === 'paused') {
      setState(prevState.current === 'idle' ? 'round' : prevState.current);
      requestWakeLock();
    }
  }, [state, roundSec, soundOn, requestWakeLock]);

  const handlePause = useCallback(() => {
    if (state === 'round' || state === 'rest') {
      prevState.current = state;
      setState('paused');
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [state]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState('idle');
    setCurrentRound(1);
    setTimeLeft(roundSec);
    releaseWakeLock();
  }, [roundSec, releaseWakeLock]);

  const handleSkip = useCallback(() => {
    if (state === 'round') {
      if (currentRound >= totalRounds) {
        setState('finished');
        setTimeLeft(0);
        if (soundOn && audioRef.current) audioRef.current.finished();
        releaseWakeLock();
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setState('rest');
        setTimeLeft(restSec);
        if (soundOn && audioRef.current) audioRef.current.roundEnd();
      }
    } else if (state === 'rest') {
      setCurrentRound((r: number) => r + 1);
      setState('round');
      setTimeLeft(roundSec);
      if (soundOn && audioRef.current) audioRef.current.roundStart();
    }
  }, [state, currentRound, totalRounds, roundSec, restSec, soundOn, releaseWakeLock]);

  const handleAdd30 = useCallback(() => {
    if (state === 'round' || state === 'rest') {
      setTimeLeft((prev: number) => prev + 30);
    }
  }, [state]);

  // ── Preset selection ──
  const handlePreset = useCallback((p: TimerPreset) => {
    setPreset(p);
    if (p.id !== 'custom') {
      setRoundSec(p.roundSec);
      setRestSec(p.restSec);
      setTotalRounds(p.rounds);
      setTimeLeft(p.roundSec);
    }
    handleReset();
  }, [handleReset]);

  // ── Fullscreen ──
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f: boolean) => !f);
  }, []);

  // ── Progress ──
  const maxTime = state === 'rest' ? restSec : roundSec;
  const progress = maxTime > 0 ? timeLeft / maxTime : 1;
  const stateStyle = STATE_COLORS[state as TimerState];

  // ── SVG circle ──
  const circleSize = isFullscreen ? 320 : 240;
  const strokeWidth = isFullscreen ? 8 : 6;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  // ── Render ──
  const timerContent = (
    <div className={`flex flex-col items-center ${isFullscreen ? 'justify-center min-h-screen gap-8 p-6' : 'gap-6'}`}>

      {/* State label */}
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-bold tracking-[0.3em] uppercase px-4 py-1.5 rounded-full"
          style={{ background: stateStyle.bg, color: stateStyle.text, border: `1px solid ${stateStyle.ring}30` }}
        >
          {stateStyle.label}
        </span>
        {state !== 'idle' && state !== 'finished' && (
          <span className="text-white/30 text-sm">
            Round {currentRound}/{totalRounds}
          </span>
        )}
      </div>

      {/* Circular timer */}
      <div className="relative" style={{ width: circleSize, height: circleSize }}>
        <svg width={circleSize} height={circleSize} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={circleSize / 2} cy={circleSize / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={circleSize / 2} cy={circleSize / 2} r={radius}
            fill="none"
            stroke={stateStyle.ring}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
            style={{ filter: `drop-shadow(0 0 8px ${stateStyle.ring}40)` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-bold tracking-wider"
            style={{
              fontSize: isFullscreen ? '72px' : '56px',
              color: stateStyle.text,
              textShadow: `0 0 30px ${stateStyle.ring}30`,
            }}
          >
            {formatTime(timeLeft)}
          </span>
          {state !== 'idle' && (
            <span className="text-white/25 text-xs mt-1">
              {state === 'rest' ? 'próximo round' : `de ${formatTime(maxTime)}`}
            </span>
          )}
        </div>
      </div>

      {/* Round dots */}
      {totalRounds <= 20 && (
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[300px]">
          {Array.from({ length: totalRounds }, (_, i) => {
            const roundNum = i + 1;
            const done = roundNum < currentRound || state === 'finished';
            const active = roundNum === currentRound && (state === 'round' || state === 'paused');
            return (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: done
                    ? '#22c55e'
                    : active
                    ? stateStyle.ring
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: active ? `0 0 8px ${stateStyle.ring}` : 'none',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Resetar"
        >
          <RotateCcw size={18} className="text-white/50" />
        </button>

        {/* Main play/pause */}
        <button
          onClick={state === 'round' || state === 'rest' ? handlePause : handleStart}
          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
          style={{
            background: state === 'round' || state === 'rest'
              ? 'rgba(255,255,255,0.1)'
              : 'linear-gradient(135deg, #D9AF69, #c9a05c)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {state === 'round' || state === 'rest' ? (
            <Pause size={28} className="text-white" />
          ) : (
            <Play size={28} className="text-black ml-0.5" />
          )}
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          disabled={state === 'idle' || state === 'finished'}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-20"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Pular"
        >
          <SkipForward size={18} className="text-white/50" />
        </button>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAdd30}
          disabled={state === 'idle' || state === 'finished'}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/70 disabled:opacity-20 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          +30s
        </button>

        <button
          onClick={() => setSoundOn((s: boolean) => !s)}
          className="px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {soundOn ? <Volume2 size={14} className="text-amber-400/70" /> : <VolumeX size={14} className="text-white/30" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {isFullscreen ? <Minimize2 size={14} className="text-white/40" /> : <Maximize2 size={14} className="text-white/40" />}
        </button>

        {!isFullscreen && (
          <button
            onClick={() => setShowConfig((c: boolean) => !c)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Settings size={14} className="text-white/40" />
          </button>
        )}
      </div>
    </div>
  );

  // ── Fullscreen wrapper ──
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: '#0a0908' }}
        onClick={(e: React.MouseEvent) => {
          if (e.target === e.currentTarget && (state === 'idle' || state === 'finished')) {
            setIsFullscreen(false);
          }
        }}
      >
        {timerContent}
      </div>
    );
  }

  // ── Normal page ──
  return (
    <div className="space-y-6 pt-6 pb-8">
      {/* Header */}
      <section className="prof-enter-1">
        <p className="text-amber-400/50 text-xs tracking-[0.25em] uppercase mb-2">Ferramenta</p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">Cronômetro</h1>
        <p className="text-white/55 text-sm mt-2">Timer de rounds para treino</p>
        <div className="prof-gold-line mt-6" />
      </section>

      {/* Presets */}
      <section className="prof-enter-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {PRESETS.map((p: TimerPreset) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p)}
              disabled={state === 'round' || state === 'rest'}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap disabled:opacity-40 ${
                preset.id === p.id
                  ? 'text-amber-300'
                  : 'text-white/40 hover:text-white/60'
              }`}
              style={{
                background: preset.id === p.id ? 'rgba(217,175,105,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${preset.id === p.id ? 'rgba(217,175,105,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Timer */}
      <section className="prof-enter-3 prof-glass-card py-8 px-4">
        {timerContent}
      </section>

      {/* Config panel */}
      {showConfig && state === 'idle' && (
        <section className="prof-enter-4 prof-glass-card p-6 space-y-5">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Configuração</h3>

          {/* Round duration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/50 text-sm">Duração do Round</span>
              <span className="text-white font-mono font-bold">{formatTime(roundSec)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { const v = clamp(roundSec - 30, 30, 600); setRoundSec(v); setTimeLeft(v); }}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Minus size={16} className="text-white/50" />
              </button>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${(roundSec / 600) * 100}%` }} />
              </div>
              <button
                onClick={() => { const v = clamp(roundSec + 30, 30, 600); setRoundSec(v); setTimeLeft(v); }}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Plus size={16} className="text-white/50" />
              </button>
            </div>
          </div>

          {/* Rest duration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/50 text-sm">Descanso</span>
              <span className="text-white font-mono font-bold">{formatTime(restSec)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRestSec(clamp(restSec - 15, 15, 300))}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Minus size={16} className="text-white/50" />
              </button>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full" style={{ width: `${(restSec / 300) * 100}%` }} />
              </div>
              <button
                onClick={() => setRestSec(clamp(restSec + 15, 15, 300))}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Plus size={16} className="text-white/50" />
              </button>
            </div>
          </div>

          {/* Number of rounds */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/50 text-sm">Rounds</span>
              <span className="text-white font-mono font-bold">{totalRounds}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTotalRounds(clamp(totalRounds - 1, 1, 20))}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Minus size={16} className="text-white/50" />
              </button>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: `${(totalRounds / 20) * 100}%` }} />
              </div>
              <button
                onClick={() => setTotalRounds(clamp(totalRounds + 1, 1, 20))}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Plus size={16} className="text-white/50" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-white/5">
            <p className="text-white/25 text-xs text-center">
              Tempo total: {formatTime((roundSec + restSec) * totalRounds - restSec)}
              {' · '}{totalRounds} rounds de {formatTime(roundSec)} + {formatTime(restSec)} descanso
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
