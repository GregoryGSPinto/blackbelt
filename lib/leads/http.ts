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
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') return leadApiError('Unauthorized', 401);
    if (error.message === 'FORBIDDEN') return leadApiError('Forbidden', 403);
  }
  return leadApiError('Internal server error', 500);
}
