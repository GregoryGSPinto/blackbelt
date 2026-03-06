/**
 * QR Check-in Validator
 *
 * Validates session QR codes:
 *   - HMAC integrity check
 *   - Expiration check (15 min)
 *   - Session existence + active status (via mock or Supabase)
 *   - Rate limit: 1 check-in per student per session
 */

import { verifyQRHmac, isQRExpired, type SessionQRPayload } from './qr-generator';
import { useMock, mockDelay } from '@/lib/env';

export interface QRValidationResult {
  valid: boolean;
  sessionId?: string;
  academyId?: string;
  expired?: boolean;
  tampered?: boolean;
  reason?: string;
}

// In-memory rate limit store (per session per student)
const checkinRateLimit = new Map<string, Set<string>>();

function getRateLimitKey(sessionId: string): Set<string> {
  if (!checkinRateLimit.has(sessionId)) {
    checkinRateLimit.set(sessionId, new Set());
  }
  return checkinRateLimit.get(sessionId)!;
}

export function hasStudentCheckedIn(sessionId: string, studentId: string): boolean {
  return getRateLimitKey(sessionId).has(studentId);
}

export function recordStudentCheckin(sessionId: string, studentId: string): void {
  getRateLimitKey(sessionId).add(studentId);
}

export function clearSessionRateLimit(sessionId: string): void {
  checkinRateLimit.delete(sessionId);
}

export async function validateQR(
  qrData: string | SessionQRPayload,
  studentId?: string
): Promise<QRValidationResult> {
  let payload: SessionQRPayload;

  // Parse if string
  if (typeof qrData === 'string') {
    try {
      payload = JSON.parse(qrData) as SessionQRPayload;
    } catch {
      return { valid: false, reason: 'QR data is not valid JSON' };
    }
  } else {
    payload = qrData;
  }

  // Validate required fields
  if (!payload.s || !payload.a || !payload.t || !payload.h) {
    return { valid: false, reason: 'Missing required QR fields' };
  }

  // Check HMAC integrity
  const hmacValid = await verifyQRHmac(payload);
  if (!hmacValid) {
    return { valid: false, tampered: true, reason: 'QR code has been tampered with' };
  }

  // Check expiration
  if (isQRExpired(payload)) {
    return {
      valid: false,
      expired: true,
      sessionId: payload.s,
      academyId: payload.a,
      reason: 'QR code has expired (15 min limit)',
    };
  }

  // Rate limit: 1 check-in per student per session
  if (studentId && hasStudentCheckedIn(payload.s, studentId)) {
    return {
      valid: false,
      sessionId: payload.s,
      academyId: payload.a,
      reason: 'Student already checked in for this session',
    };
  }

  // Validate session exists and is active
  if (useMock()) {
    await mockDelay(100);
    // Mock: assume session is valid
  } else {
    // TODO(BE-070): Check session exists and is active via Supabase
    // const { data: session } = await supabase
    //   .from('class_sessions')
    //   .select('id, status')
    //   .eq('id', payload.s)
    //   .single();
    // if (!session) return { valid: false, reason: 'Session not found' };
    // if (session.status !== 'active') return { valid: false, reason: 'Session is not active' };
  }

  return {
    valid: true,
    sessionId: payload.s,
    academyId: payload.a,
  };
}
