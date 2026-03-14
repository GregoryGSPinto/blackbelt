'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lock, QrCode, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getPublicAcademyEnrollment,
  submitPublicAcademyEnrollment,
} from '@/lib/api/academy-operations.service';

type FlowState = 'loading' | 'form' | 'success' | 'error';

export default function MatriculaPage() {
  const params = useParams<{ academyId: string }>();
  const searchParams = useSearchParams();
  const viaQr = searchParams.get('source') === 'qr';

  const [state, setState] = useState<FlowState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<Awaited<ReturnType<typeof getPublicAcademyEnrollment>> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ title: string; description: string } | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    async function load() {
      try {
        setState('loading');
        setError(null);
        const payload = await getPublicAcademyEnrollment(params.academyId);
        setContext(payload);
        setState('form');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível abrir o cadastro da academia.');
        setState('error');
      }
    }

    if (typeof params.academyId === 'string') {
      load();
    }
  }, [params.academyId]);

  const ctaLabel = useMemo(() => (
    context?.link.approvalMode === 'manual' ? 'Enviar para aprovação' : 'Criar acesso agora'
  ), [context?.link.approvalMode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!context) return;

    try {
      setSubmitting(true);
      const response = await submitPublicAcademyEnrollment(params.academyId, {
        ...form,
        source: viaQr ? 'qr' : 'public_link',
      });

      setResult({
        title: response.status === 'auto_approved' ? 'Cadastro concluído' : 'Cadastro enviado',
        description: response.message,
      });
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.');
      setState('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b,transparent_45%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para login
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-200">
              {viaQr ? <QrCode className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              Entrada da academia
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              {context?.academy.name || 'Carregando academia...'}
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              {context?.link.welcomeMessage || 'Entre pelo canal oficial da academia e finalize seu acesso com o tenant correto, sem atrito.'}
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Seu cadastro entra no tenant correto da academia.',
                context?.link.approvalMode === 'manual'
                  ? 'A equipe da academia revisa o acesso antes de liberar a conta.'
                  : 'Seus dados criam acesso imediatamente após o cadastro.',
                'Depois do cadastro, o login passa a funcionar no app principal do BlackBelt.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur">
            {state === 'loading' && (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
              </div>
            )}

            {state === 'form' && context && (
              <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Cadastro do aluno</p>
                  <h2 className="mt-2 text-2xl font-semibold">Complete seu acesso</h2>
                </div>

                <div className="grid gap-4">
                  <Field
                    label="Nome completo"
                    value={form.fullName}
                    onChange={(value) => setForm((prev) => ({ ...prev, fullName: value }))}
                    placeholder="Como você quer aparecer na academia"
                  />
                  <Field
                    label="E-mail"
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                    placeholder="voce@email.com"
                  />
                  <Field
                    label="Telefone"
                    value={form.phone}
                    onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                    placeholder="(11) 99999-9999"
                  />
                  <Field
                    label="Senha"
                    type="password"
                    value={form.password}
                    onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                    placeholder="Crie uma senha segura"
                    icon={<Lock className="h-4 w-4 text-slate-500" />}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-amber-400 px-4 py-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Enviando...' : ctaLabel}
                </button>
              </motion.form>
            )}

            {state === 'success' && result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[420px] flex-col items-center justify-center text-center"
              >
                <div className="rounded-full bg-emerald-500/15 p-4 text-emerald-300">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">{result.title}</h2>
                <p className="mt-3 max-w-md text-sm text-slate-300">{result.description}</p>
                <Link
                  href="/login"
                  className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Ir para login
                </Link>
              </motion.div>
            )}

            {state === 'error' && (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-red-500/12 px-4 py-2 text-sm text-red-300">Cadastro indisponível</div>
                <h2 className="mt-4 text-2xl font-semibold">Não foi possível abrir este acesso</h2>
                <p className="mt-3 max-w-md text-sm text-slate-300">{error}</p>
                <Link
                  href="/login"
                  className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Voltar para login
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  icon?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{icon}</span> : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300 ${icon ? 'pl-11' : ''}`}
        />
      </div>
    </label>
  );
}
