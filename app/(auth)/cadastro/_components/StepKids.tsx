'use client';

import { useState } from 'react';
import { Users, CheckCircle, ChevronRight, X } from 'lucide-react';
import { ErrorAlert } from './ErrorAlert';
import { calcIdade } from './utils';
import type { DadosKid, Sexo, StepBaseProps } from './types';

interface StepKidsProps extends StepBaseProps {
  kids: DadosKid[];
  onAddKid: (kid: DadosKid) => string | null;
  onRemoveKid: (index: number) => void;
  onContinue: () => void;
}

export function StepKids({ kids, onAddKid, onRemoveKid, onContinue, error, setError }: StepKidsProps) {
  const [querKids, setQuerKids] = useState<boolean | null>(null);
  const [kidAtual, setKidAtual] = useState<DadosKid>({
    nome: '', dataNascimento: '', sexo: 'nao-informar'
  });

  const decidirKids = (sim: boolean) => {
    setQuerKids(sim);
    if (!sim) setError('');
  };

  const handleAddKid = () => {
    const err = onAddKid(kidAtual);
    if (err) { setError(err); return; }
    setKidAtual({ nome: '', dataNascimento: '', sexo: 'nao-informar' });
    setError('');
  };

  const handleContinue = () => {
    if (querKids === null) { setError('Escolha uma opção'); return; }
    if (querKids && kids.length === 0) {
      setError('Adicione pelo menos um filho ou escolha "Não"'); return;
    }
    setError('');
    onContinue();
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl">
        <div className="flex gap-3">
          <Users size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">Deseja adicionar perfis de filhos (Kids)?</p>
            <p className="text-xs text-blue-300/80">Você pode adicionar filhos menores de 12 anos</p>
          </div>
        </div>
      </div>

      {/* Escolha sim/não */}
      {querKids === null && (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => decidirKids(true)}
            className="py-4 px-6 bg-white/10 border-2 border-white/20 rounded-lg hover:bg-white/20 font-medium">
            Sim, adicionar filhos
          </button>
          <button onClick={() => decidirKids(false)}
            className="py-4 px-6 bg-white/10 border-2 border-white/20 rounded-lg hover:bg-white/20 font-medium">
            Não adicionar filhos
          </button>
        </div>
      )}

      {/* Formulário de kids */}
      {querKids === true && (
        <>
          {/* Kids já adicionados */}
          {kids.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Filhos adicionados ({kids.length}):</p>
              {kids.map((k, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {k.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{k.nome}</p>
                    <p className="text-xs text-white/60">{calcIdade(k.dataNascimento)} anos</p>
                  </div>
                  <button onClick={() => onRemoveKid(i)} className="p-2 hover:bg-red-500/20 rounded-lg group">
                    <X size={18} className="text-white/60 group-hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form novo kid */}
          <div className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm font-medium mb-3">
              {kids.length === 0 ? 'Adicionar primeiro filho(a):' : 'Adicionar outro filho(a):'}
            </p>
            <input type="text" value={kidAtual.nome}
              onChange={e => setKidAtual({ ...kidAtual, nome: e.target.value })}
              placeholder="Nome completo"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40" />
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'masculino', label: 'Menino' },
                { value: 'feminino', label: 'Menina' },
                { value: 'nao-informar', label: 'N/I' }
              ] as const).map(o => (
                <button key={o.value} type="button" onClick={() => setKidAtual({ ...kidAtual, sexo: o.value as Sexo })}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    kidAtual.sexo === o.value ? 'border-white bg-white/10 text-white' : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
            <input type="date" value={kidAtual.dataNascimento}
              onChange={e => setKidAtual({ ...kidAtual, dataNascimento: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/40 [color-scheme:dark]" />
            <button onClick={handleAddKid}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 font-medium flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Adicionar à lista
            </button>
          </div>
        </>
      )}

      <ErrorAlert message={error} />

      {querKids !== null && (
        <button onClick={handleContinue}
          className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2">
          Continuar <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
