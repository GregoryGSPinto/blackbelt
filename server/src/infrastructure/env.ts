/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ENV — Configuração tipada e validada                          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Carrega .env via dotenv e valida todas as variáveis.          ║
 * ║  Se algo obrigatório faltar → erro ANTES de iniciar.           ║
 * ║                                                                 ║
 * ║  Nunca acesse process.env diretamente no resto do código.      ║
 * ║  Use: import { env } from './env';                             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carrega .env com prioridade:
// 1. server/.env (mais específico)
// 2. root/.env
// 3. root/.env.local
// Último carregado NÃO sobrescreve valores já definidos (dotenv default behavior)
dotenv.config({ path: resolve(__dirname, '../../.env') });         // → server/.env
dotenv.config({ path: resolve(__dirname, '../../../.env') });      // → root/.env
dotenv.config({ path: resolve(__dirname, '../../../.env.local') });// → root/.env.local

// ════════════════════════════════════════════════════════════════════
// ENVIRONMENT TYPE
// ════════════════════════════════════════════════════════════════════

export interface ServerEnv {
  /** Node environment */
  NODE_ENV: 'development' | 'production' | 'test';

  /** PostgreSQL connection string */
  DATABASE_URL: string | null;

  /** Server port */
  PORT: number;

  /** Log level */
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';

  /** Is production? */
  isProduction: boolean;

  /** Is development? */
  isDevelopment: boolean;

  /** Has real database configured? */
  hasDatabase: boolean;
}

// ════════════════════════════════════════════════════════════════════
// LOAD + VALIDATE
// ════════════════════════════════════════════════════════════════════

function loadEnv(): ServerEnv {
  const NODE_ENV = (process.env.NODE_ENV as ServerEnv['NODE_ENV']) || 'development';
  const DATABASE_URL = process.env.DATABASE_URL || null;
  const PORT = parseInt(process.env.PORT || '3001', 10);
  const LOG_LEVEL = (process.env.LOG_LEVEL as ServerEnv['LOG_LEVEL']) || (NODE_ENV === 'production' ? 'info' : 'debug');

  const env: ServerEnv = {
    NODE_ENV,
    DATABASE_URL,
    PORT,
    LOG_LEVEL,
    isProduction: NODE_ENV === 'production',
    isDevelopment: NODE_ENV === 'development',
    hasDatabase: DATABASE_URL !== null && DATABASE_URL.length > 0,
  };

  // Validate (skip in mock mode — build can proceed without DB)
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  if (env.isProduction && !env.hasDatabase && !isMock) {
    throw new Error(
      '[ENV] DATABASE_URL is REQUIRED in production.\n' +
      'Set DATABASE_URL=postgresql://user:pass@host:5432/db in .env'
    );
  }

  return env;
}

/** Typed, validated environment — import this everywhere */
export const env = loadEnv();
