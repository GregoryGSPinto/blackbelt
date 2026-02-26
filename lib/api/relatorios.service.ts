/**
 * Relatórios Service — Geração e Exportação
 *
 * MOCK:  useMock() === true → dados de __mocks__/relatorios.mock.ts
 * PROD:  useMock() === false → chama apiClient
 *
 * TODO(BE-024): Implementar endpoints relatórios
 *   GET /relatorios/config
 *   POST /relatorios/gerar
 *   GET /relatorios/:id/exportar?formato=CSV
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  RelatorioConfig,
  RelatorioGerado,
  TipoRelatorio,
  PeriodoRelatorio,
  FormatoExportacao,
  RelatorioLinha,
} from './contracts';

export type {
  RelatorioConfig,
  RelatorioGerado,
  TipoRelatorio,
  PeriodoRelatorio,
  FormatoExportacao,
  RelatorioLinha,
};

// ── Mock helpers (lazy import) ────────────────────────────

async function getMockModule() {
  return import('@/lib/__mocks__/relatorios.mock');
}

// ── Service functions ─────────────────────────────────────

/** Buscar configurações de relatórios disponíveis */
export async function getConfigs(): Promise<RelatorioConfig[]> {
  if (useMock()) {
    await mockDelay();
    const { relatorioConfigs } = await getMockModule();
    return [...relatorioConfigs];
  }
  return apiClient.get<RelatorioConfig[]>('/relatorios/config');
}

/** Gerar relatório com preview de dados */
export async function gerarRelatorio(
  tipo: TipoRelatorio,
  periodo: PeriodoRelatorio
): Promise<RelatorioGerado> {
  if (useMock()) {
    await mockDelay(600);
    const { gerarRelatorio } = await getMockModule();
    return gerarRelatorio(tipo, periodo);
  }
  return apiClient.post<RelatorioGerado>('/relatorios/gerar', { tipo, periodo });
}

/** Exportar relatório como CSV (client-side) */
export function exportarCSV(relatorio: RelatorioGerado): void {
  const header = relatorio.colunas.map(c => c.label).join(',');
  const rows = relatorio.dados.map(row =>
    relatorio.colunas.map(c => {
      const val = String(row[c.key] ?? '');
      return val.includes(',') ? `"${val}"` : val;
    }).join(',')
  ).join('\n');

  const csv = `${header}\n${rows}`;
  downloadFile(csv, `${relatorio.titulo.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
}

/** Exportar relatório como XLSX (simplified CSV with .xlsx extension for mock) */
export function exportarXLSX(relatorio: RelatorioGerado): void {
  // In production, backend would generate real XLSX
  // For mock, we generate CSV with XLSX extension
  const header = relatorio.colunas.map(c => c.label).join('\t');
  const rows = relatorio.dados.map(row =>
    relatorio.colunas.map(c => String(row[c.key] ?? '')).join('\t')
  ).join('\n');

  const tsv = `${header}\n${rows}`;
  downloadFile(tsv, `${relatorio.titulo.replace(/\s+/g, '_')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/** Exportar relatório (dispatch por formato) */
export function exportarRelatorio(relatorio: RelatorioGerado, formato: FormatoExportacao): void {
  switch (formato) {
    case 'CSV':
      exportarCSV(relatorio);
      break;
    case 'XLSX':
      exportarXLSX(relatorio);
      break;
    case 'PDF':
      // PDF gerado pelo backend em produção
      alert('Exportação PDF será gerada pelo servidor em produção.');
      break;
  }
}

// ── Helper ────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\ufeff' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
