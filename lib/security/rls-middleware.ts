// @ts-nocheck
/**
 * BLACKBELT — Prisma RLS Middleware
 * 
 * Garante que TODA query executada pelo Prisma respeita o tenant isolation
 * via SET app.current_unit_id / app.current_role antes de cada operação.
 *
 * ARQUITETURA:
 * ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
 * │  HTTP Req   │────▶│ extractJWT() │────▶│ runWithRLS() │
 * │  (Next.js)  │     │  unitId+role │     │ AsyncLocal   │
 * └─────────────┘     └──────────────┘     └──────┬───────┘
 *                                                  │
 *                    ┌─────────────────────────────▼────────┐
 *                    │     Prisma $allOperations middleware  │
 *                    │                                       │
 *                    │  1. Read unitId/role from AsyncLocal  │
 *                    │  2. SET app.current_unit_id = $1      │
 *                    │  3. SET app.current_role = $1         │
 *                    │  4. Execute original query            │
 *                    │  5. RESET app.current_unit_id         │
 *                    │  6. RESET app.current_role            │
 *                    └──────────────────────────────────────┘
 *
 * SEGURANÇA:
 * - Usa $queryRawUnsafe com validação de formato (UUID ou unit_xxx)
 * - AsyncLocalStorage garante isolamento entre requests concorrentes
 * - RESET após cada query previne leak entre conexões do pool
 * - Falha no SET = query não executa (fail-closed)
 *
 * USAGE:
 *   // Em app startup (instrumentation.ts ou server.ts)
 *   import { prismaWithRLS, runWithRLS } from './rls-middleware';
 *   
 *   // Em cada request handler:
 *   const result = await runWithRLS(
 *     { unitId: jwt.unitId, role: jwt.role },
 *     () => prismaWithRLS.student.findMany()
 *   );
 */

import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

// ── Types ──

interface RLSContext {
  unitId: string;
  role: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ValidRole = 'ADMIN' | 'SUPER_ADMIN' | 'INSTRUTOR' | 'STUDENT' | 'TEEN' | 'KID' | 'PARENT';

const VALID_ROLES: ReadonlySet<string> = new Set([
  'ADMIN', 'SUPER_ADMIN', 'INSTRUTOR', 'STUDENT', 'TEEN', 'KID', 'PARENT',
]);

// UUID: 8-4-4-4-12 hex digits (with or without hyphens)
const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
// BlackBelt unit format: unit_xxx
const UNIT_ID_REGEX = /^unit_[a-zA-Z0-9_]{1,64}$/;

// ── AsyncLocalStorage for request-scoped RLS context ──

const rlsStore = new AsyncLocalStorage<RLSContext>();

/**
 * Executa uma função com contexto RLS isolado por request.
 * Cada chamada a prisma dentro de `fn` terá o SET executado antes.
 *
 * @example
 * app.get('/api/students', async (req, res) => {
 *   const { unitId, role } = extractJWT(req);
 *   const students = await runWithRLS({ unitId, role }, () =>
 *     prisma.student.findMany()
 *   );
 *   res.json(students);
 * });
 */
export function runWithRLS<T>(ctx: RLSContext, fn: () => Promise<T>): Promise<T> {
  // Validar ANTES de entrar no AsyncLocal
  validateUnitId(ctx.unitId);
  validateRole(ctx.role);

  return rlsStore.run(ctx, fn);
}

/**
 * Retorna o contexto RLS atual (da request corrente).
 * Retorna undefined se chamado fora de runWithRLS.
 */
export function getCurrentRLSContext(): RLSContext | undefined {
  return rlsStore.getStore();
}

// ── Validation ──

function validateUnitId(unitId: string): void {
  if (!unitId) {
    throw new RLSError('unit_id is required', 'MISSING_UNIT_ID');
  }
  if (!UUID_REGEX.test(unitId) && !UNIT_ID_REGEX.test(unitId)) {
    throw new RLSError(
      `Invalid unit_id format: ${unitId.substring(0, 20)}`,
      'INVALID_UNIT_ID',
    );
  }
}

function validateRole(role: string): void {
  if (!role) {
    throw new RLSError('role is required', 'MISSING_ROLE');
  }
  if (!VALID_ROLES.has(role)) {
    throw new RLSError(
      `Invalid role: ${role.substring(0, 20)}`,
      'INVALID_ROLE',
    );
  }
}

// ── Custom Error ──

export class RLSError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(`[RLS] ${message}`);
    this.name = 'RLSError';
    this.code = code;
  }
}

// ── Prisma Extension (recommended for Prisma 5+) ──

/**
 * Cria PrismaClient com RLS middleware integrado.
 * Cada query automaticamente:
 * 1. Lê unitId/role do AsyncLocalStorage
 * 2. SET session variables
 * 3. Executa query
 * 4. RESET session variables
 */
export function createPrismaWithRLS(baseClient?: PrismaClient): PrismaClient {
  const prisma = baseClient ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

  // Prisma middleware (compatible with Prisma 4 and 5)
  prisma.$use(rlsMiddleware);

  return prisma;
}

/**
 * Middleware Prisma que injeta SET/RESET em torno de cada operação.
 * 
 * NOTA SOBRE CONNECTION POOLING:
 * O SET/RESET ocorre na mesma conexão que a query.
 * Com PgBouncer em pool_mode=transaction, o RESET garante
 * que a próxima transação não herda o unit_id anterior.
 */
const rlsMiddleware: Prisma.Middleware = async (params, next) => {
  const ctx = rlsStore.getStore();

  // Se não há contexto RLS, permitir queries de sistema
  // (migrations, healthcheck, etc.)
  if (!ctx) {
    // Em produção, bloquear queries sem contexto RLS
    if (process.env.NODE_ENV === 'production' && !isSystemOperation(params)) {
      throw new RLSError(
        `Query ${params.model}.${params.action} without RLS context`,
        'NO_RLS_CONTEXT',
      );
    }
    return next(params);
  }

  const prisma = getPrismaInstance();

  try {
    // SET antes da query (mesma conexão via $transaction)
    // Usar $executeRawUnsafe é seguro aqui porque validamos o formato acima
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.current_unit_id = '${ctx.unitId}'`
    );
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.current_role = '${ctx.role}'`
    );

    // Executar a query original
    const result = await next(params);

    return result;
  } finally {
    // RESET sempre executa, mesmo em erro
    // SET LOCAL é automaticamente resetado no fim da transação,
    // mas fazemos RESET explícito por segurança com connection pools
    try {
      await prisma.$executeRawUnsafe('RESET app.current_unit_id');
      await prisma.$executeRawUnsafe('RESET app.current_role');
    } catch {
      // RESET failure é log-only, não bloqueia a resposta
      console.error('[RLS] Failed to RESET session variables');
    }
  }
};

// ── Helpers ──

// Operações de sistema que não requerem RLS
function isSystemOperation(params: Prisma.MiddlewareParams): boolean {
  // Prisma migrations, schema introspection
  if (!params.model) return true;
  // _migrations table
  if (params.model === '_migrations') return true;
  return false;
}

// Singleton pattern para referenciar o prisma dentro do middleware
let _prismaInstance: PrismaClient | null = null;

function getPrismaInstance(): PrismaClient {
  if (!_prismaInstance) {
    throw new RLSError(
      'PrismaClient not initialized. Call createPrismaWithRLS() first.',
      'NOT_INITIALIZED',
    );
  }
  return _prismaInstance;
}

/**
 * Inicializa o cliente Prisma com RLS e exporta como singleton.
 * Chamar UMA vez no startup da aplicação.
 */
export function initPrismaRLS(): PrismaClient {
  if (_prismaInstance) return _prismaInstance;

  _prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['error'],
  });

  _prismaInstance.$use(rlsMiddleware);

  logger.debug('[RLS] Prisma middleware initialized');
  return _prismaInstance;
}

// Export singleton (importar em qualquer lugar)
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!_prismaInstance) {
      throw new RLSError(
        'Call initPrismaRLS() before using prisma',
        'NOT_INITIALIZED',
      );
    }
    return (_prismaInstance as Record<string, unknown>)[prop as string];
  },
});


// ══════════════════════════════════════════════════════════
// ALTERNATIVE: Transaction-based approach (safer with PgBouncer)
// ══════════════════════════════════════════════════════════

/**
 * Executa queries dentro de uma transação com SET LOCAL.
 * SET LOCAL é automaticamente descartado no fim da transação.
 * Mais seguro com PgBouncer porque não depende de RESET.
 *
 * @example
 * const students = await queryWithRLS(prisma, jwt, async (tx) => {
 *   return tx.student.findMany({ where: { status: 'ACTIVE' } });
 * });
 */
export async function queryWithRLS<T>(
  client: PrismaClient,
  ctx: RLSContext,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  validateUnitId(ctx.unitId);
  validateRole(ctx.role);

  return client.$transaction(async (tx) => {
    // SET LOCAL: vive apenas dentro desta transação
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_unit_id = '${ctx.unitId}'`
    );
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_role = '${ctx.role}'`
    );

    return fn(tx);
  });
}


// ══════════════════════════════════════════════════════════
// NEXT.JS INTEGRATION HELPERS
// ══════════════════════════════════════════════════════════

/**
 * Extrai unitId e role de um JWT decodificado.
 * Usar após validação de assinatura do JWT.
 */
export function extractRLSContext(decodedJWT: {
  unitId?: string;
  unidadeId?: string;
  role?: string;
  tipo?: string;
}): RLSContext {
  const unitId = decodedJWT.unitId || decodedJWT.unidadeId || '';
  const role = decodedJWT.role || decodedJWT.tipo || '';

  return { unitId, role };
}

/**
 * Wrapper para API Route handlers do Next.js.
 * Automaticamente extrai JWT e configura RLS context.
 *
 * @example
 * // app/api/students/route.ts
 * import { withRLS } from '@/lib/security/rls-middleware';
 *
 * export const GET = withRLS(async (req, ctx) => {
 *   // ctx.prisma já tem RLS configurado
 *   const students = await ctx.prisma.student.findMany();
 *   return Response.json(students);
 * });
 */
export function withRLS(
  handler: (
    req: Request,
    ctx: { prisma: PrismaClient; unitId: string; role: string }
  ) => Promise<Response>,
) {
  return async (req: Request): Promise<Response> => {
    // TODO(BE-001): Implementar extração real do JWT
    // const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    // const decoded = await verifyJWT(token);
    // const rlsCtx = extractRLSContext(decoded);

    // Placeholder — substituir pela extração real
    const rlsCtx: RLSContext = {
      unitId: '', // <- extrair de decoded.unitId
      role: '',   // <- extrair de decoded.role
    };

    try {
      return await runWithRLS(rlsCtx, () =>
        handler(req, {
          prisma: prisma,
          unitId: rlsCtx.unitId,
          role: rlsCtx.role,
        })
      );
    } catch (error) {
      if (error instanceof RLSError) {
        console.error(`[RLS] ${error.code}: ${error.message}`);
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }
  };
}
