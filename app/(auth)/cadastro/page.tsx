'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LegalModal } from '@/components/modals/LegalModal';
import { authService } from '@/lib/api';
import CinematicBackground from '@/components/ui/CinematicBackground';
import {
  StepEmail, StepSenha, StepDados, StepConsentimento, StepAvatar, StepKids, StepRevisao,
  CadastroLoading, STEP_TITLES,
  calcIdade, determinaPerfil, validaSenha,
} from './_components';
import type { Step, DadosUsuario, DadosKid } from './_components';
import { useAutoSave, restoreDraft } from '@/hooks/useAutoSave';
import { AutoSaveIndicator, RestoreDialog } from '@/components/shared/AutoSaveIndicator';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function CadastroPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '' });

  const [dados, setDados] = useState<DadosUsuario>({
    email: '', senha: '', confirmarSenha: '', nome: '',
    sexo: 'nao-informar', dataNascimento: ''
  });
  const [kids, setKids] = useState<DadosKid[]>([]);

  // ── Auto-save draft ──
  const autoSave = useAutoSave({
    key: 'cadastro',
    data: { dados: { ...dados, senha: '', confirmarSenha: '' }, kids, step },
    debounceMs: 2000,
    disabled: loading,
  });

  const handleRestore = useCallback(() => {
    const draft = restoreDraft<{ dados: DadosUsuario; kids: DadosKid[]; step: Step }>('cadastro');
    if (draft) {
      setDados(draft.data.dados);
      setKids(draft.data.kids);
      if (draft.data.step) setStep(draft.data.step);
    }
    autoSave.dismissRestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave.dismissRestore]);

  // ── Step handlers ──────────────────────────────────

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!dados.email) { setError(t('register.enterEmail')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      setError(t('register.invalidEmail')); return;
    }
    const available = await authService.checkEmailAvailable(dados.email);
    if (!available) {
      setError(t('register.emailExists'));
      return;
    }
    setStep('senha');
  };

  const handleSenha = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!dados.senha) { setError(t('register.enterPassword')); return; }
    const v = validaSenha(dados.senha);
    if (!v.ok) { setError(v.msg); return; }
    if (dados.senha !== dados.confirmarSenha) {
      setError(t('register.passwordsDontMatch')); return;
    }
    setStep('dados');
  };

  const handleDados = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!dados.nome) { setError(t('register.enterName')); return; }

    let idade = 0;
    let p = determinaPerfil(0);

    if (dados.dataNascimento) {
      idade = calcIdade(dados.dataNascimento);
      if (idade < 0 || idade > 120) { setError(t('register.invalidDate')); return; }
      p = determinaPerfil(idade);
      if (p === 'kids') {
        setError(t('register.minorRequiresParent'));
        return;
      }
    }
    setDados({ ...dados, idade, perfilAutomatico: p });
    // Teens (13-17) → parental consent step; Adults → avatar
    setStep(p === 'adolescente' ? 'consentimento' : 'avatar');
  };

  const handleConsentimento = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!dados.nomeResponsavel || dados.nomeResponsavel.trim().length < 3) {
      setError(t('consent.parentName')); return;
    }
    if (!dados.emailResponsavel || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.emailResponsavel)) {
      setError(t('register.invalidEmail')); return;
    }
    if (dados.emailResponsavel === dados.email) {
      setError(t('consent.parentEmail')); return;
    }
    if (!dados.consentimentoAceito) {
      setError(t('consent.declaration')); return;
    }
    setStep('avatar');
  };

  const continueAvatar = () => {
    if (!dados.avatar && !dados.avatarFile) { setError(t('register.chooseAvatar')); return; }
    setError('');
    setStep(dados.perfilAutomatico === 'adulto' ? 'kids' : 'revisao');
  };

  const handleAddKid = (kid: DadosKid): string | null => {
    if (!kid.nome || !kid.dataNascimento) return t('register.enterName');
    const idade = calcIdade(kid.dataNascimento);
    if (idade >= 13) return t('register.minorRequiresParent');
    if (idade < 0) return t('register.invalidDate');
    setKids(prev => [...prev, kid]);
    return null;
  };

  const handleRemoveKid = (i: number) => {
    setKids(prev => prev.filter((_, idx) => idx !== i));
  };

  const continueKids = () => {
    setError('');
    setStep('revisao');
  };

  const finalizar = async (aceite: boolean) => {
    setError('');
    if (!aceite) { setError(t('register.acceptTerms')); return; }

    setLoading(true);
    try {
      const tipo = dados.perfilAutomatico === 'adulto'
        ? (kids.length > 0 ? 'RESPONSAVEL' : 'ALUNO_ADULTO')
        : dados.perfilAutomatico === 'adolescente' ? 'ALUNO_TEEN' : 'ALUNO_KIDS';

      const result = await authService.registerFull({
        email: dados.email, password: dados.senha, nome: dados.nome,
        idade: dados.idade, tipo,
        avatar: dados.avatarFile || dados.avatar || '🥋',
        graduacao: 'Nível Iniciante', categoria: 'Iniciante',
        kids: kids.length > 0 ? kids : undefined,
      });

      if (!result) {
        setError(t('register.emailExists'));
        setLoading(false); return;
      }

      await new Promise(r => setTimeout(r, 800));
      autoSave.clearDraft();
      router.push('/login?cadastro=sucesso');
    } catch {
      setError(tCommon('errors.generic')); setLoading(false);
    }
  };

  const voltar = () => {
    setError('');
    const back: Record<Step, Step | null> = {
      email: null, senha: 'email', dados: 'senha',
      consentimento: 'dados',
      avatar: dados.perfilAutomatico === 'adolescente' ? 'consentimento' : 'dados',
      kids: 'avatar', revisao: dados.perfilAutomatico === 'adulto' ? 'kids' : 'avatar'
    };
    const prev = back[step];
    if (prev) setStep(prev);
  };

  // ── Render ──────────────────────────────────────────

  if (loading) return <CadastroLoading />;

  const { title, subtitle } = STEP_TITLES[step];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <CinematicBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-slide-up">
          {step !== 'email' ? (
            <button onClick={voltar} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">{tCommon('actions.back')}</span>
            </button>
          ) : (
            <Link href="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">{t('register.backToHome')}</span>
            </Link>
          )}

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-2">{title}</h1>
                <AutoSaveIndicator status={autoSave.status} lastSaved={autoSave.lastSaved} />
              </div>
              <p className="text-white/60">{subtitle}</p>
            </div>

            <RestoreDialog
              show={autoSave.showRestore}
              timestamp={autoSave.lastSaved}
              onRestore={handleRestore}
              onDiscard={() => { autoSave.clearDraft(); autoSave.dismissRestore(); }}
            />

            {step === 'email'   && <StepEmail   dados={dados} setDados={setDados} onSubmit={handleEmail}   error={error} setError={setError} />}
            {step === 'senha'   && <StepSenha   dados={dados} setDados={setDados} onSubmit={handleSenha}   error={error} setError={setError} />}
            {step === 'dados'          && <StepDados          dados={dados} setDados={setDados} onSubmit={handleDados}          error={error} setError={setError} />}
            {step === 'consentimento'  && <StepConsentimento  dados={dados} setDados={setDados} onSubmit={handleConsentimento}  error={error} setError={setError} />}
            {step === 'avatar'         && <StepAvatar         dados={dados} setDados={setDados} onContinue={continueAvatar}     error={error} setError={setError} />}
            {step === 'kids'    && <StepKids    kids={kids} onAddKid={handleAddKid} onRemoveKid={handleRemoveKid} onContinue={continueKids} error={error} setError={setError} />}
            {step === 'revisao' && <StepRevisao dados={dados} kids={kids} onFinalizar={finalizar} onOpenModal={t => setModal({ isOpen: true, title: t })} error={error} setError={setError} />}
          </div>
        </div>
      </div>

      <LegalModal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, title: '' })} title={modal.title} />

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
