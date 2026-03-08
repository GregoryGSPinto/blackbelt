import { describe, it, expect } from 'vitest';
import { getAlunoHomeData } from '@/src/features/students/services/aluno-home.service';

describe('Aluno Dashboard Service (mock mode)', () => {
  it('returns dashboard data with required fields', async () => {
    const data = await getAlunoHomeData();
    expect(data).toBeDefined();
    expect(data).toHaveProperty('frequencia');
    expect(data).toHaveProperty('conquistasRecentes');
    expect(data).toHaveProperty('pontosTotal');
    expect(data).toHaveProperty('posicaoRanking');
  });

  it('returns numeric values for stats', async () => {
    const data = await getAlunoHomeData();
    expect(typeof data.pontosTotal).toBe('number');
    expect(typeof data.posicaoRanking).toBe('number');
    expect(data.pontosTotal).toBeGreaterThanOrEqual(0);
    expect(data.posicaoRanking).toBeGreaterThan(0);
  });

  it('returns valid frequencia structure', async () => {
    const data = await getAlunoHomeData();
    expect(data.frequencia).toBeDefined();
    expect(typeof data.frequencia.sessõesAssistidas).toBe('number');
    expect(typeof data.frequencia.metaMensal).toBe('number');
    expect(typeof data.frequencia.percentual).toBe('number');
    expect(['up', 'down', 'stable']).toContain(data.frequencia.tendencia);
    expect(Array.isArray(data.frequencia.historicoSemanal)).toBe(true);
  });

  it('returns array of conquistas', async () => {
    const data = await getAlunoHomeData();
    expect(Array.isArray(data.conquistasRecentes)).toBe(true);
    if (data.conquistasRecentes.length > 0) {
      const conquista = data.conquistasRecentes[0];
      expect(conquista).toHaveProperty('id');
      expect(conquista).toHaveProperty('nome');
      expect(conquista).toHaveProperty('tipo');
      expect(['badge', 'medal', 'belt', 'milestone']).toContain(conquista.tipo);
    }
  });

  it('returns proxima sessao or null', async () => {
    const data = await getAlunoHomeData();
    if (data.proximaSessao !== null) {
      expect(data.proximaSessao).toHaveProperty('turmaNome');
      expect(data.proximaSessao).toHaveProperty('horario');
      expect(data.proximaSessao).toHaveProperty('instrutor');
    }
  });
});
