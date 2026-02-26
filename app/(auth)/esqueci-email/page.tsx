'use client';

// ============================================================
// Esqueci Email — Padronizado com design system BlackBelt
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MessageCircle } from 'lucide-react';
import CinematicBackground from '@/components/ui/CinematicBackground';
import { ACADEMY_CONTACT } from '@/lib/academy/contactInfo';

export default function EsqueciEmailPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <CinematicBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-slide-up">
          {/* Voltar */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Voltar para login</span>
          </Link>

          {/* Container */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                Esqueci meu Email
              </h1>
              <p className="text-white/60 text-base leading-relaxed">
                Escolha uma das opções abaixo para recuperar o email vinculado à sua conta.
              </p>
            </div>

            {/* Opções */}
            <div className="space-y-4 mb-8">
              {/* Telefone */}
              <button
                onClick={() => setSelectedOption(selectedOption === 'phone' ? null : 'phone')}
                className={`w-full p-5 rounded-xl border transition-all duration-300 text-left ${
                  selectedOption === 'phone'
                    ? 'bg-white/10 border-white/25 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">
                      Recuperar via telefone
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Enviaremos um SMS com seu email cadastrado.
                    </p>
                    {selectedOption === 'phone' && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-400 font-medium">⚠️ Em desenvolvimento</p>
                        <p className="text-xs text-blue-400/70 mt-1">
                          Entre em contato com o suporte para recuperação.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Suporte */}
              <button
                onClick={() => setSelectedOption(selectedOption === 'support' ? null : 'support')}
                className={`w-full p-5 rounded-xl border transition-all duration-300 text-left ${
                  selectedOption === 'support'
                    ? 'bg-white/10 border-white/25 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle size={20} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">
                      Falar com o suporte
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Nossa equipe ajudará você a recuperar seu email.
                    </p>
                    {selectedOption === 'support' && (
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-sm text-emerald-400 font-semibold mb-3">Canais de Atendimento:</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-emerald-400" />
                            <span className="text-white/70">
                              Email: <span className="text-white font-medium">{ACADEMY_CONTACT.email}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle size={14} className="text-emerald-400" />
                            <span className="text-white/70">
                              WhatsApp: <span className="text-white font-medium">{ACADEMY_CONTACT.whatsapp}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-emerald-400" />
                            <span className="text-white/70">
                              Telefone: <span className="text-white font-medium">{ACADEMY_CONTACT.telefone}</span>
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-white/30 mt-3">
                          Tempo médio de resposta: 24 horas úteis
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Dica */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-sm text-white/60 leading-relaxed">
                <span className="font-semibold text-white">💡 Dica:</span> Tenha em mãos seu nome completo, data de nascimento e último método de pagamento.
              </p>
            </div>

            {/* Divider + Link */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
              <p className="text-sm text-white/50">Lembrou seu email?</p>
              <Link
                href="/login"
                className="inline-block text-sm font-semibold text-white hover:text-white/80 transition-all duration-300 hover:translate-x-1"
              >
                Voltar para o login →
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-white/40 mt-8">
            Precisa criar uma conta?{' '}
            <Link href="/cadastro" className="text-white hover:text-white/80 transition-colors font-medium">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
