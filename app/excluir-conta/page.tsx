'use client';

// ============================================================
// /excluir-conta — Página pública de exclusão de conta
// Google Play exige URL web acessível para exclusão.
// ============================================================

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

type FormState = 'form' | 'loading' | 'success' | 'error';

export default function ExcluirContaPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [state, setState] = useState<FormState>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit() {
    if (!isValidEmail) return;
    setState('loading');
    try {
      const { createRequest } = await import('@/lib/persistence/lgpd');
      await createRequest('delete', email, reason || '');
      setState('success');
    } catch {
      setErrorMsg('Não foi possível processar. Tente novamente ou envie e-mail para dpo@blackbelt.com.br.');
      setState('error');
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield size={28} className="text-blue-400" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black">BlackBelt</h1>
          <p className="text-white/50 text-sm mt-1">Solicitação de Exclusão de Conta</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">

          {/* ── Form ── */}
          {(state === 'form' || state === 'error') && (
            <div className="p-6 space-y-5">
              <div className="p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-300 font-bold mb-1">Antes de continuar</p>
                    <p className="text-white/50">
                      Você também pode excluir sua conta diretamente pelo app:
                      <span className="text-white/70"> Configurações → Minha Conta → Excluir Conta</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-2">
                  E-mail cadastrado <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-2">
                  Motivo <span className="text-white/30">(opcional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Conte-nos por que deseja excluir sua conta..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-blue-500/50"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="text-xs text-white/40 space-y-1">
                <p>Ao solicitar a exclusão:</p>
                <p>• Sua conta será desativada imediatamente</p>
                <p>• Você terá 30 dias para cancelar a solicitação</p>
                <p>• Após 30 dias, todos os dados serão anonimizados irreversivelmente</p>
                <p>• Um e-mail de confirmação será enviado</p>
              </div>

              {state === 'error' && (
                <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                  <p className="text-sm text-red-300">{errorMsg}</p>
                </div>
              )}

              <button
                onClick={() => setShowConfirm(true)}
                disabled={!isValidEmail}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Solicitar Exclusão
              </button>

              <ConfirmModal
                open={showConfirm}
                title="Excluir minha conta"
                message="Esta ação é irreversível. Todos os seus dados, histórico de treinos e conquistas serão permanentemente excluídos."
                confirmLabel="Sim, excluir minha conta"
                cancelLabel="Cancelar"
                variant="danger"
                requireTyping="EXCLUIR"
                loading={false}
                onConfirm={() => { setShowConfirm(false); handleSubmit(); }}
                onCancel={() => setShowConfirm(false)}
              />
            </div>
          )}

          {/* ── Loading ── */}
          {state === 'loading' && (
            <div className="p-12 text-center">
              <Loader2 size={32} className="mx-auto text-red-400 animate-spin mb-4" />
              <p className="text-white/60 text-sm">Processando solicitação...</p>
            </div>
          )}

          {/* ── Success ── */}
          {state === 'success' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-600/20 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Solicitação recebida</h2>
              <div className="text-sm text-white/60 space-y-2">
                <p>Enviamos um e-mail de confirmação para <span className="text-white font-bold">{email}</span>.</p>
                <p>Sua conta será desativada e você terá <span className="text-white font-bold">30 dias</span> para cancelar.</p>
                <p>Após esse período, os dados serão anonimizados conforme a LGPD.</p>
              </div>
              <p className="text-xs text-white/30 pt-4">
                Dúvidas? Entre em contato: dpo@blackbelt.com.br
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <a
            href="/politica-privacidade.html"
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Política de Privacidade
          </a>
          <span className="text-white/20 mx-2">•</span>
          <a
            href="/termos-de-uso.html"
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Termos de Uso
          </a>
        </div>
      </div>
    </div>
  );
}
