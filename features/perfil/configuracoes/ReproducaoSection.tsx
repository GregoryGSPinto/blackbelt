// ============================================================
// ReproducaoSection — Reprodução e Controle de Dados
// ============================================================

import {
  Activity, CheckCircle, Wifi, WifiOff, HardDrive, Trash2,
} from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { ToggleSwitch } from './ToggleSwitch';
import type { QualidadeId } from './configuracoes.types';
import { QUALIDADE_OPTIONS } from './configuracoes.types';

interface ReproducaoSectionProps {
  qualidade: QualidadeId;
  setQualidade: (v: QualidadeId) => void;
  downloadWifiOnly: boolean;
  setDownloadWifiOnly: (v: boolean) => void;
}

export function ReproducaoSection({
  qualidade,
  setQualidade,
  downloadWifiOnly,
  setDownloadWifiOnly,
}: ReproducaoSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Activity}
        title="Reprodução e Dados"
        subtitle="Controle o consumo de dados e qualidade"
      />

      {/* Qualidade de Streaming */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Qualidade de Streaming</h3>
        <div className="space-y-3">
          {QUALIDADE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setQualidade(option.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                qualidade === option.id
                  ? 'border-white bg-white/10'
                  : 'border-white/20 hover:border-white/40 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">{option.label}</h4>
                  <p className="text-sm text-white/40">{option.desc}</p>
                </div>
                {qualidade === option.id && <CheckCircle size={20} className="text-green-400" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Download via Wi-Fi */}
      <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
        <div className="flex items-start gap-3">
          {downloadWifiOnly
            ? <Wifi size={24} className="text-blue-400 mt-1" />
            : <WifiOff size={24} className="text-white/40 mt-1" />
          }
          <div>
            <h3 className="font-semibold text-lg mb-1">Download apenas via Wi-Fi</h3>
            <p className="text-sm text-white/40">Economize seus dados móveis</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={downloadWifiOnly}
          onToggle={() => setDownloadWifiOnly(!downloadWifiOnly)}
        />
      </div>

      {/* Indicador de Cache */}
      <div className="p-5 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HardDrive size={24} />
            <div>
              <h3 className="font-semibold text-lg">Armazenamento Local</h3>
              <p className="text-sm text-white/40">Cache de vídeos e dados temporários</p>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/40">Espaço utilizado</span>
            <span className="font-medium">2.4 GB de 5 GB</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              style={{ width: '48%' }}
            />
          </div>
        </div>
        <button className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-red-400 font-medium transition-colors flex items-center justify-center gap-2">
          <Trash2 size={18} />
          Limpar Cache
        </button>
      </div>
    </div>
  );
}
