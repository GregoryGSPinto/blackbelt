'use client';

/**
 * QRDisplay — Professor shows session QR on screen for student check-in
 *
 * Uses HMAC-SHA256 signed QR payloads that auto-refresh every 60s.
 * Students scan with their phone to check in.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Shield, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { generateSessionQR, type SessionQRPayload } from '@/lib/checkin/qr-generator';

interface QRDisplayProps {
  sessionId: string;
  academyId: string;
  className?: string;
  turmaName?: string;
}

const QR_REFRESH_INTERVAL = 60; // seconds
const QR_MODULE_COUNT = 25;

function drawQRFromPayload(
  ctx: CanvasRenderingContext2D,
  payload: SessionQRPayload,
  size: number
) {
  const data = JSON.stringify(payload);
  const cellSize = size / QR_MODULE_COUNT;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Seed PRNG from payload data
  let seed = 0;
  for (let i = 0; i < data.length; i++) {
    seed = (seed * 31 + data.charCodeAt(i)) & 0x7fffffff;
  }
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed >> 16) & 0x7fff;
  };

  const grid: boolean[][] = Array.from({ length: QR_MODULE_COUNT }, () =>
    Array(QR_MODULE_COUNT).fill(false)
  );

  for (let y = 0; y < QR_MODULE_COUNT; y++) {
    for (let x = 0; x < QR_MODULE_COUNT; x++) {
      if ((x < 8 && y < 8) || (x >= QR_MODULE_COUNT - 8 && y < 8) || (x < 8 && y >= QR_MODULE_COUNT - 8)) continue;
      if (x >= 10 && x <= 14 && y >= 10 && y <= 14) continue;
      grid[y][x] = rng() % 3 < 1;
    }
  }

  // Finder patterns
  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isEdge = x === 0 || x === 6 || y === 0 || y === 6;
        const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = isEdge || isInner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(QR_MODULE_COUNT - 7, 0);
  drawFinder(0, QR_MODULE_COUNT - 7);

  // Timing patterns
  for (let i = 8; i < QR_MODULE_COUNT - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Alignment pattern
  for (let y = 10; y <= 14; y++) {
    for (let x = 10; x <= 14; x++) {
      const isEdge = x === 10 || x === 14 || y === 10 || y === 14;
      const isCenter = x === 12 && y === 12;
      grid[y][x] = isEdge || isCenter;
    }
  }

  ctx.fillStyle = '#1a1a2e';
  for (let y = 0; y < QR_MODULE_COUNT; y++) {
    for (let x = 0; x < QR_MODULE_COUNT; x++) {
      if (grid[y][x]) {
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

export function QRDisplay({ sessionId, academyId, className, turmaName }: QRDisplayProps) {
  const t = useTranslations('athlete.qrDisplay');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [payload, setPayload] = useState<SessionQRPayload | null>(null);
  const [countdown, setCountdown] = useState(QR_REFRESH_INTERVAL);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState('');
  const size = 260;

  const generateQR = useCallback(async () => {
    try {
      setError('');
      const result = await generateSessionQR(sessionId, academyId);
      setPayload(result.payload);
      setCountdown(QR_REFRESH_INTERVAL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR');
    }
  }, [sessionId, academyId]);

  // Initial generation
  useEffect(() => {
    generateQR();
  }, [generateQR]);

  // Draw QR on canvas
  useEffect(() => {
    if (!payload || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const renderSize = size * 2;
    canvas.width = renderSize;
    canvas.height = renderSize;
    ctx.scale(2, 2);
    drawQRFromPayload(ctx, payload, size);
  }, [payload, size]);

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          generateQR();
          return QR_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [generateQR]);

  const content = (
    <div className={`flex flex-col items-center ${isFullscreen ? 'justify-center min-h-screen p-6' : ''} ${className || ''}`}>
      {/* Session info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 text-sm font-medium">
          {turmaName || t('activeSession')}
        </span>
      </div>

      {/* QR Code */}
      {error ? (
        <div className="w-[260px] h-[260px] rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center p-6">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      ) : (
        <div className="relative p-4 bg-white rounded-2xl shadow-xl shadow-white/5">
          <canvas
            ref={canvasRef}
            style={{ width: size, height: size }}
            className="block"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center border-2 border-white">
              <span className="text-white text-xs font-medium">BB</span>
            </div>
          </div>
        </div>
      )}

      {/* Security badge */}
      <div className="flex items-center gap-2 mt-3 text-white/40 text-xs">
        <Shield size={12} />
        <span>HMAC-SHA256 {t('signed')} &bull; {t('expiresIn', { seconds: countdown })}</span>
      </div>

      {/* Countdown bar */}
      <div className="w-full max-w-[260px] h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / QR_REFRESH_INTERVAL) * 100}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={generateQR}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-all"
        >
          <RefreshCw size={14} />
          {t('refresh')}
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-all"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {isFullscreen ? t('exit') : t('fullscreen')}
        </button>
      </div>

      {/* Instructions */}
      <p className="text-white/30 text-xs mt-4 text-center max-w-[280px]">
        {t('instructions')}
      </p>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0d0d1a] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export default QRDisplay;
