/**
 * Persistence Module — Camada de Integridade (A Memória)
 *
 * ARQUITETURA DE 3 CAMADAS:
 *
 * ┌─────────────────────────────────────────────────┐
 * │  O CORAÇÃO — Middleware Zero Trust              │
 * │  middleware.ts + Security Headers + Route Guard  │
 * ├─────────────────────────────────────────────────┤
 * │  O MOTOR — Auth Service                         │
 * │  JWT + Refresh Rotation + Session + Rate Limit  │
 * ├─────────────────────────────────────────────────┤
 * │  A MEMÓRIA — Persistence Layer (este módulo)    │
 * │  AuditManager + SoftDelete + LGPD + Concurrency │
 * │  + TenantIsolation + ErrorHandler + Repository  │
 * └─────────────────────────────────────────────────┘
 *
 * PRINCÍPIO: Banco de dados como livro-razão imutável.
 * Cada alteração deixa rastro digital incontestável.
 *
 * COMPONENTES:
 * 1. AuditManager      → Interceptor before/after para toda escrita
 * 2. SoftDelete         → Exclusão lógica + integridade referencial
 * 3. Concurrency        → Optimistic locking (version + updatedAt)
 * 4. TenantIsolation    → Filtro automático de unit_id
 * 5. LGPD               → Anonimização + exportação de dados
 * 6. ErrorHandler       → Erros seguros (nunca expor internals)
 * 7. Repository         → Pattern com todos os guards integrados
 */

// ─── Audit Manager (Livro-Razão) ───
export {
  auditedOperation,
  auditRead,
  queryLogs,
  getResourceHistory,
  getLedgerSize,
  getLedger,
} from './audit-manager';

// ─── Soft Delete & Integridade ───
export {
  checkDeletionAllowed,
  softDelete,
  restore,
  excludeDeleted,
  isDeleted,
  DEPENDENCY_MAP,
} from './soft-delete';

// ─── Concurrency Control ───
export {
  versionedUpdate,
  checkVersion,
  initVersion,
  getCurrentVersion,
  clearVersions,
  type VersionedResult,
} from './concurrency';

// ─── Tenant Isolation ───
export {
  withUnitFilter,
  validateTenantAccess,
  filterByTenant,
  buildTenantQuery,
  assertHasTenantFilter,
  TenantError,
} from './tenant-isolation';

// ─── LGPD ───
export {
  anonymizeStudent,
  exportUserData,
  createRequest as createLGPDRequest,
  listRequests as listLGPDRequests,
  approveRequest as approveLGPDRequest,
  isAnonymized,
  ANONYMIZED_VALUES,
} from './lgpd';

// ─── Error Handler ───
export {
  toSafeError,
  getUserMessage,
  isConflict,
  isIntegrityViolation,
  isUnauthorized,
  isForbidden,
  isNotFound,
} from './error-handler';

// ─── Repository Pattern ───
export { BaseRepository, safeOperation } from './repository';

// ─── Types ───
export type {
  BaseEntity,
  AuditableOperation,
  AuditContext,
  AuditedResult,
  IntegrityError,
  SafeError,
  AnonymizeResult,
  SensitivePersonalData,
  TenantQuery,
} from '@/lib/api/contracts';
