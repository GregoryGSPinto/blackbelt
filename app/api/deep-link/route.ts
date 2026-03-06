import { NextRequest, NextResponse } from 'next/server';

/**
 * Deep Link Resolver — BBOS
 *
 * Resolves deep link URLs to internal app routes:
 *   - /academy/:slug → /dashboard (academy context)
 *   - /athlete/:id → /aluno/:id
 *   - /post/:id → /social/post/:id (future)
 *   - /competition/:id → /competitions/:id (future)
 */

interface DeepLinkMapping {
  pattern: RegExp;
  resolve: (match: RegExpMatchArray) => string;
}

const DEEP_LINK_MAPPINGS: DeepLinkMapping[] = [
  {
    pattern: /^\/academy\/([a-zA-Z0-9_-]+)$/,
    resolve: (match) => `/dashboard?academy=${match[1]}`,
  },
  {
    pattern: /^\/athlete\/([a-f0-9-]+)$/,
    resolve: (match) => `/aluno/${match[1]}`,
  },
  {
    pattern: /^\/post\/([a-f0-9-]+)$/,
    resolve: (match) => `/social/post/${match[1]}`,
  },
  {
    pattern: /^\/competition\/([a-f0-9-]+)$/,
    resolve: (match) => `/competitions/${match[1]}`,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  for (const mapping of DEEP_LINK_MAPPINGS) {
    const match = path.match(mapping.pattern);
    if (match) {
      const resolved = mapping.resolve(match);
      return NextResponse.json({ resolved, original: path });
    }
  }

  return NextResponse.json(
    { error: 'Unknown deep link path', original: path },
    { status: 404 }
  );
}
