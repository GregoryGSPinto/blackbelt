'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth, getRedirectForProfile } from '@/contexts/AuthContext';
import CinematicBackground from '@/components/ui/CinematicBackground';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { logger } from '@/lib/logger';

export default function PremiumLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  const [step, setStep]           = useState<'email' | 'password'>('email');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]     = useState(false);
  // Guard: prevent autofill-triggered submits before user interaction
  const [userInteracted, setUserInteracted] = useState(false);

  // Detectar cadastro recém-concluído
  useEffect(() => {
    if (searchParams.get('cadastro') === 'sucesso') {
      setSuccessMsg('Conta criada com sucesso! Faça login para continuar.');
    }
  }, [searchParams]);

  // Redirecionar se já autenticado (ex: voltou para login com sessão ativa)
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getRedirectForProfile(user.tipo));
    }
  }, [authLoading, user, router]);

  // Validação de formato de email (UX only)
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // ─── ETAPA 1: Submeter email ────────────────────────────────
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Block autofill-triggered submits (user must type or click)
    if (!userInteracted) return;
    setError('');
    setSuccessMsg('');

    if (!email.trim()) { setError('Digite seu email'); return; }
    if (!validateEmail(email)) { setError('Email inválido'); return; }

    // Avança para senha — a validação real acontece no servidor
    setStep('password');
  };

  // ─── ETAPA 2: Submeter senha (via AuthContext.login → API) ──
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInteracted) return;
    setError('');
    if (!password) { setError('Digite sua senha'); return; }

    setLoading(true);

    try {
      const tipo = await login(email, password);

      if (tipo) {
        // Redirect imediato usando o tipo retornado — não depende de state update
        logger.info('[Login]', 'Login bem-sucedido, redirecionando para', getRedirectForProfile(tipo));
        router.replace(getRedirectForProfile(tipo));
      } else {
        setError('Email ou senha incorretos. Tente novamente.');
        setLoading(false);
      }
    } catch (err) {
      logger.error('[Login]', 'Erro ao fazer login:', err);
      setError('Ocorreu um erro. Tente novamente.');
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setPassword('');
    setError('');
  };

  // ─── Loading state (entrando) ─────────────────────────────
  if (loading) {
    return (
      <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
        <CinematicBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-lg text-white/80">Entrando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Cinematográfico */}
      <CinematicBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Botão Voltar */}
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>

          {/* Container Principal */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl transition-all duration-500 hover:border-white/20">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo-blackbelt.png"
                alt="BlackBelt"
                width={64}
                height={64}
                className="rounded-lg"
              />
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-2 tracking-tight">Entrar</h1>
              <p className="text-white/60 text-base">
                {step === 'email' ? 'Digite seu email para continuar' : 'Digite sua senha'}
              </p>
            </div>

            {/* Mensagem de sucesso (pós-cadastro) */}
            {successMsg && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-400 leading-relaxed">{successMsg}</p>
              </div>
            )}

            {/* ETAPA 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} autoComplete="off" className="space-y-6 animate-fade-in">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2.5">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 transition-colors duration-300 group-focus-within:text-white/60" />
                    <input
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => { setUserInteracted(true); setEmail(e.target.value); setError(''); setSuccessMsg(''); }}
                      onKeyDown={() => setUserInteracted(true)}
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                      autoFocus 
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400 leading-relaxed">{error}</p>
                  </div>
                )}

                <button type="submit" className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
                  Continuar
                </button>

                <SocialLoginButtons mode="login" />

                <div className="space-y-4 text-center">
                  <Link href="/esqueci-email" className="block text-sm text-white/60 hover:text-white transition-colors duration-300">
                    Esqueci meu email
                  </Link>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60 mb-2.5">Primeira vez aqui?</p>
                    <Link href="/cadastro" className="inline-block text-sm font-semibold text-white hover:text-white/80 transition-all duration-300 hover:translate-x-1">
                      Criar conta grátis →
                    </Link>
                  </div>
                </div>
              </form>
            )}

            {/* ETAPA 2: Senha */}
            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-fade-in">
                {/* Email Display */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/5 transition-colors duration-300 hover:bg-white/10">
                  <Mail className="w-5 h-5 text-white/60 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 mb-0.5">Entrando como:</p>
                    <p className="text-white font-medium truncate">{email}</p>
                  </div>
                  <button type="button" onClick={handleBackToEmail} className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium">
                    Trocar
                  </button>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2.5">Senha</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 transition-colors duration-300 group-focus-within:text-white/60" />
                    <input
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => { setUserInteracted(true); setPassword(e.target.value); setError(''); }}
                      onKeyDown={() => setUserInteracted(true)}
                      placeholder="Digite sua senha"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                      autoFocus 
                      autoComplete="current-password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400 leading-relaxed">{error}</p>
                  </div>
                )}

                <button type="submit" className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
                  Entrar
                </button>

                <SocialLoginButtons mode="login" />

                <div className="space-y-3 text-center">
                  <Link href="/esqueci-senha" className="block text-sm text-white/60 hover:text-white transition-colors duration-300">
                    Esqueci minha senha
                  </Link>
                  <Link href="/alterar-senha" className="block text-sm text-white/60 hover:text-white transition-colors duration-300">
                    Alterar minha senha
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-white/40 mt-8 animate-fade-in-delay">
            Ao entrar, você concorda com nossos Termos de Uso
          </p>

          {/* Botão de emergência para limpar sessão */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-xs text-white/30 hover:text-white/50 transition-colors duration-300"
            >
              Problemas para entrar? Limpar sessão
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.3s forwards; opacity: 0; }
        .animate-slide-up { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
      `}</style>
    </div>
  );
}
