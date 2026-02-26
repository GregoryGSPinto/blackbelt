/**
 * Security Module — Arquitetura Enterprise Zero Trust
 *
 * CAMADAS:
 * 1. Token Store    → Armazenamento seguro (memória, não localStorage)
 * 2. RBAC           → Role Based Access Control + Policy Engine
 * 3. Audit          → Logs imutáveis (padrão bancário)
 * 4. Session        → Gerenciamento de sessões + refresh rotation
 * 5. Device FP      → Fingerprint básico para detecção de dispositivo
 * 6. Rate Limiter   → Proteção contra força bruta
 *
 * PRINCÍPIO: Backend SEMPRE é a fonte de verdade.
 * Frontend usa para UI gating e experiência do usuário.
 */

// Token Store (memória segura)
export * as tokenStore from './token-store';

// RBAC + Policy Engine
export {
  requireAuth,
  requireRole,
  requireAnyRole,
  requirePermission,
  requireOwnership,
  requireSameUnit,
  requireReauth,
  hasPermission,
  hasRole,
  getCurrentPermissions,
  isAdmin,
  isInstrutor,
} from './rbac';

// Audit (imutável)
export { logEvent, getLogs as getAuditLogs, audit } from './audit';

// Session Management
export {
  createSession,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  refreshAccessToken,
  isNewDevice,
} from './session';

// Device Fingerprint
export { getDeviceInfo, isSameDevice } from './device-fingerprint';

// Rate Limiter
export {
  checkRateLimit,
  recordAttempt,
  recordSuccess,
  getBlockTimeRemaining,
} from './rate-limiter';

// Re-export key types
export type {
  SecurityRole,
  SecurityPermission,
  PermissionCheck,
  AuditLogEntry,
  AuditAction,
  UserSession,
  DeviceInfo,
  RateLimitStatus,
  SecurityConfig,
  AuthenticatedUser,
  AuthResult,
  ReauthRequest,
  LGPDRequest,
} from '@/lib/api/contracts';
