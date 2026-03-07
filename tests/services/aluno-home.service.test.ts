import { describe, it, expect } from 'vitest';
import { getAlunoHomeData } from '@/lib/api/aluno-home.service';
import type { AlunoHomeData } from '@/lib/api/aluno-home.service';

describe('Aluno Home Service (mock mode)', () => {
  it('returns complete AlunoHomeData', async () => {
    const data: AlunoHomeData = await getAlunoHomeData();
    expect(data).toBeDefined();
    expect(data.frequencia).toBeDefined();
    expect(data.conquistasRecentes).toBeDefined();
    expect(data.proximaMeta).toBeDefined();
    expect(typeof data.pontosTotal).toBe('number');
    expect(typeof data.posicaoRanking).toBe('number');
  });

  it('frequencia has valid structure', async () => {
    const data = await getAlunoHomeData();
    const f = data.frequencia;
    expect(typeof f.sessõesAssistidas).toBe('number');
    expect(typeof f.metaMensal).toBe('number');
    expect(typeof f.percentual).toBe('number');
    expect(['up', 'down', 'stable']).toContain(f.tendencia);
    expect(Array.isArray(f.historicoSemanal)).toBe(true);
    expect(f.historicoSemanal.length).toBe(4);
  });

  it('conquistas are properly typed', async () => {
    const data = await getAlunoHomeData();
    expect(Array.isArray(data.conquistasRecentes)).toBe(true);
    for (const c of data.conquistasRecentes) {
      expect(typeof c.id).toBe('string');
      expect(typeof c.nome).toBe('string');
      expect(['badge', 'medal', 'belt', 'milestone']).toContain(c.tipo);
      expect(typeof c.emoji).toBe('string');
    }
  });

  it('proxima sessao has valid fields when present', async () => {
    const data = await getAlunoHomeData();
    if (data.proximaSessao) {
      expect(typeof data.proximaSessao.turmaNome).toBe('string');
      expect(typeof data.proximaSessao.horario).toBe('string');
      expect(typeof data.proximaSessao.instrutor).toBe('string');
      expect(typeof data.proximaSessao.local).toBe('string');
      expect(typeof data.proximaSessao.dia).toBe('string');
    }
  });

  it('pontos and ranking are positive', async () => {
    const data = await getAlunoHomeData();
    expect(data.pontosTotal).toBeGreaterThanOrEqual(0);
    expect(data.posicaoRanking).toBeGreaterThan(0);
  });
});
