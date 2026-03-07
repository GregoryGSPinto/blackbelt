// ============================================================
// AcessibilidadeSection — Recursos de acessibilidade
// ============================================================

import { Eye } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { ToggleSwitch } from './ToggleSwitch';

interface AcessibilidadeSectionProps {
  legendas: boolean;
  setLegendas: (v: boolean) => void;
}

const KEYBOARD_SHORTCUTS = [
  { key: 'Espaço', action: 'Play/Pause' },
  { key: '←/→',    action: 'Avançar/Voltar 10s' },
  { key: 'F',      action: 'Tela cheia' },
  { key: 'M',      action: 'Mudo' },
];

export function AcessibilidadeSection({ legendas, setLegendas }: AcessibilidadeSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Eye}
        title="Acessibilidade"
        subtitle="Recursos para melhorar sua experiência"
      />

      {/* Legendas */}
      <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
        <div>
          <h3 className="font-semibold text-lg mb-1">Legendas Automáticas</h3>
          <p className="text-sm text-white/40">Ativar legendas em português por padrão</p>
        </div>
        <ToggleSwitch
          enabled={legendas}
          onToggle={() => setLegendas(!legendas)}
        />
      </div>

      {/* Navegação por Teclado */}
      <div className="p-5 bg-white/5 rounded-xl border border-white/10">
        <h3 className="font-semibold text-lg mb-3">Navegação por Teclado</h3>
        <div className="space-y-2">
          {KEYBOARD_SHORTCUTS.map((shortcut) => (
            <p key={shortcut.key} className="text-sm text-white/55">
              • <kbd className="px-2 py-1 bg-white/10 rounded font-mono">{shortcut.key}</kbd> - {shortcut.action}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
