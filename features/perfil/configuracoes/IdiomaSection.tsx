// ============================================================
// IdiomaSection — Seleção de idioma
// ============================================================

import { Globe, CheckCircle } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { IDIOMA_OPTIONS } from './configuracoes.types';

interface IdiomaSectionProps {
  idioma: string;
  setIdioma: (v: string) => void;
}

export function IdiomaSection({ idioma, setIdioma }: IdiomaSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Globe}
        title="Idioma"
        subtitle="Selecione o idioma da plataforma"
      />

      <div className="space-y-3">
        {IDIOMA_OPTIONS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setIdioma(lang.code)}
            className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-200 ${
              idioma === lang.code
                ? 'border-white bg-white/10'
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{lang.flag}</span>
              <span className="font-medium text-lg">{lang.name}</span>
            </div>
            {idioma === lang.code && <CheckCircle size={24} className="text-green-400" />}
          </button>
        ))}
      </div>
    </div>
  );
}
