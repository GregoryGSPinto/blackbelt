// ============================================================
// VisualTemaSection — Personalização visual e tema
// ============================================================

import { Palette, Moon, Sun } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

interface VisualTemaSectionProps {
  tema: string;
  setTema: (v: string) => void;
}

const THEMES = [
  { id: 'escuro', label: 'Escuro', icon: Moon },
  { id: 'claro',  label: 'Claro',  icon: Sun },
];

export function VisualTemaSection({ tema, setTema }: VisualTemaSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Palette}
        title="Visual / Tema"
        subtitle="Personalize a aparência da plataforma"
      />

      <div>
        <h3 className="font-bold text-lg mb-3">Tema</h3>
        <div className="grid grid-cols-2 gap-4">
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTema(t.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  tema === t.id
                    ? 'border-white bg-white/10 scale-105'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <Icon size={32} className="mx-auto mb-3" />
                <p className="font-bold">{t.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
