// ============================================================
// Integration Test — Graduation Flow
// Simulates: verify requirements -> professor approves ->
//   admin confirms -> belt updated
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getExames,
  getRequisitos,
  getMinhaGraduacao,
  agendarExame,
  avaliarExame,
  getSubniveisAlunos,
  adicionarSubnivel,
} from '@/lib/api/graduacao.service';

describe('Graduation Flow Integration', () => {
  describe('Requirements verification', () => {
    it('returns list of graduation requirements', async () => {
      const requisitos = await getRequisitos();
      expect(Array.isArray(requisitos)).toBe(true);
      expect(requisitos.length).toBeGreaterThan(0);
    });

    it('each requirement has level and minimum criteria', async () => {
      const requisitos = await getRequisitos();
      for (const req of requisitos.slice(0, 3)) {
        expect(req).toHaveProperty('nivelDe');
        expect(req).toHaveProperty('nivelPara');
        expect(typeof req.tempoMinimoMeses).toBe('number');
        expect(typeof req.presencaMinimaPct).toBe('number');
      }
    });

    it('returns student graduation history', async () => {
      const historico = await getMinhaGraduacao();
      expect(Array.isArray(historico)).toBe(true);
    });
  });

  describe('Exam scheduling and evaluation', () => {
    it('lists existing exams', async () => {
      const exames = await getExames();
      expect(Array.isArray(exames)).toBe(true);
    });

    it('schedules a new graduation exam', async () => {
      const exam = await agendarExame({
        alunoId: 'aluno-001',
        faixaAtual: 'Branca',
        faixaAlvo: 'Cinza',
      });

      expect(exam).toBeDefined();
      expect(exam.id).toBeTruthy();
    });

    it('professor approves exam', async () => {
      const exames = await getExames();
      if (exames.length > 0) {
        const result = await avaliarExame(exames[0].id, 'APROVADO', 'Excelente desempenho');
        expect(result).toBeDefined();
        expect(result.status).toBe('APROVADO');
        expect(result.observacao).toBe('Excelente desempenho');
      }
    });

    it('professor can reject exam with observation', async () => {
      const exames = await getExames();
      if (exames.length > 0) {
        const result = await avaliarExame(exames[0].id, 'REPROVADO', 'Precisa melhorar base');
        expect(result.status).toBe('REPROVADO');
        expect(result.observacao).toBe('Precisa melhorar base');
      }
    });
  });

  describe('Belt/sublevel management', () => {
    it('returns list of student sublevels', async () => {
      const subniveis = await getSubniveisAlunos();
      expect(Array.isArray(subniveis)).toBe(true);
    });

    it('adds sublevel (stripe) to student', async () => {
      const subniveis = await getSubniveisAlunos();
      if (subniveis.length > 0) {
        const before = subniveis[0].subniveisAtuais;
        const result = await adicionarSubnivel(subniveis[0].alunoId, 'Prof. Ricardo');

        expect(result).toBeDefined();
        expect(result.subniveisAtuais).toBe(Math.min(4, before + 1));
      }
    });

    it('sublevel has history tracking', async () => {
      const subniveis = await getSubniveisAlunos();
      if (subniveis.length > 0) {
        const result = await adicionarSubnivel(subniveis[0].alunoId, 'Prof. Ana');
        expect(result.historicoSubniveis).toBeDefined();
        expect(Array.isArray(result.historicoSubniveis)).toBe(true);
        const latest = result.historicoSubniveis[result.historicoSubniveis.length - 1];
        expect(latest.instrutor).toBe('Prof. Ana');
      }
    });
  });
});
