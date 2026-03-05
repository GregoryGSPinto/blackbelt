import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, _ctx) => {
  // Templates are static for now
  return apiOk([
    { id: 'tpl-01', titulo: 'Aviso de aula cancelada', texto: 'Prezado aluno, informamos que a aula de hoje foi cancelada. Treinaremos no próximo horário regular.', categoria: 'avisos' },
    { id: 'tpl-02', titulo: 'Lembrete de treino', texto: 'Não esqueça do treino de hoje! Te esperamos no tatame 🥋', categoria: 'lembretes' },
    { id: 'tpl-03', titulo: 'Parabéns pela graduação', texto: 'Parabéns pela nova graduação! Seu esforço e dedicação são admiráveis. Continue treinando!', categoria: 'congratulacoes' },
    { id: 'tpl-04', titulo: 'Mensalidade pendente', texto: 'Olá! Verificamos que existe uma mensalidade em aberto. Por favor, entre em contato com a secretaria.', categoria: 'financeiro' },
  ]);
});
