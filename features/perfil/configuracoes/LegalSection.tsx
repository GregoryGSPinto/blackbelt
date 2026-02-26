// ============================================================
// LegalSection — Termos de Uso, Política de Privacidade, LGPD
// ============================================================
'use client';

import { FileText, Shield, Scale, ExternalLink } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const LEGAL_LINKS = [
  {
    icon: FileText,
    label: 'Termos de Uso',
    description: 'Regras de utilização da plataforma',
    href: '/termos-de-uso.html',
  },
  {
    icon: Shield,
    label: 'Política de Privacidade',
    description: 'Como coletamos e protegemos seus dados',
    href: '/politica-privacidade.html',
  },
  {
    icon: Scale,
    label: 'Consentimentos LGPD',
    description: 'Gerencie seus consentimentos de dados',
    href: '/assinatura',
    internal: true,
  },
];

export function LegalSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Termos e Políticas" subtitle="Documentos legais e direitos de dados" />

      <div className="space-y-2">
        {LEGAL_LINKS.map((item) => {
          const Icon = item.icon;
          const Tag = item.internal ? 'a' : 'a';
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.internal ? undefined : '_blank'}
              rel={item.internal ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]
                         hover:bg-white/[0.06] transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Icon size={18} className="text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80">{item.label}</p>
                <p className="text-xs text-white/30 mt-0.5">{item.description}</p>
              </div>
              <ExternalLink size={14} className="text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0" />
            </a>
          );
        })}
      </div>

      <p className="text-[10px] text-white/15 text-center mt-4">
        Última atualização dos termos: Janeiro 2026
      </p>
    </div>
  );
}
