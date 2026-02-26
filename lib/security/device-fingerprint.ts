/**
 * Device Fingerprint — Identificação básica de dispositivo
 *
 * Gera um hash determinístico baseado em características do navegador.
 * Usado para detectar login de dispositivos desconhecidos.
 *
 * NÃO é tracking — é segurança (similar a bancos digitais).
 * O fingerprint é enviado ao backend junto com o login.
 */

import type { DeviceInfo } from '@/lib/api/contracts';

/**
 * Gera hash simples (FNV-1a) de uma string.
 * Não é criptograficamente seguro — apenas para fingerprinting.
 * Em produção, o backend deve usar SHA-256 para hashing forte.
 */
function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Coleta informações do dispositivo atual */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server',
      platform: 'server',
      language: 'pt-BR',
      screenResolution: '0x0',
      timezone: 'America/Sao_Paulo',
      fingerprint: 'server-side',
    };
  }

  const info = {
    userAgent: navigator.userAgent || 'unknown',
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'pt-BR',
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
  };

  // Gera fingerprint determinístico
  const raw = [
    info.userAgent,
    info.platform,
    info.language,
    info.screenResolution,
    info.timezone,
  ].join('|');

  return {
    ...info,
    fingerprint: fnv1aHash(raw),
  };
}

/** Compara dois fingerprints para detectar dispositivo diferente */
export function isSameDevice(a: string, b: string): boolean {
  return a === b;
}
