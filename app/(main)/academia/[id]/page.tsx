'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Phone,
  Instagram,
  ChevronLeft,
  CheckCircle2,
  Award,
  Calendar,
  Shield
} from 'lucide-react';

// Mock data
const academyData = {
  id: '1',
  name: 'Academia Gracie Barra SP',
  description: 'A maior rede de Jiu-Jitsu do mundo. Aqui você encontra estrutura de alto nível, professores graduados e uma comunidade acolhedora para todos os níveis, desde iniciantes até competidores profissionais.',
  address: 'Rua Augusta, 1500 - Consolação, São Paulo - SP',
  rating: 4.9,
  reviews: 128,
  phone: '(11) 99999-9999',
  instagram: '@graciebarra_sp',
  image: '/images/academy-1.jpg',
  hours: 'Seg-Sex: 06:00 - 22:00\nSáb: 08:00 - 14:00',
  students: 450,
  founded: '2005',
  headInstructor: 'Prof. Carlos Silva',
  belt: 'Faixa Preta 4º grau',
  modalities: [
    { name: 'BJJ', description: 'Jiu-Jitsu Brasileiro para todas as idades', icon: '🥋' },
    { name: 'Muay Thai', description: 'Boxe tailandês e condicionamento', icon: '🥊' },
    { name: 'Boxe', description: 'Fundamentos e sparring', icon: '🥊' },
  ],
  facilities: [
    '4 tatames de alta qualidade',
    'Sala de musculação',
    'Vestiários com armários',
    'Estacionamento próprio',
    'Loja de equipamentos',
  ],
  plans: [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$ 199',
      period: '/mês',
      description: '2x por semana',
      features: [
        'Aulas 2x por semana',
        'Acesso a 1 modalidade',
        'Check-in via app',
        'Acompanhamento de progresso',
      ],
      popular: false,
    },
    {
      id: 'unlimited',
      name: 'Ilimitado',
      price: 'R$ 299',
      period: '/mês',
      description: 'Aulas ilimitadas',
      features: [
        'Aulas ilimitadas',
        'Todas as modalidades',
        'Acesso ao conteúdo online',
        'Sem taxa de matrícula',
        'Aulas particulares 10% off',
      ],
      popular: true,
    },
    {
      id: 'competitor',
      name: 'Competidor',
      price: 'R$ 399',
      period: '/mês',
      description: 'Preparação completa',
      features: [
        'Tudo do plano Ilimitado',
        'Treinos especiais de competição',
        'Preparação física inclusa',
        'Aulas particulares 20% off',
        'Camiseta oficial GB',
      ],
      popular: false,
    },
  ],
};

export default function AcademiaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleEnroll = (planId: string) => {
    router.push(`/matricula/${academyData.id}?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header Image */}
      <div className="relative h-64 bg-gradient-to-br from-amber-400/20 to-amber-600/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <Award className="h-32 w-32 text-amber-400/30" />
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 -mt-8">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-slate-900 p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{academyData.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-amber-400">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-medium">{academyData.rating}</span>
                <span className="text-slate-400">({academyData.reviews} avaliações)</span>
              </div>
            </div>
            <div className="rounded-full bg-amber-400/20 px-3 py-1 text-sm font-medium text-amber-400">
              {academyData.belt}
            </div>
          </div>

          <p className="mt-4 text-slate-300">{academyData.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {academyData.address}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {academyData.students} alunos
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Desde {academyData.founded}
            </span>
          </div>
        </motion.div>

        {/* Contact Buttons */}
        <div className="mt-4 flex gap-3">
          <a
            href={`tel:${academyData.phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-slate-300 transition hover:bg-white/10"
          >
            <Phone className="h-5 w-5" />
            Ligar
          </a>
          <a
            href={`https://instagram.com/${academyData.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-slate-300 transition hover:bg-white/10"
          >
            <Instagram className="h-5 w-5" />
            Instagram
          </a>
        </div>

        {/* Modalities */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">Modalidades</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {academyData.modalities.map((mod) => (
              <div
                key={mod.name}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <span className="text-3xl">{mod.icon}</span>
                <h3 className="mt-2 font-semibold">{mod.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{mod.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Facilities */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">Estrutura</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {academyData.facilities.map((facility) => (
              <li key={facility} className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                {facility}
              </li>
            ))}
          </ul>
        </section>

        {/* Schedule */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">Horários</h2>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-5 w-5 text-amber-400" />
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {academyData.hours}
              </pre>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">Planos</h2>
          <p className="mt-2 text-slate-400">Escolha o plano ideal para você</p>
          
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {academyData.plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer rounded-2xl border p-4 transition ${
                  selectedPlan === plan.id
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2 left-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-medium text-slate-950">
                    Mais Popular
                  </span>
                )}
                
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-slate-400">{plan.description}</p>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnroll(plan.id);
                  }}
                  className="mt-4 w-full rounded-xl bg-amber-400 py-2 font-medium text-slate-950 transition hover:bg-amber-300"
                >
                  Matricular-se
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Safety Info */}
        <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 flex-shrink-0 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-emerald-400">Matrícula Segura</h3>
              <p className="mt-1 text-sm text-slate-300">
                Pagamento processado com criptografia. Você pode cancelar a qualquer momento 
                sem multa. 7 dias de garantia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
