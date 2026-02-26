// ============================================================
// MinhaContaSection — Status de Membro e Plano + Exclusão de Conta
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Shield, CheckCircle, AlertCircle, AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { MemberStatus, MemberStatusType } from './configuracoes.types';
import { MOCK_MEMBER_STATUS } from './configuracoes.types';

function StatusBadge({ status }: { status: MemberStatusType }) {
  const variants: Record<MemberStatusType, { bg: string; border: string; text: string; label: string }> = {
    ativa:     { bg: 'bg-green-600/20',  border: 'border-green-600/30',  text: 'text-green-400',  label: 'ATIVA' },
    atencao:   { bg: 'bg-yellow-600/20', border: 'border-yellow-600/30', text: 'text-yellow-400', label: 'ATENÇÃO' },
    bloqueada: { bg: 'bg-red-600/20',    border: 'border-red-600/30',    text: 'text-red-400',    label: 'BLOQUEADA' },
  };

  const v = variants[status];
  return (
    <span className={`px-3 py-1 ${v.bg} border ${v.border} ${v.text} rounded-full text-xs font-bold`}>
      {v.label}
    </span>
  );
}

const PLAN_BENEFITS = [
  'Acesso ilimitado a todas as sessões',
  'Streaming em 4K',
  'Até 4 perfis simultâneos',
  'Downloads offline',
];

function PlanCard({ member }: { member: MemberStatus }) {
  return (
    <div className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-600/30 rounded-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black mb-2">{member.planType}</h3>
          <p className="text-white/55">Membro desde {member.activeSince}</p>
        </div>
        <StatusBadge status={member.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-white/40 mb-1">Status da Conta</p>
          <p className="text-xl font-bold">
            {member.status === 'ativa' && '✅ Conta Ativa'}
            {member.status === 'atencao' && '⚠️ Requer Atenção'}
            {member.status === 'bloqueada' && '🔒 Bloqueada'}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-white/40 mb-1">Próxima Renovação</p>
          <p className="text-xl font-bold">{member.nextRenewal}</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="font-bold mb-3">Benefícios do seu plano:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLAN_BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MinhaContaSection() {
  const member = MOCK_MEMBER_STATUS;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Shield}
        iconClassName="text-blue-400"
        title="Minha Conta"
        subtitle="Informações sobre seu plano e status"
      />

      <PlanCard member={member} />

      {member.status === 'ativa' ? (
        <div className="p-4 bg-green-600/10 border border-green-600/30 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-400 mb-1">Tudo certo com sua conta!</p>
              <p className="text-sm text-white/55">
                Sua assinatura está ativa e você pode treinar normalmente.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-yellow-400 mb-1">Atenção necessária</p>
              <p className="text-sm text-white/55">
                Entre em contato com a recepção para regularizar sua conta.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Danger Zone ── */}
      <div className="mt-8 pt-6 border-t border-red-500/20">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={20} className="text-red-400" />
          <h3 className="text-lg font-bold text-red-400">Excluir minha conta</h3>
        </div>
        <p className="text-sm text-white/50 mb-4">
          Esta ação é irreversível. Todos os seus dados pessoais serão anonimizados
          após o período de carência de 30 dias. Você perderá acesso a sessões,
          progresso, conquistas e histórico.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all duration-200"
        >
          <Trash2 size={16} />
          Excluir Conta
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}

// ============================================================
// Delete Account Modal — 3 etapas (Apple 5.1.1v + Google Play)
// ============================================================

const DELETE_REASONS = [
  'Não uso mais o aplicativo',
  'Mudei de unidade',
  'Preocupação com privacidade',
  'Experiência insatisfatória',
  'Outro',
] as const;

const LOSS_ITEMS = [
  'Acesso a todas as sessões e séries',
  'Seu progresso e graduação',
  'Conquistas e conquistas',
  'Histórico de treinos e check-ins',
  'Dados dos perfis vinculados (kids/teen)',
];

type DeleteStep = 'confirm' | 'reason' | 'final';

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<DeleteStep>('confirm');
  const [reason, setReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading && !done) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loading, done, onClose]);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // In production: calls createRequest('EXCLUSION', user.id, reason + reasonDetail)
      // For now: simulate API call
      const { createRequest } = await import('@/lib/persistence/lgpd');
      await createRequest(
        'EXCLUSION',
        'current-user-id', // TODO(BE): replace with real user.id from useAuth()
        `${reason}${reasonDetail ? ': ' + reasonDetail : ''}`
      );
      setDone(true);
      // In production: setTimeout(() => { logout(); router.push('/login'); }, 3000)
    } catch (err) {
      setError('Não foi possível processar a exclusão. Tente novamente ou entre em contato com o DPO.');
      setLoading(false);
    }
  }, [reason, reasonDetail]);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && !loading && !done) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto sm:max-h-none">

        {/* Header */}
        {!done && (
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Excluir Conta</h3>
                <p className="text-xs text-white/40">
                  {step === 'confirm' && 'Etapa 1 de 3 — Confirmação'}
                  {step === 'reason' && 'Etapa 2 de 3 — Motivo'}
                  {step === 'final' && 'Etapa 3 de 3 — Confirmação Final'}
                </p>
              </div>
            </div>
            {!loading && (
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={18} className="text-white/50" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-5">

          {/* ── Step 1: Confirm ── */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-white/70 text-sm">
                Tem certeza que deseja excluir sua conta? Você perderá acesso permanente a:
              </p>
              <div className="space-y-2">
                {LOSS_ITEMS.map((item) => (
                  <div key={item} className="flex items-center gap-2 p-2.5 bg-red-600/10 border border-red-600/20 rounded-lg">
                    <X size={14} className="text-red-400 flex-shrink-0" />
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-lg transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep('reason')}
                  className="flex-1 py-2.5 bg-red-600/80 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all duration-200"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Reason ── */}
          {step === 'reason' && (
            <div className="space-y-4">
              <p className="text-white/70 text-sm">
                Poderia nos dizer o motivo? <span className="text-white/40">(opcional)</span>
              </p>
              <div className="space-y-2">
                {DELETE_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 border ${
                      reason === r
                        ? 'bg-red-600/20 border-red-600/40 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {reason === 'Outro' && (
                <textarea
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="Conte-nos mais... (opcional)"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-white/20"
                  rows={3}
                  maxLength={500}
                />
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-lg transition-all duration-200"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep('final')}
                  className="flex-1 py-2.5 bg-red-600/80 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all duration-200"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Final Confirmation ── */}
          {step === 'final' && !done && (
            <div className="space-y-4">
              <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
                <p className="text-sm text-red-300 font-bold mb-2">
                  Esta ação é irreversível após 30 dias.
                </p>
                <p className="text-xs text-white/50">
                  Sua conta será desativada imediatamente. Você terá 30 dias para cancelar
                  a exclusão. Após esse período, todos os dados serão anonimizados
                  irreversivelmente conforme a LGPD.
                </p>
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-2">
                  Digite <span className="font-bold text-red-400">EXCLUIR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="EXCLUIR"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              {error && (
                <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setStep('reason'); setError(''); }}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={confirmText !== 'EXCLUIR' || loading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Excluir definitivamente'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Done ── */}
          {done && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 flex items-center justify-center">
                <CheckCircle size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Solicitação recebida</h3>
              <div className="text-sm text-white/60 space-y-2">
                <p>Sua conta será desativada agora.</p>
                <p>Você tem <span className="text-white font-bold">30 dias</span> para cancelar a exclusão.</p>
                <p>Após 30 dias, todos os dados serão anonimizados irreversivelmente.</p>
                <p className="text-white/40 pt-2">Um e-mail de confirmação foi enviado.</p>
              </div>
              <p className="text-xs text-white/30 pt-4">Redirecionando para login...</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!done && (
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: step === 'confirm' ? '33%' : step === 'reason' ? '66%' : '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modal, document.body) : null;
}
