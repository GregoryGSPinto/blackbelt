/** @type {import('next').NextConfig} */

const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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

  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
        http: false,
        stream: false,
        crypto: false,
        path: false,
        os: false,
        zlib: false,
      };
      // Ignore node: protocol imports from pptxgenjs (client-side only)
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
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

module.exports = withNextIntl(withBundleAnalyzer(nextConfig))
