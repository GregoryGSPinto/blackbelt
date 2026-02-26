// ============================================================
// ModoAmbienteSection — Otimizações para treino físico
// ============================================================

import { Zap } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { ToggleSwitch } from './ToggleSwitch';

interface ModoAmbienteSectionProps {
  modoAmbiente: boolean;
  setModoAmbiente: (v: boolean) => void;
  telaAtiva: boolean;
  setTelaAtiva: (v: boolean) => void;
  altoContrasteAmbiental: boolean;
  setAltoContrasteAmbiental: (v: boolean) => void;
}

export function ModoAmbienteSection({
  modoAmbiente,
  setModoAmbiente,
  telaAtiva,
  setTelaAtiva,
  altoContrasteAmbiental,
  setAltoContrasteAmbiental,
}: ModoAmbienteSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Zap}
        iconClassName="text-yellow-400"
        title="Modo Ambiente"
        subtitle="Otimizações para treino físico"
      />

      {/* Ativação principal */}
      <div className="p-6 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border-2 border-yellow-600/30 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={32} className="text-yellow-400" />
          <h3 className="text-xl font-black">Modo Ativado para Treino</h3>
        </div>
        <p className="text-sm text-white/55 mb-4">
          Ative o Modo Ambiente para uma experiência otimizada durante o treino físico.
        </p>
        <button
          onClick={() => setModoAmbiente(!modoAmbiente)}
          className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${
            modoAmbiente
              ? 'bg-yellow-500 text-black hover:bg-yellow-400'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {modoAmbiente ? 'Modo Ambiente Ativado ⚡' : 'Ativar Modo Ambiente'}
        </button>
      </div>

      {/* Manter Tela Ativa */}
      <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
        <div>
          <h3 className="font-bold text-lg mb-1">Manter tela ativa</h3>
          <p className="text-sm text-white/40">Evita que a tela desligue durante o treino</p>
        </div>
        <ToggleSwitch
          enabled={telaAtiva}
          onToggle={() => setTelaAtiva(!telaAtiva)}
        />
      </div>

      {/* Alto Contraste Ambiental */}
      <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
        <div>
          <h3 className="font-bold text-lg mb-1">Ajuste de contraste</h3>
          <p className="text-sm text-white/40">Melhora visibilidade em ambientes claros</p>
        </div>
        <ToggleSwitch
          enabled={altoContrasteAmbiental}
          onToggle={() => setAltoContrasteAmbiental(!altoContrasteAmbiental)}
        />
      </div>

      {/* Botões Ampliados */}
      <div className="p-5 bg-white/5 rounded-xl border border-white/10">
        <h3 className="font-bold text-lg mb-3">Área de toque ampliada</h3>
        <p className="text-sm text-white/40 mb-4">
          No Modo Ambiente, todos os botões ficam maiores para facilitar o uso durante o treino.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button className="py-6 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-lg transition-colors">
            Play ▶️
          </button>
          <button className="py-6 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-lg transition-colors">
            Pause ⏸️
          </button>
        </div>
      </div>
    </div>
  );
}
