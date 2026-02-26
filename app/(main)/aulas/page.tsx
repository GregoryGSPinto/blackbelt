import { logger } from '@/lib/logger';
import * as contentService from '@/lib/api/content.service';
import SessõesContent from './_components/SessõesContent';

/**
 * Sessões Page — Server Component
 * Carrega dados no servidor e delega interatividade ao Client Component.
 *
 * TODO(FE-024): Substituir contentService por fetch server-side com cache/revalidate
 */
export default async function SessõesPage() {
  try {
    const videos = await contentService.getVideos();
    return <SessõesContent videos={videos} />;
  } catch (err) {
    logger.error('[SessõesPage]', 'Erro ao carregar vídeos', err);
    return <SessõesContent videos={[]} />;
  }
}
