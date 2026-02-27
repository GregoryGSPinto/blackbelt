export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { MOCK_ACADEMIES } from '@/lib/__mocks__/super-admin.mock';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const academy = MOCK_ACADEMIES.find(a => a.id === params.id);
  if (!academy) {
    return NextResponse.json({ error: 'Academia não encontrada' }, { status: 404 });
  }
  const updated = { ...academy, ...body };
  return NextResponse.json({ academy: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const academy = MOCK_ACADEMIES.find(a => a.id === params.id);
  if (!academy) {
    return NextResponse.json({ error: 'Academia não encontrada' }, { status: 404 });
  }
  return NextResponse.json({ deleted: true, id: params.id });
}
