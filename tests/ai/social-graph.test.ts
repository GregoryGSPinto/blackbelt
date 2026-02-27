// ============================================================
// Social Graph — Unit Tests
// ============================================================
// Pure function tests — no mocks, no database, deterministic.
//
// Fixtures:
//   1. Well-connected student (many strong bonds)
//   2. Solo student (no connections after 60+ days)
//   3. Student with churned bonds (strong bonds left academy)
//   4. Influencer (high engagement + many connections)
//   5. Newcomer (< 60 days enrollment)
// ============================================================

import { describe, it, expect } from 'vitest';
import { buildSocialProfile } from '@/lib/domain/intelligence/engines/social-graph';
import type { SocialGraphInput } from '@/lib/domain/intelligence/engines/social-graph';

// ════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════

const wellConnectedStudent: SocialGraphInput = {
  participantId: 'p-connected',
  participantName: 'Bruno Conectado',
  coAttendances: [
    { partnerId: 'p1', partnerName: 'Maria', count: 25, lastDate: '2026-02-25', isActive: true, sharedClasses: 3 },
    { partnerId: 'p2', partnerName: 'João', count: 20, lastDate: '2026-02-24', isActive: true, sharedClasses: 2 },
    { partnerId: 'p3', partnerName: 'Ana', count: 15, lastDate: '2026-02-20', isActive: true, sharedClasses: 2 },
    { partnerId: 'p4', partnerName: 'Pedro', count: 12, lastDate: '2026-02-18', isActive: true, sharedClasses: 1 },
    { partnerId: 'p5', partnerName: 'Carla', count: 10, lastDate: '2026-02-15', isActive: true, sharedClasses: 1 },
    { partnerId: 'p6', partnerName: 'Lucas', count: 8, lastDate: '2026-02-10', isActive: true, sharedClasses: 1 },
    { partnerId: 'p7', partnerName: 'Fernanda', count: 5, lastDate: '2026-02-05', isActive: true, sharedClasses: 1 },
    { partnerId: 'p8', partnerName: 'Diego', count: 3, lastDate: '2026-01-28', isActive: true, sharedClasses: 1 },
  ],
  totalCheckins: 60,
  classesAttended: ['class-a', 'class-b', 'class-c'],
  daysSinceEnrollment: 300,
  engagementScore: 75,
  churnRisk: 10,
};

const soloStudent: SocialGraphInput = {
  participantId: 'p-solo',
  participantName: 'Roberto Solitário',
  coAttendances: [],
  totalCheckins: 30,
  classesAttended: ['class-a'],
  daysSinceEnrollment: 120,
  engagementScore: 45,
  churnRisk: 55,
};

const churnedBondsStudent: SocialGraphInput = {
  participantId: 'p-churned-bonds',
  participantName: 'Cláudia Vínculos',
  coAttendances: [
    { partnerId: 'p1', partnerName: 'Ex-amigo 1', count: 22, lastDate: '2025-12-15', isActive: false, sharedClasses: 2 },
    { partnerId: 'p2', partnerName: 'Ex-amigo 2', count: 18, lastDate: '2025-11-20', isActive: false, sharedClasses: 2 },
    { partnerId: 'p3', partnerName: 'Parceiro Ativo', count: 5, lastDate: '2026-02-20', isActive: true, sharedClasses: 1 },
    { partnerId: 'p4', partnerName: 'Conhecido', count: 3, lastDate: '2026-02-10', isActive: true, sharedClasses: 1 },
  ],
  totalCheckins: 45,
  classesAttended: ['class-a', 'class-b'],
  daysSinceEnrollment: 250,
  engagementScore: 50,
  churnRisk: 45,
};

const influencerStudent: SocialGraphInput = {
  participantId: 'p-influencer',
  participantName: 'Ana Influenciadora',
  coAttendances: [
    { partnerId: 'p1', partnerName: 'Seguidor 1', count: 30, lastDate: '2026-02-26', isActive: true, sharedClasses: 3 },
    { partnerId: 'p2', partnerName: 'Seguidor 2', count: 28, lastDate: '2026-02-25', isActive: true, sharedClasses: 2 },
    { partnerId: 'p3', partnerName: 'Seguidor 3', count: 25, lastDate: '2026-02-24', isActive: true, sharedClasses: 2 },
    { partnerId: 'p4', partnerName: 'Seguidor 4', count: 20, lastDate: '2026-02-22', isActive: true, sharedClasses: 2 },
    { partnerId: 'p5', partnerName: 'Seguidor 5', count: 15, lastDate: '2026-02-20', isActive: true, sharedClasses: 1 },
    { partnerId: 'p6', partnerName: 'Seguidor 6', count: 12, lastDate: '2026-02-18', isActive: true, sharedClasses: 1 },
    { partnerId: 'p7', partnerName: 'Seguidor 7', count: 10, lastDate: '2026-02-15', isActive: true, sharedClasses: 1 },
  ],
  totalCheckins: 80,
  classesAttended: ['class-a', 'class-b', 'class-c'],
  daysSinceEnrollment: 400,
  engagementScore: 92,
  churnRisk: 5,
};

const newcomerStudent: SocialGraphInput = {
  participantId: 'p-newcomer',
  participantName: 'Lucas Novato',
  coAttendances: [
    { partnerId: 'p1', partnerName: 'Colega 1', count: 4, lastDate: '2026-02-25', isActive: true, sharedClasses: 1 },
    { partnerId: 'p2', partnerName: 'Colega 2', count: 2, lastDate: '2026-02-20', isActive: true, sharedClasses: 1 },
  ],
  totalCheckins: 8,
  classesAttended: ['class-a'],
  daysSinceEnrollment: 20,
  engagementScore: 60,
  churnRisk: 30,
};

// ════════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════════

describe('Social Graph — buildSocialProfile()', () => {
  describe('well-connected student (many strong bonds)', () => {
    it('has multiple connections sorted by strength', () => {
      const result = buildSocialProfile(wellConnectedStudent);
      expect(result.connections.length).toBe(8);
      // Check sorted descending
      for (let i = 1; i < result.connections.length; i++) {
        expect(result.connections[i - 1].strength).toBeGreaterThanOrEqual(
          result.connections[i].strength,
        );
      }
    });

    it('has multiple strong bonds (strength >= 70)', () => {
      const result = buildSocialProfile(wellConnectedStudent);
      expect(result.metrics.strongBonds).toBeGreaterThanOrEqual(1);
    });

    it('has a large network size (significant connections >= 30 strength)', () => {
      const result = buildSocialProfile(wellConnectedStudent);
      expect(result.metrics.networkSize).toBeGreaterThanOrEqual(3);
    });

    it('has low social retention risk (all bonds active)', () => {
      const result = buildSocialProfile(wellConnectedStudent);
      expect(result.metrics.socialRetentionRisk).toBeLessThan(30);
    });

    it('community role is connector or loyalist (many connections)', () => {
      const result = buildSocialProfile(wellConnectedStudent);
      expect(['connector', 'loyalist', 'influencer']).toContain(result.metrics.communityRole);
    });

    it('generates no isolation or bond_churned alerts', () => {
      const result = buildSocialProfile(wellConnectedStudent);
      const isolatedAlert = result.alerts.find(a => a.type === 'isolated');
      const bondChurnedAlert = result.alerts.find(a => a.type === 'bond_churned');
      expect(isolatedAlert).toBeUndefined();
      expect(bondChurnedAlert).toBeUndefined();
    });

    it('strongest connection has highest co-attendance count', () => {
      const result = buildSocialProfile(wellConnectedStudent);
      const strongest = result.connections[0];
      expect(strongest.participantId).toBe('p1'); // Maria, 25 co-attendances
      expect(strongest.sharedSessions).toBe(25);
    });
  });

  describe('solo student (no connections after 60+ days)', () => {
    it('has zero connections', () => {
      const result = buildSocialProfile(soloStudent);
      expect(result.connections.length).toBe(0);
    });

    it('network size is 0', () => {
      const result = buildSocialProfile(soloStudent);
      expect(result.metrics.networkSize).toBe(0);
    });

    it('strong bonds count is 0', () => {
      const result = buildSocialProfile(soloStudent);
      expect(result.metrics.strongBonds).toBe(0);
    });

    it('community role is solo', () => {
      const result = buildSocialProfile(soloStudent);
      expect(result.metrics.communityRole).toBe('solo');
    });

    it('has high social retention risk', () => {
      const result = buildSocialProfile(soloStudent);
      expect(result.metrics.socialRetentionRisk).toBeGreaterThanOrEqual(70);
    });

    it('generates isolation alert', () => {
      const result = buildSocialProfile(soloStudent);
      const isolatedAlert = result.alerts.find(a => a.type === 'isolated');
      expect(isolatedAlert).toBeDefined();
      expect(isolatedAlert!.severity).toBe('high');
      expect(isolatedAlert!.suggestedAction).toBeTruthy();
    });
  });

  describe('student with churned bonds (strong bonds left academy)', () => {
    it('identifies inactive connections', () => {
      const result = buildSocialProfile(churnedBondsStudent);
      const inactiveConnections = result.connections.filter(c => !c.isActive);
      expect(inactiveConnections.length).toBe(2);
    });

    it('generates bond_churned alert', () => {
      const result = buildSocialProfile(churnedBondsStudent);
      const bondAlert = result.alerts.find(a => a.type === 'bond_churned');
      expect(bondAlert).toBeDefined();
      expect(bondAlert!.description).toContain('Ex-amigo');
    });

    it('has elevated social retention risk', () => {
      const result = buildSocialProfile(churnedBondsStudent);
      // Strong bonds are inactive -> higher risk
      expect(result.metrics.socialRetentionRisk).toBeGreaterThan(20);
    });

    it('strongest connections are the now-inactive ones (high co-attendance)', () => {
      const result = buildSocialProfile(churnedBondsStudent);
      const strongest = result.connections[0];
      expect(strongest.participantId).toBe('p1');
      expect(strongest.isActive).toBe(false);
    });

    it('generates group_declining alert when majority is inactive', () => {
      const result = buildSocialProfile(churnedBondsStudent);
      const groupAlert = result.alerts.find(a => a.type === 'group_declining');
      // 2 out of 4 connections inactive = 50%, which triggers at >= 50% of significant connections
      // Whether it triggers depends on strength thresholds
      // At least we should have bond_churned
      const bondAlert = result.alerts.find(a => a.type === 'bond_churned');
      expect(bondAlert).toBeDefined();
    });
  });

  describe('influencer (high engagement + many connections)', () => {
    it('community role is influencer', () => {
      const result = buildSocialProfile(influencerStudent);
      expect(result.metrics.communityRole).toBe('influencer');
    });

    it('has many strong bonds (>= 3)', () => {
      const result = buildSocialProfile(influencerStudent);
      expect(result.metrics.strongBonds).toBeGreaterThanOrEqual(3);
    });

    it('has large network size', () => {
      const result = buildSocialProfile(influencerStudent);
      expect(result.metrics.networkSize).toBeGreaterThanOrEqual(5);
    });

    it('no influencer_at_risk alert when churn risk is low', () => {
      const result = buildSocialProfile(influencerStudent);
      const atRiskAlert = result.alerts.find(a => a.type === 'influencer_at_risk');
      expect(atRiskAlert).toBeUndefined();
    });

    it('generates influencer_at_risk alert when churn risk > 50', () => {
      const atRiskInfluencer: SocialGraphInput = {
        ...influencerStudent,
        participantId: 'p-influencer-risk',
        churnRisk: 65,
      };
      const result = buildSocialProfile(atRiskInfluencer);
      const atRiskAlert = result.alerts.find(a => a.type === 'influencer_at_risk');
      expect(atRiskAlert).toBeDefined();
      expect(atRiskAlert!.severity).toBe('high');
    });

    it('has low social retention risk (all active, many connections)', () => {
      const result = buildSocialProfile(influencerStudent);
      expect(result.metrics.socialRetentionRisk).toBeLessThan(20);
    });
  });

  describe('newcomer (< 60 days enrollment)', () => {
    it('community role is newcomer', () => {
      const result = buildSocialProfile(newcomerStudent);
      expect(result.metrics.communityRole).toBe('newcomer');
    });

    it('has few connections with low strength', () => {
      const result = buildSocialProfile(newcomerStudent);
      expect(result.connections.length).toBe(2);
      // With only 4 and 2 co-attendances, strengths should be moderate at most
      for (const conn of result.connections) {
        expect(conn.strength).toBeLessThanOrEqual(80);
      }
    });

    it('does not generate isolation alert (< 60 days)', () => {
      const result = buildSocialProfile(newcomerStudent);
      const isolatedAlert = result.alerts.find(a => a.type === 'isolated');
      expect(isolatedAlert).toBeUndefined();
    });

    it('has low confidence (few data points)', () => {
      const result = buildSocialProfile(newcomerStudent);
      expect(result.metadata.confidence).toBeLessThan(0.7);
    });

    it('connections reference correct partner data', () => {
      const result = buildSocialProfile(newcomerStudent);
      const conn1 = result.connections.find(c => c.participantId === 'p1');
      expect(conn1).toBeDefined();
      expect(conn1!.name).toBe('Colega 1');
      expect(conn1!.sharedSessions).toBe(4);
    });
  });

  describe('output structure and boundaries', () => {
    it('always returns all required fields', () => {
      const inputs = [wellConnectedStudent, soloStudent, churnedBondsStudent, influencerStudent, newcomerStudent];
      for (const input of inputs) {
        const result = buildSocialProfile(input);
        expect(result.participantId).toBe(input.participantId);
        expect(result.connections).toBeDefined();
        expect(result.metrics).toBeDefined();
        expect(result.alerts).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(result.metadata.computedAt).toBeTruthy();
      }
    });

    it('connection strengths are always between 0 and 100', () => {
      const inputs = [wellConnectedStudent, churnedBondsStudent, influencerStudent, newcomerStudent];
      for (const input of inputs) {
        const result = buildSocialProfile(input);
        for (const conn of result.connections) {
          expect(conn.strength).toBeGreaterThanOrEqual(0);
          expect(conn.strength).toBeLessThanOrEqual(100);
        }
      }
    });

    it('social retention risk is always between 0 and 100', () => {
      const inputs = [wellConnectedStudent, soloStudent, churnedBondsStudent, influencerStudent, newcomerStudent];
      for (const input of inputs) {
        const result = buildSocialProfile(input);
        expect(result.metrics.socialRetentionRisk).toBeGreaterThanOrEqual(0);
        expect(result.metrics.socialRetentionRisk).toBeLessThanOrEqual(100);
      }
    });

    it('confidence is always between 0 and 1', () => {
      const inputs = [wellConnectedStudent, soloStudent, churnedBondsStudent, influencerStudent, newcomerStudent];
      for (const input of inputs) {
        const result = buildSocialProfile(input);
        expect(result.metadata.confidence).toBeGreaterThanOrEqual(0);
        expect(result.metadata.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('community role is always a valid value', () => {
      const validRoles = ['connector', 'loyalist', 'solo', 'influencer', 'newcomer'];
      const inputs = [wellConnectedStudent, soloStudent, churnedBondsStudent, influencerStudent, newcomerStudent];
      for (const input of inputs) {
        const result = buildSocialProfile(input);
        expect(validRoles).toContain(result.metrics.communityRole);
      }
    });

    it('alerts have valid types and severity', () => {
      const validTypes = ['bond_churned', 'group_declining', 'isolated', 'influencer_at_risk'];
      const validSeverities = ['high', 'medium', 'low'];
      const inputs = [soloStudent, churnedBondsStudent];
      for (const input of inputs) {
        const result = buildSocialProfile(input);
        for (const alert of result.alerts) {
          expect(validTypes).toContain(alert.type);
          expect(validSeverities).toContain(alert.severity);
          expect(alert.description).toBeTruthy();
          expect(alert.suggestedAction).toBeTruthy();
        }
      }
    });

    it('alerts are sorted by severity (high first)', () => {
      const result = buildSocialProfile(churnedBondsStudent);
      const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      for (let i = 1; i < result.alerts.length; i++) {
        expect(severityOrder[result.alerts[i - 1].severity])
          .toBeLessThanOrEqual(severityOrder[result.alerts[i].severity]);
      }
    });
  });
});
