import { logger } from '@/lib/logger';
import * as contentService from '@/lib/api/content.service';
import NovidadesContent from './_components/NovidadesContent';

/**
 * Novidades Page — Server Component
 * Carrega vídeos no servidor e delega ao Client Component.
 */
export default async function NovidadesPage() {
  try {
    const videos = await contentService.getVideos();
    return <NovidadesContent videos={videos} />;
  } catch (err) {
    logger.error('[NovidadesPage]', 'Erro ao carregar vídeos', err);
    return <NovidadesContent videos={[]} />;
  }
}
