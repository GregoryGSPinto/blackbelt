// ============================================================
// PreferenciasSection — Autoplay, volume e preferências gerais
// ============================================================

import { Sliders, VolumeX, Volume2, RotateCcw, Bell } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { ToggleSwitch } from './ToggleSwitch';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { NotificationPreferences } from '@/components/shared/NotificationPreferences';

interface PreferenciasSectionProps {
  autoplay: boolean;
  setAutoplay: (v: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
}

export function PreferenciasSection({
  autoplay,
  setAutoplay,
  volume,
  setVolume,
}: PreferenciasSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Sliders}
        title="Preferências"
        subtitle="Ajustes de reprodução e notificações"
      />

      {/* Autoplay */}
      <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
        <div>
          <h3 className="font-semibold text-lg mb-1">Reprodução Automática</h3>
          <p className="text-sm text-white/40">Iniciar próximo vídeo automaticamente</p>
        </div>
        <ToggleSwitch
          enabled={autoplay}
          onToggle={() => setAutoplay(!autoplay)}
        />
      </div>

      {/* Volume Padrão */}
      <div className="p-5 bg-white/5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Volume Padrão</h3>
          <span className="text-lg font-medium">{volume}%</span>
        </div>
        <div className="flex items-center gap-4">
          <VolumeX size={24} className="text-white/40 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <Volume2 size={24} className="flex-shrink-0" />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-5 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={18} className="text-white/50" />
          <div>
            <h3 className="font-semibold text-lg">Notificações</h3>
            <p className="text-sm text-white/40">Escolha o que deseja receber</p>
          </div>
        </div>
        <NotificationPreferences />
      </div>

      {/* Rever Tour */}
      <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
        <div>
          <h3 className="font-semibold text-lg mb-1">Tour Guiado</h3>
          <p className="text-sm text-white/40">Rever o tour de apresentação da plataforma</p>
        </div>
        <ResetTourButton />
      </div>

      {/* Salvar */}
      <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl">
        Salvar Todas as Preferências
      </button>
    </div>
  );
}

function ResetTourButton() {
  const { resetTour, startTour } = useOnboarding();

  const handleReset = () => {
    resetTour('aluno');
    resetTour('instrutor');
    resetTour('responsavel');
    // Auto-start for current profile
    startTour('aluno');
  };

  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
    >
      <RotateCcw size={14} />
      Rever
    </button>
  );
}
