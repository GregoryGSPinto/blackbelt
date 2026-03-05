// ============================================================
// MFASetupModal — QR code setup flow for enabling MFA
// ============================================================
'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useTranslations } from 'next-intl';

interface MFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  qrCodeDataURL?: string;
  backupCodes?: string[];
}

// Mock QR code (SVG placeholder)
const MOCK_QR = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="white" width="200" height="200"/><text x="100" y="100" text-anchor="middle" font-size="14" fill="black">QR Code MFA</text><text x="100" y="120" text-anchor="middle" font-size="10" fill="gray">(mock)</text></svg>')}`;
const MOCK_BACKUP = ['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4', 'Y5Z6-A7B8', 'C9D0-E1F2'];

export function MFASetupModal({
  isOpen, onClose, onComplete,
  qrCodeDataURL = MOCK_QR,
  backupCodes = MOCK_BACKUP,
}: MFASetupModalProps) {
  const toast = useToast();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVerify = useCallback(() => {
    if (code.length !== 6) { toast.warning(t('mfa.enterCode')); return; }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStep('backup');
      toast.success(t('mfa.verifyActivate'));
    }, 1000);
  }, [code, toast, t]);

  const handleCopyBackup = useCallback(() => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    toast.info(tCommon('actions.copied'));
    setTimeout(() => setCopied(false), 2000);
  }, [backupCodes, toast, tCommon]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[calc(100%-2rem)] sm:max-w-sm mx-4 rounded-2xl overflow-hidden p-6"
        style={{ background: 'rgba(20,18,14,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
        role="dialog" aria-modal="true" aria-label={t('mfa.setupTitle')}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10" aria-label={tCommon('actions.close')}>
          <X size={16} className="text-white/50" />
        </button>

        <div className="text-center mb-5">
          <Shield size={24} className="mx-auto mb-2 text-green-400" />
          <h2 className="text-lg font-bold text-white">{t('mfa.setupTitle')}</h2>
        </div>

        {step === 'qr' && (
          <div className="space-y-4">
            <p className="text-xs text-white/40 text-center">
              {t('mfa.scanQR')}
            </p>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeDataURL} alt="QR Code MFA" className="w-48 h-48 rounded-xl bg-white p-2" />
            </div>
            <button onClick={() => setStep('verify')}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-green-600 hover:bg-green-500 text-white transition-all">
              {t('mfa.scannedNext')}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <p className="text-xs text-white/40 text-center">{t('mfa.enterCode')}</p>
            <input
              type="text" inputMode="numeric" maxLength={6}
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-center text-xl tracking-[0.5em] font-mono
                         focus:outline-none focus:border-green-400/50 transition-colors"
              placeholder="000000" aria-label={t('mfa.enterCode')}
            />
            <button onClick={handleVerify} disabled={verifying || code.length !== 6}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-green-600 hover:bg-green-500 text-white disabled:opacity-40 transition-all">
              {verifying ? <Loader2 size={16} className="animate-spin mx-auto" /> : t('mfa.verifyActivate')}
            </button>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <p className="text-xs text-white/40 text-center">
              {t('mfa.saveBackupCodes')}
            </p>
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
              {backupCodes.map((bc, i) => (
                <span key={i} className="text-xs font-mono text-white/60 text-center py-1">{bc}</span>
              ))}
            </div>
            <button onClick={handleCopyBackup}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm bg-white/5 hover:bg-white/10 text-white/60 transition-colors">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? tCommon('actions.copied') : t('mfa.copyCodes')}
            </button>
            <button onClick={() => { onComplete(); onClose(); }}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-green-600 hover:bg-green-500 text-white transition-all">
              {t('mfa.finishSetup')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
