'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  CheckCircle2,
  CreditCard,
  User,
  FileText,
  Lock
} from 'lucide-react';

const plans = {
  basic: { name: 'Básico', price: 'R$ 199/mês' },
  unlimited: { name: 'Ilimitado', price: 'R$ 299/mês' },
  competitor: { name: 'Competidor', price: 'R$ 399/mês' },
};

export default function MatriculaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'basic';
  const plan = plans[planId as keyof typeof plans] || plans.basic;
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    allergies: '',
    termsAccepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirecionar para checkout do Stripe
    // router.push(`/api/checkout?plan=${planId}&academy=${params.academyId}`);
    
    // Por enquanto, redireciona para dashboard
    router.push('/inicio');
  };

  const updateForm = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Matrícula</h1>
              <p className="text-sm text-slate-400">Academia Gracie Barra SP</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${
                  s <= step ? 'bg-amber-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Step 1: Personal Data */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-amber-400/20 p-2">
                <User className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold">Dados Pessoais</h2>
                <p className="text-sm text-slate-400">Complete seus dados para a matrícula</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => updateForm('cpf', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Telefone</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Contato de Emergência</label>
                  <input
                    type="text"
                    placeholder="Nome"
                    value={formData.emergencyContact}
                    onChange={(e) => updateForm('emergencyContact', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Tel. Emergência</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.emergencyPhone}
                    onChange={(e) => updateForm('emergencyPhone', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Condições Médicas (opcional)</label>
                <textarea
                  placeholder="Informe se possui alguma condição médica relevante..."
                  value={formData.medicalConditions}
                  onChange={(e) => updateForm('medicalConditions', e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Alergias (opcional)</label>
                <input
                  type="text"
                  placeholder="Informe se possui alergias..."
                  value={formData.allergies}
                  onChange={(e) => updateForm('allergies', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.cpf || !formData.phone}
              className="mt-6 w-full rounded-xl bg-amber-400 py-4 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </motion.div>
        )}

        {/* Step 2: Terms */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-sky-400/20 p-2">
                <FileText className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <h2 className="font-semibold">Termos e Condições</h2>
                <p className="text-sm text-slate-400">Leia e aceite os termos</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-medium">Termo de Responsabilidade</h3>
              <div className="mt-4 max-h-64 overflow-y-auto text-sm text-slate-400 space-y-3">
                <p>
                  1. DECLARO que estou em boas condições de saúde para praticar atividades físicas 
                  de artes marciais e que fui orientado a consultar um médico antes do início das atividades.
                </p>
                <p>
                  2. COMPROMETO-ME a seguir as instruções dos professores e as normas da academia, 
                  respeitando os demais alunos e a estrutura do local.
                </p>
                <p>
                  3. AUTORIZO o uso de minha imagem em fotos e vídeos para fins de divulgação 
                  da academia em redes sociais e materiais promocionais.
                </p>
                <p>
                  4. ESTOU CIENTE de que a prática de artes marciais envolve riscos de lesões 
                  e que a academia não se responsabiliza por danos resultantes de negligência própria.
                </p>
                <p>
                  5. POLÍTICA DE CANCELAMENTO: Posso cancelar minha matrícula a qualquer momento 
                  sem multa, com efeito a partir do próximo ciclo de pagamento.
                </p>
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => updateForm('termsAccepted', e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400"
              />
              <span className="text-sm text-slate-300">
                Li e aceito os termos de responsabilidade e política de cancelamento
              </span>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.termsAccepted}
                className="flex-1 rounded-xl bg-amber-400 py-4 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aceitar e Continuar
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-emerald-400/20 p-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold">Pagamento</h2>
                <p className="text-sm text-slate-400">Escolha a forma de pagamento</p>
              </div>
            </div>

            {/* Plan Summary */}
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Plano selecionado</p>
                  <p className="font-semibold">{plan.name}</p>
                </div>
                <p className="text-xl font-bold text-amber-400">{plan.price}</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-slate-300">Forma de pagamento</p>
              
              <button className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/50">
                <div className="rounded-lg bg-blue-500/20 p-2">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-sm text-slate-400">Parcelamento em até 12x</p>
                </div>
                <ChevronLeft className="h-5 w-5 rotate-180 text-slate-500" />
              </button>

              <button className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/50">
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-slate-400">5% de desconto</p>
                </div>
                <ChevronLeft className="h-5 w-5 rotate-180 text-slate-500" />
              </button>
            </div>

            {/* Security */}
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Lock className="h-4 w-4" />
              <span>Pagamento seguro com criptografia SSL</span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 rounded-xl bg-amber-400 py-4 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Processando...
                  </span>
                ) : (
                  'Finalizar Matrícula'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
