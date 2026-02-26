// ============================================================
// Instrutor Service — Unit Tests
// ============================================================
// Types validated:
//   ProfessorDashboard.estatisticas: EstatisticaGeral { totalAlunos, ... }
//   TurmaResumo: { id, nome, totalAlunos, ... }
//   ChamadaResumo: { presentes, faltas, percentual, ... }
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getDashboard,
  getTurmas,
  getAvaliacoes,
  getAlunosProgresso,
  getChamadaAlunos,
  salvarChamada,
} from '@/lib/api/instrutor.service';

describe('Professor Service (mock mode)', () => {
  describe('getDashboard', () => {
    it('returns dashboard with estatisticas', async () => {
      const dash = await getDashboard();
      expect(dash).toBeDefined();
      expect(dash.estatisticas).toBeDefined();
      expect(typeof dash.estatisticas.totalAlunos).toBe('number');
      expect(typeof dash.estatisticas.presencaMedia).toBe('number');
    });

    it('dashboard has turmas array', async () => {
      const dash = await getDashboard();
      expect(Array.isArray(dash.turmas)).toBe(true);
    });
  });

  describe('getTurmas', () => {
    it('returns array of classes', async () => {
      const turmas = await getTurmas();
      expect(Array.isArray(turmas)).toBe(true);
      expect(turmas.length).toBeGreaterThan(0);
    });

    it('each turma has nome and totalAlunos', async () => {
      const turmas = await getTurmas();
      for (const t of turmas.slice(0, 3)) {
        expect(t.nome).toBeTruthy();
        expect(t.totalAlunos).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getAvaliacoes', () => {
    it('returns pending evaluations', async () => {
      const evals = await getAvaliacoes();
      expect(Array.isArray(evals)).toBe(true);
    });
  });

  describe('getAlunosProgresso', () => {
    it('returns student progress array', async () => {
      const progress = await getAlunosProgresso();
      expect(Array.isArray(progress)).toBe(true);
    });
  });

  describe('getChamadaAlunos', () => {
    it('returns attendance list for a class', async () => {
      const turmas = await getTurmas();
      if (turmas.length === 0) return;

      const alunos = await getChamadaAlunos(turmas[0].id);
      expect(Array.isArray(alunos)).toBe(true);
    });
  });

  describe('salvarChamada', () => {
    it('saves attendance and returns summary', async () => {
      const result = await salvarChamada({
        turmaId: 'turma-1',
        data: new Date().toISOString().split('T')[0],
        presencas: [
          { alunoId: 'a-1', status: 'presente' },
          { alunoId: 'a-2', status: 'falta' },
        ],
      });
      expect(result).toBeDefined();
      expect(typeof result.presentes).toBe('number');
      expect(typeof result.faltas).toBe('number');
      expect(typeof result.percentual).toBe('number');
    });
  });
});
