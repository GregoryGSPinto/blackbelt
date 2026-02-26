// ============================================================
// SobreSection — Versão do app, créditos, informações
// ============================================================
'use client';

import { Smartphone, Code2, Heart } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '2026.02.001';

export function SobreSection() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Sobre o App" subtitle="Informações do aplicativo" />

      {/* App identity */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(220,38,38,0.2), rgba(220,38,38,0.05))',
            border: '1px solid rgba(220,38,38,0.15)',
          }}
        >
          <span className="text-4xl">🥋</span>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white">BlackBelt</h3>
          <p className="text-xs text-white/30">Plataforma de Gestão</p>
        </div>
      </div>

      {/* Version info */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
        <InfoRow icon={Smartphone} label="Versão" value={`v${APP_VERSION}`} />
        <InfoRow icon={Code2} label="Build" value={BUILD_NUMBER} />
        <InfoRow icon={Heart} label="Plataforma" value="Next.js + React Native" />
      </div>

      {/* Credits */}
      <div className="text-center space-y-2 pt-2">
        <p className="text-xs text-white/30">
          Desenvolvido com 💛 para a comunidada BlackBelt
        </p>
        <p className="text-[10px] text-white/15">
          © 2026 BlackBelt. Todos os direitos reservados.
        </p>
        <p className="text-[10px] text-white/10">
          ID do dispositivo: {typeof window !== 'undefined' ? window.navigator.userAgent.slice(-8) : '—'}
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Smartphone; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-white/25" />
        <span className="text-sm text-white/50">{label}</span>
      </div>
      <span className="text-sm font-medium text-white/70">{value}</span>
    </div>
  );
}
