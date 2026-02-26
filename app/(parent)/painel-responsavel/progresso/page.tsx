'use client';

import { TrendingUp, Award, BookOpen, Calendar, BarChart3 } from 'lucide-react';
import { useParent } from '@/contexts/ParentContext';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export default function ProgressoPage() {
  const { filhos } = useParent();

  if (filhos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-white/60">Nenhum filho cadastrado.</p>
      </div>
    );
  }

  const mediaPresenca = Math.round(filhos.reduce((acc, f) => acc + f.progresso.presenca30dias, 0) / filhos.length);
  const totalSessões = filhos.reduce((acc, f) => acc + f.progresso.sessõesAssistidas, 0);
  const totalConquistas = filhos.reduce((acc, f) => acc + f.progresso.conquistasConquistadas, 0);
  const totalDesafios = filhos.reduce((acc, f) => acc + f.progresso.desafiosConcluidos, 0);

  return (
    <div className="space-y-8 animate-fade-in px-4 md:px-0">
      {/* Breadcrumb */}
      <Breadcrumb />
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Progresso Geral</h2>
        <p className="text-white/60 text-lg">Acompanhe a evolução de todos os seus filhos</p>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <TrendingUp size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Média de Presença</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{mediaPresenca}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <BookOpen size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total de Sessões</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">{totalSessões}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Award size={24} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total de Conquistas</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">{totalConquistas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Calendar size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Desafios Concluídos</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-400">{totalDesafios}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progresso Individual por Filho */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 size={28} />
          Progresso Individual
        </h3>

        <div className="space-y-6">
          {filhos.map((filho) => (
            <div
              key={filho.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              {/* Header do Filho */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl border-2 border-white/30">
                  {filho.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold">{filho.nome}</h4>
                  <p className="text-sm text-white/60">
                    {filho.categoria === 'teen' ? 'Adolescente' : 'Kids'} • Nível {filho.nivel} • {filho.turma.split(' - ')[0]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">Presença</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">{filho.progresso.presenca30dias}%</p>
                </div>
              </div>

              {/* Barras de Progresso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Presença (30 dias)</span>
                    <span className="text-xs text-white/60">{filho.progresso.presenca30dias}%</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${filho.progresso.presenca30dias}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Desafios</span>
                    <span className="text-xs text-white/60">{filho.progresso.desafiosConcluidos} concluídos</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(filho.progresso.desafiosConcluidos * 5, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-400">{filho.progresso.sessõesAssistidas}</p>
                  <p className="text-xs text-white/60 mt-1">Sessões</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-400">{filho.progresso.conquistasConquistadas}</p>
                  <p className="text-xs text-white/60 mt-1">Conquistas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">{filho.progresso.desafiosConcluidos}</p>
                  <p className="text-xs text-white/60 mt-1">Desafios</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
