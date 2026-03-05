/** @type {import('next').NextConfig} */

// Bundle analyzer (run: ANALYZE=true npm run build)
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  // ============================================================
  // CAPACITOR: Para build nativo, executar:
  //   CAPACITOR_BUILD=true npm run build
  // Isso ativa static export (output: 'export') que é incompatível
  // com API routes e middleware. NUNCA ativar na Vercel.
  // ============================================================
  ...(process.env.CAPACITOR_BUILD === 'true' && !process.env.VERCEL ? { output: 'export' } : {}),

  images: {
    unoptimized: process.env.CAPACITOR_BUILD === 'true', // Obrigatório para static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.blackbelt.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },

  // ============================================================
  // SEGURANÇA: Garantir que mocks não vão para produção
  // ============================================================
  webpack: (config, { dev, isServer }) => {
    // Em produção, ignorar completamente o diretório __mocks__
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/lib/__mocks__/admin.mock$': false,
        '@/lib/__mocks__/auth.mock$': false,
        '@/lib/__mocks__/content.mock$': false,
        '@/lib/__mocks__/kids.mock$': false,
        '@/lib/__mocks__/professor.mock$': false,
        '@/lib/__mocks__/shop.mock$': false,
        '@/lib/__mocks__/teen.mock$': false,
      };

      config.plugins.push(
        new (require('webpack').DefinePlugin)({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
      );
    }

    return config;
  },

  // Otimizações de bundle
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
