'use client';

import { useState } from 'react';
import { X, Target, ChevronRight, AlertTriangle } from 'lucide-react';
import { adultSizeGuide, kidsSizeGuide, technicalMeasurements, suggestSize } from '@/lib/api/shop.service';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize?: (size: string) => void;
  isKids?: boolean;
}

export function SizeGuideModal({ isOpen, onClose, onSelectSize, isKids = false }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'visual' | 'technical'>('quick');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [suggestedSize, setSuggestedSize] = useState<string | null>(null);
  const [accordionOpen, setAccordionOpen] = useState<string | null>(null);

  if (!isOpen) return null;

  const sizeGuide = isKids ? kidsSizeGuide : adultSizeGuide;

  const handleSuggest = () => {
    const h = parseInt(height);
    const w = parseInt(weight);
    const suggested = suggestSize(h, w, isKids);
    setSuggestedSize(suggested);
  };

  const handleSelectAndClose = () => {
    if (suggestedSize && onSelectSize) {
      onSelectSize(suggestedSize);
    }
    onClose();
  };

  const tabs = [
    { id: 'quick' as const, label: 'Tabela Rápida' },
    { id: 'visual' as const, label: 'Visual' },
    { id: 'technical' as const, label: 'Medidas Técnicas' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/90 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-dark-card rounded-xl max-w-[calc(100%-1rem)] sm:max-w-2xl md:max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-dark-card border-b border-dark-elevated p-4 md:p-6 flex items-center justify-between z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Guia de Medidas {isKids && '- Kids'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-dark-elevated px-4 md:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 font-semibold text-sm transition-colors relative
                  ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-white/40 hover:text-white'
                  }
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            {/* TAB 1: Tabela Rápida */}
            {activeTab === 'quick' && (
              <div className="space-y-6">
                {/* Sugestão Personalizada */}
                <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="text-primary" size={24} />
                    <div>
                      <h3 className="font-bold text-white">SUGESTÃO PERSONALIZADA</h3>
                      <p className="text-sm text-white/40">
                        {isKids
                          ? 'Informe as medidas do seu filho'
                          : 'Informe suas medidas e descubra seu tamanho'}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-white/55 mb-2">
                        {isKids ? 'Idade (anos)' : 'Altura (cm)'}
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder={isKids ? 'Ex: 8' : 'Ex: 178'}
                        min={isKids ? 4 : 140}
                        max={isKids ? 14 : 220}
                        className="w-full h-12 bg-dark-bg border-2 border-dark-surface rounded-lg px-4 text-white focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/55 mb-2">
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Ex: 82"
                        min={isKids ? 15 : 40}
                        max={150}
                        className="w-full h-12 bg-dark-bg border-2 border-dark-surface rounded-lg px-4 text-white focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSuggest}
                    disabled={!height || !weight}
                    className="w-full h-12 bg-primary hover:bg-primary-dark disabled:bg-dark-surface disabled:text-white/35 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                  >
                    ✔️ Sugerir Tamanho Ideal
                  </button>

                  {/* Resultado */}
                  {suggestedSize && (
                    <div className="mt-4 bg-green-500/10 border-2 border-green-500 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Target className="text-green-400 flex-shrink-0" size={24} />
                        <div className="flex-1">
                          <p className="font-bold text-lg text-white mb-1">
                            Para você{isKids && ' (seu filho)'}, recomendamos o tamanho{' '}
                            <span className="text-green-400">{suggestedSize}</span>
                          </p>
                          <p className="text-sm text-white/40">
                            📊 Baseado em: Altura {height}cm, Peso {weight}kg
                          </p>
                        </div>
                      </div>
                      {onSelectSize && (
                        <button
                          onClick={handleSelectAndClose}
                          className="w-full mt-4 h-11 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                        >
                          Selecionar {suggestedSize} e Fechar
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Tabela */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    ENCONTRE SEU TAMANHO IDEAL
                  </h3>
                  <p className="text-sm text-white/40 mb-4">
                    Descubra o tamanho perfeito em segundos
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-primary/20">
                          <th className="p-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wide">
                            Tamanho
                          </th>
                          <th className="p-4 text-center text-sm font-semibold text-white/70 uppercase tracking-wide">
                            Altura (cm)
                          </th>
                          <th className="p-4 text-center text-sm font-semibold text-white/70 uppercase tracking-wide">
                            Peso (kg)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeGuide.map((item, index) => (
                          <tr
                            key={item.size}
                            className="border-b border-white/5 hover:bg-primary/10 transition-colors"
                          >
                            <td className="p-4 font-bold text-primary text-center">
                              {item.size}
                            </td>
                            <td className="p-4 text-center text-white/55">{item.height}</td>
                            <td className="p-4 text-center text-white/55">{item.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex items-start gap-2 bg-blue-500/10 border-l-3 border-blue-500 p-3 rounded">
                    <span className="text-xl">💡</span>
                    <p className="text-sm text-white/55">
                      <strong>Dica:</strong> Em caso de dúvida entre dois tamanhos, escolha o
                      maior.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Visual de Referência */}
            {activeTab === 'visual' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">REFERÊNCIA VISUAL</h3>
                  <p className="text-sm text-white/40 mb-6">Veja como o produto veste</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Imagem */}
                  <div className="flex-shrink-0">
                    <div className="w-64 h-96 bg-dark-elevated rounded-lg overflow-hidden shadow-lg">
                      <img
                        src="https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=600&fit=crop"
                        alt="Modelo usando produto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <p className="text-xl font-bold text-white">Modelo veste tamanho A2</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <span className="text-white/55">
                          <strong>Altura:</strong> 178 cm
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⚖️</span>
                        <span className="text-white/55">
                          <strong>Peso:</strong> 82 kg
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥋</span>
                        <span className="text-white/55">
                          <strong>Graduação:</strong> Nível Intermediário
                        </span>
                      </div>
                    </div>

                    {/* Depoimento */}
                    <div className="bg-primary/10 border-l-3 border-primary p-4 rounded italic">
                      <p className="text-sm text-white/55">
                        "O caimento é perfeito, nem apertado nem folgado. Recomendo!"
                      </p>
                      <p className="text-xs text-white/40 mt-2">
                        - Rafael Silva, Nível Intermediário
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Medidas Técnicas */}
            {activeTab === 'technical' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">MEDIDAS DETALHADAS</h3>
                  <p className="text-sm text-white/40 mb-6">
                    Para quem precisa de precisão máxima
                  </p>
                </div>

                {/* Accordion 1: Medidas da Casaca */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setAccordionOpen(accordionOpen === 'jacket' ? null : 'jacket')
                    }
                    className="w-full p-4 flex items-center justify-between bg-dark-bg/50 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-semibold text-white">Medidas da Casaca</span>
                    <ChevronRight
                      className={`transition-transform ${
                        accordionOpen === 'jacket' ? 'rotate-90' : ''
                      }`}
                      size={20}
                    />
                  </button>
                  {accordionOpen === 'jacket' && (
                    <div className="p-4 bg-dark-bg/80">
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-dark-surface">
                              <th className="p-2 text-left text-sm text-white/40">Tamanho</th>
                              <th className="p-2 text-center text-sm text-white/40">
                                Comprimento
                              </th>
                              <th className="p-2 text-center text-sm text-white/40">Manga</th>
                              <th className="p-2 text-center text-sm text-white/40">
                                Ombro a Ombro
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {technicalMeasurements.map((m) => (
                              <tr key={m.size} className="border-b border-dark-elevated">
                                <td className="p-2 font-bold text-primary">{m.size}</td>
                                <td className="p-2 text-center text-white/55">{m.length}</td>
                                <td className="p-2 text-center text-white/55">{m.sleeve}</td>
                                <td className="p-2 text-center text-white/55">{m.shoulder}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-sm text-white/40">
                        <p className="font-semibold mb-2">📐 Como medir:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Comprimento: Do ombro até a barra</li>
                          <li>Manga: Do ombro até o punho</li>
                          <li>Ombro a Ombro: Largura entre as costuras</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Medidas da Calça */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setAccordionOpen(accordionOpen === 'pants' ? null : 'pants')
                    }
                    className="w-full p-4 flex items-center justify-between bg-dark-bg/50 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-semibold text-white">Medidas da Calça</span>
                    <ChevronRight
                      className={`transition-transform ${
                        accordionOpen === 'pants' ? 'rotate-90' : ''
                      }`}
                      size={20}
                    />
                  </button>
                  {accordionOpen === 'pants' && (
                    <div className="p-4 bg-dark-bg/80">
                      <p className="text-sm text-white/40">
                        Medidas detalhadas da calça (comprimento, cintura, gancho) seguem o
                        mesmo padrão da casaca.
                      </p>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Encolhimento */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setAccordionOpen(accordionOpen === 'shrink' ? null : 'shrink')
                    }
                    className="w-full p-4 flex items-center justify-between bg-dark-bg/50 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-semibold text-white">
                      Encolhimento após Lavagem
                    </span>
                    <ChevronRight
                      className={`transition-transform ${
                        accordionOpen === 'shrink' ? 'rotate-90' : ''
                      }`}
                      size={20}
                    />
                  </button>
                  {accordionOpen === 'shrink' && (
                    <div className="p-4 bg-dark-bg/80 space-y-4">
                      <p className="text-sm text-white/55">
                        O uniforme pode encolher após as primeiras lavagens.
                      </p>

                      <div>
                        <p className="font-semibold text-white mb-2">
                          Encolhimento Esperado:
                        </p>
                        <ul className="space-y-1 text-sm text-white/40 list-disc list-inside">
                          <li>Comprimento da casaca: -2 a -3 cm</li>
                          <li>Comprimento da manga: -1 a -2 cm</li>
                          <li>Comprimento da calça: -2 a -3 cm</li>
                        </ul>
                      </div>

                      <div className="bg-blue-500/10 border-l-3 border-blue-500 p-3 rounded">
                        <p className="text-sm text-white/55">
                          <strong>💡 Recomendação:</strong> Se está entre dois tamanhos,
                          escolha o maior para compensar o encolhimento natural.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-white mb-2">🧼 Cuidados:</p>
                        <ul className="space-y-1 text-sm text-white/40 list-disc list-inside">
                          <li>Lavar em água fria (máx 30°C)</li>
                          <li>Secar à sombra</li>
                          <li>Não usar secadora</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer com aviso */}
          <div className="border-t border-dark-elevated p-4 md:p-6">
            <div className="flex items-start gap-3 bg-amber-500/10 border-l-3 border-amber-500 p-3 rounded">
              <AlertTriangle className="text-amber-400 flex-shrink-0" size={20} />
              <p className="text-sm text-amber-200">
                As medidas podem variar de acordo com o modelo e lavagem do produto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
