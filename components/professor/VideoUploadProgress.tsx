'use client';

import { Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { UploadPhase } from '@/hooks/useVideoUpload';

interface VideoUploadProgressProps {
  phase: UploadPhase;
  progress: number;
  error: string | null;
  onCancel?: () => void;
  onRetry?: () => void;
}

const PHASE_LABELS: Record<UploadPhase, string> = {
  idle: '',
  validating: 'Validando...',
  uploading: 'Enviando...',
  processing: 'Processando...',
  done: 'Concluído!',
  error: 'Erro no envio',
};

export function VideoUploadProgress({
  phase,
  progress,
  error,
  onCancel,
  onRetry,
}: VideoUploadProgressProps) {
  if (phase === 'idle') return null;

  const isDone = phase === 'done';
  const isError = phase === 'error';
  const isActive = phase === 'uploading' || phase === 'processing' || phase === 'validating';

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: isError
          ? 'rgba(239,68,68,0.06)'
          : isDone
            ? 'rgba(34,197,94,0.06)'
            : 'rgba(255,255,255,0.04)',
        border: `1px solid ${
          isError
            ? 'rgba(239,68,68,0.2)'
            : isDone
              ? 'rgba(34,197,94,0.2)'
              : 'rgba(255,255,255,0.08)'
        }`,
      }}
    >
      {/* Phase indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertCircle size={16} className="text-red-400" />
          ) : isDone ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : (
            <Loader2 size={16} className="text-amber-400 animate-spin" />
          )}
          <span
            className={`text-sm font-medium ${
              isError ? 'text-red-300' : isDone ? 'text-green-300' : 'text-white/70'
            }`}
          >
            {PHASE_LABELS[phase]}
          </span>
        </div>

        {isActive && (
          <span className="text-xs text-white/40 font-mono">{progress}%</span>
        )}
      </div>

      {/* Progress bar */}
      {(isActive || isDone) && (
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              isDone
                ? 'bg-gradient-to-r from-green-500 to-green-400'
                : 'bg-gradient-to-r from-amber-600 to-amber-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {isError && error && (
        <p className="text-xs text-red-300/70">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {isActive && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <XCircle size={12} />
            Cancelar
          </button>
        )}

        {isError && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
