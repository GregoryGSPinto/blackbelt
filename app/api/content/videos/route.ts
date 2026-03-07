/**
 * GET /api/content/videos — Lista vídeos disponíveis
 *
 * Endpoint seguro: retorna array vazio se não houver dados
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: [] });
}
