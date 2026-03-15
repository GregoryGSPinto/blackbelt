'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  School,
  Play,
  ChevronRight,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const steps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao BlackBelt!',
    description: 'Sua jornada nas artes marciais começa aqui.',
  },
  {
    id: 'has-academy',
    title: 'Você já treina em uma academia?',
    description: 'Vamos conectar você à sua academia.',
  },
  {
    id: 'complete',
    title: 'Tudo pronto!',
    description: 'Agora é só começar sua jornada.',
  },
];

export default function OnboardingAlunoPage() {
  const router = useRouter();
  const t = useTranslations('common.actions');
  const [currentStep, setCurrentStep] = useState(0);
  const [hasAcademy, setHasAcademy] = useState<boolean | null>(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/buscar-academia');
    }
  };

  const handleHasAcademy = (value: boolean) => {
    setHasAcademy(value);
    if (value) {
      setTimeout(() => router.push('/buscar-academia'), 500);
    } else {
      setCurrentStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-20">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {currentStep === 0 && (
            <>
              <div className="mb-8 flex justify-center">
                <div className="rounded-full bg-amber-400/20 p-6">
                  <Trophy className="h-16 w-16 text-amber-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold">{steps[0].title}</h1>
              <p className="mt-4 text-lg text-slate-400">{steps[0].description}</p>
              
              <div className="mt-12 grid gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <Search className="mx-auto h-8 w-8 text-amber-400" />
                  <h3 className="mt-4 font-semibold">Encontre sua academia</h3>
                  <p className="mt-2 text-sm text-slate-400">Busque por nome ou localização</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <h3 className="mt-4 font-semibold">Matricule-se online</h3>
                  <p className="mt-2 text-sm text-slate-400">Escolha seu plano e pague</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <Play className="mx-auto h-8 w-8 text-sky-400" />
                  <h3 className="mt-4 font-semibold">Comece a treinar</h3>
                  <p className="mt-2 text-sm text-slate-400">Acesse conteúdo e aulas</p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="mt-12 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-8 py-4 font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Começar
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="mb-8 flex justify-center">
                <div className="rounded-full bg-sky-400/20 p-6">
                  <School className="h-16 w-16 text-sky-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold">{steps[1].title}</h1>
              <p className="mt-4 text-lg text-slate-400">{steps[1].description}</p>
              
              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={() => handleHasAcademy(true)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-amber-400 bg-amber-400/10 px-8 py-4 font-semibold text-amber-400 transition hover:bg-amber-400/20"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Sim, já treino
                </button>
                <button
                  onClick={() => handleHasAcademy(false)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
                >
                  <Search className="h-5 w-5" />
                  Não, quero encontrar uma
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="mb-8 flex justify-center">
                <div className="rounded-full bg-emerald-400/20 p-6">
                  <Play className="h-16 w-16 text-emerald-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold">{steps[2].title}</h1>
              <p className="mt-4 text-lg text-slate-400">{steps[2].description}</p>
              
              <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8 text-left">
                <h3 className="text-xl font-semibold">Como funciona:</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-400">1</div>
                    <span className="text-slate-300">Busque academias próximas a você</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-400">2</div>
                    <span className="text-slate-300">Veja horários, modalidades e preços</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-400">3</div>
                    <span className="text-slate-300">Matricule-se online em minutos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-400">4</div>
                    <span className="text-slate-300">Comece sua jornada nas artes marciais!</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/buscar-academia')}
                className="mt-12 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-8 py-4 font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                <Search className="h-5 w-5" />
                {t('searchAcademies')}
              </button>
            </>
          )}
        </motion.div>

        <div className="mt-12 text-center">
          <Link href="/inicio" className="text-sm text-slate-500 transition hover:text-slate-300">
            Pular onboarding →
          </Link>
        </div>
      </div>
    </div>
  );
}
