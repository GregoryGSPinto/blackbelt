'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  RotateCw, Share2, Wallet, ShieldCheck, ShieldAlert, ShieldX,
  QrCode, User as UserIcon, Calendar, Hash, Building2,
} from 'lucide-react';
import type { CarteirinhaDigital as CarteirinhaData, StatusCarteirinha } from '@/lib/api/contracts';

// ── Cores da nivel ────────────────────────────────────────

const NIVEL_GRADIENTS: Record<string, { from: string; to: string; text: string }> = {
  'Nível Iniciante':   { from: '#E5E7EB', to: '#D1D5DB', text: '#1F2937' },
  'Nível Cinza':    { from: '#9CA3AF', to: '#6B7280', text: '#FFFFFF' },
  'Nível Amarelo':  { from: '#F59E0B', to: '#D97706', text: '#1F2937' },
  'Nível Laranja':  { from: '#F97316', to: '#EA580C', text: '#FFFFFF' },
  'Nível Verde':    { from: '#22C55E', to: '#16A34A', text: '#FFFFFF' },
  'Nível Básico':     { from: '#3B82F6', to: '#2563EB', text: '#FFFFFF' },
  'Nível Intermediário':     { from: '#8B5CF6', to: '#7C3AED', text: '#FFFFFF' },
  'Nível Avançado':   { from: '#92400E', to: '#78350F', text: '#FFFFFF' },
  'Nível Máximo':    { from: '#374151', to: '#111827', text: '#FFFFFF' },
  'Nível Máximo 1º Subnível': { from: '#374151', to: '#111827', text: '#FFFFFF' },
  'Nível Máximo 2º Subnível': { from: '#374151', to: '#111827', text: '#FFFFFF' },
  'Nível Máximo 3º Subnível': { from: '#374151', to: '#111827', text: '#FFFFFF' },
};

function getNivelColors(nivel: string) {
  return NIVEL_GRADIENTS[nivel] || NIVEL_GRADIENTS['Nível Iniciante'];
}

// ── Status badge ──────────────────────────────────────────

const STATUS_CONFIG: Record<StatusCarteirinha, { label: string; color: string; bg: string; Icon: typeof ShieldCheck }> = {
  ATIVA:     { label: 'ATIVA', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', Icon: ShieldCheck },
  VENCIDA:   { label: 'VENCIDA', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/25', Icon: ShieldAlert },
  BLOQUEADA: { label: 'BLOQUEADA', color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/25', Icon: ShieldX },
};

// ── QR Code simples (canvas-based, padrão visual) ─────────

function MiniQRCode({ data, size = 100 }: { data: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 4;
    const grid = Math.floor(size / cellSize);
    canvas.width = size;
    canvas.height = size;

    // Gera padrão determinístico baseado no hash do data
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';

    // Finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 ||
              (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            ctx.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize);
          }
        }
      }
    };
    drawFinder(1, 1);
    drawFinder(grid - 8, 1);
    drawFinder(1, grid - 8);

    // Padrão pseudo-aleatório no centro
    const seed = Math.abs(hash);
    for (let i = 9; i < grid - 9; i++) {
      for (let j = 9; j < grid - 9; j++) {
        const val = ((seed * (i + 1) * (j + 1)) % 97);
        if (val < 45) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < grid - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg"
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
    />
  );
}

// ── Código de barras simples ──────────────────────────────

function Barcode({ code, width = 180, height = 40 }: { code: string; width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#000000';
    let x = 10;
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const barWidth = 1 + (charCode % 3);
      ctx.fillRect(x, 4, barWidth, height - 8);
      x += barWidth + 1;
      // Gap
      x += 1 + (charCode % 2);
      if (x >= width - 10) break;
    }
  }, [code, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded"
      style={{ width, height, imageRendering: 'pixelated' }}
    />
  );
}

// ── Componente Principal ──────────────────────────────────

interface CarteirinhaDigitalProps {
  carteirinha: CarteirinhaData;
  onShare?: () => void;
}

export default function CarteirinhaDigital({ carteirinha, onShare }: CarteirinhaDigitalProps) {
  const [flipped, setFlipped] = useState(false);
  const nivelColors = getNivelColors(carteirinha.nivel);
  const status = STATUS_CONFIG[carteirinha.status];
  const StatusIcon = status.Icon;

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return d; }
  };

  const handleShare = useCallback(async () => {
    if (onShare) {
      onShare();
      return;
    }
    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Carteirinha - ${carteirinha.nome}`,
          text: `${carteirinha.nome} | ${carteirinha.nivel} | ${carteirinha.unidade}`,
          url: `https://blackbelt.com.br/atleta/${carteirinha.alunoId}`,
        });
      } catch { /* user cancelled */ }
    }
  }, [carteirinha, onShare]);

  return (
    <div className="space-y-4">
      {/* Card container com perspective */}
      <div
        className="relative w-full max-w-sm mx-auto"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-full transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            aspectRatio: '1.586', // proporção cartão de crédito
          }}
        >
          {/* ════ FRENTE ════ */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Background gradient baseado na nivel */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${nivelColors.from}22, ${nivelColors.to}11, rgba(0,0,0,0.85))`,
              }}
            />
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
            {/* Accent line top */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${nivelColors.from}, ${nivelColors.to})` }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col p-5">
              {/* Header row: logo + status */}
              <div className="flex items-center justify-between mb-auto">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-base">🦁</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/90 tracking-wider">{carteirinha.unidade}</p>
                    {carteirinha.unidadeNome && (
                      <p className="text-[9px] text-white/40">{carteirinha.unidadeNome}</p>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${status.bg}`}>
                  <StatusIcon size={10} className={status.color} />
                  <span className={status.color}>{status.label}</span>
                </div>
              </div>

              {/* Middle: Avatar + Info + QR */}
              <div className="flex items-end gap-4 mt-auto">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0 border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${nivelColors.from}40, ${nivelColors.to}20)`,
                    color: nivelColors.text,
                  }}
                >
                  {carteirinha.avatar || carteirinha.nome.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white truncate">{carteirinha.nome}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: nivelColors.from }}
                    />
                    <span className="text-xs text-white/60">{carteirinha.nivel}</span>
                  </div>
                  {carteirinha.turma && (
                    <p className="text-[10px] text-white/35 mt-0.5">{carteirinha.turma}</p>
                  )}
                </div>

                {/* QR Code mini */}
                <div className="shrink-0 p-1.5 bg-white rounded-lg">
                  <MiniQRCode data={carteirinha.codigoQR} size={56} />
                </div>
              </div>
            </div>
          </div>

          {/* ════ VERSO ════ */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
            {/* Accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${nivelColors.from}, ${nivelColors.to})` }}
            />

            {/* Tarja magnética */}
            <div className="absolute top-6 left-0 right-0 h-10 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700" />

            {/* Content */}
            <div className="relative h-full flex flex-col p-5 pt-20">
              {/* Data fields */}
              <div className="grid grid-cols-2 gap-3 mb-auto">
                <InfoField
                  icon={Calendar}
                  label="Data de Início"
                  value={formatDate(carteirinha.dataInicio)}
                />
                <InfoField
                  icon={Calendar}
                  label="Validade"
                  value={formatDate(carteirinha.dataValidade)}
                />
                <InfoField
                  icon={Hash}
                  label="Matrícula"
                  value={carteirinha.matricula}
                />
                <InfoField
                  icon={Building2}
                  label="Instrutor"
                  value={carteirinha.professor || '—'}
                />
              </div>

              {/* Barcode */}
              <div className="mt-auto flex flex-col items-center gap-1">
                <Barcode code={carteirinha.codigoBarras} width={200} height={36} />
                <p className="text-[9px] text-white/25 tracking-widest font-mono">
                  {carteirinha.codigoBarras}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 max-w-sm mx-auto">
        <button
          onClick={() => setFlipped(f => !f)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-medium hover:bg-white/[0.1] transition-colors active:scale-[0.98]"
        >
          <RotateCw size={16} />
          {flipped ? 'Ver frente' : 'Virar'}
        </button>

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-medium hover:bg-white/[0.1] transition-colors active:scale-[0.98]"
        >
          <Share2 size={16} />
          Compartilhar
        </button>

        <button
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 text-sm font-medium cursor-not-allowed"
          title="Apple Wallet (requer backend)"
          disabled
        >
          <Wallet size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className="text-white/25" />
        <span className="text-[9px] text-white/25 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-semibold text-white/70">{value}</p>
    </div>
  );
}
