/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TENANT SCOPE — Isolamento multi-academia                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Toda operação de escrita DEVE ter unitId.                     ║
 * ║  Sem unitId → erro ANTES de tocar o banco.                    ║
 * ║                                                                 ║
 * ║  assertTenantScope() é chamado:                                ║
 * ║  • Antes de cada command                                       ║
 * ║  • Antes de cada write no event store                          ║
 * ║  • Antes de cada mutation                                      ║
 * ║                                                                 ║
 * ║  Isso garante que dados de academia A nunca vazam para B.      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ════════════════════════════════════════════════════════════════════
// TENANT CONTEXT
// ════════════════════════════════════════════════════════════════════

export interface TenantContext {
  /** ID da unidade/academia (obrigatório) */
  unitId: string;

  /** ID do usuário autenticado */
  userId?: string;

  /** Role do usuário no tenant */
  role?: 'admin' | 'instructor' | 'student' | 'guardian';
}

// ════════════════════════════════════════════════════════════════════
// ASSERTION
// ════════════════════════════════════════════════════════════════════

/**
 * Valida que o contexto de tenant é válido.
 * Lança erro se unitId estiver ausente.
 *
 * Use antes de qualquer operação de escrita:
 * ```
 * assertTenantScope(ctx);
 * await eventStore.persist(event);
 * ```
 */
export function assertTenantScope(ctx: TenantContext | undefined | null): asserts ctx is TenantContext {
  if (!ctx) {
    throw new TenantScopeError('Tenant context is required for this operation');
  }
  if (!ctx.unitId || ctx.unitId.trim() === '') {
    throw new TenantScopeError('unitId is required — cannot write without tenant scope');
  }
}

/**
 * Valida que o operador tem permissão para o role dado.
 */
export function assertTenantRole(
  ctx: TenantContext,
  requiredRoles: TenantContext['role'][],
): void {
  assertTenantScope(ctx);
  if (ctx.role && !requiredRoles.includes(ctx.role)) {
    throw new TenantScopeError(
      `Role '${ctx.role}' not authorized. Required: ${requiredRoles.join(', ')}`
    );
  }
}

// ════════════════════════════════════════════════════════════════════
// ERROR
// ════════════════════════════════════════════════════════════════════

export class TenantScopeError extends Error {
  readonly code = 'TENANT_SCOPE_VIOLATION';

  constructor(message: string) {
    super(message);
    this.name = 'TenantScopeError';
  }
}

// ════════════════════════════════════════════════════════════════════
// HELPER — Extrair unitId de diferentes fontes
// ════════════════════════════════════════════════════════════════════

/**
 * Resolve TenantContext de diferentes fontes.
 *
 * Prioridade:
 * 1. Header X-Unit-Id (API)
 * 2. Cookie/session (web)
 * 3. Default do ambiente (single-tenant dev)
 */
export function resolveTenantContext(sources: {
  header?: string | null;
  session?: { unitId?: string; userId?: string; role?: string } | null;
  fallbackUnitId?: string;
}): TenantContext | null {
  const unitId = sources.header
    ?? sources.session?.unitId
    ?? sources.fallbackUnitId;

  if (!unitId) return null;

  return {
    unitId,
    userId: sources.session?.userId,
    role: sources.session?.role as TenantContext['role'],
  };
}
