// ============================================================
// DispositivosSection — Gestão de Dispositivos e Sessões
// ============================================================

import {
  Monitor, Smartphone, Tablet, Tv, Laptop,
  MapPin, Clock, LogOut,
} from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { DeviceInfo } from './configuracoes.types';
import { MOCK_DISPOSITIVOS } from './configuracoes.types';

function getDeviceIcon(type: DeviceInfo['type']) {
  switch (type) {
    case 'desktop':    return Laptop;
    case 'smartphone': return Smartphone;
    case 'tablet':     return Tablet;
    case 'tv':         return Tv;
    default:           return Monitor;
  }
}

export function DispositivosSection() {
  const dispositivos = MOCK_DISPOSITIVOS;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon={Monitor}
        title="Dispositivos e Sessões"
        subtitle="Gerencie onde você está conectado"
      />

      {/* Lista de dispositivos */}
      <div className="space-y-4">
        {dispositivos.map((device) => {
          const DeviceIcon = getDeviceIcon(device.type);
          return (
            <div
              key={device.id}
              className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                device.isCurrent
                  ? 'bg-blue-600/10 border-blue-600/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DeviceIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {device.name}
                      {device.isCurrent && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">ATUAL</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-white/40 mb-1">
                      <MapPin size={14} />
                      <span>{device.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/40">
                      <Clock size={14} />
                      <span>Última atividade: {device.lastActive}</span>
                    </div>
                  </div>
                </div>
                {!device.isCurrent && (
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-red-400 text-sm font-medium transition-colors">
                    Encerrar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Encerrar todas as sessões */}
      <button className="w-full py-4 bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600/30 rounded-xl text-red-400 font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2">
        <LogOut size={20} />
        Encerrar sessão em outros dispositivos
      </button>

      {/* Info box */}
      <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl">
        <p className="text-sm text-blue-300">
          ℹ️ Por segurança, recomendamos encerrar sessões em dispositivos que você não reconhece.
        </p>
      </div>
    </div>
  );
}
