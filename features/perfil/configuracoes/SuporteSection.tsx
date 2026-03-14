// ============================================================
// SuporteSection — Suporte, Contato, FAQ
// ============================================================
'use client';

import { Mail, MessageCircle, HelpCircle, ExternalLink, Phone } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const SUPPORT_ITEMS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'suporte@blackbelt.app',
    href: 'mailto:suporte@blackbelt.app',
    color: 'rgba(59,130,246,0.15)',
  },
  {
    icon: MessageCircle,
    label: 'Central de suporte',
    value: 'Abrir página pública de suporte e compliance',
    href: '/suporte',
    color: 'rgba(34,197,94,0.15)',
  },
  {
    icon: Phone,
    label: 'Privacidade',
    value: 'privacidade@blackbelt.app',
    href: 'mailto:privacidade@blackbelt.app',
    color: 'rgba(168,85,247,0.15)',
  },
];

const FAQ_ITEMS = [
  { q: 'Como faço check-in?', a: 'Use o botão verde flutuante na tela inicial ou escaneie o QR Code na recepção.' },
  { q: 'Esqueci minha senha', a: 'Na tela de login, toque em "Esqueci minha senha" e siga as instruções por email.' },
  { q: 'Como alterar meu plano?', a: 'Vá em Configurações → Minha Conta para ver opções de plano.' },
  { q: 'Posso usar offline?', a: 'Check-ins feitos offline são sincronizados automaticamente quando a conexão voltar.' },
];

export function SuporteSection() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Suporte" subtitle="Precisa de ajuda? Estamos aqui." />

      {/* Contact options */}
      <div className="space-y-2">
        {SUPPORT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith('/') ? undefined : '_blank'}
              rel={item.href.startsWith('/') ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]
                         hover:bg-white/[0.06] transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.color }}
              >
                <Icon size={18} className="text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80">{item.label}</p>
                <p className="text-xs text-white/40">{item.value}</p>
              </div>
              <ExternalLink size={14} className="text-white/15 group-hover:text-white/30 transition-colors" />
            </a>
          );
        })}
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle size={14} className="text-white/30" />
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Perguntas Frequentes</p>
        </div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden"
            >
              <summary className="flex items-center justify-between p-3.5 cursor-pointer text-sm text-white/70 hover:text-white/90 transition-colors">
                {item.q}
                <span className="text-white/20 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-3.5 pb-3.5 text-xs text-white/40 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-[10px] text-white/15">
          Horário de atendimento: Seg-Sex 8h-18h
        </p>
      </div>
    </div>
  );
}
