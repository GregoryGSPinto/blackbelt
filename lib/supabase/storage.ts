import { getSupabaseBrowserClient } from './client';

export const BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  CLASS_MEDIA: 'class-media',
} as const;

type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

interface UploadResult {
  path: string;
  url: string;
}

function generateFilePath(bucket: BucketName, userId: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'bin';
  const timestamp = Date.now();
  return `${userId}/${timestamp}.${ext}`;
}

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<{ data: UploadResult | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const path = generateFilePath(BUCKETS.AVATARS, userId, file.name);

  const { error } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .upload(path, file, { upsert: true });

  if (error) return { data: null, error: error.message };

  const { data: urlData } = supabase.storage
    .from(BUCKETS.AVATARS)
    .getPublicUrl(path);

  return { data: { path, url: urlData.publicUrl }, error: null };
}

export async function uploadDocument(
  userId: string,
  file: File,
): Promise<{ data: UploadResult | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const path = generateFilePath(BUCKETS.DOCUMENTS, userId, file.name);

  const { error } = await supabase.storage
    .from(BUCKETS.DOCUMENTS)
    .upload(path, file);

  if (error) return { data: null, error: error.message };

  const { data: urlData } = await supabase.storage
    .from(BUCKETS.DOCUMENTS)
    .createSignedUrl(path, 3600);

  return {
    data: { path, url: urlData?.signedUrl || '' },
    error: null,
  };
}

export async function uploadClassMedia(
  userId: string,
  file: File,
): Promise<{ data: UploadResult | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const path = generateFilePath(BUCKETS.CLASS_MEDIA, userId, file.name);

  const { error } = await supabase.storage
    .from(BUCKETS.CLASS_MEDIA)
    .upload(path, file);

  if (error) return { data: null, error: error.message };

  const { data: urlData } = supabase.storage
    .from(BUCKETS.CLASS_MEDIA)
    .getPublicUrl(path);

  return { data: { path, url: urlData.publicUrl }, error: null };
}

export async function deleteFile(
  bucket: BucketName,
  path: string,
): Promise<{ error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error?.message || null };
}

export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn = 3600,
): Promise<{ url: string | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  return { url: data?.signedUrl || null, error: error?.message || null };
}
