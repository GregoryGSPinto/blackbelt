'use client';

// ============================================================
// MinhaContaSection — Status de Membro, Assinatura e Exclusão
// ============================================================

import Link from 'next/link';
import { Shield, CheckCircle, AlertCircle, CreditCard, ExternalLink, Trash2 } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { MemberStatus, MemberStatusType } from './configuracoes.types';
import { MOCK_MEMBER_STATUS } from './configuracoes.types';

function StatusBadge({ status }: { status: MemberStatusType }) {
  const variants: Record<MemberStatusType, { bg: string; border: string; text: string; label: string }> = {
    ativa: { bg: 'bg-green-600/20', border: 'border-green-600/30', text: 'text-green-400', label: 'ATIVA' },
    atencao: { bg: 'bg-yellow-600/20', border: 'border-yellow-600/30', text: 'text-yellow-400', label: 'ATENÇÃO' },
    bloqueada: { bg: 'bg-red-600/20', border: 'border-red-600/30', text: 'text-red-400', label: 'BLOQUEADA' },
  };

  const v = variants[status];
  return (
    <span className={`px-3 py-1 ${v.bg} border ${v.border} ${v.text} rounded-full text-xs font-medium`}>
      {v.label}
    </span>
  );
}

const PLAN_BENEFITS = [
  'Acesso ilimitado a todas as sessões',
  'Streaming em 4K',
  'Até 4 perfis simultâneos',
  'Downloads offline',
];

function PlanCard({ member }: { member: MemberStatus }) {
  return (
    <div className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-600/30 rounded-2xl">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">{member.planType}</h3>
          <p className="text-white/55">Membro desde {member.activeSince}</p>
        </div>
        <StatusBadge status={member.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-white/40 mb-1">Status da Conta</p>
          <p className="text-xl font-medium">
            {member.status === 'ativa' && 'Conta ativa'}
            {member.status === 'atencao' && 'Requer atenção'}
            {member.status === 'bloqueada' && 'Conta bloqueada'}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-white/40 mb-1">Próxima Renovação</p>
          <p className="text-xl font-medium">{member.nextRenewal}</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="font-semibold mb-3">Benefícios do seu plano:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLAN_BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MinhaContaSection() {
  const member = MOCK_MEMBER_STATUS;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Shield}
        iconClassName="text-blue-400"
        title="Minha Conta"
        subtitle="Informações sobre seu plano, suporte e direitos de dados"
      />

      <PlanCard member={member} />

      {member.status === 'ativa' ? (
        <div className="p-4 bg-green-600/10 border border-green-600/30 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-400 mb-1">Tudo certo com sua conta</p>
              <p className="text-sm text-white/55">
                Sua assinatura está ativa e você pode treinar normalmente.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-400 mb-1">Atenção necessária</p>
              <p className="text-sm text-white/55">
                Revise sua assinatura ou fale com o suporte para regularizar a conta.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3">
              <CreditCard size={18} className="text-blue-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white">Assinatura e cancelamento</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Antes de excluir sua conta, revise pagamentos pendentes e cancele a assinatura ativa para evitar
                renovações futuras. Se precisar de apoio, use o suporte oficial.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/suporte"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Abrir suporte
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3">
              <Trash2 size={18} className="text-red-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-red-300">Excluir minha conta</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Este é o caminho oficial no app para solicitar exclusão de conta e dados. O pedido pode ser iniciado
                aqui, sem depender de email manual ou contato prévio com suporte.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/55">
                <li>• confirmação explícita antes do envio</li>
                <li>• análise de retenção legal e billing aplicável</li>
                <li>• registro auditável da solicitação de exclusão</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/excluir-conta"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
                >
                  Solicitar exclusão
                  <ExternalLink size={14} />
                </Link>
                <Link
                  href="/politica-privacidade"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Ver política
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
