import { structuredLog } from '@/lib/monitoring/structured-logger';
import { gerarRelatorio } from '@/lib/api/relatorios.service';
import type { PeriodoRelatorio, TipoRelatorio } from '@/lib/api/contracts';

export async function generateMonthlyReportJob(periodo: PeriodoRelatorio, tipo: TipoRelatorio = 'FINANCEIRO') {
  structuredLog.business.info('Generating periodic report', { period: periodo, type: tipo });
  return gerarRelatorio(tipo, periodo);
}
