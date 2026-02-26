'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, User, MessageSquare, Filter } from 'lucide-react';

/* ─── Mock: lista completa de treinos ─── */
const TODOS_TREINOS = [
  { id: '01', data: '13/02/2026', hora: '18:00', tipo: 'Avançado',     instrutor: 'Prof. Ricardo', duracao: '90 min', obs: 'Trabalho de raspagem da guarda-aranha.' },
  { id: '02', data: '12/02/2026', hora: '18:00', tipo: 'Iniciante',    instrutor: 'Prof. Ricardo', duracao: '60 min', obs: '' },
  { id: '03', data: '11/02/2026', hora: '19:30', tipo: 'Competição',   instrutor: 'Prof. Marcos',  duracao: '90 min', obs: 'Simulação de luta com rounds de 6 min.' },
  { id: '04', data: '10/02/2026', hora: '06:30', tipo: 'Fundamentos',  instrutor: 'Prof. Ricardo', duracao: '60 min', obs: '' },
  { id: '05', data: '07/02/2026', hora: '18:00', tipo: 'Avançado',     instrutor: 'Prof. Ricardo', duracao: '90 min', obs: 'Passagem de guarda com pressão.' },
  { id: '06', data: '06/02/2026', hora: '19:30', tipo: 'No-Gi',        instrutor: 'Prof. Marcos',  duracao: '90 min', obs: '' },
  { id: '07', data: '05/02/2026', hora: '18:00', tipo: 'Iniciante',    instrutor: 'Prof. Ricardo', duracao: '60 min', obs: 'Revisão de posições básicas.' },
  { id: '08', data: '04/02/2026', hora: '06:30', tipo: 'Fundamentos',  instrutor: 'Prof. Ricardo', duracao: '60 min', obs: '' },
  { id: '09', data: '03/02/2026', hora: '18:00', tipo: 'Avançado',     instrutor: 'Prof. Ricardo', duracao: '90 min', obs: 'Drill de leg-lock e defesas.' },
  { id: '10', data: '31/01/2026', hora: '18:00', tipo: 'Avançado',     instrutor: 'Prof. Ricardo', duracao: '90 min', obs: '' },
  { id: '11', data: '30/01/2026', hora: '19:30', tipo: 'Competição',   instrutor: 'Prof. Marcos',  duracao: '90 min', obs: 'Treino preparatório para estadual.' },
  { id: '12', data: '29/01/2026', hora: '06:30', tipo: 'Fundamentos',  instrutor: 'Prof. Ricardo', duracao: '60 min', obs: '' },
  { id: '13', data: '28/01/2026', hora: '18:00', tipo: 'Iniciante',    instrutor: 'Prof. Ricardo', duracao: '60 min', obs: '' },
  { id: '14', data: '27/01/2026', hora: '18:00', tipo: 'No-Gi',        instrutor: 'Prof. Marcos',  duracao: '90 min', obs: 'Guillotine e anaconda drill.' },
  { id: '15', data: '24/01/2026', hora: '18:00', tipo: 'Avançado',     instrutor: 'Prof. Ricardo', duracao: '90 min', obs: '' },
  { id: '16', data: '23/01/2026', hora: '19:30', tipo: 'Competição',   instrutor: 'Prof. Marcos',  duracao: '90 min', obs: '' },
  { id: '17', data: '22/01/2026', hora: '06:30', tipo: 'Fundamentos',  instrutor: 'Prof. Ricardo', duracao: '60 min', obs: 'Montada e transições.' },
  { id: '18', data: '21/01/2026', hora: '18:00', tipo: 'Avançado',     instrutor: 'Prof. Ricardo', duracao: '90 min', obs: '' },
  { id: '19', data: '20/01/2026', hora: '18:00', tipo: 'Iniciante',    instrutor: 'Prof. Ricardo', duracao: '60 min', obs: '' },
  { id: '20', data: '17/01/2026', hora: '10:00', tipo: 'Open Mat',     instrutor: '—',             duracao: '120 min', obs: 'Treino livre sábado.' },
];

const TIPOS = ['Todos', 'Fundamentos', 'Iniciante', 'Avançado', 'Competição', 'No-Gi', 'Open Mat'];

function tipoColor(tipo: string) {
  switch (tipo) {
    case 'Fundamentos': return 'bg-blue-500/15 text-blue-400';
    case 'Iniciante':   return 'bg-emerald-500/15 text-emerald-400';
    case 'Avançado':    return 'bg-amber-500/15 text-amber-400';
    case 'Competição':  return 'bg-red-500/15 text-red-400';
    case 'No-Gi':       return 'bg-purple-500/15 text-purple-400';
    case 'Open Mat':    return 'bg-cyan-500/15 text-cyan-400';
    default:            return 'bg-white/5 text-white/50';
  }
}

function tipoBorderColor(tipo: string) {
  switch (tipo) {
    case 'Fundamentos': return 'border-blue-500/20';
    case 'Iniciante':   return 'border-emerald-500/20';
    case 'Avançado':    return 'border-amber-500/20';
    case 'Competição':  return 'border-red-500/20';
    case 'No-Gi':       return 'border-purple-500/20';
    case 'Open Mat':    return 'border-cyan-500/20';
    default:            return 'border-white/5';
  }
}

export default function HistoricoDetalhes() {
  const router = useRouter();
  const [filtro, setFiltro] = useState('Todos');

  const filtered = filtro === 'Todos'
    ? TODOS_TREINOS
    : TODOS_TREINOS.filter(t => t.tipo === filtro);

  // Group by month
  const grouped = filtered.reduce<Record<string, typeof TODOS_TREINOS>>((acc, t) => {
    const [, m, y] = t.data.split('/');
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const key = `${meses[parseInt(m) - 1]} ${y}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/historico')}
            className="flex items-center gap-2 text-sm mb-4 transition-colors"
            style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}
          >
            <ArrowLeft size={16} /> Voltar ao resumo
          </button>
          <h1 className="text-3xl font-black mb-2" style={{ color: 'rgb(var(--color-text))' }}>
            Todos os Treinos
          </h1>
          <p style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
            {filtered.length} {filtered.length === 1 ? 'treino registrado' : 'treinos registrados'}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <Filter size={14} className="flex-shrink-0" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }} />
          {TIPOS.map(t => (
            <button
              key={t}
              onClick={() => setFiltro(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filtro === t
                  ? (t === 'Todos' ? 'bg-white/10 text-white' : tipoColor(t))
                  : ''
              }`}
              style={filtro !== t ? { color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' } : undefined}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grouped list */}
        {Object.entries(grouped).map(([month, treinos]) => (
          <section key={month}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
              {month}
            </h2>
            <div className="space-y-3">
              {treinos.map(t => (
                <div
                  key={t.id}
                  className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-5 ${tipoBorderColor(t.tipo)}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Date block */}
                    <div className="w-14 text-center flex-shrink-0 pt-0.5">
                      <p className="text-2xl font-black" style={{ color: 'rgb(var(--color-text))' }}>
                        {t.data.split('/')[0]}
                      </p>
                      <p className="text-[10px] uppercase" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
                        {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(t.data.split('/')[1]) - 1]}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${tipoColor(t.tipo)}`}>{t.tipo}</span>
                        <span className="text-xs" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>{t.duracao}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
                          <Clock size={12} /> {t.hora}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
                          <User size={12} /> {t.instrutor}
                        </span>
                      </div>

                      {t.obs && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgb(var(--color-text-subtle) / 0.04)' }}>
                          <MessageSquare size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }} />
                          <p className="text-xs leading-relaxed" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>{t.obs}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
