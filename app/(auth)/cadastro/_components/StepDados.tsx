'use client';

import { User, Calendar } from 'lucide-react';
import { ErrorAlert } from './ErrorAlert';
import { calcIdade } from './utils';
import type { DadosUsuario, StepBaseProps } from './types';

interface StepDadosProps extends StepBaseProps {
  dados: DadosUsuario;
  setDados: (d: DadosUsuario) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function StepDados({ dados, setDados, onSubmit, error, setError }: StepDadosProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2.5">Nome Completo *</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={dados.nome}
            onChange={e => setDados({ ...dados, nome: e.target.value })}
            placeholder="Seu nome completo"
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            autoFocus
            autoComplete="name"
            required
            minLength={3}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2.5">
          Data de Nascimento <span className="text-white/50 text-xs">(opcional)</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="date"
            value={dados.dataNascimento}
            onChange={e => { setDados({ ...dados, dataNascimento: e.target.value }); setError(''); }}
            max={new Date().toISOString().split('T')[0]}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/40 [color-scheme:dark]"
          />
        </div>
        {dados.dataNascimento && (
          <p className="text-xs text-white/60 mt-2">Idade: {calcIdade(dados.dataNascimento)} anos</p>
        )}
      </div>

      <ErrorAlert message={error} />
      <button type="submit" className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all">
        Continuar
      </button>
    </form>
  );
}
