import { logger } from '@/lib/logger';
import * as contentService from '@/lib/api/content.service';
import SeriesContent from './_components/SeriesContent';

/**
 * Séries Page — Server Component
 * Carrega vídeos e séries no servidor.
 */
export default async function SeriesPage() {
  try {
    const [videos, series] = await Promise.all([
      contentService.getVideos(),
      contentService.getSeries(),
    ]);
    return <SeriesContent videos={videos} series={series} />;
  } catch (err) {
    logger.error('[SeriesPage]', 'Erro ao carregar séries', err);
    return <SeriesContent videos={[]} series={[]} />;
  }
}
