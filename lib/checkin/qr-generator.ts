/**
 * QR Check-in Generator — Session-based QR with HMAC-SHA256
 *
 * Generates QR codes for class sessions that professors display.
 * QR payload: { s: sessionId, a: academyId, t: timestamp, h: HMAC-SHA256 }
 * HMAC uses SUPABASE_SERVICE_ROLE_KEY as secret.
 * Expires in 15 minutes.
 * Rate limit: 1 check-in per student per session.
 */

import { useMock } from '@/lib/env';

export interface SessionQRPayload {
  s: string;  // sessionId
  a: string;  // academyId
  t: number;  // timestamp (ms)
  h: string;  // HMAC-SHA256 hex
}

const QR_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

function getHmacSecret(): string {
  if (useMock()) return 'mock-hmac-secret-for-development';
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for QR generation');
  return secret;
}

async function computeHMAC(message: string, secret: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle !== 'undefined') {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(message);
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signature = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, msgData);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Node.js fallback
  const { createHmac } = await import('crypto');
  return createHmac('sha256', secret).update(message).digest('hex');
}

export async function generateSessionQR(
  sessionId: string,
  academyId: string
): Promise<{ payload: SessionQRPayload; dataUrl: string; expiresAt: number }> {
  const timestamp = Date.now();
  const message = `${sessionId}:${academyId}:${timestamp}`;
  const hmac = await computeHMAC(message, getHmacSecret());

  const payload: SessionQRPayload = {
    s: sessionId,
    a: academyId,
    t: timestamp,
    h: hmac,
  };

  const jsonStr = JSON.stringify(payload);
  const dataUrl = `data:application/json;base64,${btoa(jsonStr)}`;

  return {
    payload,
    dataUrl,
    expiresAt: timestamp + QR_EXPIRY_MS,
  };
}

export function isQRExpired(payload: SessionQRPayload): boolean {
  return Date.now() - payload.t > QR_EXPIRY_MS;
}

export async function verifyQRHmac(payload: SessionQRPayload): Promise<boolean> {
  const message = `${payload.s}:${payload.a}:${payload.t}`;
  const expected = await computeHMAC(message, getHmacSecret());
  return payload.h === expected;
}

export { computeHMAC, QR_EXPIRY_MS };
