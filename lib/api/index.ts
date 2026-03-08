// Core
export { apiClient, ApiError } from './client';
export type { ApiResponse } from './client';

// Contratos canônicos (single source of truth)
export * from './contracts';

// DTOs e tipos compartilhados
export * from './types';

// Services por domínio
export * as authService from '@/features/auth/services/auth-service';
export * as adminService from './admin.service';
export * as contentService from './content.service';
export * as kidsService from './kids.service';
export * as teenService from './teen.service';
export * as shopService from './shop.service';
export * as rankingService from './ranking.service';
export * as carteirinhaService from './carteirinha.service';
export * as eventosService from './eventos.service';
export * as automacoesService from './automacoes.service';
export * as relatoriosService from './relatorios.service';
export * as assinaturaService from './assinatura.service';
export * as graduacaoService from './graduacao.service';
export * as analyticsService from './analytics.service';
export * as gatewayService from './gateway.service';
export * as whatsappBusinessService from './whatsapp-business.service';
export * as pushService from './push.service';
export * as storageService from './storage.service';
export * as kidsSafetyService from './kids-safety.service';
export * as planoAulaService from './plano-aula.service';
