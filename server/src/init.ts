/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SERVER INIT — Inicialização lazy do backend                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Roda UMA vez, na primeira chamada de API.                     ║
 * ║  Todas as API routes chamam ensureInitialized() no topo.       ║
 * ║                                                                 ║
 * ║  Porquê lazy e não instrumentation.ts:                         ║
 * ║  • Zero configuração extra no Next.js                          ║
 * ║  • Funciona em dev e prod igualmente                           ║
 * ║  • Não precisa de experimental features                        ║
 * ║  • Thread-safe (Promise garante execução única)                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { bootstrap, type BootstrapResult } from './bootstrap';

let initPromise: Promise<BootstrapResult> | null = null;
let result: BootstrapResult | null = null;

/**
 * Garante que o servidor está inicializado.
 * Chame no topo de toda API route:
 *
 * ```ts
 * export async function GET() {
 *   await ensureInitialized();
 *   // ... handler code
 * }
 * ```
 *
 * Primeira chamada: roda bootstrap completo.
 * Chamadas seguintes: retorna imediatamente.
 */
export async function ensureInitialized(): Promise<BootstrapResult> {
  if (result) return result;

  if (!initPromise) {
    initPromise = bootstrap().then(r => {
      result = r;
      return r;
    }).catch(err => {
      // Reset para permitir retry na próxima chamada
      initPromise = null;
      throw err;
    });
  }

  return initPromise;
}

/**
 * Retorna status de inicialização (sem bloquear).
 */
export function getInitStatus(): {
  initialized: boolean;
  mode: 'POSTGRES' | 'MEMORY' | 'PENDING';
} {
  if (result) return { initialized: true, mode: result.mode };
  if (initPromise) return { initialized: false, mode: 'PENDING' };
  return { initialized: false, mode: 'PENDING' };
}
