// ============================================================
// Kids Service — Unit Tests
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getKidsProfiles,
  getChallenges,
  getMedals,
  getMascots,
  getKidsCheckins,
} from '@/lib/api/kids.service';

describe('Kids Service (mock mode)', () => {
  describe('getKidsProfiles', () => {
    it('returns array of kid profiles', async () => {
      const profiles = await getKidsProfiles();
      expect(Array.isArray(profiles)).toBe(true);
    });

    it('each profile has name and avatar', async () => {
      const profiles = await getKidsProfiles();
      for (const p of profiles.slice(0, 3)) {
        expect(p.nome).toBeTruthy();
      }
    });
  });

  describe('getChallenges', () => {
    it('returns gamification challenges', async () => {
      const challenges = await getChallenges();
      expect(Array.isArray(challenges)).toBe(true);
      expect(challenges.length).toBeGreaterThan(0);
    });

    it('each challenge has titulo and estrelas', async () => {
      const challenges = await getChallenges();
      for (const c of challenges.slice(0, 3)) {
        expect(c.titulo).toBeTruthy();
        expect(typeof c.estrelas).toBe('number');
      }
    });
  });

  describe('getMedals', () => {
    it('returns array of medals', async () => {
      const medals = await getMedals();
      expect(Array.isArray(medals)).toBe(true);
    });
  });

  describe('getMascots', () => {
    it('returns array of mascots', async () => {
      const mascots = await getMascots();
      expect(Array.isArray(mascots)).toBe(true);
      expect(mascots.length).toBeGreaterThan(0);
    });
  });

  describe('getKidsCheckins', () => {
    it('returns kids checkin history', async () => {
      const checkins = await getKidsCheckins();
      expect(Array.isArray(checkins)).toBe(true);
    });
  });
});
