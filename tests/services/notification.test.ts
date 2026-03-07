// ============================================================
// Push Notification Service — Tests
// Tests: registerToken, sendToUser, channel routing, topic broadcast
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import {
  enviarPush,
  enviarParaTopico,
  registrarToken,
  desregistrarToken,
} from '@/lib/api/push.service';

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('Push Notification Service (mock mode)', () => {
  describe('registrarToken', () => {
    it('registers a web push token', async () => {
      await expect(
        registrarToken('user-001', 'fcm-token-abc123', 'web')
      ).resolves.toBeUndefined();
    });

    it('registers an android push token', async () => {
      await expect(
        registrarToken('user-002', 'fcm-token-android', 'android')
      ).resolves.toBeUndefined();
    });

    it('registers an ios push token', async () => {
      await expect(
        registrarToken('user-003', 'fcm-token-ios', 'ios')
      ).resolves.toBeUndefined();
    });
  });

  describe('desregistrarToken', () => {
    it('unregisters a token for a user', async () => {
      await expect(
        desregistrarToken('user-001')
      ).resolves.toBeUndefined();
    });
  });

  describe('enviarPush (send to user)', () => {
    it('sends notification to single user', async () => {
      const result = await enviarPush({
        titulo: 'Novo treino disponivel',
        corpo: 'Seu treino de terça foi atualizado',
        destinatarios: ['user-001'],
      });

      expect(result).toBeDefined();
      expect(result.enviados).toBe(1);
      expect(result.falhas).toBe(0);
      expect(result.messageId).toBeTruthy();
    });

    it('sends notification to multiple users', async () => {
      const result = await enviarPush({
        titulo: 'Aviso geral',
        corpo: 'A academia fecha mais cedo amanha',
        destinatarios: ['user-001', 'user-002', 'user-003'],
      });

      expect(result.enviados).toBe(3);
      expect(result.falhas).toBe(0);
    });

    it('includes custom data in notification', async () => {
      const result = await enviarPush({
        titulo: 'Check-in registrado',
        corpo: 'Presenca confirmada',
        destinatarios: ['user-001'],
        dados: { type: 'checkin', turmaId: 'turma-001' },
      });

      expect(result).toBeDefined();
      expect(result.enviados).toBe(1);
    });

    it('handles empty recipients gracefully', async () => {
      const result = await enviarPush({
        titulo: 'Test',
        corpo: 'Test body',
        destinatarios: [],
      });

      expect(result.enviados).toBe(0);
    });
  });

  describe('enviarParaTopico (channel routing)', () => {
    it('sends notification to a topic/channel', async () => {
      const result = await enviarParaTopico(
        'all',
        'Aviso importante',
        'Treino cancelado amanha'
      );

      expect(result).toBeDefined();
      expect(result.enviados).toBeGreaterThan(0);
      expect(result.falhas).toBe(0);
    });

    it('sends notification to class-specific topic', async () => {
      const result = await enviarParaTopico(
        'turma_001',
        'Treino extra',
        'Sabado as 10h teremos treino especial'
      );

      expect(result).toBeDefined();
      expect(result.enviados).toBeGreaterThan(0);
    });

    it('sends notification to admin topic', async () => {
      const result = await enviarParaTopico(
        'admin',
        'Novo aluno',
        'Um novo aluno se matriculou'
      );

      expect(result).toBeDefined();
    });
  });
});
