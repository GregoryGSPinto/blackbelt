// ============================================================
// ConfiguracoesContent — Orquestrador de abas e estado
// ============================================================
// Gerencia navegação entre seções e distribui estado para
// cada componente-seção via props tipadas.
// ============================================================

'use client';

import { useState, Suspense } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Tab, QualidadeId } from './configuracoes.types';
import { TABS, DEFAULT_CONFIG } from './configuracoes.types';
import { SkeletonLoader } from './SkeletonLoader';
import { DispositivosSection } from './DispositivosSection';
import { ReproducaoSection } from './ReproducaoSection';
import { ModoAmbienteSection } from './ModoAmbienteSection';
import { MinhaContaSection } from './MinhaContaSection';
import { AcessibilidadeSection } from './AcessibilidadeSection';
import { VisualTemaSection } from './VisualTemaSection';
import { IdiomaSection } from './IdiomaSection';
import { PreferenciasSection } from './PreferenciasSection';
import { StudentExtraSections } from './StudentExtraSections';
import { EditarDadosSection } from './EditarDadosSection';
import { AlterarSenhaSection } from './AlterarSenhaSection';
import { AvatarUploadSection } from './AvatarUploadSection';
import { LegalSection } from './LegalSection';
import { SuporteSection } from './SuporteSection';
import { SobreSection } from './SobreSection';
import { NotificationPreferences } from '@/components/shared/NotificationPreferences';

// ── Error Fallback ────────────────────────────────────────────

function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <AlertCircle size={24} className="text-red-400" />
        <h3 className="font-bold text-red-400">Erro ao carregar configurações</h3>
      </div>
      <p className="text-sm text-white/70 mb-4">{error.message}</p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  );
}

// ── Active Tab Content ────────────────────────────────────────

function ActiveSection({
  tab,
  legendas, setLegendas,
  autoplay, setAutoplay,
  qualidade, setQualidade,
  tema, setTema,
  idioma, setIdioma,
  volume, setVolume,
  downloadWifiOnly, setDownloadWifiOnly,
  modoAmbiente, setModoAmbiente,
  telaAtiva, setTelaAtiva,
  altoContrasteAmbiental, setAltoContrasteAmbiental,
}: {
  tab: Tab;
  legendas: boolean; setLegendas: (v: boolean) => void;
  autoplay: boolean; setAutoplay: (v: boolean) => void;
  qualidade: QualidadeId; setQualidade: (v: QualidadeId) => void;
  tema: string; setTema: (v: string) => void;
  idioma: string; setIdioma: (v: string) => void;
  volume: number; setVolume: (v: number) => void;
  downloadWifiOnly: boolean; setDownloadWifiOnly: (v: boolean) => void;
  modoAmbiente: boolean; setModoAmbiente: (v: boolean) => void;
  telaAtiva: boolean; setTelaAtiva: (v: boolean) => void;
  altoContrasteAmbiental: boolean; setAltoContrasteAmbiental: (v: boolean) => void;
}) {
  switch (tab) {
    case 'dados':
      return <EditarDadosSection />;
    case 'avatar':
      return <AvatarUploadSection />;
    case 'senha':
      return <AlterarSenhaSection />;
    case 'dispositivos':
      return <DispositivosSection />;
    case 'reproducao':
      return (
        <ReproducaoSection
          qualidade={qualidade} setQualidade={setQualidade}
          downloadWifiOnly={downloadWifiOnly} setDownloadWifiOnly={setDownloadWifiOnly}
        />
      );
    case 'ambiente':
      return (
        <ModoAmbienteSection
          modoAmbiente={modoAmbiente} setModoAmbiente={setModoAmbiente}
          telaAtiva={telaAtiva} setTelaAtiva={setTelaAtiva}
          altoContrasteAmbiental={altoContrasteAmbiental} setAltoContrasteAmbiental={setAltoContrasteAmbiental}
        />
      );
    case 'membro':
      return <MinhaContaSection />;
    case 'acessibilidade':
      return <AcessibilidadeSection legendas={legendas} setLegendas={setLegendas} />;
    case 'visual':
      return <VisualTemaSection tema={tema} setTema={setTema} />;
    case 'idioma':
      return <IdiomaSection idioma={idioma} setIdioma={setIdioma} />;
    case 'preferencias':
      return (
        <PreferenciasSection
          autoplay={autoplay} setAutoplay={setAutoplay}
          volume={volume} setVolume={setVolume}
        />
      );
    case 'notificacoes':
      return <NotificationPreferences />;
    case 'legal':
      return <LegalSection />;
    case 'suporte':
      return <SuporteSection />;
    case 'sobre':
      return <SobreSection />;
    default:
      return null;
  }
}

// ── Main Content ──────────────────────────────────────────────

export function ConfiguracoesContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dados');
  const [isLoading, setIsLoading] = useState(false);

  // Estado de configuração
  const [legendas, setLegendas] = useState(DEFAULT_CONFIG.legendas);
  const [autoplay, setAutoplay] = useState(DEFAULT_CONFIG.autoplay);
  const [qualidade, setQualidade] = useState<QualidadeId>(DEFAULT_CONFIG.qualidade);
  const [tema, setTema] = useState(DEFAULT_CONFIG.tema);
  const [idioma, setIdioma] = useState(DEFAULT_CONFIG.idioma);
  const [volume, setVolume] = useState(DEFAULT_CONFIG.volume);
  const [downloadWifiOnly, setDownloadWifiOnly] = useState(DEFAULT_CONFIG.downloadWifiOnly);
  const [modoAmbiente, setModoAmbiente] = useState(DEFAULT_CONFIG.modoAmbiente);
  const [telaAtiva, setTelaAtiva] = useState(DEFAULT_CONFIG.telaAtiva);
  const [altoContrasteAmbiental, setAltoContrasteAmbiental] = useState(DEFAULT_CONFIG.altoContrasteAmbiental);

  const handleTabChange = (tabId: Tab) => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2">Configurações</h1>
          <p className="text-white/40">Personalize sua experiência no BlackBelt</p>
        </div>

        {/* Layout de Abas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Tabs Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg shadow-white/10'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:scale-[1.02]'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-4">
            <Suspense fallback={<SkeletonLoader />}>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 min-h-[600px]">
                {isLoading ? (
                  <SkeletonLoader />
                ) : (
                  <ActiveSection
                    tab={activeTab}
                    legendas={legendas} setLegendas={setLegendas}
                    autoplay={autoplay} setAutoplay={setAutoplay}
                    qualidade={qualidade} setQualidade={setQualidade}
                    tema={tema} setTema={setTema}
                    idioma={idioma} setIdioma={setIdioma}
                    volume={volume} setVolume={setVolume}
                    downloadWifiOnly={downloadWifiOnly} setDownloadWifiOnly={setDownloadWifiOnly}
                    modoAmbiente={modoAmbiente} setModoAmbiente={setModoAmbiente}
                    telaAtiva={telaAtiva} setTelaAtiva={setTelaAtiva}
                    altoContrasteAmbiental={altoContrasteAmbiental} setAltoContrasteAmbiental={setAltoContrasteAmbiental}
                  />
                )}
              </div>
            </Suspense>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <StudentExtraSections />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
