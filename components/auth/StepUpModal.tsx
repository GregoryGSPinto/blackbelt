// ============================================================
// StepUpModal — Step-up auth for critical actions
// ============================================================
'use client';

import { useCallback } from 'react';
import { MFAVerifyModal } from './MFAVerifyModal';
import { useTranslations } from 'next-intl';

interface StepUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorized: (stepUpToken: string) => void;
  actionDescription?: string;
}

export function StepUpModal({
  isOpen, onClose, onAuthorized,
  actionDescription,
}: StepUpModalProps) {
  const t = useTranslations('auth');

  const handleVerified = useCallback((code: string) => {
    // Mock: generate a step-up token
    const token = `step-up-${Date.now()}-${code}`;
    onAuthorized(token);
    onClose();
  }, [onAuthorized, onClose]);

  return (
    <MFAVerifyModal
      isOpen={isOpen}
      onClose={onClose}
      onVerified={handleVerified}
      title={t('stepUp.confirmIdentity')}
      subtitle={actionDescription ?? t('stepUp.actionRequiresConfirmation')}
    />
  );
}
