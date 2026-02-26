/**
 * Cloud Storage — Service
 *
 * Upload e gerenciamento de arquivos (atestados, vídeos, avatares, documentos).
 * Em mock, retorna URLs fake. Em produção, faz upload para S3/GCS/R2.
 *
 * TODO(BE-036): Implementar AWS S3, GCP Storage, ou Cloudflare R2
 * TODO(BE-037): Implementar presigned URLs para upload direto do browser
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

// ── Types ─────────────────────────────────────────────────

export type StorageBucket = 'atestados' | 'videos' | 'avatares' | 'documentos' | 'temp';

export interface UploadRequest {
  bucket: StorageBucket;
  arquivo: File;
  pasta?: string;
  nomeArquivo?: string;
}

export interface UploadResponse {
  url: string;
  key: string;
  tamanho: number;
  mimeType: string;
  bucket: StorageBucket;
}

export interface PresignedUrlRequest {
  bucket: StorageBucket;
  nomeArquivo: string;
  mimeType: string;
  tamanhoMaxMb?: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresIn: number; // seconds
}

export interface StorageStats {
  totalArquivos: number;
  tamanhoTotalMb: number;
  porBucket: Record<StorageBucket, { arquivos: number; tamanhoMb: number }>;
}

// ── Validation ────────────────────────────────────────────

const BUCKET_LIMITS: Record<StorageBucket, { maxMb: number; mimeTypes: string[] }> = {
  atestados: { maxMb: 10, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] },
  videos: { maxMb: 500, mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'] },
  avatares: { maxMb: 5, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  documentos: { maxMb: 20, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] },
  temp: { maxMb: 50, mimeTypes: ['*/*'] },
};

export function validarArquivo(bucket: StorageBucket, arquivo: File): string | null {
  const limits = BUCKET_LIMITS[bucket];
  const sizeMb = arquivo.size / (1024 * 1024);
  if (sizeMb > limits.maxMb) return `Arquivo excede o limite de ${limits.maxMb}MB (${sizeMb.toFixed(1)}MB)`;
  if (limits.mimeTypes[0] !== '*/*' && !limits.mimeTypes.includes(arquivo.type)) {
    return `Tipo de arquivo não permitido: ${arquivo.type}. Aceitos: ${limits.mimeTypes.join(', ')}`;
  }
  return null;
}

// ── Service Functions ─────────────────────────────────────

export async function upload(req: UploadRequest): Promise<UploadResponse> {
  const erroValidacao = validarArquivo(req.bucket, req.arquivo);
  if (erroValidacao) throw new Error(erroValidacao);

  if (useMock()) {
    await mockDelay(1000);
    const nome = req.nomeArquivo || req.arquivo.name;
    const key = `${req.bucket}/${req.pasta || 'geral'}/${Date.now()}_${nome}`;
    return {
      url: `/mock-uploads/${key}`,
      key,
      tamanho: req.arquivo.size,
      mimeType: req.arquivo.type,
      bucket: req.bucket,
    };
  }

  const formData = new FormData();
  formData.append('arquivo', req.arquivo);
  formData.append('bucket', req.bucket);
  if (req.pasta) formData.append('pasta', req.pasta);
  if (req.nomeArquivo) formData.append('nomeArquivo', req.nomeArquivo);

  const { data } = await apiClient.post<UploadResponse>('/storage/upload', formData); return data;
}

export async function getPresignedUrl(req: PresignedUrlRequest): Promise<PresignedUrlResponse> {
  if (useMock()) {
    await mockDelay(200);
    const key = `${req.bucket}/${Date.now()}_${req.nomeArquivo}`;
    return { uploadUrl: `/mock-uploads/presigned/${key}`, fileUrl: `/mock-uploads/${key}`, key, expiresIn: 3600 };
  }
  const { data } = await apiClient.post<PresignedUrlResponse>('/storage/presigned-url', req); return data;
}

export async function getUrl(key: string): Promise<string> {
  if (useMock()) { return `/mock-uploads/${key}`; }
  const { data } = await apiClient.get<{ url: string }>(`/storage/url?key=${encodeURIComponent(key)}`);
  return data.url;
}

export async function deletar(key: string): Promise<void> {
  if (useMock()) { await mockDelay(200); return; }
  await apiClient.delete(`/storage/files?key=${encodeURIComponent(key)}`);
}

export async function getStats(): Promise<StorageStats> {
  if (useMock()) {
    await mockDelay();
    return {
      totalArquivos: 156,
      tamanhoTotalMb: 2340,
      porBucket: {
        atestados: { arquivos: 45, tamanhoMb: 120 },
        videos: { arquivos: 28, tamanhoMb: 1800 },
        avatares: { arquivos: 68, tamanhoMb: 340 },
        documentos: { arquivos: 15, tamanhoMb: 80 },
        temp: { arquivos: 0, tamanhoMb: 0 },
      },
    };
  }
  const { data } = await apiClient.get<StorageStats>('/storage/stats'); return data;
}
