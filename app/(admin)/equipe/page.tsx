'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mail, Plus, ShieldCheck, UserCog, Users } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import {
  getTeamOverview,
  inviteProfessor,
  updateTeamMemberStatus,
  type TeamOverview,
} from '@/lib/api/academy-operations.service';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { PageError } from '@/components/shared/DataStates';
import { useTranslations } from 'next-intl';

export default function EquipePage() {
  const toast = useToast();
  const t = useTranslations('common');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [data, setData] = useState<TeamOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setData(await getTeamOverview());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar a equipe.');
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
  }), [tokens.cardBg, tokens.cardBorder]);

  if (loading) return <PremiumLoader text={t('loading.team')} />;
  if (error || !data) return <PageError error={error || 'Equipe indisponível'} onRetry={() => window.location.reload()} />;

  const professors = data.members.filter((member) => member.role === 'professor');
  const leadership = data.members.filter((member) => member.role !== 'professor');

  const handleInvite = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Nome e e-mail são obrigatórios.');
      return;
    }

    try {
      setSubmitting(true);
      const createdInvite = await inviteProfessor(form);
      setData((prev) => prev ? { ...prev, invites: [createdInvite, ...prev.invites] } : prev);
      setForm({ fullName: '', email: '', phone: '' });
      toast.success('Convite de professor criado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar o convite.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (membershipId: string, nextStatus: 'active' | 'inactive') => {
    try {
      const updated = await updateTeamMemberStatus({ membershipId, status: nextStatus });
      setData((prev) => prev ? {
        ...prev,
        members: prev.members.map((member) => member.id === updated.id ? updated : member),
      } : prev);
      toast.success(nextStatus === 'active' ? 'Professor ativado.' : 'Professor desativado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar o status.');
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-8 pt-6 md:px-0">
      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div style={cardStyle} className="p-6">
          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: tokens.textMuted }}>
            Gestão de professores
          </p>
          <h1 className="mt-2 text-3xl font-semibold" style={{ color: tokens.text }}>
            Equipe operacional da academia
          </h1>
          <p className="mt-2 text-sm" style={{ color: tokens.textMuted }}>
            Convide professores, acompanhe acessos ativos e mantenha cada papel claro para a operacao diaria.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Users, label: 'Professores ativos', value: String(professors.filter((item) => item.status === 'active').length) },
              { icon: UserCog, label: 'Liderança', value: String(leadership.length) },
              { icon: Mail, label: 'Convites pendentes', value: String(data.invites.filter((item) => item.status === 'pending').length) },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <item.icon className="h-5 w-5 text-amber-300" />
                <p className="mt-4 text-3xl font-semibold" style={{ color: tokens.text }}>{item.value}</p>
                <p className="mt-1 text-sm" style={{ color: tokens.textMuted }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: tokens.text }}>
              <Plus className="h-4 w-4 text-emerald-300" />
              Trazer novo professor
            </div>
            <p className="mt-2 text-sm" style={{ color: tokens.textMuted }}>
              O convite entra na fila operacional da academia. Depois, o professor conclui o acesso pelo link oficial e ja entra com o papel correto.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                placeholder="Nome completo"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                style={{ color: tokens.text }}
              />
              <input
                placeholder="email@professor.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                style={{ color: tokens.text }}
              />
              <input
                placeholder="Telefone (opcional)"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                style={{ color: tokens.text }}
              />
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleInvite}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Enviar convite
            </button>
          </div>
        </div>

        <div style={cardStyle} className="p-6">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: tokens.text }}>
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Liderança e permissões
          </div>
          <div className="mt-4 grid gap-3">
            {leadership.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center text-sm" style={{ color: tokens.textMuted }}>
                {t('empty.noAdminMembers')}
              </div>
            ) : leadership.map((member) => (
              <div key={member.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium" style={{ color: tokens.text }}>{member.fullName}</p>
                    <p className="mt-1 text-sm capitalize" style={{ color: tokens.textMuted }}>
                      {member.role === 'owner' ? 'Dono da academia' : 'Administrador da academia'}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em]" style={{ color: tokens.textMuted }}>
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={cardStyle} className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: tokens.textMuted }}>
              Time pedagógico
            </p>
            <h2 className="mt-2 text-2xl font-semibold" style={{ color: tokens.text }}>
              Professores da academia
            </h2>
            <p className="mt-1 text-sm" style={{ color: tokens.textMuted }}>
              Mantenha aqui somente quem precisa acompanhar turmas, chamada e progresso.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {professors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center text-sm" style={{ color: tokens.textMuted }}>
              {t('empty.noProfessors')}
            </div>
          ) : professors.map((member) => (
            <div key={member.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium" style={{ color: tokens.text }}>{member.fullName}</p>
                  <p className="mt-1 text-sm" style={{ color: tokens.textMuted }}>
                    {member.phone || 'Telefone não informado'} · Ingresso {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('pt-BR') : 'recente'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em]" style={{ color: tokens.textMuted }}>
                    {member.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStatus(member.id, member.status === 'active' ? 'inactive' : 'active')}
                    className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm transition hover:bg-white/5"
                    style={{ color: tokens.text }}
                  >
                    {member.status === 'active' ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: tokens.textMuted }}>
            Convites em aberto
          </p>
          <div className="mt-4 grid gap-3">
            {data.invites.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-5 py-8 text-center text-sm" style={{ color: tokens.textMuted }}>
                {t('empty.noPendingInvites')}
              </div>
            ) : data.invites.map((invite) => (
              <div key={invite.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium" style={{ color: tokens.text }}>{invite.fullName}</p>
                    <p className="mt-1 text-sm" style={{ color: tokens.textMuted }}>
                      {invite.email}{invite.phone ? ` · ${invite.phone}` : ''}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em]" style={{ color: tokens.textMuted }}>
                    {invite.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
