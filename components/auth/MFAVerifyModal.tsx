// ============================================================
// MFAVerifyModal — 6-digit code input for MFA verification
// ============================================================
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Loader2, Key } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface MFAVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (code: string) => void;
  title?: string;
  subtitle?: string;
}

export function MFAVerifyModal({
  isOpen, onClose, onVerified,
  title = 'Verificação de Segurança',
  subtitle = 'Digite o código do seu app autenticador',
}: MFAVerifyModalProps) {
  const toast = useToast();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setVerifying(false);
      setUseBackup(false);
      setBackupCode('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleDigit = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(d => d.length === 1)) {
      const code = next.join('');
      setVerifying(true);
      setTimeout(() => {
        onVerified(code);
        setVerifying(false);
      }, 800);
    }
  }, [digits, onVerified]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handleBackupSubmit = useCallback(() => {
    if (backupCode.length < 6) { toast.warning('Código de backup inválido'); return; }
    setVerifying(true);
    setTimeout(() => {
      onVerified(backupCode);
      setVerifying(false);
    }, 800);
  }, [backupCode, onVerified, toast]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden p-6"
        style={{ background: 'rgba(20,18,14,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
        role="dialog" aria-modal="true" aria-label={title}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10" aria-label="Fechar">
          <X size={16} className="text-white/50" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/15 flex items-center justify-center mb-4">
            <Shield size={24} className="text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs text-white/40 mt-1">{subtitle}</p>
        </div>

        {!useBackup ? (
          <>
            <div className="flex gap-2 justify-center mb-6">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={verifying}
                  className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/15 text-white
                             focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition-all
                             disabled:opacity-40"
                  aria-label={`Dígito ${i + 1}`}
                />
              ))}
            </div>
            {verifying && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Loader2 size={16} className="animate-spin text-blue-400" />
                <span className="text-xs text-blue-400">Verificando...</span>
              </div>
            )}
            <button
              onClick={() => setUseBackup(true)}
              className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors py-2"
            >
              <Key size={12} className="inline mr-1" /> Usar código de backup
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={backupCode}
              onChange={e => setBackupCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white/90 text-sm text-center
                         focus:outline-none focus:border-blue-400/50 transition-colors mb-4"
              aria-label="Código de backup"
            />
            <button
              onClick={handleBackupSubmit}
              disabled={verifying}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-all mb-3"
            >
              {verifying ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Verificar Código de Backup'}
            </button>
            <button onClick={() => setUseBackup(false)} className="w-full text-xs text-white/30 hover:text-white/50 py-2">
              Voltar ao código TOTP
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
