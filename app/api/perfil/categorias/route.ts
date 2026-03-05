import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, _ctx) => {
  return apiOk({
    GALO: { label: 'Galo', pesoMax: '57.5 kg' },
    PLUMA: { label: 'Pluma', pesoMax: '64 kg' },
    PENA: { label: 'Pena', pesoMax: '70 kg' },
    LEVE: { label: 'Leve', pesoMax: '76 kg' },
    MEDIO: { label: 'Médio', pesoMax: '82.3 kg' },
    MEIO_PESADO: { label: 'Meio-Pesado', pesoMax: '88.3 kg' },
    PESADO: { label: 'Pesado', pesoMax: '94.3 kg' },
    SUPER_PESADO: { label: 'Super-Pesado', pesoMax: '100.5 kg' },
    PESADISSIMO: { label: 'Pesadíssimo', pesoMax: '100.5+ kg' },
    ABSOLUTO: { label: 'Absoluto', pesoMax: 'Sem limite' },
  });
});
