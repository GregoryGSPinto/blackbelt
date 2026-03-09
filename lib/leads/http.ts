import { NextResponse } from 'next/server';

export function leadApiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function leadApiError(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    { data: null, error: { message, status, details: details ?? null } },
    { status },
  );
}

export function mapLeadError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal server error';
  if (message === 'UNAUTHORIZED') return leadApiError('Unauthorized', 401);
  if (message === 'FORBIDDEN') return leadApiError('Forbidden', 403);
  return leadApiError(message, 500);
}
