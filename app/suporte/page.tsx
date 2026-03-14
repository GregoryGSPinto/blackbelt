'use client';

import Link from 'next/link';
import { ExternalLink, LifeBuoy, Mail, Shield, Trash2 } from 'lucide-react';

const SUPPORT_CHANNELS = [
  {
    icon: Mail,
    title: 'Suporte geral',
    value: 'suporte@blackbelt.app',
    href: 'mailto:suporte@blackbelt.app',
    description: 'Ajuda com acesso, assinatura, cobrança e uso diário do produto.',
  },
  {
    icon: Shield,
    title: 'Privacidade e dados',
    value: 'privacidade@blackbelt.app',
    href: 'mailto:privacidade@blackbelt.app',
    description: 'Canal para dúvidas LGPD, retenção, anonimização e solicitações de dados.',
  },
  {
    icon: Trash2,
    title: 'Excluir conta',
    value: '/excluir-conta',
    href: '/excluir-conta',
    description: 'Fluxo público exigido pelo Google Play para solicitação de exclusão de conta e dados.',
  },
];

export default function SuportePage() {
  return (
    <main className="min-h-screen bg-[#0d0d1a] px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/login" className="inline-flex items-center text-sm text-amber-400 transition-colors hover:text-amber-300">
          &larr; Voltar
        </Link>

        <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              Support
            </span>
            <h1 className="mt-4 text-3xl font-semibold">Suporte e canais de compliance</h1>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Esta página centraliza os canais públicos usados nas submissões da App Store e do Google Play.
              Aqui o usuário encontra suporte, privacidade, termos legais e o caminho oficial de exclusão de conta.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {SUPPORT_CHANNELS.map(({ icon: Icon, title, value, href, description }) => (
              <a
                key={title}
                href={href}
                target={href.startsWith('/') ? undefined : '_blank'}
                rel={href.startsWith('/') ? undefined : 'noopener noreferrer'}
                className="rounded-3xl border border-white/10 bg-black/20 p-5 transition-colors hover:bg-black/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <Icon size={18} className="text-white/80" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold">{title}</h2>
                    <p className="truncate text-sm text-amber-300">{value}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/65">{description}</p>
              </a>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <a
              href="/politica-privacidade"
              className="rounded-3xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Política de privacidade</h2>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Explica dados coletados, finalidades, retenção, canais de privacidade e exclusão de conta.
                  </p>
                </div>
                <ExternalLink size={18} className="text-white/40" />
              </div>
            </a>

            <a
              href="/termos-de-uso"
              className="rounded-3xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Termos de uso</h2>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Cobre regras de acesso, responsabilidades, assinatura, cancelamento e limites do serviço.
                  </p>
                </div>
                <ExternalLink size={18} className="text-white/40" />
              </div>
            </a>
          </div>

          <div className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-start gap-3">
              <LifeBuoy size={18} className="mt-1 text-emerald-300" />
              <div>
                <h2 className="text-lg font-semibold text-emerald-200">Caminho de exclusão dentro do app</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  O mesmo fluxo também pode ser iniciado no aplicativo em <strong>Menu da conta → Excluir conta</strong> ou em
                  <strong> Configurações → Minha Conta → Solicitar exclusão</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
