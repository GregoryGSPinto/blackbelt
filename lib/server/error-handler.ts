import { NextResponse } from 'next/server';
import { logger } from '@/src/infrastructure/logger';
import { sanitizeErrorForLogging } from '@/lib/security/sensitive-data';

export type ServerErrorShape = {
  success: false;
  error: string;
  code?: string;
};

export function createErrorResponse(
  message: string,
  status = 500,
  code?: string
) {
  const body: ServerErrorShape = {
    success: false,
    error: message,
    ...(code ? { code } : {}),
  };

  return NextResponse.json(body, { status });
}

export function logServerError(scope: string, error: unknown) {
  logger.error(scope, 'Unhandled server error', sanitizeErrorForLogging(error));
}

export function handleServerError(
  scope: string,
  error: unknown,
  fallbackMessage = 'Internal Server Error',
  status = 500,
  code = 'INTERNAL_ERROR'
) {
  logServerError(scope, error);
  return createErrorResponse(fallbackMessage, status, code);
}
