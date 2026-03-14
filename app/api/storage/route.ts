import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

const DEFAULT_BUCKET = 'uploads';
const PRIVATE_URL_TTL_SECONDS = 300;

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
}

export const POST = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const body = await req.json();
  const requestedPath = typeof body.path === 'string' ? sanitizePathSegment(body.path) : '';
  const tenantPrefix = `${membership!.academy_id}/${user.id}`;
  const objectPath = requestedPath
    ? `${tenantPrefix}/${requestedPath}`
    : `${tenantPrefix}/${Date.now()}`;

  if (body.action === 'presigned-url') {
    const { data, error } = await supabase.storage
      .from(DEFAULT_BUCKET)
      .createSignedUploadUrl(objectPath);
    if (error) throw error;
    return apiOk({ ...data, path: objectPath, bucket: DEFAULT_BUCKET });
  }

  if (body.action === 'get-url') {
    const path = requestedPath ? `${tenantPrefix}/${requestedPath}` : objectPath;
    const { data, error } = await supabase.storage
      .from(DEFAULT_BUCKET)
      .createSignedUrl(path, PRIVATE_URL_TTL_SECONDS);
    if (error) throw error;
    return apiOk({ signedUrl: data?.signedUrl || null, expiresIn: PRIVATE_URL_TTL_SECONDS });
  }

  return apiError('Action required', 'VALIDATION');
});

export const GET = createHandler(async (_req: NextRequest, { supabase }) => {
  return apiOk({ stats: { totalFiles: 0, totalSize: 0 } });
});
