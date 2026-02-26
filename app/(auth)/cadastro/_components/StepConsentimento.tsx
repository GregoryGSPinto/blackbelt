// ============================================================
// StepConsentimento — Consentimento do Responsável (13-17 anos)
// ============================================================
// Required for teens: collects guardian email and consent.
// Compliance: LGPD Art. 14 (tratamento de dados de menores)
// ============================================================
'use client';

import { Shield, Mail, UserCheck, CheckCircle } from 'lucide-react';
import type { DadosUsuario, StepBaseProps } from './types';

interface Props extends StepBaseProps {
  dados: DadosUsuario;
  setDados: React.Dispatch<React.SetStateAction<DadosUsuario>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function StepConsentimento({ dados, setDados, onSubmit, error, setError }: Props) {
  const isValid =
    dados.emailResponsavel &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.emailResponsavel) &&
    dados.nomeResponsavel &&
    dados.nomeResponsavel.trim().length >= 3 &&
    dados.consentimentoAceito;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Header */}
      <div className="text-center mb-2">
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <Shield size={24} className="text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Autorização do Responsável</h2>
        <p className="text-xs text-white/40 mt-1.5">
          Como você tem {dados.idade} anos, precisamos da autorização de um responsável legal
          para criar sua conta (LGPD Art. 14).
        </p>
      </div>

      {/* Guardian name */}
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">
          Nome do Responsável
        </label>
        <div className="relative">
          <UserCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={dados.nomeResponsavel || ''}
            onChange={e => { setDados(d => ({ ...d, nomeResponsavel: e.target.value })); setError(''); }}
            placeholder="Nome completo do pai, mãe ou responsável"
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm
                       placeholder:text-white/20 focus:border-blue-500/40 focus:outline-none transition-colors"
            aria-label="Nome do responsável legal"
            aria-required="true"
          />
        </div>
      </div>

      {/* Guardian email */}
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">
          Email do Responsável
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="email"
            value={dados.emailResponsavel || ''}
            onChange={e => { setDados(d => ({ ...d, emailResponsavel: e.target.value })); setError(''); }}
            placeholder="email@responsavel.com"
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm
                       placeholder:text-white/20 focus:border-blue-500/40 focus:outline-none transition-colors"
            aria-label="Email do responsável legal"
            aria-required="true"
          />
        </div>
        <p className="text-[10px] text-white/25 mt-1">
          O responsável receberá um email de confirmação.
        </p>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={dados.consentimentoAceito || false}
            onChange={e => { setDados(d => ({ ...d, consentimentoAceito: e.target.checked })); setError(''); }}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
              ${dados.consentimentoAceito
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white/5 border-white/15 group-hover:border-white/30'
              }`}
          >
            {dados.consentimentoAceito && <CheckCircle size={12} className="text-white" />}
          </div>
        </div>
        <span className="text-xs text-white/50 leading-relaxed">
          Declaro que sou responsável legal pelo menor <strong className="text-white/70">{dados.nome}</strong> e
          autorizo a criação de conta na plataforma BlackBelt, incluindo o tratamento de dados pessoais
          conforme a{' '}
          <a href="/politica-privacidade.html" target="_blank" className="text-blue-400 underline">
            Política de Privacidade
          </a>{' '}
          e{' '}
          <a href="/termos-de-uso.html" target="_blank" className="text-blue-400 underline">
            Termos de Uso
          </a>.
        </span>
      </label>

      {/* Info box */}
      <div
        className="p-3 rounded-xl text-xs text-white/40 leading-relaxed"
        style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}
      >
        <p className="font-medium text-blue-300/60 mb-1">O que acontece a seguir:</p>
        <ul className="space-y-0.5 text-white/30">
          <li>• Email de verificação será enviado ao responsável</li>
          <li>• A conta ficará vinculada ao responsável</li>
          <li>• O responsável poderá acompanhar pelo Painel Responsável</li>
        </ul>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs text-center" role="alert">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all
          ${isValid
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:from-blue-500 hover:to-blue-400'
            : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
      >
        Continuar
      </button>
    </form>
  );
}
