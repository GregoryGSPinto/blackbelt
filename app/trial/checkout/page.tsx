'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Check, 
  CreditCard, 
  Building2, 
  Mail, 
  Phone, 

  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface PlanInfo {
  id: string;
  name: string;
  trialDays: number;
  features: string[];
}

const PLANS: Record<string, PlanInfo> = {
  start: {
    id: 'start',
    name: 'Start',
    trialDays: 14,
    features: ['50 alunos', '3 usuários', '5GB storage', 'Suporte por email'],
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    trialDays: 14,
    features: ['100 alunos', '5 usuários', '10GB storage', 'Suporte por chat'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    trialDays: 30,
    features: ['150 alunos', '10 usuários', '20GB storage', 'Suporte prioritário', 'Loja virtual'],
  },
  business: {
    id: 'business',
    name: 'Business',
    trialDays: 30,
    features: ['300 alunos', '20 usuários', '50GB storage', 'Suporte dedicado', 'White label'],
  },
};

export default function TrialCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('plan') || 'start';
  const plan = PLANS[planId] || PLANS.start;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cnpj: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          academy_data: formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to onboarding
        router.push(`/onboarding?trial_id=${data.trial_id}&academy_id=${data.academy_id}`);
      } else {
        const error = await response.json();
        setSubmitError(
          response.status === 401
            ? 'Faça login com a conta proprietária da academia antes de iniciar o trial.'
            : error.error || 'Erro ao iniciar trial',
        );
      }
    } catch (error) {
      console.error(error);
      setSubmitError('Erro ao iniciar trial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            Teste grátis por {plan.trialDays} dias
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold mb-4"
          >
            Comece seu trial no plano {plan.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400"
          >
            Sem cartão de crédito. Cancele a qualquer momento.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {submitError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Academia</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500"
                      placeholder="Ex: Academia Black Belt"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">CNPJ</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Iniciando trial...'
                  ) : (
                    <>
                      Iniciar Trial Grátis
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-400">
                  Ao solicitar o trial, você concorda com os{' '}
                  <Link href="/termos-de-uso" className="text-emerald-400 hover:underline">
                    Termos de Serviço
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>

          {/* Plan Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Plano {plan.name}</h2>
                <p className="text-slate-400">{plan.trialDays} dias grátis</p>
              </div>

              <div className="border-t border-white/10 pt-6 mb-6">
                <h3 className="font-semibold mb-4">O que está incluído:</h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Garantia de satisfação</span>
                </div>
                <p className="text-sm text-slate-400">
                  Teste por {plan.trialDays} dias sem compromisso. Cancele a qualquer momento 
                  durante o trial sem pagar nada.
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  Quer outro plano?{' '}
                  <Link href="/contato" className="text-emerald-400 hover:underline">
                    Falar com consultor
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
