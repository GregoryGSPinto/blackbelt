'use client';

// ============================================================
// QRGenerator — Gera QR code do aluno para check-in
//
// Canvas-based, zero dependências externas.
// Gera padrão visual baseado no hash dos dados (mock).
// Em produção: substituir drawQR() por lib qrcode real.
//
// Props: alunoId, nome, avatar, graduacao, unidadeId
// Features: auto-refresh 60s, fullscreen mode, anti-fraude hash
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, RefreshCw, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface QRGeneratorProps {
  alunoId: string;
  nome: string;
  avatar?: string;
  graduacao?: string;
  unidadeId?: string;
  size?: number;
  onClose?: () => void;
  fullscreen?: boolean;
}

const NIVEL_COLORS: Record<string, string> = {
  'Nível Iniciante': '#FFFFFF',
  'Nível Básico': '#3B82F6',
  'Nível Intermediário': '#8B5CF6',
  'Nível Avançado': '#92400E',
  'Nível Máximo': '#1F2937',
  'Nível Cinza': '#9CA3AF',
  'Nível Amarelo': '#EAB308',
  'Nível Laranja': '#F97316',
  'Nível Verde': '#22C55E',
};

function generateHash(alunoId: string, timestamp: number): string {
  const raw = `${alunoId}:${timestamp}:blackbelt-secret`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(8, '0');
}

/** Draw a QR-like pattern on canvas based on data hash */
function drawQRPattern(ctx: CanvasRenderingContext2D, data: string, size: number) {
  const modules = 25; // Grid size
  const cellSize = size / modules;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Generate deterministic pattern from data
  const bytes: number[] = [];
  for (let i = 0; i < data.length; i++) {
    bytes.push(data.charCodeAt(i));
  }

  // Create module grid from data hash
  const grid: boolean[][] = Array.from({ length: modules }, () =>
    Array(modules).fill(false)
  );

  // Seed PRNG with data
  let seed = 0;
  for (const b of bytes) seed = (seed * 31 + b) & 0x7FFFFFFF;
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
    return (seed >> 16) & 0x7FFF;
  };

  // Fill data area (avoiding finder patterns)
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      // Skip finder pattern areas
      if ((x < 8 && y < 8) || (x >= modules - 8 && y < 8) || (x < 8 && y >= modules - 8)) continue;
      // Skip alignment pattern
      if (x >= 10 && x <= 14 && y >= 10 && y <= 14) continue;
      // Data modules
      grid[y][x] = rng() % 3 < 1;
    }
  }

  // Draw finder patterns (standard QR)
  const drawFinder = (ox: number, oy: number) => {
    // Outer border (7×7)
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isEdge = x === 0 || x === 6 || y === 0 || y === 6;
        const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = isEdge || isInner;
      }
    }
  };

  drawFinder(0, 0);                    // Top-left
  drawFinder(modules - 7, 0);          // Top-right
  drawFinder(0, modules - 7);          // Bottom-left

  // Timing patterns
  for (let i = 8; i < modules - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Alignment pattern (center)
  for (let y = 10; y <= 14; y++) {
    for (let x = 10; x <= 14; x++) {
      const isEdge = x === 10 || x === 14 || y === 10 || y === 14;
      const isCenter = x === 12 && y === 12;
      grid[y][x] = isEdge || isCenter;
    }
  }

  // Draw modules
  ctx.fillStyle = '#1a1a2e'; // Dark color matching app theme
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (grid[y][x]) {
        // Rounded modules for premium look
        const cx = x * cellSize;
        const cy = y * cellSize;
        const r = cellSize * 0.15;
        const s = cellSize * 0.9;
        const o = cellSize * 0.05;
        ctx.beginPath();
        ctx.roundRect(cx + o, cy + o, s, s, r);
        ctx.fill();
      }
    }
  }
}

export function QRGenerator({
  alunoId,
  nome,
  avatar,
  graduacao = 'Nível Iniciante',
  unidadeId = 'unit_01',
  size = 220,
  onClose,
  fullscreen = false,
}: QRGeneratorProps) {
  const t = useTranslations('athlete.qrGenerator');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [countdown, setCountdown] = useState(60);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);

  const qrData = JSON.stringify({
    alunoId,
    nome,
    unidadeId,
    timestamp,
    hash: generateHash(alunoId, timestamp),
  });

  // Draw QR on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderSize = size * 2; // 2x for retina
    canvas.width = renderSize;
    canvas.height = renderSize;
    ctx.scale(2, 2);

    drawQRPattern(ctx, qrData, size);
  }, [qrData, size]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev <= 1) {
          setTimestamp(Date.now());
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(() => {
    setTimestamp(Date.now());
    setCountdown(60);
  }, []);

  const nivelColor = NIVEL_COLORS[graduacao] || '#FFFFFF';

  const content = (
    <div className={`flex flex-col items-center ${isFullscreen ? 'justify-center min-h-screen p-6' : ''}`}>
      {/* Header: Avatar + Info */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2"
          style={{ borderColor: nivelColor, backgroundColor: `${nivelColor}20` }}
        >
          {avatar || nome.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-white text-lg">{nome}</p>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: nivelColor }}
            />
            <span className="text-sm text-white/60">{graduacao}</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="relative p-4 bg-white rounded-2xl shadow-xl shadow-white/5">
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="block"
        />
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center border-2 border-white">
            <span className="text-white text-xs font-black">CJJ</span>
          </div>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 mt-3 text-white/40 text-xs">
        <Shield size={12} />
        <span>{t('secureCode')} • {t('expiresIn', { seconds: countdown })}</span>
      </div>

      {/* Countdown bar */}
      <div className="w-full max-w-[220px] h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 60) * 100}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-all"
        >
          <RefreshCw size={14} />
          {t('renew')}
        </button>
        <button
          onClick={() => isFullscreen && onClose ? onClose() : setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-all"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {isFullscreen ? t('exit') : t('fullscreen')}
        </button>
      </div>

      {/* Instruction */}
      <p className="text-white/30 text-xs mt-4 text-center max-w-[240px]">
        {t('presentCode')}
      </p>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0d0d1a] flex items-center justify-center animate-fade-in">
        {content}
      </div>
    );
  }

  return content;
}

export default QRGenerator;
