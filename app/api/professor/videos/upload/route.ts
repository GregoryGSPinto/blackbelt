import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const POST = createHandler(async (req: NextRequest) => {
  // TODO(BE-150): Implement real file upload to storage provider
  // For now, return a mock stub response
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const inputRaw = formData.get('input') as string | null;

  if (!file) {
    return apiOk({ error: 'No file provided' }, 400);
  }

  const input = inputRaw ? JSON.parse(inputRaw) : {};
  const id = `uv_${Date.now()}`;

  return apiOk({
    id,
    title: input.title || file.name,
    status: 'processing',
    source: 'upload',
    fileUrl: `https://cdn.blackbelt.app/videos/${id}/${file.name}`,
    thumbnailUrl: `https://cdn.blackbelt.app/thumbs/${id}/thumb.jpg`,
    originalFileName: file.name,
    fileSizeMB: Math.round(file.size / (1024 * 1024)),
    ...input,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });
});
