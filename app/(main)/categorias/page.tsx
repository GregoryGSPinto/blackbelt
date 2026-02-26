import { logger } from '@/lib/logger';
import * as contentService from '@/lib/api/content.service';
import CategoriasContent from './_components/CategoriasContent';

/**
 * Categorias Page — Server Component
 * Carrega todos os vídeos no servidor, filtragem por categoria é client-side.
 */
export default async function CategoriasPage() {
  try {
    const videos = await contentService.getVideos();
    return <CategoriasContent videos={videos} />;
  } catch (err) {
    logger.error('[CategoriasPage]', 'Erro ao carregar vídeos', err);
    return <CategoriasContent videos={[]} />;
  }
}
