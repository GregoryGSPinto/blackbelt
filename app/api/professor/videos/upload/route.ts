import { NextRequest } from 'next/server';
import { createHandler, apiError } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const POST = createHandler(async (_req: NextRequest, { membership }) => {
  if (!membership || !['owner', 'admin', 'professor'].includes(membership.role)) {
    return apiError('Sem permissão para enviar vídeos.', 'FORBIDDEN', 403);
  }

  return apiError(
    'Upload direto ainda não está habilitado neste ambiente. Use o fluxo de URL/YouTube na biblioteca do professor.',
    'UPLOAD_NOT_AVAILABLE',
    409,
  );
});
