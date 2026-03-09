/**
 * GET /api/admin/usuarios — Lista usuários da academia
 *
 * Endpoint seguro: retorna array vazio se não houver dados
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Por enquanto retorna array vazio — implementar com Supabase depois
  return NextResponse.json([]);
}
