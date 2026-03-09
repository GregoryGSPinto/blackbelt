import { leadApiError, leadApiSuccess, mapLeadError } from '@/lib/leads/http';
import { LEAD_PIPELINE_STATUSES } from '@/lib/leads/types';
import { requireSuperAdmin } from '@/lib/leads/server';

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function GET() {
  try {
    const { supabase } = await requireSuperAdmin();
    const { data: leads, error } = await supabase.from('leads').select('*');

    if (error) {
      return leadApiError(error.message, 500);
    }

    const { data: statusHistory } = await supabase.from('lead_status_history').select('*');
    const dataset = leads ?? [];
    const wonLeads = dataset.filter((lead: any) => lead.status === 'WON');
    const lostLeads = dataset.filter((lead: any) => lead.status === 'LOST');

    const summary = {
      totalLeads: dataset.length,
      conversionRate: dataset.length ? Number(((wonLeads.length / dataset.length) * 100).toFixed(1)) : 0,
      avgDealSize: Math.round(average(wonLeads.map((lead: any) => Number(lead.closed_price ?? lead.proposed_price ?? 0)))),
      revenuePotential: dataset.reduce((sum: number, lead: any) => sum + Number(lead.proposed_price ?? lead.suggested_price ?? 0), 0),
      pipelineValue: dataset
        .filter((lead: any) => !['WON', 'LOST'].includes(lead.status))
        .reduce((sum: number, lead: any) => sum + Number(lead.proposed_price ?? lead.suggested_price ?? 0), 0),
    };

    const pipelineDistribution = LEAD_PIPELINE_STATUSES.map((status) => ({
      status,
      count: dataset.filter((lead: any) => lead.status === status).length,
      value: dataset
        .filter((lead: any) => lead.status === status)
        .reduce((sum: number, lead: any) => sum + Number(lead.proposed_price ?? lead.suggested_price ?? 0), 0),
    }));

    const leadsPerCityMap = new Map<string, number>();
    const modalityMap = new Map<string, number>();
    const sourceMap = new Map<string, number>();
    const stageConversion = LEAD_PIPELINE_STATUSES.map((status) => {
      const entrants = dataset.filter((lead: any) => {
        if (lead.status === status) return true;
        const historyForLead = (statusHistory ?? []).filter((entry: any) => entry.lead_id === lead.id);
        return historyForLead.some((entry: any) => entry.to_status === status);
      }).length;
      const nextWon = dataset.filter((lead: any) => lead.status === 'WON').filter((lead: any) => {
        const historyForLead = (statusHistory ?? []).filter((entry: any) => entry.lead_id === lead.id);
        return status === 'WON' || historyForLead.some((entry: any) => entry.to_status === status);
      }).length;
      return {
        status,
        entrants,
        won: nextWon,
        rate: entrants ? Number(((nextWon / entrants) * 100).toFixed(1)) : 0,
      };
    });

    dataset.forEach((lead: any) => {
      const cityKey = [lead.city, lead.state].filter(Boolean).join(', ');
      if (cityKey) leadsPerCityMap.set(cityKey, (leadsPerCityMap.get(cityKey) ?? 0) + 1);
      for (const modality of lead.modalities ?? []) {
        modalityMap.set(modality, (modalityMap.get(modality) ?? 0) + 1);
      }
      if (lead.lead_source) {
        sourceMap.set(lead.lead_source, (sourceMap.get(lead.lead_source) ?? 0) + 1);
      }
    });

    const topCities = [...leadsPerCityMap.entries()]
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const modalitiesPerformance = [...modalityMap.entries()]
      .map(([modality, count]) => ({
        modality,
        count,
        won: wonLeads.filter((lead: any) => (lead.modalities ?? []).includes(modality)).length,
      }))
      .map((item) => ({
        ...item,
        rate: item.count ? Number(((item.won / item.count) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const dealCycles = wonLeads
      .filter((lead: any) => lead.converted_at)
      .map((lead: any) => {
        const created = new Date(lead.created_at).getTime();
        const converted = new Date(lead.converted_at).getTime();
        return Math.max(1, Math.round((converted - created) / 86_400_000));
      });

    const lossReasons = lostLeads.reduce((acc: Record<string, number>, lead: any) => {
      const key = lead.loss_reason || 'UNSPECIFIED';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const monthMap = new Map<string, { leads: number; won: number; proposals: number }>();
    dataset.forEach((lead: any) => {
      const month = new Date(lead.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const current = monthMap.get(month) ?? { leads: 0, won: 0, proposals: 0 };
      current.leads += 1;
      if (lead.status === 'WON') current.won += 1;
      if (['PROPOSAL_SENT', 'NEGOTIATING', 'WON'].includes(lead.status)) current.proposals += 1;
      monthMap.set(month, current);
    });

    return leadApiSuccess({
      summary,
      pipelineDistribution,
      stageConversion,
      topCities,
      modalitiesPerformance,
      sources: [...sourceMap.entries()].map(([source, count]) => ({ source, count })),
      revenuePotentialByStatus: pipelineDistribution,
      averageDealTime: Math.round(average(dealCycles)),
      lossReasons: Object.entries(lossReasons).map(([reason, count]) => ({ reason, count })),
      monthly: [...monthMap.entries()].map(([month, value]) => ({ month, ...value })),
    });
  } catch (error) {
    return mapLeadError(error);
  }
}
