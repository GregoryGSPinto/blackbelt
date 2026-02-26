/**
 * Server — Public API
 */

// Bootstrap
export { bootstrap, shutdown } from './bootstrap';
export { ensureInitialized, getInitStatus } from './init';

// Infrastructure
export { createPgPool, getPgPool, checkDatabaseHealth, closePgPool } from './infrastructure/database/postgres';
export { env } from './infrastructure/env';
export { PostgresEventStoreAdapter } from './infrastructure/event-store/postgres-event-store';

// Tenant
export { assertTenantScope, resolveTenantContext, TenantScopeError } from './infrastructure/tenant-scope';
export type { TenantContext } from './infrastructure/tenant-scope';
export { createScopedEventStore, ScopedEventStore } from './infrastructure/scoped-event-store';

// Replay + Support Admin
export { executeFullReplay, assertSupportAdmin, SUPPORT_ADMIN_PERMISSIONS } from './infrastructure/replay-policy';
export type { ReplayMode, ReplayOptions, ReplayResult, SupportAdminPermission } from './infrastructure/replay-policy';

// API
export { getHealth, getHealthDb } from './api/health';
