'use client';

// ════════════════════════════════════════════════════════════════════
// AI SYSTEM ROI — Metricas de retorno do sistema de IA
// ════════════════════════════════════════════════════════════════════

interface AISystemROIProps {
  metrics: {
    predictionsGenerated: number;
    alertsGenerated: number;
    alertsActedUpon: number;
    churnsPrevented: number;
    estimatedRevenueSaved: number;
  };
}

export function AISystemROI({ metrics }: AISystemROIProps) {
  const actionRate = metrics.alertsGenerated > 0
    ? Math.round((metrics.alertsActedUpon / metrics.alertsGenerated) * 100)
    : 0;

  const cards = [
    {
      label: 'Predicoes Geradas',
      value: metrics.predictionsGenerated.toLocaleString('pt-BR'),
      sublabel: 'analises de IA processadas',
      color: 'border-blue-500/30 bg-blue-500/10',
      valueColor: 'text-blue-400',
    },
    {
      label: 'Alertas Gerados',
      value: metrics.alertsGenerated.toString(),
      sublabel: `${actionRate}% atuados`,
      color: 'border-orange-500/30 bg-orange-500/10',
      valueColor: 'text-orange-400',
    },
    {
      label: 'Evasoes Prevenidas',
      value: metrics.churnsPrevented.toString(),
      sublabel: 'alunos retidos pela IA',
      color: 'border-green-500/30 bg-green-500/10',
      valueColor: 'text-green-400',
    },
    {
      label: 'Receita Preservada',
      value: `R$ ${metrics.estimatedRevenueSaved.toLocaleString('pt-BR')}`,
      sublabel: 'estimativa de receita salva',
      color: 'border-emerald-500/30 bg-emerald-500/10',
      valueColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-300">ROI do Sistema de IA</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          BlackBelt Intelligence
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(card => (
          <div key={card.label} className={`rounded-lg border p-3 ${card.color}`}>
            <p className="text-[10px] text-zinc-500 mb-1">{card.label}</p>
            <p className={`text-lg font-bold ${card.valueColor}`}>{card.value}</p>
            <p className="text-[10px] text-zinc-600 mt-1">{card.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Action rate visualization */}
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500">Taxa de atuacao em alertas</span>
          <span className="text-xs font-medium text-zinc-300">{actionRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              actionRate >= 70 ? 'bg-green-500' :
              actionRate >= 40 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${actionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-zinc-700">{metrics.alertsActedUpon} atuados</span>
          <span className="text-[10px] text-zinc-700">{metrics.alertsGenerated} total</span>
        </div>
      </div>
    </div>
  );
}
