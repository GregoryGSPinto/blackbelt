'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Link2, QrCode, RefreshCcw, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import {
  getAcademyOnboardingOverview,
  moderateOnboardingRequest,
  updateAcademyOnboardingLink,
  type AcademyOnboardingOverview,
} from '@/lib/api/academy-operations.service';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { PageError } from '@/components/shared/DataStates';
import { AcademyEnrollmentQRCode } from '@/components/academy/AcademyEnrollmentQRCode';

export default function MinhaAcademiaPage() {
  const toast = useToast();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [data, setData] = useState<AcademyOnboardingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await getAcademyOnboardingOverview();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar a operação da academia.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const cardStyle = useMemo(() => ({
    background: tokens.cardBg,
    border: `1px solid ${tokens.cardBorder}`,
    borderRadius: '24px',
    backdropFilter: 'blur(18px)',
  }), [tokens.cardBg, tokens.cardBorder]);

  if (loading) return <PremiumLoader text="Carregando operação da academia..." />;
  if (error || !data) return <PageError error={error || 'Dados indisponíveis'} onRetry={() => window.location.reload()} />;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.link.publicUrl);
    toast.success('Link copiado com sucesso.');
  };

  const handleLinkUpdate = async (patch: Parameters<typeof updateAcademyOnboardingLink>[0]) => {
    try {
      setSaving(true);
      const updatedLink = await updateAcademyOnboardingLink(patch);
      setData((prev) => prev ? { ...prev, link: updatedLink } : prev);
      toast.success('Configuração de onboarding atualizada.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar o onboarding.');
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await moderateOnboardingRequest({ requestId, action });
      const refreshed = await getAcademyOnboardingOverview();
      setData(refreshed);
      toast.success(action === 'approve' ? 'Cadastro aprovado.' : 'Cadastro rejeitado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível revisar o cadastro.');
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-8 pt-6 md:px-0">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div style={cardStyle} className="overflow-hidden p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: tokens.textMuted }}>
                Operação da academia
              </p>
              <h1 className="mt-2 text-3xl font-semibold" style={{ color: tokens.text }}>
                {data.academy.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: tokens.textMuted }}>
                Centralize entrada de alunos, controle aprovação e distribua o QR oficial da academia sem depender de processo manual.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {data.link.approvalMode === 'manual' ? 'Entrada com aprovação manual' : 'Entrada automática habilitada'}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Users, label: 'Pendentes de alunos', value: String(data.stats.pendingStudents) },
              { icon: UserCheck, label: 'Pendentes de professores', value: String(data.stats.pendingProfessors) },
              { icon: CheckCircle2, label: 'Aprovações recentes', value: String(data.stats.approvedThisWeek) },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <item.icon className="h-5 w-5 text-amber-300" />
                <p className="mt-4 text-3xl font-semibold" style={{ color: tokens.text }}>{item.value}</p>
                <p className="mt-1 text-sm" style={{ color: tokens.textMuted }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: tokens.textMuted }}>
                  Link oficial de cadastro
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" style={{ color: tokens.text }}>
                    {data.link.publicUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5"
                    style={{ color: tokens.text }}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleLinkUpdate({ isActive: !data.link.isActive })}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5 disabled:opacity-60"
                  style={{ color: tokens.text }}
                >
                  {data.link.isActive ? 'Desativar link' : 'Ativar link'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleLinkUpdate({ regenerate: true })}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Regenerar
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: tokens.text }}>
                  <Link2 className="h-4 w-4 text-amber-300" />
                  Experiência pública
                </div>
                <p className="mt-3 text-sm" style={{ color: tokens.textMuted }}>
                  Título do fluxo
                </p>
                <input
                  value={data.link.title || ''}
                  onChange={(event) => setData((prev) => prev ? { ...prev, link: { ...prev.link, title: event.target.value } } : prev)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                  style={{ color: tokens.text }}
                />

                <p className="mt-4 text-sm" style={{ color: tokens.textMuted }}>
                  Mensagem de boas-vindas
                </p>
                <textarea
                  value={data.link.welcomeMessage || ''}
                  onChange={(event) => setData((prev) => prev ? { ...prev, link: { ...prev.link, welcomeMessage: event.target.value } } : prev)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                  style={{ color: tokens.text }}
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleLinkUpdate({ title: data.link.title || '', welcomeMessage: data.link.welcomeMessage || '' })}
                  className="mt-4 rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5 disabled:opacity-60"
                  style={{ color: tokens.text }}
                >
                  Salvar texto público
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: tokens.text }}>
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Política de entrada
                </div>
                <p className="mt-3 text-sm" style={{ color: tokens.textMuted }}>
                  Controle se o aluno entra direto no app ou aguarda revisão da equipe.
                </p>
                <div className="mt-4 grid gap-3">
                  {[
                    { value: 'automatic', label: 'Aprovação automática', description: 'Cria o vínculo do aluno imediatamente após o cadastro.' },
                    { value: 'manual', label: 'Aprovação manual', description: 'Mantém o cadastro pendente até revisão da academia.' },
                  ].map((option) => {
                    const selected = data.link.approvalMode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={saving}
                        onClick={() => handleLinkUpdate({ approvalMode: option.value as 'automatic' | 'manual' })}
                        className={`rounded-3xl border p-4 text-left transition ${selected ? 'border-amber-300/50 bg-amber-300/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'}`}
                      >
                        <p className="text-sm font-medium" style={{ color: tokens.text }}>{option.label}</p>
                        <p className="mt-2 text-sm" style={{ color: tokens.textMuted }}>{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle} className="p-6">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: tokens.text }}>
            <QrCode className="h-4 w-4 text-amber-300" />
            QR Code da academia
          </div>
          <p className="mt-2 text-sm" style={{ color: tokens.textMuted }}>
            Exiba na recepção, envie por WhatsApp ou baixe para impressão. O QR leva direto ao fluxo público contextualizado pela sua academia.
          </p>
          <div className="mt-5">
            <AcademyEnrollmentQRCode value={data.link.qrValue} academyName={data.academy.name} />
          </div>
        </div>
      </section>

      <section style={cardStyle} className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: tokens.textMuted }}>
              Fila de onboarding
            </p>
            <h2 className="mt-2 text-2xl font-semibold" style={{ color: tokens.text }}>
              Cadastros recentes
            </h2>
          </div>
        </div>

        {data.requests.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-lg font-medium" style={{ color: tokens.text }}>Nenhum cadastro recebido ainda.</p>
            <p className="mt-2 text-sm" style={{ color: tokens.textMuted }}>
              Assim que alunos ou professores usarem o link/QR da academia, eles aparecerão aqui para acompanhamento.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {data.requests.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-medium" style={{ color: tokens.text }}>{item.fullName}</p>
                    <p className="mt-1 text-sm" style={{ color: tokens.textMuted }}>
                      {item.email}{item.phone ? ` · ${item.phone}` : ''} · {item.desiredRole === 'professor' ? 'Professor' : 'Aluno'}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em]" style={{ color: tokens.textMuted }}>
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReview(item.id, 'approve')}
                        className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400"
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(item.id, 'reject')}
                        className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm transition hover:bg-white/5"
                        style={{ color: tokens.text }}
                      >
                        Rejeitar
                      </button>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: tokens.textMuted }}>
                      Revisado em {new Date(item.reviewedAt || item.requestedAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
