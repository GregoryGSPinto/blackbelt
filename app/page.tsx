import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, CreditCard, GraduationCap, Shield, Sparkles, Users } from 'lucide-react';

const testimonials = [
  {
    name: 'Camila Rocha',
    role: 'Gestora de academia',
    quote: 'Centralizamos matrículas, cobrança, check-in e comunicação em uma única operação.',
  },
  {
    name: 'Leandro Sato',
    role: 'Professor',
    quote: 'Consigo montar turmas, acompanhar evolução e registrar presença em poucos toques.',
  },
  {
    name: 'Marina Alves',
    role: 'Responsável',
    quote: 'A área da família deixa pagamentos, progresso e mensagens muito mais claros.',
  },
];

const plans = [
  { name: 'Start', price: 'R$ 149/mês', description: 'Para academias em fase de operação inicial.', features: ['Até 50 alunos', 'Check-in QR', 'Financeiro básico'] },
  { name: 'Growth', price: 'R$ 299/mês', description: 'Para academias que precisam escalar rotina e time.', features: ['Até 150 alunos', 'Automação operacional', 'Painel do professor'] },
  { name: 'Scale', price: 'Sob consulta', description: 'Para operações com múltiplas unidades e maior volume.', features: ['Múltiplas unidades', 'Controles avançados', 'Suporte prioritário'] },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_30%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-6 py-20 lg:flex-row lg:items-center lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-200">
              <Sparkles className="h-4 w-4" />
              Plataforma operacional para academias de artes marciais
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Gestão, cobrança e experiência mobile em uma única plataforma.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              O BlackBelt conecta alunos, professores, responsáveis e gestores com autenticação segura,
              pagamentos recorrentes, check-in, progresso técnico e comunicação centralizada.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-amber-300"
              >
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5"
              >
                Entrar
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400" /> Autenticação com Supabase</div>
              <div className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-400" /> Assinaturas Stripe</div>
              <div className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> iOS e Android via Capacitor</div>
            </div>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <Users className="h-8 w-8 text-amber-300" />
              <h2 className="mt-4 text-xl font-semibold">Para alunos e famílias</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Acompanhe aulas, pagamentos, progresso, mensagens e histórico sem depender de atendimento manual.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <GraduationCap className="h-8 w-8 text-sky-300" />
              <h2 className="mt-4 text-xl font-semibold">Para professores</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Registre presença, avalie evolução, organize turmas e publique conteúdo sem planilhas paralelas.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:col-span-2">
              <BarChart3 className="h-8 w-8 text-emerald-300" />
              <h2 className="mt-4 text-xl font-semibold">Para academias</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Tenha visão financeira, operação multi-perfil, automação de cobrança, retenção e relatórios em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <h2 className="text-3xl font-semibold">Como funciona</h2>
            <p className="mt-3 text-slate-400">
              A plataforma organiza a jornada operacional da academia do cadastro ao pagamento recorrente.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="text-sm text-amber-300">01</div>
            <h3 className="mt-3 text-xl font-semibold">Cadastre a academia</h3>
            <p className="mt-2 text-sm text-slate-400">Configure planos, horários, equipes e identidade da unidade.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="text-sm text-amber-300">02</div>
            <h3 className="mt-3 text-xl font-semibold">Conecte seus alunos</h3>
            <p className="mt-2 text-sm text-slate-400">Acesso individual para alunos, responsáveis, instrutores e administradores.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 lg:col-start-2">
            <div className="text-sm text-amber-300">03</div>
            <h3 className="mt-3 text-xl font-semibold">Receba e acompanhe</h3>
            <p className="mt-2 text-sm text-slate-400">Use cobranças recorrentes, relatórios e check-in para operar com previsibilidade.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/70">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold">Depoimentos</h2>
              <p className="mt-3 text-slate-400">Valor real para operação, ensino e experiência do aluno.</p>
            </div>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-2xl border border-white/10 bg-slate-950 p-6">
                <p className="text-slate-200">“{item.quote}”</p>
                <div className="mt-6">
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="text-sm text-slate-400">{item.role}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">Planos para crescer com segurança</h2>
          <p className="mt-3 text-slate-400">
            Estrutura de cobrança e operação compatível com academia em fase inicial, expansão ou múltiplas unidades.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div className="text-sm uppercase tracking-[0.25em] text-amber-300">{plan.name}</div>
              <div className="mt-4 text-3xl font-semibold">{plan.price}</div>
              <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-400/15 to-sky-400/10 p-8 md:p-12">
          <h2 className="text-3xl font-semibold">Pronto para operar com mais previsibilidade?</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Crie sua conta, ative a academia e leve check-in, comunicação e cobrança para um fluxo único.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/cadastro" className="rounded-xl bg-amber-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-amber-300">
              Criar conta
            </Link>
            <Link href="/login" className="rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5">
              Entrar no painel
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-sm text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>© 2026 BlackBelt. Gestão segura para academias de artes marciais.</div>
          <div className="flex gap-5">
            <Link href="/politica-privacidade" className="hover:text-white">Política de Privacidade</Link>
            <Link href="/termos-de-uso" className="hover:text-white">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
