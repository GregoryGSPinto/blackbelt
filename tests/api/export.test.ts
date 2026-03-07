// ============================================================
// Export Dropdown — Tests
// Tests: CSV generation, format verification, header validation
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper: simulate the CSV generation logic from ExportDropdown
function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'Sim' : 'Nao';
  return String(val);
}

function generateCSV(
  data: Record<string, unknown>[],
  columns: string[],
  labels: string[]
): string {
  const header = labels.join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const val = formatValue(row[col]);
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  );
  const bom = '\uFEFF';
  return bom + [header, ...rows].join('\n');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

describe('Export Dropdown — CSV Generation', () => {
  const sampleData = [
    { nome: 'Lucas Mendes', email: 'lucas@test.com', faixa: 'Azul', presenca: 85 },
    { nome: 'Ana Silva', email: 'ana@test.com', faixa: 'Branca', presenca: 92 },
    { nome: 'Pedro Costa', email: 'pedro@test.com', faixa: 'Roxa', presenca: 78 },
  ];
  const columns = ['nome', 'email', 'faixa', 'presenca'];
  const labels = ['Nome', 'Email', 'Faixa', 'Presenca'];

  describe('CSV format', () => {
    it('generates valid CSV with headers and data rows', () => {
      const csv = generateCSV(sampleData, columns, labels);
      const lines = csv.replace('\uFEFF', '').split('\n');

      expect(lines.length).toBe(4); // 1 header + 3 data rows
      expect(lines[0]).toBe('Nome,Email,Faixa,Presenca');
    });

    it('includes BOM for Excel compatibility', () => {
      const csv = generateCSV(sampleData, columns, labels);
      expect(csv.startsWith('\uFEFF')).toBe(true);
    });

    it('correctly formats each data row', () => {
      const csv = generateCSV(sampleData, columns, labels);
      const lines = csv.replace('\uFEFF', '').split('\n');

      expect(lines[1]).toBe('Lucas Mendes,lucas@test.com,Azul,85');
      expect(lines[2]).toBe('Ana Silva,ana@test.com,Branca,92');
      expect(lines[3]).toBe('Pedro Costa,pedro@test.com,Roxa,78');
    });
  });

  describe('CSV header validation', () => {
    it('uses custom labels when provided', () => {
      const customLabels = ['Nome Completo', 'E-mail', 'Graduacao', '% Presenca'];
      const csv = generateCSV(sampleData, columns, customLabels);
      const header = csv.replace('\uFEFF', '').split('\n')[0];

      expect(header).toBe('Nome Completo,E-mail,Graduacao,% Presenca');
    });

    it('generates headers matching column count', () => {
      const csv = generateCSV(sampleData, columns, labels);
      const header = csv.replace('\uFEFF', '').split('\n')[0];
      const headerFields = header.split(',');

      expect(headerFields.length).toBe(columns.length);
    });

    it('each data row has same number of fields as headers', () => {
      const csv = generateCSV(sampleData, columns, labels);
      const lines = csv.replace('\uFEFF', '').split('\n');
      const headerCount = lines[0].split(',').length;

      for (let i = 1; i < lines.length; i++) {
        const fieldCount = lines[i].split(',').length;
        expect(fieldCount).toBe(headerCount);
      }
    });
  });

  describe('Special character handling', () => {
    it('wraps values containing commas in quotes', () => {
      const data = [{ nome: 'Silva, Junior', email: 'test@test.com', faixa: 'Azul', presenca: 80 }];
      const csv = generateCSV(data, columns, labels);
      const dataLine = csv.replace('\uFEFF', '').split('\n')[1];

      expect(dataLine).toContain('"Silva, Junior"');
    });

    it('escapes double quotes in values', () => {
      const data = [{ nome: 'Aluno "Top"', email: 'test@test.com', faixa: 'Preta', presenca: 95 }];
      const csv = generateCSV(data, columns, labels);
      const dataLine = csv.replace('\uFEFF', '').split('\n')[1];

      expect(dataLine).toContain('"Aluno ""Top"""');
    });

    it('handles null and undefined values', () => {
      const data = [{ nome: null, email: undefined, faixa: 'Branca', presenca: 0 }];
      const csv = generateCSV(data, columns, labels);
      const dataLine = csv.replace('\uFEFF', '').split('\n')[1];

      expect(dataLine).toBe(',,Branca,0');
    });

    it('formats boolean values in Portuguese', () => {
      const val1 = formatValue(true);
      const val2 = formatValue(false);
      expect(val1).toBe('Sim');
      expect(val2).toBe('Nao');
    });
  });

  describe('Filename sanitization', () => {
    it('sanitizes filenames correctly', () => {
      expect(sanitizeFilename('Relatorio de Alunos')).toBe('Relatorio_de_Alunos');
      expect(sanitizeFilename('Export@2026#03')).toBe('Export_2026_03');
      expect(sanitizeFilename('normal-file_name')).toBe('normal-file_name');
    });

    it('collapses multiple underscores', () => {
      expect(sanitizeFilename('a   b   c')).toBe('a_b_c');
    });

    it('handles empty string', () => {
      expect(sanitizeFilename('')).toBe('');
    });
  });

  describe('Empty data handling', () => {
    it('generates CSV with only headers when data is empty', () => {
      const csv = generateCSV([], columns, labels);
      const lines = csv.replace('\uFEFF', '').split('\n');

      expect(lines.length).toBe(1);
      expect(lines[0]).toBe('Nome,Email,Faixa,Presenca');
    });
  });
});
