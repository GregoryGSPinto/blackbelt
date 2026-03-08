import * as analyticsService from '@/src/features/analytics/services/analytics.service';
import { structuredLog } from '@/lib/monitoring/structured-logger';

export async function refreshAnalyticsJob() {
  structuredLog.business.info('Running analytics refresh job');
  return analyticsService.getAnalytics();
}
