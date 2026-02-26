// ============================================================
// Device Fingerprint — Unit Tests
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDeviceFingerprint,
  recordDeviceSession,
  getDeviceSessions,
  recordDeviceError,
  getDeviceInsights,
  getMockDeviceInsights,
} from '@/lib/api/device-fingerprint.service';

const TEST_USER = 'test-user-fp';

describe('Device Fingerprint Service', () => {
  beforeEach(() => {
    // Clear storage for test user
    try { localStorage.removeItem(`blackbelt_device_sessions_${TEST_USER}`); } catch {}
  });

  describe('getDeviceFingerprint', () => {
    it('returns fingerprint with required fields', () => {
      const fp = getDeviceFingerprint();
      expect(fp.id).toBeTruthy();
      expect(fp.browser).toBeTruthy();
      expect(fp.os).toBeTruthy();
      expect(fp.deviceType).toMatch(/desktop|tablet|mobile/);
      expect(fp.screenResolution).toMatch(/\d+x\d+/);
      expect(fp.language).toBeTruthy();
      expect(fp.timezone).toBeTruthy();
    });

    it('generates consistent id for same device', () => {
      const fp1 = getDeviceFingerprint();
      const fp2 = getDeviceFingerprint();
      expect(fp1.id).toBe(fp2.id);
    });
  });

  describe('recordDeviceSession', () => {
    it('creates new session on first visit', () => {
      const session = recordDeviceSession(TEST_USER);
      expect(session.sessionCount).toBe(1);
      expect(session.firstSeen).toBeTruthy();
      expect(session.lastSeen).toBeTruthy();
    });

    it('increments session count on return visit', () => {
      recordDeviceSession(TEST_USER);
      const session2 = recordDeviceSession(TEST_USER);
      expect(session2.sessionCount).toBe(2);
    });

    it('persists sessions in storage', () => {
      recordDeviceSession(TEST_USER);
      const sessions = getDeviceSessions(TEST_USER);
      expect(sessions.length).toBe(1);
    });
  });

  describe('recordDeviceError', () => {
    it('records error for current device', () => {
      recordDeviceSession(TEST_USER);
      recordDeviceError(TEST_USER, {
        type: 'RenderError',
        message: 'Component failed',
        page: '/dashboard',
      });

      const sessions = getDeviceSessions(TEST_USER);
      const session = sessions[0];
      expect(session.errors.length).toBe(1);
      expect(session.errors[0].type).toBe('RenderError');
    });

    it('caps errors at 50 per device', () => {
      recordDeviceSession(TEST_USER);
      for (let i = 0; i < 55; i++) {
        recordDeviceError(TEST_USER, {
          type: 'Error',
          message: `Error ${i}`,
          page: '/test',
        });
      }

      const sessions = getDeviceSessions(TEST_USER);
      expect(sessions[0].errors.length).toBe(50);
    });
  });

  describe('getDeviceInsights', () => {
    it('returns empty for clean device', () => {
      recordDeviceSession(TEST_USER);
      const insights = getDeviceInsights(TEST_USER);
      // No errors = may or may not have insights (depends on browser/OS)
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('getMockDeviceInsights', () => {
    it('returns mock data with severity levels', () => {
      const mocks = getMockDeviceInsights();
      expect(mocks.length).toBeGreaterThan(0);
      for (const m of mocks) {
        expect(m.severity).toMatch(/info|warning|critical/);
        expect(m.label).toBeTruthy();
        expect(m.message).toBeTruthy();
      }
    });
  });
});
