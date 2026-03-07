/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { useState, useCallback } from 'react';
import { generateInviteLinkAction, completeOnboardingStepAction } from '@/app/actions/onboarding';
import { UserPlus, ArrowLeft, Copy, Check, Link2 } from 'lucide-react';

interface StepInviteProps {
  academyId: string;
  onComplete: () => void;
  onBack: () => void;
  tokens: ReturnType<typeof import('@/lib/design-tokens').getDesignTokens>;
}

export default function StepInvite({ academyId, onComplete, onBack, tokens }: StepInviteProps) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const result = await generateInviteLinkAction(academyId);
      if (result.success) {
        const fullUrl = `${window.location.origin}${result.data.url}`;
        setInviteUrl(fullUrl);
      }
    } finally {
      setGenerating(false);
    }
  }, [academyId]);

  const handleCopy = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }, [inviteUrl]);

  const handleSkip = useCallback(async () => {
    await completeOnboardingStepAction(academyId, 'invite');
    onComplete();
  }, [academyId, onComplete]);

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
          style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
        >
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold" style={{ color: tokens.text }}>
          Invite your Team
        </h2>
        <p className="text-sm mt-1" style={{ color: tokens.textMuted }}>
          Share an invite link with coaches and students
        </p>
      </div>

      {!inviteUrl ? (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
        >
          <Link2 className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Invite Link'}
        </button>
      ) : (
        <div className="space-y-3">
          <div
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{ background: tokens.overlay }}
          >
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 bg-transparent text-sm truncate outline-none"
              style={{ color: tokens.text }}
            />
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-2 rounded-md transition-colors"
              style={{ color: copied ? tokens.success : tokens.textMuted }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs" style={{ color: tokens.textMuted }}>
            This link expires in 7 days. Share it with your coaches and students.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={inviteUrl ? onComplete : handleSkip}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
        >
          {inviteUrl ? 'Continue' : 'Skip for now'}
        </button>
      </div>
    </div>
  );
}
