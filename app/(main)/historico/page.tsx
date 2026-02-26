import {
  Flame, CalendarDays, TrendingUp, Clock, Dumbbell,
  Award, BarChart3,
} from 'lucide-react';
import { VerTudoButton } from './_components/VerTudoButton';

/**
 * Histórico de Treinos — Server Component
 * Dados mock renderizados no servidor. Único ponto interativo (navegação)
 * extraído para Client Component VerTudoButton.
 */

/* ─── Mock data ─── */
const MOCK_STATS = {
  totalTreinos: 147,
  treinosMes: 14,
  streak: 5,
  melhorStreak: 12,
  mediaSemanal: 3.5,
  tempoTotal: '294h',
};

const DIAS_SEMANA = [
  { dia: 'Seg', treinos: 28, ativo: true },
  { dia: 'Ter', treinos: 22, ativo: true },
  { dia: 'Qua', treinos: 30, ativo: true },
  { dia: 'Qui', treinos: 25, ativo: true },
  { dia: 'Sex', treinos: 18, ativo: true },
  { dia: 'Sáb', treinos: 14, ativo: false },
  { dia: 'Dom', treinos: 0, ativo: false },
];
const maxDia = Math.max(...DIAS_SEMANA.map(d => d.treinos));

const ULTIMOS_TREINOS = [
  { id: '1', data: '13/02/2026', hora: '18:00', tipo: 'Avançado', instrutor: 'Prof. Ricardo', duracao: '90 min' },
  { id: '2', data: '12/02/2026', hora: '18:00', tipo: 'Iniciante', instrutor: 'Prof. Ricardo', duracao: '60 min' },
  { id: '3', data: '11/02/2026', hora: '19:30', tipo: 'Competição', instrutor: 'Prof. Marcos', duracao: '90 min' },
  { id: '4', data: '10/02/2026', hora: '06:30', tipo: 'Fundamentos', instrutor: 'Prof. Ricardo', duracao: '60 min' },
  { id: '5', data: '07/02/2026', hora: '18:00', tipo: 'Avançado', instrutor: 'Prof. Ricardo', duracao: '90 min' },
];

// Pre-generated grid (deterministic for SSR)
const SEMANAS_GRID: boolean[][] = [
  [true,false,true,true,false,false,false],
  [true,true,false,true,true,false,false],
  [false,true,true,true,false,true,false],
  [true,false,true,false,true,false,false],
  [true,true,true,true,false,false,false],
  [false,true,false,true,true,false,false],
  [true,true,true,false,true,false,false],
  [true,false,true,true,false,true,false],
  [false,true,true,true,true,false,false],
  [true,true,false,true,false,false,false],
  [true,false,true,true,true,false,false],
  [true,true,true,true,true,false,false],
];

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

export default function HistoricoDashboard() {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2" style={{ color: 'rgb(var(--color-text))' }}>
            Histórico de Treinos
          </h1>
          <p style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
            Sua jornada no ambiente
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Dumbbell} label="Total de Treinos" value={String(MOCK_STATS.totalTreinos)} accent="blue" />
          <StatCard icon={CalendarDays} label="Este Mês" value={String(MOCK_STATS.treinosMes)} accent="emerald" />
          <StatCard icon={Flame} label="Sequência Atual" value={`${MOCK_STATS.streak} dias`} accent="amber" />
          <StatCard icon={Clock} label="Tempo Total" value={MOCK_STATS.tempoTotal} accent="purple" />
        </div>

        {/* Streak & Weekly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Streak card */}
          <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={18} className="text-amber-400" />
              <h2 className="text-base font-bold" style={{ color: 'rgb(var(--color-text))' }}>Sequência de Treinos</h2>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-amber-400">{MOCK_STATS.streak}</span>
              <span className="text-sm" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>dias consecutivos</span>
            </div>
            <p className="text-xs mb-5" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
              Recorde pessoal: {MOCK_STATS.melhorStreak} dias
            </p>

            <div className="flex gap-1">
              {SEMANAS_GRID.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((active, di) => (
                    <div
                      key={di}
                      className="w-3 h-3 rounded-sm transition-colors"
                      style={{
                        background: active
                          ? 'rgba(245,158,11,0.6)'
                          : 'rgb(var(--color-text-subtle) / 0.08)',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
              Últimas 12 semanas
            </p>
          </div>

          {/* Dias da semana */}
          <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-blue-400" />
              <h2 className="text-base font-bold" style={{ color: 'rgb(var(--color-text))' }}>Dias Mais Frequentados</h2>
            </div>
            <p className="text-xs mb-5" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
              Média semanal: {MOCK_STATS.mediaSemanal} treinos
            </p>
            <div className="space-y-3">
              {DIAS_SEMANA.map(d => (
                <div key={d.dia} className="flex items-center gap-3">
                  <span className="text-xs font-semibold w-8" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>{d.dia}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-text-subtle) / 0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${maxDia ? (d.treinos / maxDia) * 100 : 0}%`,
                        background: d.treinos > 0
                          ? 'linear-gradient(90deg, rgba(59,130,246,0.5), rgba(59,130,246,0.8))'
                          : 'transparent',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold w-6 text-right" style={{ color: 'rgb(var(--color-text))' }}>{d.treinos}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Últimos Treinos */}
        <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="text-base font-bold" style={{ color: 'rgb(var(--color-text))' }}>Últimos Treinos</h2>
            </div>
            <VerTudoButton />
          </div>

          <div className="space-y-3">
            {ULTIMOS_TREINOS.map(t => (
              <div key={t.id} className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: 'rgb(var(--color-text-subtle) / 0.06)' }}>
                <div className="w-12 text-center flex-shrink-0">
                  <p className="text-lg font-black" style={{ color: 'rgb(var(--color-text))' }}>{t.data.split('/')[0]}</p>
                  <p className="text-[10px] uppercase" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
                    {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(t.data.split('/')[1]) - 1]}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${tipoColor(t.tipo)}`}>{t.tipo}</span>
                    <span className="text-xs" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>{t.duracao}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
                    {t.professor} · {t.hora}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat card component (Server Component) ─── */
function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  accent: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colors = {
    blue:    { icon: 'text-blue-400',    bg: 'bg-blue-500/15' },
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    amber:   { icon: 'text-amber-400',   bg: 'bg-amber-500/15' },
    purple:  { icon: 'text-purple-400',  bg: 'bg-purple-500/15' },
  };
  const c = colors[accent];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon size={18} className={c.icon} />
      </div>
      <p className="text-2xl font-black" style={{ color: 'rgb(var(--color-text))' }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>{label}</p>
    </div>
  );
}
