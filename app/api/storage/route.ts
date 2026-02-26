import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const POST = createHandler(async (req: NextRequest, { supabase, user }) => {
  const body = await req.json();

  if (body.action === 'presigned-url') {
    const { data, error } = await supabase.storage
      .from(body.bucket || 'uploads')
      .createSignedUploadUrl(body.path || `${user.id}/${Date.now()}`);
    if (error) throw error;
    return apiOk(data);
  }

  if (body.action === 'get-url') {
    const { data } = supabase.storage
      .from(body.bucket || 'uploads')
      .getPublicUrl(body.path);
    return apiOk(data);
  }

  return apiError('Action required', 'VALIDATION');
});

export const GET = createHandler(async (_req: NextRequest, { supabase }) => {
  return apiOk({ stats: { totalFiles: 0, totalSize: 0 } });
});
